import React, { useState } from 'react';
import { Moon, Sun, Volume2, VolumeX, Sparkles, User, Bell, Download, RotateCcw, ShieldCheck } from 'lucide-react';
import { UserProfile, ThemeMode } from '../types';
import { playSound } from '../utils/audio';

interface SettingsViewProps {
  profile: UserProfile;
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onResetData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  profile,
  onUpdateProfile,
  onResetData,
}) => {
  const [userName, setUserName] = useState(profile.name);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;
    onUpdateProfile({ name: userName.trim() });
    playSound('correct', profile.soundEnabled);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleThemeChange = (mode: ThemeMode) => {
    playSound('tap', profile.soundEnabled);
    onUpdateProfile({ theme: mode });
  };

  const handleExportData = () => {
    playSound('tap', profile.soundEnabled);
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(
      JSON.stringify({ profile, exportedAt: new Date().toISOString() }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `neurosync_backup_${profile.name.toLowerCase()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="pt-20 px-4 md:px-8 max-w-2xl mx-auto space-y-6 pb-28">
      <div className="border-b border-black dark:border-white/20 pb-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 mb-0.5">
          SYSTEM CONFIGURATION
        </div>
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
          Customize your cognitive environment, audio synthesis, and neural AI companion.
        </p>
      </div>

      {/* Profile Card */}
      <section className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-5 space-y-4">
        <h2 className="font-headline text-sm font-bold text-neutral-900 dark:text-white uppercase flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
          <User className="w-4 h-4 text-black dark:text-white" />
          User Profile
        </h2>

        <div className="flex items-center gap-4">
          <img
            src={profile.avatarUrl}
            alt="Profile Avatar"
            className="w-14 h-14 object-cover border border-black dark:border-white/30"
          />
          <form onSubmit={handleSaveName} className="flex-1 space-y-2">
            <div>
              <label className="block text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-1">
                DISPLAY IDENTIFIER
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="flex-1 px-3 py-1.5 bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 text-xs font-mono text-neutral-900 dark:text-white focus:outline-none focus:border-black dark:focus:border-white"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white text-xs font-mono uppercase font-bold hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  SAVE
                </button>
              </div>
            </div>
            {savedSuccess && (
              <span className="text-[10px] font-mono font-bold text-black dark:text-white">
                ✓ NAME UPDATED
              </span>
            )}
          </form>
        </div>
      </section>

      {/* Theme Selection */}
      <section className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-5 space-y-3">
        <h2 className="font-headline text-sm font-bold text-neutral-900 dark:text-white uppercase flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
          <Sparkles className="w-4 h-4 text-black dark:text-white" />
          Visual Theme Architecture
        </h2>

        <div className="grid grid-cols-2 gap-3">
          {/* Dark Mode */}
          <button
            onClick={() => handleThemeChange('dark')}
            className={`p-3.5 border flex flex-col items-start gap-2 transition-all text-left cursor-pointer ${
              profile.theme === 'dark'
                ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black'
                : 'border-black/20 dark:border-white/20 bg-white dark:bg-[#1A1A1A] hover:border-black dark:hover:border-white'
            }`}
          >
            <div className="w-7 h-7 border border-current flex items-center justify-center">
              <Moon className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase font-bold">
                Geometric Dark
              </div>
              <div className="text-[10px] font-mono opacity-70">
                Monochrome brutalist obsidian
              </div>
            </div>
          </button>

          {/* Light Mode */}
          <button
            onClick={() => handleThemeChange('light')}
            className={`p-3.5 border flex flex-col items-start gap-2 transition-all text-left cursor-pointer ${
              profile.theme === 'light'
                ? 'border-black dark:border-white bg-black text-white dark:bg-white dark:text-black'
                : 'border-black/20 dark:border-white/20 bg-white dark:bg-[#1A1A1A] hover:border-black dark:hover:border-white'
            }`}
          >
            <div className="w-7 h-7 border border-current flex items-center justify-center">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-xs font-mono uppercase font-bold">
                Geometric Light
              </div>
              <div className="text-[10px] font-mono opacity-70">
                High-contrast architectural paper
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* Audio & Feedback */}
      <section className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-5 space-y-4">
        <h2 className="font-headline text-sm font-bold text-neutral-900 dark:text-white uppercase flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
          <Volume2 className="w-4 h-4 text-black dark:text-white" />
          Sound & Haptics
        </h2>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-mono uppercase font-bold text-neutral-900 dark:text-white">
                Harmonic Audio Synthesis
              </div>
              <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                Play sine wave feedback on game events and protocol sync
              </div>
            </div>
            <button
              onClick={() => {
                const next = !profile.soundEnabled;
                onUpdateProfile({ soundEnabled: next });
                if (next) playSound('levelUp', true);
              }}
              className={`w-11 h-6 border border-black dark:border-white transition-colors relative p-0.5 cursor-pointer ${
                profile.soundEnabled
                  ? 'bg-black dark:bg-white'
                  : 'bg-neutral-200 dark:bg-neutral-800'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 bg-white dark:bg-black transition-transform ${
                  profile.soundEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-black/10 dark:border-white/10">
            <div>
              <div className="text-xs font-mono uppercase font-bold text-neutral-900 dark:text-white">
                Tactile Vibration Feedback
              </div>
              <div className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                Haptic vibration pulses when selecting matrix coordinates
              </div>
            </div>
            <button
              onClick={() => onUpdateProfile({ hapticsEnabled: !profile.hapticsEnabled })}
              className={`w-11 h-6 border border-black dark:border-white transition-colors relative p-0.5 cursor-pointer ${
                profile.hapticsEnabled
                  ? 'bg-black dark:bg-white'
                  : 'bg-neutral-200 dark:bg-neutral-800'
              }`}
            >
              <div
                className={`w-4.5 h-4.5 bg-white dark:bg-black transition-transform ${
                  profile.hapticsEnabled ? 'translate-x-5' : 'translate-x-0'
                }`}
              ></div>
            </button>
          </div>
        </div>
      </section>

      {/* Data Management & Export */}
      <section className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-5 space-y-3">
        <h2 className="font-headline text-sm font-bold text-neutral-900 dark:text-white uppercase flex items-center gap-2 border-b border-black/10 dark:border-white/10 pb-2">
          <ShieldCheck className="w-4 h-4 text-black dark:text-white" />
          Data & Protocol Control
        </h2>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            onClick={handleExportData}
            className="flex-1 py-2 px-3 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 text-xs font-mono uppercase font-bold text-neutral-900 dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            EXPORT BACKUP (JSON)
          </button>
          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset training data and cognitive score baselines?')) {
                onResetData();
                playSound('tap', profile.soundEnabled);
              }
            }}
            className="py-2 px-3 bg-neutral-100 dark:bg-neutral-900 border border-black/30 dark:border-white/30 text-xs font-mono uppercase font-bold text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600 dark:hover:text-white transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET BASELINE
          </button>
        </div>
      </section>
    </div>
  );
};
