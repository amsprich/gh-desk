import React from 'react';
import { useUI } from '../contexts/UIContext';
import { vscode } from '../lib/vscode';

export const ContextMenu: React.FC = () => {
  const { state, hideContextMenu, stageFile, unstageFile } = useUI();

  if (!state.contextMenu.isVisible || !state.contextMenu.targetFile) {
    return null;
  }

  const handleDiscardChanges = () => {
    if (state.contextMenu.targetFile) {
      // Use git checkout to discard changes
      vscode.postMessage({
        type: 'discardChanges',
        path: state.contextMenu.targetFile.path
      });
    }
    hideContextMenu();
  };

  const handleCopyFilePath = () => {
    if (state.contextMenu.targetFile) {
      // Get full system path
      vscode.postMessage({
        type: 'getFullFilePath',
        path: state.contextMenu.targetFile.path
      });
    }
    hideContextMenu();
  };

  const handleCopyRelativePath = () => {
    if (state.contextMenu.targetFile) {
      navigator.clipboard.writeText(state.contextMenu.targetFile.path);
    }
    hideContextMenu();
  };

  const handleRevealInFinder = () => {
    if (state.contextMenu.targetFile) {
      vscode.postMessage({
        type: 'revealInFinder',
        path: state.contextMenu.targetFile.path
      });
    }
    hideContextMenu();
  };

  const handleOpenInEditor = () => {
    if (state.contextMenu.targetFile) {
      vscode.postMessage({
        type: 'openInEditor',
        path: state.contextMenu.targetFile.path
      });
    }
    hideContextMenu();
  };

  return (
    <div
      className="absolute bg-[#2d333b] border border-gray-700 rounded-md shadow-lg text-white text-sm py-1 z-50"
      style={{
        left: state.contextMenu.x,
        top: state.contextMenu.y,
      }}
    >
      <button
        className="block w-full text-left px-4 py-1.5 hover:bg-red-600"
        onClick={handleDiscardChanges}
      >
        Discard Changes...
      </button>
      <div className="border-t border-gray-700 my-1"></div>
      <button
        className="block w-full text-left px-4 py-1.5 hover:bg-blue-600"
        onClick={handleCopyFilePath}
      >
        Copy File Path
      </button>
      <button
        className="block w-full text-left px-4 py-1.5 hover:bg-blue-600"
        onClick={handleCopyRelativePath}
      >
        Copy Relative File Path
      </button>
      <div className="border-t border-gray-700 my-1"></div>
      <button
        className="block w-full text-left px-4 py-1.5 hover:bg-blue-600"
        onClick={handleRevealInFinder}
      >
        Reveal in Finder
      </button>
      <button
        className="block w-full text-left px-4 py-1.5 hover:bg-blue-600"
        onClick={handleOpenInEditor}
      >
        Open in Editor
      </button>
    </div>
  );
};