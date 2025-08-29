import React, { useState } from 'react';
import { useUI } from '../contexts/UIContext';

const UncommittedChangesDialog: React.FC<{
  currentBranch: string;
  newBranch: string;
  onConfirm: (action: 'leave' | 'bring') => void;
  onCancel: () => void;
}> = ({ currentBranch, newBranch, onConfirm, onCancel }) => {
  return (
    <div className="absolute inset-0 bg-black/40 z-30 grid place-items-center">
      <div className="bg-[#2d333b] w-full max-w-md rounded-lg shadow-xl border border-gray-700 flex flex-col p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Uncommitted Changes</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <p className="text-sm mb-4">You have uncommitted changes. What would you like to do with them?</p>

        <div className="space-y-2 text-sm">
          <label className="flex items-start p-3 bg-[#22272e] rounded border border-gray-600">
            <input
              type="radio"
              name="changes-action"
              value="leave"
              defaultChecked
              className="mt-1"
              onChange={() => {}}
            />
            <div className="ml-3">
              <p>Leave my changes on {currentBranch}</p>
              <p className="text-xs text-gray-400">
                Your changes will be stashed and stay on the current branch.
              </p>
            </div>
          </label>
          <label className="flex items-start p-3 bg-[#22272e] rounded border border-gray-600">
            <input
              type="radio"
              name="changes-action"
              value="bring"
              className="mt-1"
              onChange={() => {}}
            />
            <div className="ml-3">
              <p>Bring my changes to {newBranch}</p>
              <p className="text-xs text-gray-400">
                Your uncommitted changes will follow you to the new branch.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onCancel}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-4 rounded-md text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              const selectedAction = (document.querySelector('input[name="changes-action"]:checked') as HTMLInputElement)?.value as 'leave' | 'bring';
              onConfirm(selectedAction || 'leave');
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-md text-sm"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};

export const SelectBaseBranchModal: React.FC = () => {
  const { state, setCreateBranchModalOpen, setPendingBranchName, setPendingBaseBranch, createBranch } = useUI();
  const [branchName, setBranchName] = useState(state.pendingBranchName);
  const [baseBranch, setBaseBranch] = useState<'main' | 'current'>(state.pendingBaseBranch || 'current'); // Default to current branch
  const [showUncommittedDialog, setShowUncommittedDialog] = useState(false);

  // Show base branch selection only if not on default branch
  const showBaseBranchSelection = state.currentBranch !== state.defaultBranch;

  // Check if there are uncommitted changes
  const hasUncommittedChanges = state.uncommittedChanges > 0;

  console.log('=== SELECT BASE BRANCH MODAL DEBUG ===');
  console.log('Modal open:', state.isCreateBranchModalOpen);
  console.log('Pending branch name:', state.pendingBranchName);
  console.log('Current branch name in input:', branchName);
  console.log('Current branch:', state.currentBranch);
  console.log('Default branch:', state.defaultBranch);
  console.log('Show base branch selection:', showBaseBranchSelection);
  console.log('Has uncommitted changes:', hasUncommittedChanges);

  // Don't render if modal is not open
  if (!state.isCreateBranchModalOpen) return null;

  const handleClose = () => {
    setCreateBranchModalOpen(false);
    setPendingBranchName('');
    setPendingBaseBranch('main');
    setBranchName('');
    setBaseBranch('main');
  };

  const handleCreateBranch = () => {
    if (branchName.trim()) {
      if (hasUncommittedChanges) {
        setShowUncommittedDialog(true);
      } else {
        createBranch(branchName.trim(), baseBranch);
      }
    }
  };

  const handleUncommittedConfirm = (action: 'leave' | 'bring') => {
    setShowUncommittedDialog(false);
    console.log('User chose to:', action, 'uncommitted changes');
    createBranch(branchName.trim(), baseBranch, action);
  };

  const handleUncommittedCancel = () => {
    setShowUncommittedDialog(false);
  };

  return (
    <>
      <div className="absolute inset-0 bg-black/40 z-20 grid place-items-center">
        <div className="bg-[#2d333b] w-full max-w-md rounded-lg shadow-xl border border-gray-700 flex flex-col p-6 text-white">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              {showBaseBranchSelection ? 'Select Base Branch' : 'Create Branch'}
            </h2>
            <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">
              ×
            </button>
          </div>

          <p className="text-sm mb-2">Branch name</p>
          <input
            type="text"
            value={branchName}
            onChange={(e) => setBranchName(e.target.value)}
            className="bg-[#22272e] border border-gray-600 rounded px-3 py-1.5 w-full mb-4 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />

          {showBaseBranchSelection && (
            <>
              <p className="text-sm mb-2">Create branch based on...</p>
              <div className="space-y-2 text-sm">
                <label className="flex items-start p-3 bg-[#22272e] rounded border border-gray-600">
                  <input
                    type="radio"
                    name="base-branch"
                    value="main"
                    checked={baseBranch === 'main'}
                    onChange={() => setBaseBranch('main')}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <p>{state.defaultBranch}</p>
                    <p className="text-xs text-gray-400">
                      The default branch in your repository. Pick this to start something new that's not dependent on your current branch.
                    </p>
                  </div>
                </label>
                <label className="flex items-start p-3 bg-[#22272e] rounded border border-gray-600">
                  <input
                    type="radio"
                    name="base-branch"
                    value="current"
                    checked={baseBranch === 'current'}
                    onChange={() => setBaseBranch('current')}
                    className="mt-1"
                  />
                  <div className="ml-3">
                    <p>{state.currentBranch}</p>
                    <p className="text-xs text-gray-400">
                      The currently checked out branch. Pick this if you need to build on work done on this branch.
                    </p>
                  </div>
                </label>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <button
              onClick={handleClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-4 rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBranch}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-md text-sm"
            >
              Create Branch
            </button>
          </div>
        </div>
      </div>

      {showUncommittedDialog && (
        <UncommittedChangesDialog
          currentBranch={state.currentBranch}
          newBranch={branchName}
          onConfirm={handleUncommittedConfirm}
          onCancel={handleUncommittedCancel}
        />
      )}
    </>
  );
};

// Export both names for backward compatibility
export { SelectBaseBranchModal as CreateBranchModal };