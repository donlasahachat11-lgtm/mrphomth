package cmd

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
)

// executeWriteFile writes content to a file
func executeWriteFile(params map[string]interface{}) error {
	path, ok := params["path"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid 'path' parameter")
	}

	content, ok := params["content"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid 'content' parameter")
	}

	// Security check: ensure path is within allowed directory
	if err := validatePath(path); err != nil {
		return err
	}

	// Create directory if it doesn't exist
	dir := filepath.Dir(path)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	// Write file
	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		return fmt.Errorf("failed to write file: %w", err)
	}

	return nil
}

// executeReadFile reads content from a file
func executeReadFile(params map[string]interface{}) (string, error) {
	path, ok := params["path"].(string)
	if !ok {
		return "", fmt.Errorf("missing or invalid 'path' parameter")
	}

	// Security check
	if err := validatePath(path); err != nil {
		return "", err
	}

	// Read file
	content, err := os.ReadFile(path)
	if err != nil {
		return "", fmt.Errorf("failed to read file: %w", err)
	}

	return string(content), nil
}

// executeRunCommand runs a shell command
func executeRunCommand(params map[string]interface{}) (string, error) {
	command, ok := params["command"].(string)
	if !ok {
		return "", fmt.Errorf("missing or invalid 'command' parameter")
	}

	// Security check: validate command
	if err := validateCommand(command); err != nil {
		return "", err
	}

	// Get working directory
	workDir, _ := params["workDir"].(string)
	if workDir == "" {
		workDir, _ = os.Getwd()
	}

	// Execute command
	cmd := exec.Command("sh", "-c", command)
	cmd.Dir = workDir

	output, err := cmd.CombinedOutput()
	if err != nil {
		return string(output), fmt.Errorf("command failed: %w\nOutput: %s", err, string(output))
	}

	return string(output), nil
}

// executeListFiles lists files in a directory
func executeListFiles(params map[string]interface{}) ([]string, error) {
	path, ok := params["path"].(string)
	if !ok {
		return nil, fmt.Errorf("missing or invalid 'path' parameter")
	}

	// Security check
	if err := validatePath(path); err != nil {
		return nil, err
	}

	// Read directory
	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read directory: %w", err)
	}

	files := make([]string, 0, len(entries))
	for _, entry := range entries {
		files = append(files, entry.Name())
	}

	return files, nil
}

// executeCreateDirectory creates a directory
func executeCreateDirectory(params map[string]interface{}) error {
	path, ok := params["path"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid 'path' parameter")
	}

	// Security check
	if err := validatePath(path); err != nil {
		return err
	}

	// Create directory
	if err := os.MkdirAll(path, 0755); err != nil {
		return fmt.Errorf("failed to create directory: %w", err)
	}

	return nil
}

// executeDeleteFile deletes a file or directory
func executeDeleteFile(params map[string]interface{}) error {
	path, ok := params["path"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid 'path' parameter")
	}

	// Security check
	if err := validatePath(path); err != nil {
		return err
	}

	// Additional safety check: don't allow deleting root or home
	absPath, err := filepath.Abs(path)
	if err != nil {
		return err
	}

	if absPath == "/" || absPath == os.Getenv("HOME") {
		return fmt.Errorf("cannot delete root or home directory")
	}

	// Delete file or directory
	if err := os.RemoveAll(path); err != nil {
		return fmt.Errorf("failed to delete: %w", err)
	}

	return nil
}

// executeGitCommit commits changes to git
func executeGitCommit(params map[string]interface{}) error {
	message, ok := params["message"].(string)
	if !ok {
		return fmt.Errorf("missing or invalid 'message' parameter")
	}

	workDir, _ := params["workDir"].(string)
	if workDir == "" {
		workDir, _ = os.Getwd()
	}

	// Git add
	addCmd := exec.Command("git", "add", ".")
	addCmd.Dir = workDir
	if output, err := addCmd.CombinedOutput(); err != nil {
		return fmt.Errorf("git add failed: %w\nOutput: %s", err, string(output))
	}

	// Git commit
	commitCmd := exec.Command("git", "commit", "-m", message)
	commitCmd.Dir = workDir
	if output, err := commitCmd.CombinedOutput(); err != nil {
		// Check if there's nothing to commit
		if strings.Contains(string(output), "nothing to commit") {
			return nil
		}
		return fmt.Errorf("git commit failed: %w\nOutput: %s", err, string(output))
	}

	return nil
}

// executeGitPush pushes changes to remote
func executeGitPush(params map[string]interface{}) error {
	workDir, _ := params["workDir"].(string)
	if workDir == "" {
		workDir, _ = os.Getwd()
	}

	branch, _ := params["branch"].(string)
	if branch == "" {
		branch = "main"
	}

	// Git push
	pushCmd := exec.Command("git", "push", "origin", branch)
	pushCmd.Dir = workDir
	if output, err := pushCmd.CombinedOutput(); err != nil {
		return fmt.Errorf("git push failed: %w\nOutput: %s", err, string(output))
	}

	return nil
}

// validatePath validates that a path is safe to access
func validatePath(path string) error {
	// Get absolute path
	absPath, err := filepath.Abs(path)
	if err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}

	// Get current working directory
	cwd, err := os.Getwd()
	if err != nil {
		return fmt.Errorf("failed to get working directory: %w", err)
	}

	// Check if path is within current working directory or its subdirectories
	relPath, err := filepath.Rel(cwd, absPath)
	if err != nil {
		return fmt.Errorf("invalid path: %w", err)
	}

	// Don't allow paths that go outside the current directory
	if strings.HasPrefix(relPath, "..") {
		return fmt.Errorf("access denied: path outside working directory")
	}

	return nil
}

// validateCommand validates that a command is safe to execute
func validateCommand(command string) error {
	// List of dangerous commands
	dangerousCommands := []string{
		"rm -rf /",
		"mkfs",
		"dd if=/dev/zero",
		":(){ :|:& };:",
		"sudo",
		"su",
		"chmod 777",
	}

	commandLower := strings.ToLower(command)

	for _, dangerous := range dangerousCommands {
		if strings.Contains(commandLower, dangerous) {
			return fmt.Errorf("dangerous command blocked: %s", dangerous)
		}
	}

	return nil
}
