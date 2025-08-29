import React from 'react';
import { useUI } from '../contexts/UIContext';

export const MainContent: React.FC = () => {
  const { state } = useUI();

  return (
    <main className="flex-1 flex flex-col bg-[#22272e]">
      {state.activeTab === 'changes' ? (
        <ChangesDiffView />
      ) : (
        <HistoryDiffView />
      )}
    </main>
  );
};

const ChangesDiffView: React.FC = () => {
  const { state } = useUI();

  // Show diff only when a file is selected
  if (!state.selectedFile) {
    return (
      <div className="flex-1 flex flex-col context-menu-target">
        <div className="flex items-center justify-center h-full text-gray-400">
          <div className="text-center">
            <div className="text-2xl mb-2">📄</div>
            <div>Select a file to view changes</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col context-menu-target">
      {/* File Path Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-3 bg-[#2d333b] border-b border-gray-700">
        <div className="text-gray-300 font-mono text-sm">
          {state.selectedFile.path}
        </div>
      </div>

      {/* Code View */}
      <div className="flex-1 overflow-auto font-mono text-sm">
        <table className="w-full text-left">
          <tbody>
            <tr>
              <td className="p-1 pl-4 text-right text-gray-500 select-none w-10">16</td>
              <td className="p-1 text-right text-gray-500 select-none w-10">16</td>
              <td className="p-1 pr-4 text-gray-400">
                <span className="text-pink-400">import</span> {' { EnvConfig } '}
                <span className="text-pink-400">from</span> <span className="text-green-400">"./types"</span>;
              </td>
            </tr>
            <tr>
              <td className="p-1 pl-4 text-right text-gray-500 select-none">17</td>
              <td className="p-1 text-right text-gray-500 select-none">17</td>
              <td className="p-1 pr-4 text-gray-500">
                <span className="text-gray-500">// They will override all other values.</span>
              </td>
            </tr>
            <tr className="bg-red-500/10">
              <td className="p-1 pl-4 text-right text-gray-500 select-none">19</td>
              <td className="p-1 text-right text-gray-500 select-none"></td>
              <td className="p-1 pr-4 text-red-400">
                <span className="text-red-400/50">-</span>
                <span className="text-gray-500">// Detect if we are in a Node environment (process exists)</span>
              </td>
            </tr>
            <tr className="bg-green-500/10">
              <td className="p-1 text-right text-gray-500 select-none">19</td>
              <td className="p-1 pr-4 text-green-300">
                <span className="text-green-400/50">+</span>
                <span className="text-gray-500">// Detect if we are in a Node environment (process exists)</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const HistoryDiffView: React.FC = () => {
  const { state } = useUI();

  return (
    <div className="flex-1 flex flex-col context-menu-target">
      <div className="flex items-center justify-center h-full text-gray-400">
        <div className="text-center">
          <div className="text-2xl mb-2">📜</div>
          <div>Commit history view</div>
          <div className="text-sm mt-2">Select a commit to view changes</div>
        </div>
      </div>
    </div>
  );
};