import React, { useState, useEffect } from 'react';
import { useUI } from '../contexts/UIContext';
import { gitService } from '../services/gitService';

export const BranchOverlay: React.FC = () => {
  const { state, toggleBranchOverlay, setActiveOverlayTab, setCreateBranchModalOpen, setPendingBranchName, setPendingBaseBranch, createBranch } = useUI();
  const [filterInput, setFilterInput] = useState('');

  const validateBranchName = (name: string): boolean => {
    // Git branch naming rules: alphanumeric, hyphens, underscores, forward slashes
    const validPattern = /^[a-zA-Z0-9\-_\/]+$/;
    return validPattern.test(name) && name.length > 0 && name.length <= 255;
  };

  const handleBranchCreation = () => {
    const branchName = filterInput.trim();

    if (!branchName) {
      console.error('Branch name cannot be empty');
      return;
    }

    if (!validateBranchName(branchName)) {
      console.error('Invalid branch name:', branchName, '- Branch names can only contain letters, numbers, hyphens, underscores, and forward slashes');
      return;
    }

    // Check if branch already exists
    if (state.branches.includes(branchName)) {
      console.error('Branch already exists:', branchName);
      return;
    }

    // Check if we're on default branch and have uncommitted changes
    const isOnDefaultBranch = state.currentBranch === state.defaultBranch;
    const hasUncommittedChanges = state.uncommittedChanges > 0;

    setPendingBranchName(branchName);
    toggleBranchOverlay(); // Close branch overlay first

    if (isOnDefaultBranch && !hasUncommittedChanges) {
      // On default branch with no uncommitted changes - create branch directly
      console.log('Creating branch directly:', branchName, 'based on:', state.currentBranch);
      createBranch(branchName, 'main');
    } else if (isOnDefaultBranch && hasUncommittedChanges) {
      // On default branch with uncommitted changes - skip base branch selection, go straight to uncommitted changes dialog
      console.log('On default branch with uncommitted changes, skipping base branch modal');
      setPendingBaseBranch('main');
      setCreateBranchModalOpen(true);
    } else {
      // Not on default branch - show SelectBaseBranchModal
      console.log('Opening SelectBaseBranchModal');
      setPendingBaseBranch('current'); // Default to current branch when not on default
      setCreateBranchModalOpen(true);
    }
  };



  // Refresh branches and PRs when overlay opens
  useEffect(() => {
    if (state.isBranchOverlayOpen) {
      gitService.getBranches();
      gitService.getPullRequests();
    }
  }, [state.isBranchOverlayOpen]);

  if (!state.isBranchOverlayOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/40 z-10 grid place-items-center" onClick={toggleBranchOverlay}>
      <div className="bg-[#22272e] w-full max-w-2xl rounded-lg shadow-xl border border-gray-700 flex flex-col" onClick={(e) => e.stopPropagation()}>
        {/* Overlay Tabs */}
        <div className="flex-shrink-0 border-b border-gray-700">
          <div className="flex w-full">
            <button 
              onClick={() => setActiveOverlayTab('branches')}
              className={`w-1/2 text-center font-semibold py-2 border-b-2 ${
                state.activeOverlayTab === 'branches'
                  ? 'text-white border-blue-500'
                  : 'text-gray-400 border-gray-700'
              }`}
            >
              Branches
            </button>
            <button 
              onClick={() => setActiveOverlayTab('prs')}
              className={`w-1/2 text-center font-semibold py-2 border-b-2 ${
                state.activeOverlayTab === 'prs'
                  ? 'text-white border-blue-500'
                  : 'text-gray-400 border-gray-700'
              }`}
            >
              Pull Requests <span className="bg-gray-600 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-1">2</span>
            </button>
          </div>
        </div>

        {/* Filter Input */}
        <div className="p-4 border-b border-gray-700 flex items-center space-x-2">
          <input
            type="text"
            placeholder="Filter or create a branch"
            value={filterInput}
            onChange={(e) => setFilterInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleBranchCreation();
              }
            }}
            className="bg-[#2d333b] text-white text-sm border border-gray-600 rounded px-3 py-1.5 w-full flex-grow focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <button
            onClick={handleBranchCreation}
            className="bg-[#2d333b] p-1.5 rounded-md text-white hover:bg-gray-600 border border-gray-600 flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Content Area */}
        <div className="overflow-y-auto h-96">
          {state.activeOverlayTab === 'branches' ? (
            <BranchesList filterInput={filterInput} />
          ) : (
            <PullRequestsList />
          )}
        </div>
      </div>
    </div>
  );
};

const BranchesList: React.FC<{ filterInput: string }> = ({ filterInput }) => {
  const { state, switchBranch } = useUI();

  // Filter branches based on input
  const filteredBranches = state.branches.filter(branch =>
    branch.toLowerCase().includes(filterInput.toLowerCase())
  );

  const handleBranchClick = (branch: string) => {
    if (branch !== state.currentBranch) {
      switchBranch(branch);
    }
  };

  return (
    <div>
      <ul>
        {filteredBranches.map((branch) => (
          <li
            key={branch}
            className={`px-4 py-2 text-gray-300 hover:bg-gray-700/50 cursor-pointer flex items-center justify-between ${
              branch === state.currentBranch ? 'bg-blue-900/30 border-l-2 border-blue-500' : ''
            }`}
            onClick={() => handleBranchClick(branch)}
          >
            <span>{branch}</span>
            {branch === state.currentBranch && (
              <span className="text-blue-400 text-xs">current</span>
            )}
          </li>
        ))}
        {filteredBranches.length === 0 && filterInput && (
          <li className="px-4 py-2 text-gray-500 text-sm">
            No branches match "{filterInput}"
          </li>
        )}
      </ul>
    </div>
  );
};

const PullRequestsList: React.FC = () => {
  const { state, switchToPR } = useUI();

  const handlePRClick = (pr: any) => {
    if (pr.status === 'info') {
      // Open GitHub PRs page in browser
      if (pr.htmlUrl) {
        // Send message to extension to open URL
        window.parent.postMessage({
          type: 'openExternalUrl',
          url: pr.htmlUrl
        }, '*');
      }
    } else {
      // Switch to PR branch
      console.log('Switching to PR branch:', pr.branch, 'for PR #', pr.number);
      switchToPR(pr.number, pr.branch);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  const openGitHubSettings = () => {
    // Send message to extension to open VS Code settings
    window.parent.postMessage({
      type: 'openSettings',
      section: 'gh-desk'
    }, '*');
  };

  return (
    <div>
      <ul>
        {state.pullRequests.map((pr) => (
          <li
            key={pr.number || 'info'}
            className="px-4 py-3 text-gray-300 hover:bg-gray-700/50 cursor-pointer border-b border-gray-700 last:border-b-0"
            onClick={() => handlePRClick(pr)}
          >
            <p className="font-semibold mb-1">{pr.title}</p>
            <div className="flex items-center justify-between text-xs text-gray-400">
              {pr.status === 'info' ? (
                <span className="text-blue-400">{pr.message}</span>
              ) : (
                <>
                  <span>#{pr.number} opened {formatTimeAgo(pr.createdAt)} by {pr.author}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${
                    pr.status === 'open' ? 'bg-green-900/30 text-green-400' :
                    pr.status === 'merged' ? 'bg-purple-900/30 text-purple-400' :
                    'bg-red-900/30 text-red-400'
                  }`}>
                    {pr.status}
                  </span>
                </>
              )}
            </div>
          </li>
        ))}
        {state.pullRequests.length === 0 && (
          <li className="px-4 py-8 text-gray-500 text-center">
            <div className="text-2xl mb-2">📋</div>
            <div className="mb-4">No pull requests found</div>
            <button
              onClick={openGitHubSettings}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
            >
              Configure GitHub Token
            </button>
          </li>
        )}
      </ul>
    </div>
  );
};