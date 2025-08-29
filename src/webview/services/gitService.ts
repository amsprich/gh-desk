import { vscode } from '../lib/vscode';

export interface GitFile {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'conflicted';
  isStaged: boolean;
}

export interface GitStatus {
  files: GitFile[];
  branch: string;
  ahead: number;
  behind: number;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
  filesChanged: number;
  insertions: number;
  deletions: number;
}

export interface PullRequestInfo {
  number: number;
  title: string;
  author: string;
  branch: string;
  createdAt: string;
  status: 'open' | 'closed' | 'merged' | 'info';
  htmlUrl?: string;
  message?: string;
}

class GitService {
  private listeners: Set<(status: GitStatus) => void> = new Set();
  private commitHistoryListeners: Set<(commits: CommitInfo[]) => void> = new Set();
  private branchListeners: Set<(branches: string[]) => void> = new Set();
  private prListeners: Set<(prs: PullRequestInfo[]) => void> = new Set();
  private commitHistory: CommitInfo[] = [];
  private branches: string[] = [];
  private pullRequests: PullRequestInfo[] = [];

  constructor() {
    // Listen for Git status updates from the extension
    window.addEventListener('message', (event) => {
      const message = event.data;
      if (message.type === 'gitStatusUpdate') {
        this.notifyListeners(message.data);
      } else if (message.type === 'commitHistoryUpdate') {
        this.commitHistory = message.data;
        this.notifyCommitHistoryListeners();
      } else if (message.type === 'branchesUpdate') {
        this.branches = message.data;
        this.notifyBranchListeners();
      } else if (message.type === 'pullRequestsUpdate') {
        this.pullRequests = message.data;
        this.notifyPRListeners();
      } else if (message.type === 'fullFilePath') {
        // Copy the full file path to clipboard
        navigator.clipboard.writeText(message.path);
      } else if (message.type === 'additionalCommits') {
        // Append additional commits to existing history
        this.commitHistory = [...this.commitHistory, ...message.data];
        this.notifyCommitHistoryListeners();
      }
    });

    // Request initial status after a short delay to ensure extension is ready
    setTimeout(() => {
      this.refresh();
    }, 100);
  }

  /**
   * Subscribe to Git status changes
   */
  onStatusChange(callback: (status: GitStatus) => void): () => void {
    this.listeners.add(callback);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Subscribe to commit history changes
   */
  onCommitHistoryChange(callback: (commits: CommitInfo[]) => void): () => void {
    this.commitHistoryListeners.add(callback);
    // Return unsubscribe function
    return () => {
      this.commitHistoryListeners.delete(callback);
    };
  }

  private notifyCommitHistoryListeners() {
    this.commitHistoryListeners.forEach(listener => listener(this.commitHistory));
  }

  private notifyBranchListeners() {
    this.branchListeners.forEach(listener => listener(this.branches));
  }

  private notifyPRListeners() {
    this.prListeners.forEach(listener => listener(this.pullRequests));
  }

  private notifyListeners(status: GitStatus) {
    this.listeners.forEach(listener => listener(status));
  }

  /**
   * Request current Git status from the extension
   */
  async refresh(): Promise<void> {
    vscode.postMessage({
      type: 'getGitStatus'
    });
  }

  /**
   * Get commit history
   */
  async getCommitHistory(): Promise<void> {
    vscode.postMessage({
      type: 'getCommitHistory'
    });
  }

  /**
   * Load more commits (for infinite scroll)
   */
  async loadMoreCommits(): Promise<void> {
    vscode.postMessage({
      type: 'loadMoreCommits',
      offset: this.commitHistory.length
    });
  }

  /**
   * Stage a file
   */
  async stageFile(filePath: string): Promise<void> {
    vscode.postMessage({
      type: 'stageFile',
      path: filePath
    });
  }

  /**
   * Unstage a file
   */
  async unstageFile(filePath: string): Promise<void> {
    vscode.postMessage({
      type: 'unstageFile',
      path: filePath
    });
  }

  /**
   * Stage all files
   */
  async stageAll(): Promise<void> {
    vscode.postMessage({
      type: 'stageAll'
    });
  }

  /**
   * Unstage all files
   */
  async unstageAll(): Promise<void> {
    vscode.postMessage({
      type: 'unstageAll'
    });
  }

  /**
   * Commit staged changes
   */
  async commit(message: string, description?: string): Promise<void> {
    vscode.postMessage({
      type: 'commit',
      message,
      description
    });
  }

  /**
   * Discard changes to a file
   */
  async discardChanges(filePath: string): Promise<void> {
    vscode.postMessage({
      type: 'discardChanges',
      path: filePath
    });
  }

  /**
    * Amend the last commit
    */
   async amendLastCommit(message?: string): Promise<void> {
     vscode.postMessage({
       type: 'amendLastCommit',
       message
     });
   }

   /**
    * Subscribe to branch changes
    */
   onBranchChange(callback: (branches: string[]) => void): () => void {
     this.branchListeners.add(callback);
     // Return unsubscribe function
     return () => {
       this.branchListeners.delete(callback);
     };
   }

   /**
    * Subscribe to PR changes
    */
   onPRChange(callback: (prs: PullRequestInfo[]) => void): () => void {
     this.prListeners.add(callback);
     // Return unsubscribe function
     return () => {
       this.prListeners.delete(callback);
     };
   }

   /**
    * Get branches
    */
   async getBranches(): Promise<void> {
     vscode.postMessage({
       type: 'getBranches'
     });
   }

   /**
    * Get pull requests
    */
   async getPullRequests(): Promise<void> {
     vscode.postMessage({
       type: 'getPullRequests'
     });
   }

   /**
    * Switch to a branch
    */
   async switchBranch(branchName: string): Promise<void> {
     vscode.postMessage({
       type: 'switchBranch',
       branch: branchName
     });
   }

   /**
    * Switch to a PR branch
    */
   async switchToPR(prNumber: number, branchName: string): Promise<void> {
     vscode.postMessage({
       type: 'switchToPR',
       prNumber,
       branch: branchName
     });
   }

   /**
    * Create a new branch
    */
   async createBranch(name: string, baseBranch: 'main' | 'current', stashAction?: 'leave' | 'bring'): Promise<void> {
     vscode.postMessage({
       type: 'createBranch',
       name,
       baseBranch,
       stashAction
     });
   }

   /**
    * Stash changes
    */
   async stashChanges(message?: string): Promise<void> {
     vscode.postMessage({
       type: 'stashChanges',
       message
     });
   }
 }

// Export singleton instance
export const gitService = new GitService();