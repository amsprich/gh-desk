# VSCode Git Extension: Project Document

This document outlines the features and functionality of a Git integration extension for Visual Studio Code. The extension is designed to provide a seamless, visual Git experience directly within the editor, focusing on the currently opened project and branch.

## Core UI Components

The extension's UI is divided into two main panels, which are fully resizable for a customized workflow.

### 1. Sidebar Panel

The sidebar provides a high-level overview of your repository's status and is divided into two main tabs: **Changes** and **History**.

#### Changes Tab

This is the default view and focuses on your current work-in-progress. It includes:

* A filterable list of all uncommitted file changes.
* A summary and description field for crafting commit messages.
* A "Commit" button to finalize your changes.

#### History Tab

This view displays a chronological list of all previous commits for the current branch. Selecting a commit will update the main panel to show the details of that commit.

### 2. Main Panel

The main panel is context-aware and updates based on your selections in the sidebar.

#### Diff View

When the **Changes** tab is active, this panel displays a color-coded diff of all uncommitted changes, allowing you to review your work before committing.

#### Commit Details

When a commit is selected from the **History** tab, this panel updates to show:

* The full commit message.
* A list of all files that were part of the commit.
* A diff view of the changes from that specific commit.

## Key Features & Workflows

### Branch Management

The extension offers a robust set of tools for managing branches, accessible through a centralized dialog.

* **Branch Switching & Creation**: Clicking the "Current Branch" button opens a dialog where you can filter existing branches, switch to a different one, or create a new branch.
* **Base Branch Selection**: When creating a new branch from a non-default branch, you'll be prompted to choose whether to base your new branch on the default branch or your current one.
* **Handling Uncommitted Changes**: If you have uncommitted work, a dialog will ask whether you want to bring your changes to the new branch or leave them stashed on the current one. This dialog now defaults to bringing the changes with you for a smoother workflow.

### Context Menu

For quick access to common actions, a custom context menu is available when you right-click on a changed file or within the diff panel. The menu includes the following options:

* Discard Changes
* Copy File Path
* Copy Relative File Path
* Reveal in Finder
* Open in Editor

## Keyboard Shortcuts

To accelerate your workflow, the following keyboard shortcuts are available:

* **`ctrl+b`**: Opens the branch dialog with the cursor automatically focused in the filter field.
    * **`Enter`**: Creates a new branch using the text in the filter field.
    * **`Up/Down Arrows`**: Navigates the branch list.
    * **`Right Arrow`**: Switches to the "Pull Requests" tab.
    * **`Left Arrow`**: Switches back to the "Branches" tab.
* **`ctrl+c`**: Focuses the commit message's summary field.
    * **`Tab`**: Moves the cursor to the description field.
    * **`ctrl+enter`**: Commits the changes using the provided summary and description.
* **`ctrl+p`**: Pulls the latest changes from the remote repository. If the branch is already up-to-date and there are no uncommitted changes, it will push any local commits instead.
* **`ctrl+r`**: Opens the corresponding pull request on GitHub in your default browser. If no pull request exists for the current branch, it will open the "Create a Pull Request" page.