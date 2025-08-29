# Git Integration

## Overview
The extension integrates with VS Code's built-in Git extension API to provide Git functionality through a GitHub Desktop-like interface.

## Architecture

### GitProvider (Backend)
- **Location**: `src/services/GitProvider.ts`
- **Purpose**: Handles all Git operations and communicates with VS Code's Git extension
- **Key Features**:
  - Repository initialization and status monitoring
  - File system watching for automatic status updates
  - WebView message handling for frontend requests

### GitService (Frontend)
- **Location**: `src/webview/services/gitService.ts`
- **Purpose**: Frontend service that communicates with GitProvider via postMessage API
- **Key Features**:
  - Event-driven status updates
  - Commit history management
  - File operations (stage, unstage, discard)

## Git Operations

### Status Management
- Real-time file status tracking using VS Code's Git API
- Automatic refresh on file system changes
- Status mapping: modified, added, deleted, untracked, conflicted

### File Operations
- **Stage/Unstage**: Individual files or all files
- **Discard Changes**: Revert file to last commit state
- **File Actions**: Open in editor, reveal in finder, copy full path

### Commit Operations
- **Commit**: Create new commits with summary and description
- **Amend**: Modify last commit message or add staged changes
- **History**: View commit history with stats (files changed, insertions, deletions)

### Branch Operations
- **List Branches**: Get all available branches (local and remote)
- **Switch Branch**: Checkout different branches with UI feedback
- **Branch Status**: Ahead/behind tracking and current branch indication
- **Create Branch**: Create new branches from current or default branch

### Pull Request Operations
- **List Pull Requests**: Fetch real PRs from GitHub API when token is configured
- **Switch to PR Branch**: Checkout the branch associated with a PR
- **PR Status**: Display PR status (open, merged, closed) with visual indicators
- **GitHub Integration**: Automatic repository detection and API authentication

### GitHub API Integration
- **VS Code Authentication**: Automatically uses existing GitHub login from VS Code
- **Token Fallback**: Falls back to `gh-desk.githubToken` setting if VS Code auth unavailable
- **Repository Detection**: Automatic repository detection and API authentication
- **Error Handling**: Graceful fallbacks when API is unavailable
- **Rate Limiting**: Respects GitHub API rate limits

## Technical Implementation

### VS Code Git Extension Integration
```typescript
const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
const git = gitExtension.isActive ? gitExtension.exports : await gitExtension.activate();
this.gitAPI = git.getAPI(1);
```

### File Status Mapping
Status codes from Git API are mapped to user-friendly status strings:
- `INDEX_ADDED` → 'added'
- `INDEX_MODIFIED` → 'modified'
- `INDEX_DELETED` → 'deleted'
- `UNTRACKED` → 'untracked'

### Message Passing
Communication between extension and webview uses VS Code's postMessage API:
- Extension → WebView: Git status updates, commit history, branch lists, PR data
- WebView → Extension: User actions (stage file, commit, switch branch, switch to PR)

## Branch Modal Interface

### Two-Tab Structure
The branch modal provides a unified interface for branch and PR management:

#### Branches Tab
- **Real-time Branch List**: Displays all available branches from Git
- **Current Branch Indicator**: Shows which branch is currently checked out
- **Filter Functionality**: Search and filter branches by name
- **Branch Switching**: Click to switch to any branch
- **Create Branch**: Quick access to create new branches

#### Pull Requests Tab
- **PR List**: Shows open pull requests with title, number, author, and status
- **Status Indicators**: Visual status badges (open, merged, closed)
- **Time Information**: Relative time stamps for when PRs were opened
- **PR Branch Switching**: Click to checkout the branch for any PR

### User Experience Features
- **Keyboard Navigation**: Tab switching with arrow keys
- **Visual Feedback**: Current branch highlighting and status indicators
- **Error Handling**: Graceful error messages for failed operations
- **Auto-refresh**: Branch and PR data refreshes when modal opens

## Error Handling
- Graceful fallback when Git extension is not available
- Error messages displayed to user via VS Code notifications
- Mock data provided when Git operations fail