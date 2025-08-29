import * as vscode from 'vscode';
import * as cp from 'node:child_process';
import { join } from 'node:path';
import * as https from 'node:https';

interface GitExtension {
    getAPI(version: number): GitAPI;
}

interface GitAPI {
    repositories: Repository[];
}

interface Repository {
    state: RepositoryState;
    inputBox: InputBox;
    rootUri: vscode.Uri;
    add(resources: vscode.Uri[]): Promise<void>;
    commit(message: string): Promise<void>;
    diff(path: string): Promise<string>;
    getBranches(): Promise<Branch[]>;
    checkout(branch: string): Promise<void>;
}

interface RepositoryState {
    HEAD: Branch | undefined;
    workingTreeChanges: Change[];
    indexChanges: Change[];
    mergeChanges: Change[];
}

interface Branch {
    name?: string;
    upstream?: { name: string; remote: string };
    ahead?: number;
    behind?: number;
}

interface Change {
    uri: vscode.Uri;
    status: number;
}

interface InputBox {
    value: string;
}

// Git status codes
const Status = {
    INDEX_MODIFIED: 0,
    INDEX_ADDED: 1,
    INDEX_DELETED: 2,
    INDEX_RENAMED: 3,
    INDEX_COPIED: 4,
    MODIFIED: 5,
    DELETED: 6,
    UNTRACKED: 7,
    IGNORED: 8,
    INTENT_TO_ADD: 9,
    ADDED_BY_US: 10,
    ADDED_BY_THEM: 11,
    DELETED_BY_US: 12,
    DELETED_BY_THEM: 13,
    BOTH_ADDED: 14,
    BOTH_DELETED: 15,
    BOTH_MODIFIED: 16
};

export class GitProvider {
    private gitAPI: GitAPI | undefined;
    private repository: Repository | undefined;
    private disposables: vscode.Disposable[] = [];

    constructor(private webviewPanel: vscode.WebviewPanel) {
        this.initializeGit();
    }

    private async initializeGit() {
        try {
            const gitExtension = vscode.extensions.getExtension<GitExtension>('vscode.git');
            if (!gitExtension) {
                console.error('Git extension not found');
                vscode.window.showErrorMessage('Git extension not found');
                return;
            }
                 
vscode.commands.getCommands(true).then(cmds => {
  console.log(cmds);
});

            const git = gitExtension.isActive ? gitExtension.exports : await gitExtension.activate();
            this.gitAPI = git.getAPI(1);

            console.log('Git API initialized, repositories found:', this.gitAPI.repositories.length);

            if (this.gitAPI.repositories.length === 0) {
                console.warn('No Git repositories found in workspace');
                vscode.window.showWarningMessage('No Git repositories found in workspace');
                // Send empty status to show UI is working
                this.sendGitStatus();
                return;
            }

            // Use the first repository
            this.repository = this.gitAPI.repositories[0];
            console.log('Git repository initialized:', this.repository.rootUri.toString());

            // Set up file system watcher for changes
            const watcher = vscode.workspace.createFileSystemWatcher('**/*');
            
            // Watch for any file changes
            watcher.onDidChange(() => this.sendGitStatus());
            watcher.onDidCreate(() => this.sendGitStatus());
            watcher.onDidDelete(() => this.sendGitStatus());
            
            this.disposables.push(watcher);

            // Listen for messages from the webview
            this.webviewPanel.webview.onDidReceiveMessage(
                message => this.handleWebviewMessage(message),
                undefined,
                this.disposables
            );

            // Send initial status after a brief delay
            setTimeout(() => this.sendGitStatus(), 100);
        } catch (error) {
            console.error('Error initializing Git:', error);
            vscode.window.showErrorMessage(`Git initialization failed: ${error}`);
        }
    }

    private async handleWebviewMessage(message: any) {
        console.log('Received message from webview:', message);
        
        switch (message.type) {
            case 'test':
                console.log('Test message received!');
                this.webviewPanel.webview.postMessage({
                    type: 'test-response',
                    data: 'Message received successfully!'
                });
                break;
                
            case 'getGitStatus':
                console.log('Git status requested');
                this.sendGitStatus();
                break;
            
            case 'stageFile':
                if (this.repository) {
                    await this.stageFile(message.path);
                }
                break;
            
            case 'unstageFile':
                if (this.repository) {
                    await this.unstageFile(message.path);
                }
                break;
            
            case 'stageAll':
                if (this.repository) {
                    await this.stageAll();
                }
                break;
            
            case 'unstageAll':
                if (this.repository) {
                    await this.unstageAll();
                }
                break;

            case 'discardChanges':
                if (this.repository) {
                    await this.discardChanges(message.path);
                }
                break;
            
            case 'commit':
                if (this.repository) {
                    await this.commit(message.message, message.description);
                }
                break;
            
            case 'discardChanges':
                if (this.repository) {
                    await this.discardChanges(message.path);
                }
                break;

            case 'getBranches':
                console.log('Branches requested');
                this.sendBranches();
                break;

            case 'switchBranch':
                if (this.repository) {
                    await this.switchBranch(message.branch);
                }
                break;

            case 'getCommitHistory':
                console.log('Commit history requested');
                this.sendCommitHistory();
                break;

            case 'amendLastCommit':
                console.log('Amend last commit requested');
                this.amendLastCommit(message.message);
                break;

            case 'getFullFilePath':
                console.log('Get full file path requested');
                this.getFullFilePath(message.path);
                break;

            case 'revealInFinder':
                console.log('Reveal in finder requested');
                this.revealInFinder(message.path);
                break;

            case 'openInEditor':
                console.log('Open in editor requested');
                this.openInEditor(message.path);
                break;

            case 'loadMoreCommits':
                console.log('Load more commits requested');
                this.loadMoreCommits(message.offset);
                break;

            case 'switchBranch':
                if (this.repository) {
                    await this.switchBranch(message.branch);
                }
                break;

            case 'getBranches':
                console.log('Branches requested');
                this.sendBranches();
                break;

            case 'getPullRequests':
                console.log('Pull requests requested');
                this.sendPullRequests();
                break;

            case 'switchToPR':
                if (this.repository) {
                    await this.switchToPR(message.prNumber, message.branch);
                }
                break;

            case 'createBranch':
                if (this.repository) {
                    await this.createBranch(message.name, message.baseBranch, message.stashAction);
                }
                break;

            case 'stashChanges':
                if (this.repository) {
                    await this.stashChanges(message.message);
                }
                break;

            case 'openExternalUrl':
                this.openExternalUrl(message.url);
                break;

            case 'openSettings':
                this.openSettings(message.section);
                break;
        }
    }

    private getFileStatus(status: number): string {
        if (status === Status.INDEX_ADDED || status === Status.ADDED_BY_US || status === Status.ADDED_BY_THEM) {
            return 'added';
        }
        if (status === Status.INDEX_MODIFIED || status === Status.MODIFIED || status === Status.BOTH_MODIFIED) {
            return 'modified';
        }
        if (status === Status.INDEX_DELETED || status === Status.DELETED || 
            status === Status.DELETED_BY_US || status === Status.DELETED_BY_THEM) {
            return 'deleted';
        }
        if (status === Status.UNTRACKED) {
            return 'untracked';
        }
        return 'unknown';
    }

    private async sendGitStatus() {
        if (!this.repository) {
            console.log('No repository available');
            return;
        }

        try {
            const state = this.repository.state;
            console.log('Repository state:', {
                hasState: !!state,
                hasHead: !!state?.HEAD,
                headName: state?.HEAD?.name,
                indexChangesCount: state?.indexChanges?.length || 0,
                workingTreeChangesCount: state?.workingTreeChanges?.length || 0
            });

            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                console.log('No workspace folder found');
                return;
            }

            const workspaceRoot = workspaceFolder.uri.path;

            // Safely handle changes arrays
            const indexChanges = state?.indexChanges || [];
            const workingTreeChanges = state?.workingTreeChanges || [];

            // Combine all changes with safety checks
            const allChanges = [
                ...indexChanges.map(change => ({ 
                    uri: change?.uri,
                    status: change?.status,
                    isStaged: true 
                })),
                ...workingTreeChanges.map(change => ({ 
                    uri: change?.uri,
                    status: change?.status,
                    isStaged: false 
                }))
            ];

            // Create a map to avoid duplicates and properly track staging status
            const filesMap = new Map<string, any>();

            allChanges.forEach(change => {
                if (!change?.uri?.path) {
                    console.log('Skipping change with no path:', change);
                    return;
                }

                try {
                    // Use proper path utilities to get relative path
                    const relativePath = vscode.workspace.asRelativePath(change.uri);
                    const existing = filesMap.get(relativePath);
                    
                    if (!existing || change.isStaged) {
                        filesMap.set(relativePath, {
                            path: relativePath,
                            status: this.getFileStatus(change.status || 0),
                            isStaged: change.isStaged
                        });
                    }
                } catch (pathError) {
                    console.error('Error processing file path:', pathError, change);
                }
            });

            const files = Array.from(filesMap.values());

            const gitStatus = {
                files,
                branch: state?.HEAD?.name || 'main',
                ahead: state?.HEAD?.ahead || 0,
                behind: state?.HEAD?.behind || 0
            };

            this.webviewPanel.webview.postMessage({
                type: 'gitStatusUpdate',
                data: gitStatus
            });
        } catch (error: any) {
            console.error('Error sending git status:', error);
            
            // Send an error status to webview
            this.webviewPanel.webview.postMessage({
                type: 'gitStatusUpdate',
                data: {
                    files: [],
                    branch: 'unknown',
                    ahead: 0,
                    behind: 0,
                    error: error.message
                }
            });
        }
    }

    private runGitCommand(args: string[], cwd: string): Promise<string> {
        return new Promise((resolve, reject) => {
            cp.execFile('git', args, { cwd }, (err, stdout, stderr) => {
            if (err) {
                reject(new Error(stderr || err.message));
            } else {
                resolve(stdout.trim());
            }
            });
        });
    }

    private async stageFile(path: string) {
        if (!this.repository) return;

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        const uri = join(workspaceFolder.uri.path, path);
        // Equivalent of: git add src/data/index.ts
        await this.runGitCommand(['add', uri], workspaceFolder.uri.path);
        await vscode.commands.executeCommand('git.refresh');
        this.sendGitStatus();
    }

    private async unstageFile(path: string) {
        if (!this.repository) return;
        
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        const uri = join(workspaceFolder.uri.path, path);
        // Equivalent of: git add src/data/index.ts
        await this.runGitCommand(['restore','--staged', uri], workspaceFolder.uri.path);
        await vscode.commands.executeCommand('git.refresh');
        this.sendGitStatus();
    }

    private async stageAll() {
        if (!this.repository) return;
        
        // Execute git reset to unstage all files
        await vscode.commands.executeCommand('git.stageAll');
        this.sendGitStatus();
    }

    private async unstageAll() {
        if (!this.repository) return;

        // Execute git reset to unstage all files
        await vscode.commands.executeCommand('git.unstageAll');
        this.sendGitStatus();
    }

    private async discardChanges(path: string) {
        if (!this.repository) return;

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        try {
            // Use git checkout to discard changes
            const fullPath = vscode.Uri.joinPath(workspaceFolder.uri, path).fsPath;
            await this.runGitCommand(['checkout', '--', fullPath], workspaceFolder.uri.fsPath);
            console.log('Successfully discarded changes for:', path);
            this.sendGitStatus();
        } catch (error: any) {
            console.error('Error discarding changes:', error);
            vscode.window.showErrorMessage(`Failed to discard changes: ${error.message}`);
        }
    }

    private async commit(message: string, description?: string) {
        if (!this.repository) return;

        const fullMessage = description ? `${message}\n\n${description}` : message;
        await this.repository.commit(fullMessage);
        // Refresh both status and commit history after commit
        this.sendGitStatus();
        this.sendCommitHistory();
    }



    private async getFullFilePath(relativePath: string) {
        if (!this.repository) return;

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        const fullPath = vscode.Uri.joinPath(workspaceFolder.uri, relativePath).fsPath;

        // Send the full path back to the webview
        this.webviewPanel.webview.postMessage({
            type: 'fullFilePath',
            path: fullPath
        });
    }

    private async revealInFinder(relativePath: string) {
        if (!this.repository) return;

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, relativePath);

        try {
            await vscode.commands.executeCommand('revealFileInOS', fileUri);
        } catch (error) {
            console.error('Error revealing file in finder:', error);
        }
    }

    private async openInEditor(relativePath: string) {
        if (!this.repository) return;

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        const fileUri = vscode.Uri.joinPath(workspaceFolder.uri, relativePath);

        try {
            await vscode.commands.executeCommand('vscode.open', fileUri);
        } catch (error) {
            console.error('Error opening file in editor:', error);
        }
    }

    private async loadMoreCommits(offset: number) {
        if (!this.repository) return;

        try {
            // Get additional commits starting from the offset
            const additionalLogOutput = await this.runGitCommand(['log', '--pretty=format:%H|%an|%ae|%at|%s|%w(0,0,0)', '--shortstat', '--no-merges', `--skip=${offset}`, '-30'], this.repository.rootUri.fsPath);

            const additionalCommits: any[] = [];
            const lines = additionalLogOutput.split('\n').filter(line => line.trim());

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('|')) {
                    // This is a commit line
                    const [hash, author, email, timestamp, ...messageParts] = line.split('|');
                    const message = messageParts.join('|');

                    let filesChanged = 0;
                    let insertions = 0;
                    let deletions = 0;

                    // Check next line for stats
                    if (i + 1 < lines.length && lines[i + 1].match(/\d+ files? changed/)) {
                        const statsLine = lines[i + 1];
                        const filesMatch = statsLine.match(/(\d+) files? changed/);
                        const insertionsMatch = statsLine.match(/(\d+) insertions?/);
                        const deletionsMatch = statsLine.match(/(\d+) deletions?/);

                        if (filesMatch) filesChanged = parseInt(filesMatch[1]);
                        if (insertionsMatch) insertions = parseInt(insertionsMatch[1]);
                        if (deletionsMatch) deletions = parseInt(deletionsMatch[1]);

                        i++; // Skip the stats line
                    }

                    additionalCommits.push({
                        hash: hash.trim(),
                        message: message.trim(),
                        author: author.trim(),
                        date: new Date(parseInt(timestamp) * 1000).toISOString(),
                        filesChanged,
                        insertions,
                        deletions
                    });
                }
            }

            console.log('Sending additional commits:', additionalCommits);

            this.webviewPanel.webview.postMessage({
                type: 'additionalCommits',
                data: additionalCommits
            });
        } catch (error: any) {
            console.error('Error loading more commits:', error);
        }
    }



    private async sendBranches() {
        if (!this.repository) {
            console.log('No repository available for branches');
            return;
        }

        try {
            const branches = await this.repository.getBranches();
            const branchNames = branches.map(branch => branch.name).filter(name => name);

            console.log('Sending branches:', branchNames);

            this.webviewPanel.webview.postMessage({
                type: 'branchesUpdate',
                data: branchNames
            });
        } catch (error: any) {
            console.error('Error getting branches:', error);
            this.webviewPanel.webview.postMessage({
                type: 'branchesUpdate',
                data: [],
                error: error.message
            });
        }
    }

    private async switchBranch(branchName: string) {
        if (!this.repository) return;

        try {
            console.log('Switching to branch:', branchName);
            await this.repository.checkout(branchName);
            // Refresh status after branch switch
            this.sendGitStatus();
            this.sendBranches();
        } catch (error: any) {
            console.error('Error switching branch:', error);
            vscode.window.showErrorMessage(`Failed to switch to branch ${branchName}: ${error.message}`);
        }
    }

    private async sendPullRequests() {
        if (!this.repository) {
            console.log('No repository available for pull requests');
            return;
        }

        try {
            // Get repository information
            const repoInfo = await this.getRepositoryInfo();

            if (!repoInfo) {
                console.log('Could not determine repository information for PRs');
                // Send empty PR list with helpful message
                this.webviewPanel.webview.postMessage({
                    type: 'pullRequestsUpdate',
                    data: [],
                    message: 'Unable to determine repository information. Make sure you have a remote origin configured.'
                });
                return;
            }

            // Try to get GitHub token from VS Code authentication first
            let token = await this.getGitHubTokenFromVSCode();

            // Fall back to settings if VS Code auth fails
            if (!token) {
                const config = vscode.workspace.getConfiguration('gh-desk');
                token = config.get<string>('githubToken');
            }

            let pullRequests: any[] = [];

            if (token && token.trim()) {
                // Try to fetch real PRs from GitHub API
                try {
                    pullRequests = await this.fetchPullRequestsFromGitHub(repoInfo.owner, repoInfo.name, token);
                    console.log('Fetched real pull requests:', pullRequests.length);
                } catch (apiError: any) {
                    console.error('GitHub API error:', apiError);
                    // Fall back to info message
                    pullRequests = [{
                        number: 0,
                        title: 'GitHub API Error',
                        author: 'system',
                        branch: 'main',
                        createdAt: new Date().toISOString(),
                        status: 'info',
                        htmlUrl: `https://github.com/${repoInfo.owner}/${repoInfo.name}/pulls`,
                        message: `API Error: ${apiError.message}`
                    }];
                }
            } else {
                // No authentication available - show helpful message
                pullRequests = [{
                    number: 0,
                    title: 'GitHub Authentication Required',
                    author: 'system',
                    branch: 'main',
                    createdAt: new Date().toISOString(),
                    status: 'info',
                    htmlUrl: `https://github.com/${repoInfo.owner}/${repoInfo.name}/pulls`,
                    message: 'Sign in to GitHub in VS Code (Ctrl+Shift+P → "GitHub: Sign In") or set gh-desk.githubToken in settings'
                }];
            }

            console.log('Sending pull requests:', pullRequests);

            this.webviewPanel.webview.postMessage({
                type: 'pullRequestsUpdate',
                data: pullRequests,
                repository: repoInfo
            });
        } catch (error: any) {
            console.error('Error getting pull requests:', error);
            this.webviewPanel.webview.postMessage({
                type: 'pullRequestsUpdate',
                data: [],
                error: error.message
            });
        }
    }

    private async getRepositoryInfo(): Promise<{ owner: string; name: string } | null> {
        try {
            // Get the remote URL to extract owner and repo name
            const remoteUrl = await this.runGitCommand(['config', '--get', 'remote.origin.url'], this.repository!.rootUri.fsPath);

            // Parse the remote URL to extract owner and repo
            // Supports both HTTPS and SSH formats
            const httpsMatch = remoteUrl.match(/github\.com\/([^\/]+)\/([^\/\.]+)/);
            const sshMatch = remoteUrl.match(/git@github\.com:([^\/]+)\/([^\/\.]+)/);

            let owner: string, name: string;
            if (httpsMatch) {
                [, owner, name] = httpsMatch;
            } else if (sshMatch) {
                [, owner, name] = sshMatch;
            } else {
                console.warn('Could not parse GitHub repository URL:', remoteUrl);
                return null;
            }

            // Remove .git suffix if present
            name = name.replace(/\.git$/, '');

            return { owner, name };
        } catch (error) {
            console.error('Error getting repository info:', error);
            return null;
        }
    }

    private async getGitHubTokenFromVSCode(): Promise<string | undefined> {
        try {
            // Try to get existing GitHub authentication session
            const session = await vscode.authentication.getSession('github', ['repo'], {
                createIfNone: false
            });

            if (session?.accessToken) {
                console.log('Using VS Code GitHub authentication session');
                return session.accessToken;
            }

            // If no session exists, try to create one silently
            try {
                const newSession = await vscode.authentication.getSession('github', ['repo'], {
                    createIfNone: true,
                    silent: true
                });

                if (newSession?.accessToken) {
                    console.log('Created new VS Code GitHub authentication session');
                    return newSession.accessToken;
                }
            } catch (createError) {
                // User cancelled or authentication failed
                console.log('VS Code GitHub authentication not available');
            }

            return undefined;
        } catch (error) {
            console.error('Error getting VS Code GitHub token:', error);
            return undefined;
        }
    }

    private async fetchPullRequestsFromGitHub(owner: string, repo: string, token: string): Promise<any[]> {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.github.com',
                path: `/repos/${owner}/${repo}/pulls?state=open&per_page=10`,
                method: 'GET',
                headers: {
                    'Authorization': `token ${token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'User-Agent': 'VSCode-GitHub-Desktop-Extension'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        if (res.statusCode === 200) {
                            const prs = JSON.parse(data);
                            console.log('GitHub API response:', prs.slice(0, 2)); // Log first 2 PRs for debugging

                            // Transform GitHub API response to our format
                            const transformedPRs = prs.map((pr: any) => {
                                const branchName = pr.head?.ref;
                                console.log(`PR #${pr.number}: title="${pr.title}", branch="${branchName}"`);

                                if (!branchName) {
                                    console.warn(`PR #${pr.number} has no branch name in head.ref`);
                                }

                                return {
                                    number: pr.number,
                                    title: pr.title,
                                    author: pr.user?.login || 'unknown',
                                    branch: branchName || 'unknown-branch',
                                    createdAt: pr.created_at,
                                    status: pr.state,
                                    htmlUrl: pr.html_url
                                };
                            });
                            resolve(transformedPRs);
                        } else if (res.statusCode === 401) {
                            reject(new Error('GitHub authentication failed. Please check your token.'));
                        } else if (res.statusCode === 403) {
                            reject(new Error('Access denied. Please check your token permissions.'));
                        } else if (res.statusCode === 404) {
                            reject(new Error('Repository not found or access denied.'));
                        } else {
                            reject(new Error(`GitHub API error: ${res.statusCode}`));
                        }
                    } catch (parseError) {
                        reject(new Error('Failed to parse GitHub API response'));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Network error: ${error.message}`));
            });

            req.setTimeout(10000, () => {
                req.destroy();
                reject(new Error('Request timeout'));
            });

            req.end();
        });
    }

    private async switchToPR(prNumber: number, branchName: string) {
        if (!this.repository) return;

        try {
            console.log('Switching to PR branch:', branchName, 'for PR #', prNumber);

            // Validate branch name
            if (!branchName || branchName.trim() === '') {
                throw new Error('Invalid branch name received');
            }

            if (branchName === 'unknown-branch') {
                throw new Error('Branch name could not be determined from PR data');
            }

            // Check for invalid branch name characters
            if (branchName.includes(' ') || branchName.includes('..') || branchName.startsWith('-') || branchName.endsWith('/')) {
                console.warn('Branch name may contain invalid characters:', branchName);
            }

            // Check if the branch exists locally
            const branches = await this.repository.getBranches();
            console.log('Available branches:', branches.map(b => b.name).filter(Boolean));

            const branchExists = branches.some(b => b.name === branchName);

            if (!branchExists) {
                console.log('Branch does not exist locally, fetching from remote...');
                try {
                    // Try to fetch the branch from remote
                    await this.runGitCommand(['fetch', 'origin', branchName + ':' + branchName], this.repository.rootUri.fsPath);
                    console.log('Successfully fetched branch from remote');
                } catch (fetchError) {
                    console.error('Failed to fetch branch from remote:', fetchError);
                    throw new Error(`Branch '${branchName}' does not exist locally and could not be fetched from remote`);
                }
            }

            await this.repository.checkout(branchName);
            console.log('Successfully switched to branch:', branchName);

            // Refresh status after branch switch
            this.sendGitStatus();
            this.sendBranches();
        } catch (error: any) {
            console.error('Error switching to PR branch:', error);
            vscode.window.showErrorMessage(`Failed to switch to PR branch ${branchName}: ${error.message}`);
        }
    }

    private openExternalUrl(url: string) {
        try {
            vscode.env.openExternal(vscode.Uri.parse(url));
        } catch (error) {
            console.error('Error opening external URL:', error);
            vscode.window.showErrorMessage(`Failed to open URL: ${url}`);
        }
    }

    private openSettings(section?: string) {
        try {
            vscode.commands.executeCommand('workbench.action.openSettings', section);
        } catch (error) {
            console.error('Error opening settings:', error);
            vscode.window.showErrorMessage('Failed to open settings');
        }
    }

    private async createBranch(branchName: string, baseBranch: 'main' | 'current', stashAction?: 'leave' | 'bring') {
        if (!this.repository) return;

        try {
            // Determine the actual base branch name
            const actualBaseBranch = baseBranch === 'main' ? 'main' : this.repository.state.HEAD?.name || 'main';

            console.log('Creating branch:', branchName, 'based on:', actualBaseBranch, 'with stash action:', stashAction);

            // Check if there are uncommitted changes
            const hasUncommittedChanges = this.repository.state.indexChanges.length > 0 || this.repository.state.workingTreeChanges.length > 0;

            if (hasUncommittedChanges && stashAction === 'leave') {
                // Stash changes before creating the branch
                console.log('Stashing uncommitted changes...');
                await this.runGitCommand(['stash', 'push', '-m', `WIP on ${this.repository.state.HEAD?.name || 'unknown'} before creating ${branchName}`], this.repository.rootUri.fsPath);
            }

            // Create and checkout the new branch
            await this.runGitCommand(['checkout', '-b', branchName, actualBaseBranch], this.repository.rootUri.fsPath);

            if (hasUncommittedChanges && stashAction === 'bring') {
                // If we want to bring changes and they weren't stashed, they should automatically come with us
                console.log('Bringing uncommitted changes to new branch');
                // No additional action needed - git checkout -b will bring unstaged changes automatically
            }

            console.log('Successfully created and switched to branch:', branchName);

            // Refresh status and branches after creation
            this.sendGitStatus();
            this.sendBranches();
        } catch (error: any) {
            console.error('Error creating branch:', error);
            vscode.window.showErrorMessage(`Failed to create branch ${branchName}: ${error.message}`);
        }
    }

    private async stashChanges(message?: string) {
        if (!this.repository) return;

        try {
            const stashMessage = message || `WIP on ${this.repository.state.HEAD?.name || 'unknown'}`;
            console.log('Stashing changes with message:', stashMessage);

            await this.runGitCommand(['stash', 'push', '-m', stashMessage], this.repository.rootUri.fsPath);

            console.log('Successfully stashed changes');

            // Refresh status after stashing
            this.sendGitStatus();
        } catch (error: any) {
            console.error('Error stashing changes:', error);
            vscode.window.showErrorMessage(`Failed to stash changes: ${error.message}`);
        }
    }

    private async sendCommitHistory() {
        if (!this.repository) {
            console.log('No repository available for commit history');
            return;
        }

        try {
            // Get real git log data with stats
            const logOutput = await this.runGitCommand(['log', '--pretty=format:%H|%an|%ae|%at|%s|%w(0,0,0)', '--shortstat', '--no-merges', '-30'], this.repository.rootUri.fsPath);

            const commits: any[] = [];
            const lines = logOutput.split('\n').filter(line => line.trim());

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                if (line.includes('|')) {
                    // This is a commit line
                    const [hash, author, email, timestamp, ...messageParts] = line.split('|');
                    const message = messageParts.join('|');

                    let filesChanged = 0;
                    let insertions = 0;
                    let deletions = 0;

                    // Check next line for stats
                    if (i + 1 < lines.length && lines[i + 1].match(/\d+ files? changed/)) {
                        const statsLine = lines[i + 1];
                        const filesMatch = statsLine.match(/(\d+) files? changed/);
                        const insertionsMatch = statsLine.match(/(\d+) insertions?/);
                        const deletionsMatch = statsLine.match(/(\d+) deletions?/);

                        if (filesMatch) filesChanged = parseInt(filesMatch[1]);
                        if (insertionsMatch) insertions = parseInt(insertionsMatch[1]);
                        if (deletionsMatch) deletions = parseInt(deletionsMatch[1]);

                        i++; // Skip the stats line
                    }

                    commits.push({
                        hash: hash.trim(),
                        message: message.trim(),
                        author: author.trim(),
                        date: new Date(parseInt(timestamp) * 1000).toISOString(),
                        filesChanged,
                        insertions,
                        deletions
                    });
                }
            }

            console.log('Sending real commit history:', commits);

            this.webviewPanel.webview.postMessage({
                type: 'commitHistoryUpdate',
                data: commits
            });
        } catch (error: any) {
            console.error('Error getting commit history:', error);
            // Fallback to mock data if git log fails
            const mockHistory = [
                {
                    hash: 'fallback1234567890abcdef1234567890abcdef1234',
                    message: 'Unable to load git history',
                    author: 'System',
                    date: new Date().toISOString(),
                    filesChanged: 0,
                    insertions: 0,
                    deletions: 0
                }
            ];

            this.webviewPanel.webview.postMessage({
                type: 'commitHistoryUpdate',
                data: mockHistory,
                error: error.message
            });
        }
    }

    private async amendLastCommit(message?: string) {
        if (!this.repository) return;

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) return;

        try {
            // Use git commit --amend to actually amend the last commit
            const args = ['commit', '--amend'];

            // If a new message is provided, use it
            if (message && message.trim()) {
                args.push('-m', message.trim());
            } else {
                // If no message provided, keep the existing commit message
                args.push('--no-edit');
            }

            await this.runGitCommand(args, workspaceFolder.uri.fsPath);
            console.log('Successfully amended last commit with message:', message || 'existing message');

            // Refresh status and commit history after amend
            this.sendGitStatus();
            this.sendCommitHistory();
        } catch (error: any) {
            console.error('Error amending last commit:', error);
            vscode.window.showErrorMessage(`Failed to amend last commit: ${error.message}`);
        }
    }

    dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}