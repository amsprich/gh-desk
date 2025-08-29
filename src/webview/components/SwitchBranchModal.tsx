import React, { useState } from 'react';
import { useUI } from '../contexts/UIContext';

export const SwitchBranchModal: React.FC = () => {
  const { state, setSwitchBranchModalOpen } = useUI();
  const [stashOption, setStashOption] = useState<'leave' | 'bring'>('bring');

  if (!state.isSwitchBranchModalOpen) return null;

  const handleClose = () => {
    setSwitchBranchModalOpen(false);
    setStashOption('bring');
  };

  const handleSwitchBranch = () => {
    // Handle branch switching logic here
    console.log('Switching branch with option:', stashOption);
    handleClose();
  };

  return (
    <div className="absolute inset-0 bg-black/40 z-20 grid place-items-center">
      <div className="bg-[#2d333b] w-full max-w-md rounded-lg shadow-xl border border-gray-700 flex flex-col p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Switch Branch</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-white text-2xl">
            ×
          </button>
        </div>

        <p className="text-sm mb-4">You have changes on this branch. What would you like to do with them?</p>
        
        <div className="space-y-2 text-sm">
          <label className="flex items-start p-3 bg-[#22272e] rounded border border-gray-600">
            <input 
              type="radio" 
              name="stash-option" 
              value="leave" 
              checked={stashOption === 'leave'}
              onChange={() => setStashOption('leave')}
              className="mt-1"
            />
            <div className="ml-3">
              <p>Leave my changes on {state.currentBranch}</p>
              <p className="text-xs text-gray-400">
                Your in-progress work will be stashed on this branch for you to return to later.
              </p>
            </div>
          </label>
          <label className="flex items-start p-3 bg-[#22272e] rounded border border-gray-600">
            <input 
              type="radio" 
              name="stash-option" 
              value="bring" 
              checked={stashOption === 'bring'}
              onChange={() => setStashOption('bring')}
              className="mt-1"
            />
            <div className="ml-3">
              <p>Bring my changes to new branch</p>
              <p className="text-xs text-gray-400">
                Your in-progress work will follow you to the new branch.
              </p>
            </div>
          </label>
        </div>

        <div className="flex justify-end space-x-2 mt-6">
          <button 
            onClick={handleClose}
            className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-1.5 px-4 rounded-md text-sm"
          >
            Cancel
          </button>
          <button 
            onClick={handleSwitchBranch}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-4 rounded-md text-sm"
          >
            Switch Branch
          </button>
        </div>
      </div>
    </div>
  );
};