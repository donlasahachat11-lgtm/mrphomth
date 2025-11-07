package main

import (
	"fmt"
	"os"

	"github.com/mrphomth/cli/cmd"
)

const (
	// Version of the CLI tool
	Version = "1.0.0"
	// AppName is the name of the application
	AppName = "mr-promth-cli"
)

func main() {
	if err := cmd.Execute(); err != nil {
		fmt.Fprintf(os.Stderr, "Error: %v\n", err)
		os.Exit(1)
	}
}
