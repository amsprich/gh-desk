import React, { useRef, useState } from 'react';
import { UIProvider } from './contexts/UIContext';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { MainContent } from './components/MainContent';
import { BranchOverlay } from './components/BranchOverlay';
import { SelectBaseBranchModal } from './components/CreateBranchModal';
import { SwitchBranchModal } from './components/SwitchBranchModal';
import { ContextMenu } from './components/ContextMenu';
import './index.css';

export const App = () => {
    const sidebarRef = useRef<HTMLDivElement>(null);
    const [isResizing, setIsResizing] = useState(false);

    const handleResizeStart = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);

        const startX = e.clientX;
        const sidebar = sidebarRef.current;
        if (!sidebar) return;

        const startWidth = sidebar.getBoundingClientRect().width;

        const handleMouseMove = (e: MouseEvent) => {
            const newWidth = startWidth + (e.clientX - startX);
            const minWidth = 200;
            const maxWidth = window.innerWidth - 400;

            if (newWidth >= minWidth && newWidth <= maxWidth) {
                sidebar.style.width = `${newWidth}px`;
            }
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.classList.remove('select-none');
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.body.classList.add('select-none');
    };
    return (
        <UIProvider>
            <div className="w-screen h-screen bg-[#2d333b] flex flex-col overflow-hidden border border-gray-700 relative">
                {/* Main Content */}
                <div className={`flex flex-1 overflow-hidden ${isResizing ? 'select-none' : ''}`}>
                    {/* Sidebar */}
                    <div ref={sidebarRef} className="bg-[#22272e] flex flex-col text-sm" style={{ width: '25%' }}>
                        <Sidebar />
                    </div>

                    {/* Resizer */}
                    <div
                        id="main-resizer"
                        className="w-1 bg-transparent hover:bg-blue-500 cursor-col-resize border-r border-l border-gray-700 transition-colors"
                        onMouseDown={handleResizeStart}
                    />

                    {/* Main Content Area */}
                    <div className="flex-1 flex flex-col">
                        <Header />
                        <MainContent />
                    </div>
                </div>

                {/* Overlays */}
                <BranchOverlay />
                <SelectBaseBranchModal />
                <SwitchBranchModal />
                <ContextMenu />
            </div>
        </UIProvider>
    );
};
