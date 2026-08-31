import React from 'react';
import { CognitiveMetrics, UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface DashboardViewProps {
  metrics: CognitiveMetrics;
  profile: UserProfile;
  onStartGame: (gameName: string, level?: number) => void;
  onOpenAssistant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  profile,
  onStartGame,
}) => {
  return (
    <div className="pt-20 px-4 md:px-8 max-w-2xl mx-auto space-y-6 pb-28">
      {/* Structural Header & Streak */}
      <section className="flex justify-between items-end border-b border-black dark:border-white/20 pb-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 mb-0.5">
            STATUS // ACTIVE
          </div>
          <h1 className="font-headline text-2xl md:text-3xl font-bold tracking-tight text-neutral-900 dark:text-white uppercase">
            Cognitive Index
          </h1>
        </div>
        <div className="px-3 py-1 border border-black dark:border-white/30 bg-white dark:bg-[#1A1A1A] flex items-center gap-2">
          <div className="w-2 h-2 bg-black dark:bg-white rotate-45"></div>
          <span className="text-[11px] font-mono font-bold tracking-wider text-black dark:text-white uppercase">
            STREAK: {metrics.streakDays}D
          </span>
        </div>
      </section>

      {/* Overall Cognitive Score */}
      <section className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-6 relative overflow-hidden flex flex-col items-center justify-center text-center">
        <div className="absolute top-2 left-2 text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400">
          INDEX.01
        </div>
        <div className="absolute top-2 right-2 text-[9px] font-mono uppercase tracking-[0.2em] text-neutral-400">
          SYS.AGGREGATE
        </div>

        <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-neutral-600 dark:text-neutral-300 mt-2 mb-1">
          TOTAL COMPOSITE RATING
        </span>
        <div className="text-[64px] font-headline font-bold leading-none text-neutral-900 dark:text-white my-2 tracking-tighter">
          {metrics.cognitiveScore}
        </div>

        {/* Mini Sparkline Bar Chart */}
        <div className="w-full max-w-xs h-12 flex items-end gap-1.5 px-2 mt-3 pt-2 border-t border-black/10 dark:border-white/10">
          {metrics.dailySparkline.map((item, idx) => (
            <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <div
                className={`w-full transition-all duration-300 ${
                  item.isToday
                    ? 'bg-black dark:bg-white'
                    : 'bg-neutral-300 dark:bg-neutral-700'
                }`}
                style={{ height: `${item.value}%` }}
              ></div>
            </div>
          ))}
        </div>

        <div className="w-full max-w-xs flex justify-between mt-2 text-[10px] font-mono text-neutral-500 dark:text-neutral-400 px-2">
          {metrics.dailySparkline.map((item, idx) => (
            <span
              key={idx}
              className={item.isToday ? 'text-black dark:text-white font-bold underline' : ''}
            >
              {item.day}
            </span>
          ))}
        </div>
      </section>

      {/* Sub-scores Bento Grid (2x2) */}
      <section className="grid grid-cols-2 gap-3.5">
        {/* Memory */}
        <div className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col justify-between aspect-square relative hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              [01] MEM
            </span>
            <span className="text-[10px] font-mono font-bold text-black dark:text-white border border-black dark:border-white/30 px-1.5 py-0.5">
              +{metrics.categories.memory.delta}%
            </span>
          </div>
          <div>
            <div className="font-headline text-3xl font-bold text-neutral-900 dark:text-white mb-1">
              {metrics.categories.memory.score}
            </div>
            <div className="text-[11px] font-mono uppercase text-neutral-500 dark:text-neutral-400 mb-2">
              Memory Recall
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 border border-black/20 dark:border-white/20 overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-500"
                style={{ width: `${metrics.categories.memory.score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Focus */}
        <div className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col justify-between aspect-square relative hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              [02] FOC
            </span>
            <span className="text-[10px] font-mono font-bold text-black dark:text-white border border-black dark:border-white/30 px-1.5 py-0.5">
              +{metrics.categories.focus.delta}%
            </span>
          </div>
          <div>
            <div className="font-headline text-3xl font-bold text-neutral-900 dark:text-white mb-1">
              {metrics.categories.focus.score}
            </div>
            <div className="text-[11px] font-mono uppercase text-neutral-500 dark:text-neutral-400 mb-2">
              Focus Sustained
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 border border-black/20 dark:border-white/20 overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-500"
                style={{ width: `${metrics.categories.focus.score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Speed */}
        <div className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col justify-between aspect-square relative hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              [03] SPD
            </span>
            <span className="text-[10px] font-mono font-bold text-black dark:text-white border border-black dark:border-white/30 px-1.5 py-0.5">
              {metrics.categories.speed.delta}%
            </span>
          </div>
          <div>
            <div className="font-headline text-3xl font-bold text-neutral-900 dark:text-white mb-1">
              {metrics.categories.speed.score}
            </div>
            <div className="text-[11px] font-mono uppercase text-neutral-500 dark:text-neutral-400 mb-2">
              Processing Velocity
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 border border-black/20 dark:border-white/20 overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-500"
                style={{ width: `${metrics.categories.speed.score}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Logic */}
        <div className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col justify-between aspect-square relative hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
              [04] LOG
            </span>
            <span className="text-[10px] font-mono font-bold text-black dark:text-white border border-black dark:border-white/30 px-1.5 py-0.5">
              +{metrics.categories.logic.delta}%
            </span>
          </div>
          <div>
            <div className="font-headline text-3xl font-bold text-neutral-900 dark:text-white mb-1">
              {metrics.categories.logic.score}
            </div>
            <div className="text-[11px] font-mono uppercase text-neutral-500 dark:text-neutral-400 mb-2">
              Logical Reasoning
            </div>
            <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 border border-black/20 dark:border-white/20 overflow-hidden">
              <div
                className="h-full bg-black dark:bg-white transition-all duration-500"
                style={{ width: `${metrics.categories.logic.score}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Daily Challenge */}
      <section className="space-y-2.5">
        <div className="flex justify-between items-center">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
            PROTOCOL // DAILY TASK
          </h2>
          <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">RESET: 06:00:00</span>
        </div>
        <div className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-5 relative">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2 h-2 bg-black dark:bg-white"></span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-black dark:text-white">
                  OPTIMAL PROTOCOL
                </span>
              </div>
              <h3 className="font-headline text-xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
                Memory Matrix
              </h3>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-mono font-bold text-white bg-black dark:bg-white dark:text-black px-2 py-0.5 mb-1">
                TIER 04
              </span>
              <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                05 MIN DURATION
              </span>
            </div>
          </div>

          <p className="text-xs text-neutral-600 dark:text-neutral-300 mb-5 leading-relaxed font-sans">
            Calibrate spatial recall by identifying rapid node patterns across a 4x4 coordinate plane.
          </p>

          <button
            onClick={() => {
              playSound('tap', profile.soundEnabled);
              onStartGame('Memory Matrix', 4);
            }}
            className="w-full py-3 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white text-xs font-mono font-bold uppercase tracking-[0.2em] hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            EXECUTE PROTOCOL
          </button>
        </div>
      </section>

      {/* Continue Training Grid */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-600 dark:text-neutral-400">
          TRAINING // DIRECTORY
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Card 1: Memory Match */}
          <div
            onClick={() => {
              playSound('tap', profile.soundEnabled);
              onStartGame('Memory Match', 2);
            }}
            className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-8 h-8 border border-black dark:border-white/30 flex items-center justify-center mb-3 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-lg">view_cozy</span>
              </div>
              <h3 className="font-headline text-[15px] font-bold text-neutral-900 dark:text-white uppercase mb-1">
                Memory Match
              </h3>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>LVL 02 • 3 MIN</span>
              <span className="material-symbols-outlined text-sm text-black dark:text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>

          {/* Card 2: Focus Flow */}
          <div
            onClick={() => {
              playSound('tap', profile.soundEnabled);
              onStartGame('Focus Flow', 3);
            }}
            className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-8 h-8 border border-black dark:border-white/30 flex items-center justify-center mb-3 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-lg">waves</span>
              </div>
              <h3 className="font-headline text-[15px] font-bold text-neutral-900 dark:text-white uppercase mb-1">
                Focus Flow
              </h3>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>LVL 03 • 4 MIN</span>
              <span className="material-symbols-outlined text-sm text-black dark:text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>

          {/* Card 3: Pattern Recall */}
          <div
            onClick={() => {
              playSound('tap', profile.soundEnabled);
              onStartGame('Pattern Recall', 4);
            }}
            className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-8 h-8 border border-black dark:border-white/30 flex items-center justify-center mb-3 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-lg">pattern</span>
              </div>
              <h3 className="font-headline text-[15px] font-bold text-neutral-900 dark:text-white uppercase mb-1">
                Pattern Recall
              </h3>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>LVL 04 • 5 MIN</span>
              <span className="material-symbols-outlined text-sm text-black dark:text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>

          {/* Card 4: Logic Circuit */}
          <div
            onClick={() => {
              playSound('tap', profile.soundEnabled);
              onStartGame('Logic Circuit', 3);
            }}
            className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group"
          >
            <div>
              <div className="w-8 h-8 border border-black dark:border-white/30 flex items-center justify-center mb-3 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-lg">calculate</span>
              </div>
              <h3 className="font-headline text-[15px] font-bold text-neutral-900 dark:text-white uppercase mb-1">
                Logic Circuit
              </h3>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>LVL 03 • 4 MIN</span>
              <span className="material-symbols-outlined text-sm text-black dark:text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>

          {/* Card 5: Word Weaver */}
          <div
            onClick={() => {
              playSound('tap', profile.soundEnabled);
              onStartGame('Word Weaver', 2);
            }}
            className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-4 flex flex-col justify-between hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group sm:col-span-2 md:col-span-1"
          >
            <div>
              <div className="w-8 h-8 border border-black dark:border-white/30 flex items-center justify-center mb-3 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                <span className="material-symbols-outlined text-lg">spellcheck</span>
              </div>
              <h3 className="font-headline text-[15px] font-bold text-neutral-900 dark:text-white uppercase mb-1">
                Word Weaver
              </h3>
            </div>
            <div className="flex justify-between items-center mt-3 pt-2 border-t border-black/10 dark:border-white/10 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
              <span>LVL 02 • 3 MIN</span>
              <span className="material-symbols-outlined text-sm text-black dark:text-white group-hover:translate-x-1 transition-transform">arrow_forward</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
