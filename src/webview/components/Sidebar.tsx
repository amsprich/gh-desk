import React from 'react';
import { useUI } from '../contexts/UIContext';
import { gitService } from '../services/gitService';

export const Sidebar: React.FC = () => {
  const { state, setActiveTab } = useUI();

  return (
    <div className="flex flex-col h-full">
      {/* Tabs */}
      <div className="flex-shrink-0 border-b border-gray-700">
        <div className="flex w-full min-h-[57px]">
          <button
            onClick={() => setActiveTab('changes')}
            className={`w-1/2 text-center font-semibold py-3 border-b-2 cursor-pointer ${
              state.activeTab === 'changes'
                ? 'text-white border-blue-500 bg-[#2d333b] rounded-t-md'
                : 'text-gray-400 border-gray-700'
            }`}
          >
            Changes 
            {state.uncommittedChanges > 0 && (
              <span className="bg-blue-500 text-white text-xs font-bold rounded-full px-2 py-0.5 ml-1">
                {state.uncommittedChanges}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`w-1/2 text-center font-semibold py-3 border-b cursor-pointer ${
              state.activeTab === 'history'
                ? 'text-white border-b-2 border-blue-500 bg-[#2d333b] rounded-t-md'
                : 'text-gray-400 border-gray-700'
            }`}
          >
            History
          </button>
        </div>
      </div>

      {/* Content based on active tab */}
      {state.activeTab === 'changes' ? (
        <ChangesView />
      ) : (
        <HistoryView />
      )}
    </div>
  );
};

const ChangesView: React.FC = () => {
  const { state, stageFile, unstageFile, toggleAllFiles, selectFile, showContextMenu, hideContextMenu } = useUI();
  const [filter, setFilter] = React.useState('');
  const [commitMessage, setCommitMessage] = React.useState('');
  const [commitDescription, setCommitDescription] = React.useState('');
  const [isCommitting, setIsCommitting] = React.useState(false);
  const [isAmending, setIsAmending] = React.useState(false);

  // Filter and sort files alphabetically
  const filteredFiles = state.gitFiles
    .filter(file => file.path.toLowerCase().includes(filter.toLowerCase()))
    .sort((a, b) => a.path.localeCompare(b.path));

  // Determine checkbox state: checked if all visible files are staged
  const allStaged = filteredFiles.length > 0 && filteredFiles.every(f => f.isStaged);
  const someStaged = filteredFiles.some(f => f.isStaged);
  const isIndeterminate = someStaged && !allStaged;

  const handleFileClick = (file: typeof state.gitFiles[0]) => {
    // Select the file to show diff
    selectFile(file);
  };

  const handleCheckboxToggle = (file: typeof state.gitFiles[0], e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation(); // Prevent file selection when clicking checkbox
    if (file.isStaged) {
      unstageFile(file.path);
    } else {
      stageFile(file.path);
    }
  };

  const handleContextMenu = (file: typeof state.gitFiles[0], e: React.MouseEvent) => {
    e.preventDefault();
    showContextMenu(e.clientX, e.clientY, file);
  };

  // Refresh repository when switching to changes tab
  React.useEffect(() => {
    if (state.activeTab === 'changes') {
      gitService.refresh();
    }
  }, [state.activeTab]);

  // Close context menu when clicking elsewhere
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (state.contextMenu.isVisible) {
        hideContextMenu();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.contextMenu.isVisible) {
        hideContextMenu();
      }
    };

    document.addEventListener('click', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [state.contextMenu.isVisible, hideContextMenu]);

  const handleCommit = async () => {
    if (!commitMessage.trim() || state.stagedCount === 0 || isCommitting) return;

    setIsCommitting(true);
    try {
      await gitService.commit(commitMessage.trim(), commitDescription.trim());
      // Clear form after successful commit
      setCommitMessage('');
      setCommitDescription('');
    } catch (error) {
      console.error('Commit failed:', error);
    } finally {
      setIsCommitting(false);
    }
  };

  const handleAmend = async () => {
    if (!state.canAmend || isCommitting || isAmending) return;

    setIsAmending(true);
    try {
      const message = commitMessage.trim() || undefined;
      await gitService.amendLastCommit(message);
      // Clear form after successful amend
      setCommitMessage('');
      setCommitDescription('');
    } catch (error) {
      console.error('Amend failed:', error);
    } finally {
      setIsAmending(false);
    }
  };

  const getFileIcon = (status: string) => {
    switch (status) {
      case 'added':
        return <span className="text-green-400 font-bold">A</span>;
      case 'modified':
        return <span className="text-yellow-400 font-bold">M</span>;
      case 'deleted':
        return <span className="text-red-400 font-bold">D</span>;
      case 'untracked':
        return <span className="text-gray-400 font-bold">U</span>;
      default:
        return <span className="text-gray-400 font-bold">?</span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 overflow-y-auto flex-1">
        <div className="flex flex-col mb-2">
          <input 
            type="text" 
            placeholder="Filter changed files" 
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="bg-[#2d333b] text-white text-sm border border-gray-600 rounded px-3 py-1.5 w-full mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <div className="flex items-center text-gray-300">
            <input 
              type="checkbox" 
              checked={allStaged}
              ref={(el) => {
                if (el) el.indeterminate = isIndeterminate;
              }}
              onChange={toggleAllFiles}
              className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500" 
            />
            <span className="ml-2 font-semibold">
              {state.uncommittedChanges} changed files
              {state.stagedCount > 0 && (
                <span className="text-gray-400 text-xs ml-1">
                  ({state.stagedCount} staged)
                </span>
              )}
            </span>
          </div>
        </div>
        
        {filteredFiles.length === 0 ? (
          <p className="p-4 text-gray-400 text-center">
            {filter ? 'No files match your filter' : 'No local changes'}
          </p>
        ) : (
          <ul className="space-y-1">
            {filteredFiles.map((file) => (
              <li
                key={file.path}
                className={`flex items-center hover:bg-gray-700/30 rounded px-2 py-1.5 cursor-pointer ${
                  state.selectedFile?.path === file.path ? 'bg-blue-900/30 border border-blue-700/50' : ''
                }`}
                onClick={() => handleFileClick(file)}
                onContextMenu={(e) => handleContextMenu(file, e)}
              >
                <input
                  type="checkbox"
                  checked={file.isStaged}
                  onChange={(e) => handleCheckboxToggle(file, e)}
                  className="h-4 w-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500 mr-2"
                />
                <span className="text-gray-300 text-sm truncate flex-1">
                  {file.path}
                </span>
                <span className="ml-2 w-4 text-center">
                  {getFileIcon(file.status)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      {/* Commit Area */}
      <div className="flex-shrink-0 p-4 mt-auto border-t border-gray-700">
        <input
          type="text"
          placeholder="Summary (required)"
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          className="bg-[#2d333b] text-white w-full border border-gray-600 rounded p-2 mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isCommitting || isAmending}
        />
        <textarea
          placeholder="Description"
          value={commitDescription}
          onChange={(e) => setCommitDescription(e.target.value)}
          className="bg-[#2d333b] text-white w-full border border-gray-600 rounded p-2 h-24 resize-none mb-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
          disabled={isCommitting || isAmending}
        />

                        <div className="flex items-stretch justify-between">
          <button
            onClick={handleCommit}
            disabled={state.stagedCount === 0 || !commitMessage.trim() || isCommitting}
            className={`font-semibold py-1.5 px-4 rounded-md flex-grow text-xs transition-all duration-200 ${
              state.stagedCount > 0 && commitMessage.trim() && !isCommitting
                ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
            } ${isCommitting ? 'animate-pulse' : ''}`}
          >
            {isCommitting ? (
              <span>Committing...</span>
            ) : (
              <>
                Commit {state.stagedCount} {state.stagedCount === 1 ? 'file' : 'files'} to <span className="font-mono">{state.currentBranch}</span>
              </>
            )}
          </button>
          <button
            onClick={handleAmend}
            disabled={!state.canAmend || isCommitting || isAmending}
            className={`text-xs p-2 rounded-md ml-2 border transition-all duration-200 ${
              state.canAmend && !isCommitting && !isAmending
                ? 'text-gray-300 hover:text-white border-gray-600 bg-[#2d333b] hover:bg-gray-700 cursor-pointer'
                : 'text-gray-500 border-gray-700 bg-gray-800 cursor-not-allowed'
            } ${isAmending ? 'animate-pulse' : ''}`}
            title={state.canAmend ? 'Amend last commit' : 'No unpushed commits to amend'}
          >
            {isAmending ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const HistoryView: React.FC = () => {
  const { state } = useUI();
  const [isLoadingMore, setIsLoadingMore] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const handleScroll = React.useCallback(() => {
    if (!scrollRef.current || isLoadingMore) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px from bottom

    if (isNearBottom && state.commitHistory.length >= 30) {
      setIsLoadingMore(true);
      // Load more commits
      gitService.loadMoreCommits().finally(() => {
        setIsLoadingMore(false);
      });
    }
  }, [isLoadingMore, state.commitHistory.length]);

  React.useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto">
      {state.commitHistory.length === 0 ? (
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-2">📜</div>
            <div>Commit history view</div>
            <div className="text-sm mt-2">Select a commit to view changes</div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          {state.commitHistory.map((commit, index) => (
            <div key={commit.hash} className="mb-4 pb-4 border-b border-gray-700 last:border-b-0">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {commit.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white font-medium text-sm mb-1">
                    {commit.message}
                  </div>
                  <div className="text-gray-400 text-xs mb-2">
                    <span className="font-mono">{commit.hash.substring(0, 7)}</span>
                    <span className="mx-2">•</span>
                    <span>{commit.author}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(commit.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    <span>{commit.filesChanged} files changed</span>
                    {commit.insertions > 0 && (
                      <span className="text-green-400">+{commit.insertions}</span>
                    )}
                    {commit.deletions > 0 && (
                      <span className="text-red-400">-{commit.deletions}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
          {isLoadingMore && (
            <div className="text-center py-4">
              <div className="text-gray-400 text-sm">Loading more commits...</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};