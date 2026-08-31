import React from 'react';
import { X, Bell, Flame, Calendar, Award, CheckCircle } from 'lucide-react';
import { playSound } from '../utils/audio';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  soundEnabled,
}) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 'notif-1',
      title: 'Daily Cognitive Challenge Ready',
      desc: 'Memory Matrix Level 4 is waiting. Keep your 14-day streak alive!',
      time: '10m ago',
      icon: 'local_fire_department',
      color: 'text-orange-500 bg-orange-100 dark:bg-orange-900/30',
    },
    {
      id: 'notif-2',
      title: 'Upcoming Presentation Reminder',
      desc: 'Product Strategy Presentation on Sept 12 at 10:00 AM.',
      time: '1h ago',
      icon: 'event',
      color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    },
    {
      id: 'notif-3',
      title: 'Cognitive Milestone Unlocked',
      desc: 'Visual memory retention increased by +12% this week.',
      time: 'Yesterday',
      icon: 'insights',
      color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-black dark:border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-headline text-base font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
              Notifications & Sync
            </h3>
          </div>
          <button
            onClick={() => {
              playSound('tap', soundEnabled);
              onClose();
            }}
            className="w-7 h-7 border border-black/20 dark:border-white/20 flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="p-3 bg-neutral-50 dark:bg-neutral-900 border border-black/15 dark:border-white/15 flex items-start gap-3"
            >
              <div className="w-8 h-8 border border-black dark:border-white/30 bg-white dark:bg-black text-black dark:text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[18px]">{n.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start">
                  <h4 className="text-xs font-mono uppercase font-bold text-neutral-900 dark:text-white truncate">
                    {n.title}
                  </h4>
                  <span className="text-[10px] font-mono text-neutral-400 whitespace-nowrap ml-2">
                    {n.time}
                  </span>
                </div>
                <p className="text-xs font-mono text-neutral-600 dark:text-neutral-400 mt-1 leading-snug">
                  {n.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={() => {
            playSound('tap', soundEnabled);
            onClose();
          }}
          className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white text-xs font-mono uppercase font-bold tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors cursor-pointer"
        >
          MARK ALL AS READ
        </button>
      </div>
    </div>
  );
};
