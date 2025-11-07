# Mr.Promth CLI Tool

A command-line interface tool for connecting your local machine to the Mr.Promth platform, enabling AI agents to execute commands and build projects directly in your development environment.

## Features

- ✅ **Secure Authentication** - Login with Supabase credentials
- ✅ **Real-time Communication** - WebSocket connection to backend
- ✅ **Safe Command Execution** - Sandboxed command execution with security checks
- ✅ **File Operations** - Read, write, list, and delete files
- ✅ **Git Integration** - Commit and push changes
- ✅ **Cross-platform** - Works on Linux, macOS, and Windows

## Installation

### From Source

```bash
cd cli-tool
go build -o mr-promth-cli .
sudo mv mr-promth-cli /usr/local/bin/
```

### Binary Release

Download the latest binary for your platform from the releases page.

## Usage

### Login

```bash
mr-promth-cli login
```

You'll be prompted for your email and password. Credentials are stored securely in `~/.mrphomth/config.yaml`.

### Connect

Start the agent runner and connect to the backend:

```bash
mr-promth-cli connect
```

This establishes a WebSocket connection and waits for commands from AI agents.

### Check Status

```bash
mr-promth-cli status
```

### Logout

```bash
mr-promth-cli logout
```

## Supported Tools

The CLI supports the following tools that AI agents can execute:

### File Operations

- **writeFile** - Write content to a file
  ```json
  {
    "tool_name": "writeFile",
    "parameters": {
      "path": "src/index.js",
      "content": "console.log('Hello World');"
    }
  }
  ```

- **readFile** - Read content from a file
  ```json
  {
    "tool_name": "readFile",
    "parameters": {
      "path": "src/index.js"
    }
  }
  ```

- **listFiles** - List files in a directory
  ```json
  {
    "tool_name": "listFiles",
    "parameters": {
      "path": "src/"
    }
  }
  ```

- **createDirectory** - Create a directory
  ```json
  {
    "tool_name": "createDirectory",
    "parameters": {
      "path": "src/components"
    }
  }
  ```

- **deleteFile** - Delete a file or directory
  ```json
  {
    "tool_name": "deleteFile",
    "parameters": {
      "path": "temp.txt"
    }
  }
  ```

### Command Execution

- **runCommand** - Execute a shell command
  ```json
  {
    "tool_name": "runCommand",
    "parameters": {
      "command": "npm install",
      "workDir": "/path/to/project"
    }
  }
  ```

### Git Operations

- **gitCommit** - Commit changes
  ```json
  {
    "tool_name": "gitCommit",
    "parameters": {
      "message": "Add new feature",
      "workDir": "/path/to/project"
    }
  }
  ```

- **gitPush** - Push to remote
  ```json
  {
    "tool_name": "gitPush",
    "parameters": {
      "branch": "main",
      "workDir": "/path/to/project"
    }
  }
  ```

## Security

The CLI implements several security measures:

1. **Path Validation** - All file operations are restricted to the current working directory
2. **Command Filtering** - Dangerous commands (e.g., `rm -rf /`, `sudo`) are blocked
3. **Sandboxing** - Commands run in a restricted environment
4. **Secure Storage** - Credentials are stored with 0600 permissions

## Configuration

Configuration is stored in `~/.mrphomth/config.yaml`:

```yaml
auth_token: <supabase-auth-token>
user_id: <user-uuid>
session_token: <session-token>
supabase_url: https://xcwkwdoxrbzzpwmlqswr.supabase.co
machine_id: <machine-identifier>
```

## Development

### Building

```bash
go build -o mr-promth-cli .
```

### Testing

```bash
go test ./...
```

### Cross-compilation

```bash
# Linux
GOOS=linux GOARCH=amd64 go build -o mr-promth-cli-linux-amd64

# macOS
GOOS=darwin GOARCH=amd64 go build -o mr-promth-cli-darwin-amd64

# Windows
GOOS=windows GOARCH=amd64 go build -o mr-promth-cli-windows-amd64.exe
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Mr.Promth Backend                        │
│                    (Next.js + WebSocket)                     │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ WebSocket
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Mr.Promth CLI Tool                         │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Commands   │  │   WebSocket  │  │     Tools    │      │
│  │              │  │   Handler    │  │              │      │
│  │ - login      │  │              │  │ - writeFile  │      │
│  │ - logout     │  │ - Connect    │  │ - readFile   │      │
│  │ - connect    │  │ - Execute    │  │ - runCommand │      │
│  │ - status     │  │ - Respond    │  │ - gitCommit  │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         │ File System / Shell
                         │
┌────────────────────────▼────────────────────────────────────┐
│                   Local Development Environment              │
│                  (Files, Git, Commands, etc.)                │
└─────────────────────────────────────────────────────────────┘
```

## Troubleshooting

### Connection Failed

- Check that the backend is running
- Verify the WebSocket URL is correct
- Ensure you're logged in (`mr-promth-cli status`)

### Command Execution Failed

- Check file permissions
- Verify paths are correct
- Review security restrictions

### Authentication Failed

- Verify your credentials
- Check Supabase URL is correct
- Ensure network connectivity

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/mrphomth/cli/issues
- Documentation: https://docs.mrphomth.com
