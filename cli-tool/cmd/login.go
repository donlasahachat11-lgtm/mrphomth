package cmd

import (
	"bufio"
	"bytes"
	"crypto/rand"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"syscall"

	"github.com/spf13/cobra"
	"golang.org/x/term"
)

const (
	DefaultSupabaseURL = "https://xcwkwdoxrbzzpwmlqswr.supabase.co"
	DefaultAnonKey     = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhid2t3ZG94cmJ6enB3bWxxc3dyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzA4OTk4NjYsImV4cCI6MjA0NjQ3NTg2Nn0"
)

// loginCmd represents the login command
var loginCmd = &cobra.Command{
	Use:   "login",
	Short: "Login to Mr.Promth",
	Long: `Authenticate with your Mr.Promth account using email and password.
This will store your credentials securely in ~/.mrphomth/config.yaml`,
	RunE: runLogin,
}

func init() {
	loginCmd.Flags().String("email", "", "Email address")
	loginCmd.Flags().String("password", "", "Password")
	loginCmd.Flags().String("supabase-url", DefaultSupabaseURL, "Supabase URL")
}

func runLogin(cmd *cobra.Command, args []string) error {
	email, _ := cmd.Flags().GetString("email")
	password, _ := cmd.Flags().GetString("password")
	supabaseURL, _ := cmd.Flags().GetString("supabase-url")

	// Prompt for email if not provided
	if email == "" {
		fmt.Print("Email: ")
		reader := bufio.NewReader(os.Stdin)
		input, err := reader.ReadString('\n')
		if err != nil {
			return fmt.Errorf("failed to read email: %w", err)
		}
		email = strings.TrimSpace(input)
	}

	// Prompt for password if not provided
	if password == "" {
		fmt.Print("Password: ")
		passwordBytes, err := term.ReadPassword(int(syscall.Stdin))
		if err != nil {
			return fmt.Errorf("failed to read password: %w", err)
		}
		fmt.Println() // New line after password input
		password = string(passwordBytes)
	}

	// Authenticate with Supabase
	authToken, userID, err := authenticateWithSupabase(supabaseURL, email, password)
	if err != nil {
		return fmt.Errorf("authentication failed: %w", err)
	}

	// Generate machine ID
	machineID, err := generateMachineID()
	if err != nil {
		return fmt.Errorf("failed to generate machine ID: %w", err)
	}

	// Generate session token
	sessionToken, err := generateSessionToken()
	if err != nil {
		return fmt.Errorf("failed to generate session token: %w", err)
	}

	// Save configuration
	config := &Config{
		AuthToken:    authToken,
		UserID:       userID,
		SessionToken: sessionToken,
		SupabaseURL:  supabaseURL,
		MachineID:    machineID,
	}

	if err := saveConfig(config); err != nil {
		return fmt.Errorf("failed to save configuration: %w", err)
	}

	// Create CLI session in database
	if err := createCLISession(config); err != nil {
		fmt.Printf("Warning: Failed to create CLI session: %v\n", err)
	}

	fmt.Println("✓ Successfully logged in!")
	fmt.Printf("User ID: %s\n", userID)
	fmt.Printf("Session: %s\n", sessionToken[:8]+"...")
	fmt.Println("\nRun 'mr-promth-cli connect' to start the agent runner.")

	return nil
}

// authenticateWithSupabase authenticates with Supabase and returns the auth token and user ID
func authenticateWithSupabase(supabaseURL, email, password string) (string, string, error) {
	url := supabaseURL + "/auth/v1/token?grant_type=password"

	payload := map[string]string{
		"email":    email,
		"password": password,
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return "", "", err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return "", "", err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", DefaultAnonKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return "", "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", "", err
	}

	if resp.StatusCode != http.StatusOK {
		return "", "", fmt.Errorf("authentication failed: %s", string(body))
	}

	var result struct {
		AccessToken string `json:"access_token"`
		User        struct {
			ID string `json:"id"`
		} `json:"user"`
	}

	if err := json.Unmarshal(body, &result); err != nil {
		return "", "", err
	}

	return result.AccessToken, result.User.ID, nil
}

// generateMachineID generates a unique machine identifier
func generateMachineID() (string, error) {
	// Try to get hostname
	hostname, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	}

	// Generate random bytes
	b := make([]byte, 16)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}

	return fmt.Sprintf("%s-%x", hostname, b[:8]), nil
}

// generateSessionToken generates a random session token
func generateSessionToken() (string, error) {
	b := make([]byte, 32)
	if _, err := rand.Read(b); err != nil {
		return "", err
	}
	return fmt.Sprintf("%x", b), nil
}

// createCLISession creates a CLI session record in the database
func createCLISession(config *Config) error {
	url := config.SupabaseURL + "/rest/v1/cli_sessions"

	hostname, _ := os.Hostname()
	osInfo := fmt.Sprintf("%s/%s", os.Getenv("GOOS"), os.Getenv("GOARCH"))

	payload := map[string]interface{}{
		"user_id":       config.UserID,
		"session_token": config.SessionToken,
		"machine_id":    config.MachineID,
		"machine_name":  hostname,
		"os_info":       osInfo,
		"cli_version":   Version,
		"status":        "connected",
	}

	jsonData, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	req, err := http.NewRequest("POST", url, bytes.NewBuffer(jsonData))
	if err != nil {
		return err
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("apikey", DefaultAnonKey)
	req.Header.Set("Authorization", "Bearer "+config.AuthToken)
	req.Header.Set("Prefer", "return=minimal")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to create CLI session: %s", string(body))
	}

	return nil
}
