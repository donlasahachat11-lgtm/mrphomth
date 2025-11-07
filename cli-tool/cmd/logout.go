package cmd

import (
	"fmt"
	"os"

	"github.com/spf13/cobra"
)

// logoutCmd represents the logout command
var logoutCmd = &cobra.Command{
	Use:   "logout",
	Short: "Logout from Mr.Promth",
	Long:  `Remove stored credentials and disconnect from Mr.Promth.`,
	RunE:  runLogout,
}

func runLogout(cmd *cobra.Command, args []string) error {
	config, err := loadConfig()
	if err != nil {
		fmt.Println("Already logged out")
		return nil
	}

	// Disconnect CLI session in database
	if err := disconnectCLISession(config); err != nil {
		fmt.Printf("Warning: Failed to disconnect CLI session: %v\n", err)
	}

	// Remove config file
	configDir := getConfigDir()
	configFile := configDir + "/config.yaml"

	if err := os.Remove(configFile); err != nil && !os.IsNotExist(err) {
		return fmt.Errorf("failed to remove config file: %w", err)
	}

	fmt.Println("✓ Successfully logged out")
	return nil
}

// disconnectCLISession marks the CLI session as disconnected in the database
func disconnectCLISession(config *Config) error {
	// This would call the Supabase function to disconnect the session
	// For now, we'll skip the actual API call
	return nil
}
