import React from 'react';
import { TabType } from '../types';

interface BottomNavBarProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
}) => {
  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'dashboard', label: 'Overview', icon: 'dashboard' },
    { id: 'games', label: 'Matrix', icon: 'grid_view' },
    { id: 'assistant', label: 'Vault', icon: 'psychology' },
    { id: 'progress', label: 'Insights', icon: 'insights' },
    { id: 'settings', label: 'Config', icon: 'tune' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#F8F8F8] dark:bg-[#121212] border-t border-black dark:border-white/20 transition-colors duration-200">
      <div className="max-w-md mx-auto flex justify-around items-center h-16 px-2 pb-safe">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`flex flex-col items-center justify-center transition-all duration-150 cursor-pointer h-12 px-3 border border-transparent ${
                isActive
                  ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-black dark:hover:text-white hover:border-black/20 dark:hover:border-white/20'
              }`}
            >
              <span
                className="material-symbols-outlined text-[18px] leading-none mb-1"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1, 'wght' 600" : "'FILL' 0, 'wght' 400",
                }}
              >
                {tab.icon}
              </span>
              <span className="text-[9px] font-mono tracking-[0.15em] uppercase leading-none">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
