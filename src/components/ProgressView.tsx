import React, { useState } from 'react';
import { TrendingUp, RefreshCw, Award, CheckCircle, Calendar, Sparkles } from 'lucide-react';
import { CognitiveMetrics, UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface ProgressViewProps {
  metrics: CognitiveMetrics;
  profile: UserProfile;
  onRefreshInsights: () => Promise<void>;
  isRefreshing?: boolean;
}

export const ProgressView: React.FC<ProgressViewProps> = ({
  metrics,
  profile,
  onRefreshInsights,
  isRefreshing = false,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<{ day: string; score: number } | null>(null);

  return (
    <div className="pt-20 px-4 md:px-8 max-w-2xl mx-auto space-y-5 pb-28">
      {/* Overall Score Card */}
      <section className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-6 flex flex-col gap-3 relative overflow-hidden">
        <div className="flex justify-between items-end border-b border-black/10 dark:border-white/10 pb-4">
          <div>
            <p className="text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">
              OVERALL METRIC SCORE
            </p>
            <div className="flex items-baseline gap-2.5 mt-1">
              <span className="font-mono text-4xl font-bold text-neutral-900 dark:text-white">
                {metrics.cognitiveScore}
              </span>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white flex items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 border border-black/20 dark:border-white/20">
                <TrendingUp className="w-3.5 h-3.5" />
                +{metrics.scoreDelta}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em]">
              WEEKLY TARGET
            </p>
            <p className="text-sm font-mono font-bold text-neutral-900 dark:text-white mt-1 flex items-center justify-end gap-1 uppercase">
              <CheckCircle className="w-3.5 h-3.5" />
              {metrics.weeklyGoalMet ? 'STATUS: MET' : 'STATUS: IN PROGRESS'}
            </p>
          </div>
        </div>

        {/* Geometric Step / Spline Chart */}
        <div className="w-full h-36 relative mt-4 border-b border-l border-black dark:border-white/30 px-2">
          {hoveredPoint && (
            <div className="absolute top-2 right-4 bg-black text-white dark:bg-white dark:text-black px-2 py-1 text-[10px] font-mono uppercase font-bold border border-black dark:border-white z-20">
              {hoveredPoint.day}: {hoveredPoint.score} PTS
            </div>
          )}

          <svg
            className="w-full h-full overflow-visible"
            preserveAspectRatio="none"
            viewBox="0 0 100 40"
          >
            <defs>
              <linearGradient id="chartGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                <stop offset="0%" stopColor="#000000" stopOpacity="0.15" className="dark:stop-color-white"></stop>
                <stop offset="100%" stopColor="#000000" stopOpacity="0.0"></stop>
              </linearGradient>
            </defs>

            {/* Spline Area Fill */}
            <path
              d="M 0,34 C 15,32 25,24 35,22 C 45,20 55,14 65,13 C 75,12 85,7 100,4 L 100,40 L 0,40 Z"
              fill="url(#chartGrad)"
            ></path>

            {/* Spline Line */}
            <path
              d="M 0,34 C 15,32 25,24 35,22 C 45,20 55,14 65,13 C 75,12 85,7 100,4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-black dark:text-white"
              vectorEffect="non-scaling-stroke"
            ></path>

            {/* Interactive Data Points */}
            <circle
              cx="35"
              cy="22"
              r="3"
              className="fill-black dark:fill-white stroke-2 stroke-white dark:stroke-[#1A1A1A] cursor-pointer hover:r-4 transition-all"
              onMouseEnter={() => setHoveredPoint({ day: 'Wed', score: 750 })}
              onMouseLeave={() => setHoveredPoint(null)}
            ></circle>
            <circle
              cx="65"
              cy="13"
              r="3"
              className="fill-black dark:fill-white stroke-2 stroke-white dark:stroke-[#1A1A1A] cursor-pointer hover:r-4 transition-all"
              onMouseEnter={() => setHoveredPoint({ day: 'Fri', score: 770 })}
              onMouseLeave={() => setHoveredPoint(null)}
            ></circle>
            <circle
              cx="100"
              cy="4"
              r="3.5"
              className="fill-black dark:fill-white stroke-2 stroke-white dark:stroke-[#1A1A1A] cursor-pointer hover:r-5 transition-all"
              onMouseEnter={() => setHoveredPoint({ day: 'Sun (Today)', score: 785 })}
              onMouseLeave={() => setHoveredPoint(null)}
            ></circle>
          </svg>
        </div>

        {/* Chart X-Axis Labels */}
        <div className="flex justify-between w-full mt-1 text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400 px-1">
          <span>Mon</span>
          <span>Wed</span>
          <span>Fri</span>
          <span className="text-black dark:text-white font-bold">Sun</span>
        </div>
      </section>

      {/* AI Cognitive Insight Card */}
      <section className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-5 flex items-start gap-4">
        {/* AI Insight Icon */}
        <div className="w-10 h-10 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0">
          <span className="material-symbols-outlined text-xl">psychology_alt</span>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-start mb-1">
            <h3 className="font-headline text-base font-bold text-neutral-900 dark:text-white uppercase">
              {metrics.insight.title}
            </h3>
            <button
              onClick={() => {
                playSound('tap', profile.soundEnabled);
                onRefreshInsights();
              }}
              disabled={isRefreshing}
              title="Regenerate dynamic AI insights"
              className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors p-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">
            Your visual memory improved{' '}
            <strong className="font-mono font-bold text-black dark:text-white">
              +{metrics.insight.percentageGain}%
            </strong>{' '}
            this week. Consistent spatial puzzle training is paying off.
          </p>
          <p className="text-[11px] font-mono text-neutral-500 dark:text-neutral-400 mt-2">
            [PROTOCOL ADVICE]: {metrics.insight.recommendation}
          </p>
        </div>
      </section>

      {/* Bento Grid: 14 Day Streak & Personal Bests */}
      <div className="grid grid-cols-2 gap-4">
        {/* Streak Calendar Card */}
        <section className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-4.5 flex flex-col items-center text-center justify-between">
          <div className="w-9 h-9 border border-black dark:border-white/30 text-black dark:text-white flex items-center justify-center mb-2">
            <span className="material-symbols-outlined text-[20px]">local_fire_department</span>
          </div>

          <div>
            <h4 className="font-headline text-sm font-bold text-neutral-900 dark:text-white uppercase leading-tight">
              14 Day Streak
            </h4>
            <p className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400 mt-0.5 mb-3">
              CURRENT CYCLE
            </p>
          </div>

          {/* Mini Calendar 14-block grid (7 cols x 2 rows) */}
          <div className="grid grid-cols-7 gap-1.5 w-full max-w-[170px]">
            {metrics.streakCalendar.map((item) => (
              <div
                key={item.day}
                title={`Day ${item.day}`}
                className={`h-4 border transition-transform ${
                  item.isToday
                    ? 'bg-black dark:bg-white border-black dark:border-white ring-2 ring-black/20 dark:ring-white/20'
                    : item.active
                    ? 'bg-black dark:bg-white border-black dark:border-white'
                    : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 dark:border-neutral-700'
                }`}
              ></div>
            ))}
          </div>
        </section>

        {/* Personal Bests Card */}
        <section className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-4.5 flex flex-col justify-between">
          <h4 className="text-[10px] font-mono uppercase font-bold text-neutral-500 dark:text-neutral-400 tracking-[0.2em] mb-2">
            PERSONAL BESTS
          </h4>

          <div className="space-y-2.5">
            {/* Memory */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5 text-black dark:text-white">
                <span className="material-symbols-outlined text-[16px]">memory</span>
                <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200 uppercase">
                  Memory
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                {metrics.personalBests.memory}
              </span>
            </div>

            {/* Focus */}
            <div className="flex items-center justify-between border-b border-black/10 dark:border-white/10 pb-1.5">
              <div className="flex items-center gap-1.5 text-black dark:text-white">
                <span className="material-symbols-outlined text-[16px]">center_focus_strong</span>
                <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200 uppercase">
                  Focus
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                {metrics.personalBests.focus}
              </span>
            </div>

            {/* Speed */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-black dark:text-white">
                <span className="material-symbols-outlined text-[16px]">speed</span>
                <span className="text-xs font-mono font-bold text-neutral-800 dark:text-neutral-200 uppercase">
                  Speed
                </span>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-900 dark:text-white">
                {metrics.personalBests.speed}
              </span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
