# Sidebar Functionality

## Overview
The sidebar provides the main Git interface with two primary views: Changes and History, implemented as a React component with tab-based navigation.

## Component Structure

### Main Sidebar Component
- **Location**: `src/webview/components/Sidebar.tsx`
- **Features**: Tab navigation, state management, keyboard shortcuts
- **Tabs**: Changes (file operations) and History (commit timeline)

## Changes View

### File Management
- **File List**: Displays all modified files with status indicators
- **Status Icons**:
  - 🟢 **A** (Added) - New files
  - 🟡 **M** (Modified) - Changed files
  - 🔴 **D** (Deleted) - Removed files
  - ⚪ **U** (Untracked) - New untracked files

### Staging Operations
- **Individual Staging**: Checkbox per file for stage/unstage
- **Bulk Operations**: "Stage All" / "Unstage All" functionality
- **Filter**: Search/filter files by path
- **Selection**: Click to select file for diff view

### Commit Interface
- **Commit Message**: Required summary field
- **Description**: Optional detailed description
- **Commit Button**: Shows staged file count and current branch
- **Amend Button**: Modify last commit (when available)

### Context Menu
- **Right-click Actions**:
  - Stage/Unstage file
  - Discard changes
  - Open in editor
  - Reveal in finder
  - Copy full path

## History View

### Commit Timeline
- **Commit List**: Chronological commit history
- **Commit Details**:
  - Author avatar (initials)
  - Commit message
  - Short hash
  - Author name and date
  - File change statistics

### Infinite Scroll
- **Load More**: Automatically loads additional commits on scroll
- **Batch Size**: 30 commits per load
- **Performance**: Efficient rendering for large histories

## State Management

### UI Context
- **Location**: `src/webview/contexts/UIContext.tsx`
- **State Properties**:
  - `activeTab`: Current tab ('changes' | 'history')
  - `gitFiles`: Array of file status objects
  - `selectedFile`: Currently selected file for diff
  - `commitHistory`: Array of commit objects
  - `currentBranch`: Active branch name
  - `stagedCount`: Number of staged files
  - `uncommittedChanges`: Total changed files

### Git Service Integration
- **Real-time Updates**: Automatic refresh on file changes
- **Event Listeners**: Subscribe to Git status and history changes
- **Message Passing**: Communicate with extension backend

## User Interactions

### Keyboard Navigation
- **Tab Switching**: Click or programmatic tab changes
- **File Selection**: Click to select, Enter to confirm
- **Context Menu**: Right-click or keyboard shortcuts
- **Escape**: Close menus and dialogs

### Mouse Interactions
- **File Checkbox**: Stage/unstage individual files
- **Bulk Checkbox**: Stage/unstage all files
- **File Click**: Select file for diff view
- **Scroll**: Infinite scroll in history view

## Performance Features

### Efficient Rendering
- **File Filtering**: Client-side search with debouncing
- **Virtual Scrolling**: Optimized for large file lists
- **Memoization**: Prevent unnecessary re-renders

### Data Management
- **Lazy Loading**: History commits loaded on demand
- **Caching**: Git status cached and refreshed on changes
- **Error Handling**: Graceful fallbacks for failed operations

## Accessibility

### Keyboard Support
- **Tab Navigation**: Full keyboard accessibility
- **Focus Management**: Proper focus indicators
- **Screen Reader**: Semantic HTML structure

### Visual Design
- **Status Indicators**: Clear visual status representation
- **Loading States**: Spinner animations during operations
- **Error States**: Clear error messaging