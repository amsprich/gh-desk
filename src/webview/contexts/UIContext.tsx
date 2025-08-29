import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { gitService, GitFile, GitStatus, CommitInfo, PullRequestInfo } from '../services/gitService';

interface UIState {
  currentBranch: string;
  defaultBranch: string;
  uncommittedChanges: number;
  activeTab: 'changes' | 'history';
  isBranchOverlayOpen: boolean;
  activeOverlayTab: 'branches' | 'prs';
  isCreateBranchModalOpen: boolean;
  isSwitchBranchModalOpen: boolean;
  selectedFiles: string[];
  selectedFile: GitFile | null;
  gitFiles: GitFile[];
  stagedCount: number;
  unstagedCount: number;
  commitHistory: CommitInfo[];
  branches: string[];
  pullRequests: PullRequestInfo[];
  canAmend: boolean;
  pendingBranchName: string;
  pendingBaseBranch: 'main' | 'current';
  contextMenu: {
    isVisible: boolean;
    x: number;
    y: number;
    targetFile: GitFile | null;
  };
}

interface UIContextType {
  state: UIState;
  setCurrentBranch: (branch: string) => void;
  setActiveTab: (tab: 'changes' | 'history') => void;
  toggleBranchOverlay: () => void;
  setActiveOverlayTab: (tab: 'branches' | 'prs') => void;
  setCreateBranchModalOpen: (open: boolean) => void;
  setSwitchBranchModalOpen: (open: boolean) => void;
  setSelectedFiles: (files: string[]) => void;
  setUncommittedChanges: (count: number) => void;
  selectFile: (file: GitFile | null) => void;
  stageFile: (path: string) => void;
  unstageFile: (path: string) => void;
  toggleAllFiles: () => void;
  showContextMenu: (x: number, y: number, file: GitFile) => void;
  hideContextMenu: () => void;
  amendLastCommit: (message?: string) => void;
  switchBranch: (branchName: string) => void;
  switchToPR: (prNumber: number, branchName: string) => void;
  setPendingBranchName: (name: string) => void;
  setPendingBaseBranch: (base: 'main' | 'current') => void;
  createBranch: (name: string, baseBranch: 'main' | 'current', stashAction?: 'leave' | 'bring') => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, setState] = useState<UIState>({
    currentBranch: 'main',
    defaultBranch: 'main', // Will be updated when branches are loaded
    uncommittedChanges: 0,
    activeTab: 'changes',
    isBranchOverlayOpen: false,
    activeOverlayTab: 'branches',
    isCreateBranchModalOpen: false,
    isSwitchBranchModalOpen: false,
    selectedFiles: [],
    selectedFile: null,
    gitFiles: [],
    stagedCount: 0,
    unstagedCount: 0,
    commitHistory: [],
    branches: [],
    pullRequests: [],
    canAmend: false,
    pendingBranchName: '',
    pendingBaseBranch: 'main',
    contextMenu: {
      isVisible: false,
      x: 0,
      y: 0,
      targetFile: null,
    },
  });

  // Subscribe to Git status updates
  useEffect(() => {
    const unsubscribeStatus = gitService.onStatusChange((status: GitStatus) => {
      const stagedFiles = status.files.filter(f => f.isStaged);
      const unstagedFiles = status.files.filter(f => !f.isStaged);

      setState(prev => ({
        ...prev,
        gitFiles: status.files,
        currentBranch: status.branch || prev.currentBranch,
        stagedCount: stagedFiles.length,
        unstagedCount: unstagedFiles.length,
        uncommittedChanges: status.files.length,
        canAmend: status.ahead > 0 && prev.commitHistory.length > 0, // Can amend if there are unpushed commits
      }));
    });

    const unsubscribeHistory = gitService.onCommitHistoryChange((commits: CommitInfo[]) => {
      setState(prev => ({
        ...prev,
        commitHistory: commits,
      }));
    });

    const unsubscribeBranches = gitService.onBranchChange((branches: string[]) => {
      // Determine default branch from available branches
      let defaultBranch = 'main'; // fallback
      if (branches.includes('main')) {
        defaultBranch = 'main';
      } else if (branches.includes('master')) {
        defaultBranch = 'master';
      }

      setState(prev => ({
        ...prev,
        branches: branches,
        defaultBranch: defaultBranch,
      }));
    });

    const unsubscribePRs = gitService.onPRChange((prs: PullRequestInfo[]) => {
      setState(prev => ({
        ...prev,
        pullRequests: prs,
      }));
    });

    // Request initial status, history, branches, and PRs
    gitService.refresh();
    gitService.getCommitHistory();
    gitService.getBranches();
    gitService.getPullRequests();

    return () => {
      unsubscribeStatus();
      unsubscribeHistory();
      unsubscribeBranches();
      unsubscribePRs();
    };
  }, []);

  const setCurrentBranch = (branch: string) => {
    setState(prev => ({ ...prev, currentBranch: branch }));
  };

  const setActiveTab = (tab: 'changes' | 'history') => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const toggleBranchOverlay = () => {
    setState(prev => ({ ...prev, isBranchOverlayOpen: !prev.isBranchOverlayOpen }));
  };

  const setActiveOverlayTab = (tab: 'branches' | 'prs') => {
    setState(prev => ({ ...prev, activeOverlayTab: tab }));
  };

  const setCreateBranchModalOpen = (open: boolean) => {
    setState(prev => ({ ...prev, isCreateBranchModalOpen: open }));
  };

  const setSwitchBranchModalOpen = (open: boolean) => {
    setState(prev => ({ ...prev, isSwitchBranchModalOpen: open }));
  };

  const setSelectedFiles = (files: string[]) => {
    setState(prev => ({ ...prev, selectedFiles: files }));
  };

  const setUncommittedChanges = (count: number) => {
    setState(prev => ({ ...prev, uncommittedChanges: count }));
  };

  const selectFile = (file: GitFile | null) => {
    setState(prev => ({ ...prev, selectedFile: file }));
  };

  const showContextMenu = (x: number, y: number, file: GitFile) => {
    setState(prev => ({
      ...prev,
      contextMenu: {
        isVisible: true,
        x,
        y,
        targetFile: file,
      },
    }));
  };

  const hideContextMenu = () => {
    setState(prev => ({
      ...prev,
      contextMenu: {
        ...prev.contextMenu,
        isVisible: false,
      },
    }));
  };

  const amendLastCommit = async (message?: string) => {
    // TODO: Implement amend functionality
    console.log('Amend last commit with message:', message);
  };

  const switchBranch = async (branchName: string) => {
    try {
      await gitService.switchBranch(branchName);
      setCurrentBranch(branchName);
      toggleBranchOverlay(); // Close the overlay after switching
    } catch (error) {
      console.error('Failed to switch branch:', error);
    }
  };

  const switchToPR = async (prNumber: number, branchName: string) => {
    try {
      await gitService.switchToPR(prNumber, branchName);
      setCurrentBranch(branchName);
      toggleBranchOverlay(); // Close the overlay after switching
    } catch (error) {
      console.error('Failed to switch to PR branch:', error);
    }
  };

  const setPendingBranchName = (name: string) => {
    setState(prev => ({ ...prev, pendingBranchName: name }));
  };

  const setPendingBaseBranch = (base: 'main' | 'current') => {
    setState(prev => ({ ...prev, pendingBaseBranch: base }));
  };

  const createBranch = async (name: string, baseBranch: 'main' | 'current', stashAction?: 'leave' | 'bring') => {
    try {
      await gitService.createBranch(name, baseBranch, stashAction);
      // After creation, switch to the new branch
      setCurrentBranch(name);
      toggleBranchOverlay();
      setCreateBranchModalOpen(false);
      setPendingBranchName('');
      setPendingBaseBranch('main');
    } catch (error) {
      console.error('Failed to create branch:', error);
      // Error is already handled in GitProvider
    }
  };

  const stageFile = async (path: string) => {
    const file = state.gitFiles.find(f => f.path === path);
    if (file && !file.isStaged) {
      await gitService.stageFile(path);
      await gitService.refresh();
    }
  };

  const unstageFile = async (path: string) => {
    const file = state.gitFiles.find(f => f.path === path);
    if (file && file.isStaged) {
      await gitService.unstageFile(path);
      await gitService.refresh();
    }
  };

  const toggleAllFiles = async () => {
    // If all files are staged, unstage all. Otherwise, stage all.
    const allStaged = state.gitFiles.every(f => f.isStaged);
    
    if (allStaged) {
      await gitService.unstageAll();
    } else {
      await gitService.stageAll();
    }
    await gitService.refresh();
  };

  return (
    <UIContext.Provider value={{
      state,
      setCurrentBranch,
      setActiveTab,
      toggleBranchOverlay,
      setActiveOverlayTab,
      setCreateBranchModalOpen,
      setSwitchBranchModalOpen,
      setSelectedFiles,
      setUncommittedChanges,
      selectFile,
      stageFile,
      unstageFile,
      toggleAllFiles,
      showContextMenu,
      hideContextMenu,
      amendLastCommit,
      switchBranch,
      switchToPR,
      setPendingBranchName,
      setPendingBaseBranch,
      createBranch,
    }}>
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};