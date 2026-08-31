import React from 'react';
import { Bell, Moon, Sun } from 'lucide-react';
import { TabType, UserProfile } from '../types';

interface HeaderProps {
  currentTab: TabType;
  profile: UserProfile;
  onToggleTheme: () => void;
  onOpenNotifications: () => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  profile,
  onToggleTheme,
  onOpenNotifications,
  unreadCount = 2,
}) => {
  const getHeaderContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border border-black dark:border-white shadow-xs">
              <div className="w-3.5 h-3.5 border-2 border-white dark:border-black rotate-45"></div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                PROTOCOL № 042
              </div>
              <span className="font-headline text-[16px] md:text-[18px] font-bold tracking-tight text-neutral-900 dark:text-white uppercase">
                {profile.name} // OVERVIEW
              </span>
            </div>
          </div>
        );

      case 'assistant':
        return (
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border border-black dark:border-white">
              <div className="w-3.5 h-3.5 border-2 border-white dark:border-black rotate-45"></div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-black dark:bg-white inline-block"></span>
                NEURAL ENGINE ONLINE
              </div>
              <h1 className="font-headline text-[16px] md:text-[18px] font-bold text-neutral-900 dark:text-white leading-tight uppercase tracking-tight">
                NEUROSYNC // VAULT
              </h1>
            </div>
          </div>
        );

      case 'progress':
        return (
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border border-black dark:border-white">
              <div className="w-3.5 h-3.5 border-2 border-white dark:border-black rotate-45"></div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                METRICS & ANALYSIS
              </div>
              <h1 className="font-headline text-[16px] md:text-[18px] font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
                COGNITIVE ARCHIVES
              </h1>
            </div>
          </div>
        );

      case 'games':
        return (
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border border-black dark:border-white">
              <div className="w-3.5 h-3.5 border-2 border-white dark:border-black rotate-45"></div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                MODULE CALIBRATION
              </div>
              <h1 className="font-headline text-[16px] md:text-[18px] font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
                NEURAL MATRIX
              </h1>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center border border-black dark:border-white">
              <div className="w-3.5 h-3.5 border-2 border-white dark:border-black rotate-45"></div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400">
                SYSTEM CONFIGURATION
              </div>
              <h1 className="font-headline text-[16px] md:text-[18px] font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
                PREFERENCES
              </h1>
            </div>
          </div>
        );
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-[#F8F8F8] dark:bg-[#121212] border-b border-black dark:border-white/20 px-4 md:px-8 flex justify-between items-center transition-colors duration-200">
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        {getHeaderContent()}

        <div className="flex items-center gap-2">
          {/* Quick Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title={profile.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
            className="w-9 h-9 border border-black dark:border-white/30 flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors active:scale-95 cursor-pointer bg-white dark:bg-[#1A1A1A]"
          >
            {profile.theme === 'dark' ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            aria-label="Notifications"
            className="relative w-9 h-9 border border-black dark:border-white/30 flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors active:scale-95 cursor-pointer bg-white dark:bg-[#1A1A1A]"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-black dark:bg-white border border-white dark:border-black"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
