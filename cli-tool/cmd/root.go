package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

var (
	// Version of the CLI
	Version = "1.0.0"
	
	// ConfigPath is the path to the config file
	ConfigPath string
	
	// Verbose enables verbose output
	Verbose bool
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "mr-promth-cli",
	Short: "Mr.Promth CLI - AI-powered development automation",
	Long: `Mr.Promth CLI is a command-line tool that connects your local machine
to the Mr.Promth platform, enabling AI agents to execute commands and build
projects directly in your development environment.

Features:
  - Secure authentication with Supabase
  - Real-time WebSocket communication
  - Safe command execution with sandboxing
  - File system operations
  - Git integration
  - Database management
  - Deployment automation`,
	Version: Version,
}

// Execute adds all child commands to the root command and sets flags appropriately.
func Execute() error {
	return rootCmd.Execute()
}

func init() {
	// Global flags
	rootCmd.PersistentFlags().StringVar(&ConfigPath, "config", "", "config file (default is $HOME/.mrphomth/config.yaml)")
	rootCmd.PersistentFlags().BoolVarP(&Verbose, "verbose", "v", false, "verbose output")
	
	// Add subcommands
	rootCmd.AddCommand(loginCmd)
	rootCmd.AddCommand(logoutCmd)
	rootCmd.AddCommand(connectCmd)
	rootCmd.AddCommand(statusCmd)
	rootCmd.AddCommand(versionCmd)
}

// versionCmd represents the version command
var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("mr-promth-cli v%s\n", Version)
	},
}

// statusCmd represents the status command
var statusCmd = &cobra.Command{
	Use:   "status",
	Short: "Check connection status",
	Run: func(cmd *cobra.Command, args []string) {
		config, err := loadConfig()
		if err != nil {
			fmt.Println("Status: Not logged in")
			return
		}
		
		if config.AuthToken == "" {
			fmt.Println("Status: Not logged in")
			return
		}
		
		fmt.Println("Status: Logged in")
		fmt.Printf("User ID: %s\n", config.UserID)
		fmt.Printf("Session: %s\n", config.SessionToken[:8]+"...")
	},
}

// Config represents the CLI configuration
type Config struct {
	AuthToken    string `yaml:"auth_token"`
	UserID       string `yaml:"user_id"`
	SessionToken string `yaml:"session_token"`
	SupabaseURL  string `yaml:"supabase_url"`
	MachineID    string `yaml:"machine_id"`
}

// loadConfig loads the configuration from file
func loadConfig() (*Config, error) {
	configDir := getConfigDir()
	configFile := configDir + "/config.yaml"
	
	if _, err := os.Stat(configFile); os.IsNotExist(err) {
		return nil, fmt.Errorf("config file not found")
	}
	
	// Read config file
	data, err := os.ReadFile(configFile)
	if err != nil {
		return nil, err
	}
	
	// Parse YAML (simple key-value parsing)
	config := &Config{}
	lines := string(data)
	fmt.Sscanf(lines, "auth_token: %s\nuser_id: %s\nsession_token: %s\nsupabase_url: %s\nmachine_id: %s",
		&config.AuthToken, &config.UserID, &config.SessionToken, &config.SupabaseURL, &config.MachineID)
	
	return config, nil
}

// saveConfig saves the configuration to file
func saveConfig(config *Config) error {
	configDir := getConfigDir()
	
	// Create config directory if it doesn't exist
	if err := os.MkdirAll(configDir, 0700); err != nil {
		return err
	}
	
	configFile := configDir + "/config.yaml"
	
	// Write config file
	data := fmt.Sprintf("auth_token: %s\nuser_id: %s\nsession_token: %s\nsupabase_url: %s\nmachine_id: %s\n",
		config.AuthToken, config.UserID, config.SessionToken, config.SupabaseURL, config.MachineID)
	
	return os.WriteFile(configFile, []byte(data), 0600)
}

// getConfigDir returns the configuration directory path
func getConfigDir() string {
	home, err := os.UserHomeDir()
	if err != nil {
		return ".mrphomth"
	}
	return home + "/.mrphomth"
}
