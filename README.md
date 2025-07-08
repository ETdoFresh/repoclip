# repoclip

A command-line tool that copies all non-gitignored files from a repository to your clipboard.

## Installation

### Windows
Run the installation script:
```cmd
install.cmd
```

This will:
1. Build the TypeScript project
2. Install repoclip globally using npm link
3. Make the `repoclip` command available system-wide

### Manual Installation
```bash
npm run build
npm link
```

## Uninstallation

### Windows
Run the uninstallation script:
```cmd
uninstall.cmd
```

This will remove the global `repoclip` command from your system.

### Manual Uninstallation
```bash
npm unlink -g repoclip
```

## Usage

### Basic Usage
```bash
# Copy all non-gitignored files to clipboard
repoclip
```

### Options

- `-i, --ignore <patterns...>` - Additional patterns to ignore
- `-o, --only <patterns...>` - Only include files matching these patterns
- `-s, --stdout` - Output to stdout instead of clipboard
- `-h, --help` - Display help information
- `-V, --version` - Display version

### Examples

```bash
# Copy all non-gitignored files
repoclip

# Ignore all .log files
repoclip --ignore "**/*.log"

# Only include .ts and .js files
repoclip --only "*.ts" "*.js"

# Ignore tmp/ and only include src/
repoclip -i "tmp/*" -o "src/**"

# Display files instead of copying
repoclip --stdout

# Display only JSON files
repoclip -s -o "*.json"
```

## Features

- Automatically respects `.gitignore` patterns
- Always excludes `.git` and `node_modules` directories
- Skips binary files
- Shows file count and total size
- Supports glob patterns for filtering
- Can output to stdout for preview

## Output Format

When files are copied or displayed, they're formatted with:
- File separators (`============`)
- File path headers
- Full file contents