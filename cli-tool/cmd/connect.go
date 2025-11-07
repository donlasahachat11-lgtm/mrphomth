package cmd

import (
	"encoding/json"
	"fmt"
	"log"
	"net/url"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gorilla/websocket"
	"github.com/spf13/cobra"
)

// connectCmd represents the connect command
var connectCmd = &cobra.Command{
	Use:   "connect",
	Short: "Connect to Mr.Promth and start the agent runner",
	Long: `Establishes a WebSocket connection to the Mr.Promth backend
and starts listening for commands from AI agents.`,
	RunE: runConnect,
}

func init() {
	connectCmd.Flags().String("ws-url", "ws://localhost:3000/api/ws", "WebSocket URL")
}

func runConnect(cmd *cobra.Command, args []string) error {
	config, err := loadConfig()
	if err != nil {
		return fmt.Errorf("not logged in. Run 'mr-promth-cli login' first")
	}

	wsURL, _ := cmd.Flags().GetString("ws-url")

	fmt.Println("Connecting to Mr.Promth...")
	fmt.Printf("WebSocket URL: %s\n", wsURL)

	// Parse WebSocket URL
	u, err := url.Parse(wsURL)
	if err != nil {
		return fmt.Errorf("invalid WebSocket URL: %w", err)
	}

	// Add authentication query parameters
	q := u.Query()
	q.Set("token", config.AuthToken)
	q.Set("session", config.SessionToken)
	u.RawQuery = q.Encode()

	// Connect to WebSocket
	conn, _, err := websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		return fmt.Errorf("failed to connect: %w", err)
	}
	defer conn.Close()

	fmt.Println("✓ Connected to Mr.Promth")
	fmt.Println("Waiting for commands from AI agents...")
	fmt.Println("Press Ctrl+C to disconnect")

	// Handle interrupt signal
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt, syscall.SIGTERM)

	// Channel for receiving messages
	done := make(chan struct{})

	// Start message handler
	go handleMessages(conn, done)

	// Wait for interrupt or done
	select {
	case <-interrupt:
		fmt.Println("\nDisconnecting...")
		
		// Send close message
		err := conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
		if err != nil {
			log.Printf("Error sending close message: %v", err)
		}
		
		// Wait for done or timeout
		select {
		case <-done:
		case <-time.After(time.Second):
		}
		
	case <-done:
		fmt.Println("Connection closed by server")
	}

	return nil
}

// handleMessages handles incoming WebSocket messages
func handleMessages(conn *websocket.Conn, done chan struct{}) {
	defer close(done)

	for {
		_, message, err := conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseNormalClosure) {
				log.Printf("WebSocket error: %v", err)
			}
			return
		}

		// Parse command
		var command Command
		if err := json.Unmarshal(message, &command); err != nil {
			log.Printf("Failed to parse command: %v", err)
			continue
		}

		// Execute command
		result := executeCommand(&command)

		// Send result back
		resultJSON, err := json.Marshal(result)
		if err != nil {
			log.Printf("Failed to marshal result: %v", err)
			continue
		}

		if err := conn.WriteMessage(websocket.TextMessage, resultJSON); err != nil {
			log.Printf("Failed to send result: %v", err)
			return
		}
	}
}

// Command represents a command from the backend
type Command struct {
	ID         string                 `json:"id"`
	ToolName   string                 `json:"tool_name"`
	Parameters map[string]interface{} `json:"parameters"`
}

// CommandResult represents the result of a command execution
type CommandResult struct {
	ID      string                 `json:"id"`
	Success bool                   `json:"success"`
	Output  map[string]interface{} `json:"output"`
	Error   string                 `json:"error,omitempty"`
}

// executeCommand executes a command and returns the result
func executeCommand(cmd *Command) *CommandResult {
	if Verbose {
		fmt.Printf("\n→ Executing: %s\n", cmd.ToolName)
	}

	result := &CommandResult{
		ID:     cmd.ID,
		Output: make(map[string]interface{}),
	}

	switch cmd.ToolName {
	case "writeFile":
		err := executeWriteFile(cmd.Parameters)
		if err != nil {
			result.Success = false
			result.Error = err.Error()
		} else {
			result.Success = true
			result.Output["message"] = "File written successfully"
		}

	case "readFile":
		content, err := executeReadFile(cmd.Parameters)
		if err != nil {
			result.Success = false
			result.Error = err.Error()
		} else {
			result.Success = true
			result.Output["content"] = content
		}

	case "runCommand":
		output, err := executeRunCommand(cmd.Parameters)
		if err != nil {
			result.Success = false
			result.Error = err.Error()
		} else {
			result.Success = true
			result.Output["stdout"] = output
		}

	case "listFiles":
		files, err := executeListFiles(cmd.Parameters)
		if err != nil {
			result.Success = false
			result.Error = err.Error()
		} else {
			result.Success = true
			result.Output["files"] = files
		}

	case "createDirectory":
		err := executeCreateDirectory(cmd.Parameters)
		if err != nil {
			result.Success = false
			result.Error = err.Error()
		} else {
			result.Success = true
			result.Output["message"] = "Directory created successfully"
		}

	case "deleteFile":
		err := executeDeleteFile(cmd.Parameters)
		if err != nil {
			result.Success = false
			result.Error = err.Error()
		} else {
			result.Success = true
			result.Output["message"] = "File deleted successfully"
		}

	case "gitCommit":
		err := executeGitCommit(cmd.Parameters)
		if err != nil {
			result.Success = false
			result.Error = err.Error()
		} else {
			result.Success = true
			result.Output["message"] = "Git commit successful"
		}

	case "gitPush":
		err := executeGitPush(cmd.Parameters)
		if err != nil {
			result.Success = false
			result.Error = err.Error()
		} else {
			result.Success = true
			result.Output["message"] = "Git push successful"
		}

	default:
		result.Success = false
		result.Error = fmt.Sprintf("Unknown tool: %s", cmd.ToolName)
	}

	if Verbose {
		if result.Success {
			fmt.Printf("✓ Success\n")
		} else {
			fmt.Printf("✗ Error: %s\n", result.Error)
		}
	}

	return result
}
