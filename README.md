# GitHub Desktop for VS Code

A Visual Studio Code extension that provides a GitHub Desktop-like Git interface directly within the editor.

## Features

- **Visual Git Interface**: Clean, intuitive interface similar to GitHub Desktop
- **Branch Management**: Easy branch switching, creation, and management with stash handling
- **Commit History**: View commit history with detailed diff views
- **File Changes**: See all changed files with staging/unstaging capabilities
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Context Menus**: Right-click actions for quick file operations

## Keyboard Shortcuts

- **`Ctrl/Cmd + B`**: Open branch dialog
- **`Ctrl/Cmd + C`**: Focus commit message field
- **`Ctrl/Cmd + P`**: Pull or push changes
- **`Ctrl/Cmd + R`**: Open pull request in browser
- **`Ctrl/Cmd + Enter`**: Commit changes (when in commit area)
- **`Tab`**: Navigate from summary to description field
- **`Escape`**: Close modals and menus

### Branch Dialog Navigation
- **`Up/Down Arrows`**: Navigate branch list
- **`Enter`**: Switch to selected branch or create new branch
- **`Left/Right Arrows`**: Switch between Branches and Pull Requests tabs

## Installation

1. Open VS Code
2. Go to Extensions (Ctrl/Cmd + Shift + X)
3. Search for "GitHub Desktop"
4. Install the extension

## Usage

1. Open a Git repository in VS Code
2. The extension will automatically activate
3. Look for the "GitHub Desktop" view in the SCM panel
4. Use the interface to manage your Git workflow

## Requirements

- VS Code 1.74.0 or higher
- Git installed and configured
- A Git repository opened in the workspace

## Extension Settings

This extension contributes the following settings:

- `gh-desk.autoRefresh`: Automatically refresh git status when files change (default: true)
- `gh-desk.githubToken`: GitHub Personal Access Token for fetching pull requests (optional if already signed in to GitHub in VS Code). Create one at https://github.com/settings/tokens with 'repo' scope.

## GitHub Authentication

The extension supports two ways to authenticate with GitHub for pull request functionality:

### 1. VS Code GitHub Authentication (Recommended)
If you're already signed in to GitHub in VS Code, the extension will automatically use your existing authentication session.

### 2. Personal Access Token
Alternatively, you can configure a GitHub Personal Access Token in the extension settings. This is useful if you prefer not to use VS Code's built-in authentication or need different permissions.

## Development

To develop this extension:

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to compile TypeScript
4. Press F5 to run the extension in a new Extension Development Host window

## License

MIT License - see LICENSE file for details