import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, X } from 'lucide-react';
import { UserProfile, GameResult } from '../../types';
import { playSound } from '../../utils/audio';

interface MemoryMatrixGameProps {
  profile: UserProfile;
  initialLevel?: number;
  onFinishGame: (result: GameResult) => void;
  onCloseGame: () => void;
}

type MatrixPhase = 'memorize' | 'recall' | 'success' | 'failed' | 'paused';

export const MemoryMatrixGame: React.FC<MemoryMatrixGameProps> = ({
  profile,
  initialLevel = 4,
  onFinishGame,
  onCloseGame,
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [score, setScore] = useState<number>(12400);
  const [timeLeft, setTimeLeft] = useState<number>(105);
  const [phase, setPhase] = useState<MatrixPhase>('memorize');
  const [targetIndices, setTargetIndices] = useState<number[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<number[]>([]);
  const [mistakeIndices, setMistakeIndices] = useState<number[]>([]);
  const [aiGuidance, setAiGuidance] = useState<string>(
    `Focus on the geometric clusters, ${profile.name}. Spatial working memory thrives on chunking.`
  );
  const [streak, setStreak] = useState<number>(1);
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [correctClicks, setCorrectClicks] = useState<number>(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateNewRound = useCallback(
    (lvl: number) => {
      const tileCount = Math.min(Math.max(3, lvl + 1), 9);
      const indices: number[] = [];
      while (indices.length < tileCount) {
        const rand = Math.floor(Math.random() * 16);
        if (!indices.includes(rand)) {
          indices.push(rand);
        }
      }
      setTargetIndices(indices);
      setSelectedIndices([]);
      setMistakeIndices([]);
      setPhase('memorize');
      playSound('tile', profile.soundEnabled);

      const displayDuration = Math.max(1600, 2400 - lvl * 100);
      setTimeout(() => {
        setPhase('recall');
      }, displayDuration);
    },
    [profile.soundEnabled]
  );

  useEffect(() => {
    generateNewRound(level);
  }, [generateNewRound, level]);

  useEffect(() => {
    if (phase === 'paused') return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleGameOver();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [phase]);

  const handleTileClick = (index: number) => {
    if (phase !== 'recall') return;
    if (selectedIndices.includes(index) || mistakeIndices.includes(index)) return;

    setTotalAttempts((a) => a + 1);

    if (targetIndices.includes(index)) {
      playSound('correct', profile.soundEnabled);
      setCorrectClicks((c) => c + 1);
      const newSelected = [...selectedIndices, index];
      setSelectedIndices(newSelected);
      setScore((s) => s + 200 * streak);

      if (newSelected.length === targetIndices.length) {
        setPhase('success');
        playSound('levelUp', profile.soundEnabled);
        setStreak((s) => s + 1);
        setRoundsCompleted((r) => r + 1);
        confetti({ particleCount: 35, spread: 60, origin: { y: 0.7 } });

        const nextLevel = Math.min(9, level + 1);
        setLevel(nextLevel);

        setTimeout(() => {
          generateNewRound(nextLevel);
        }, 1200);
      }
    } else {
      playSound('error', profile.soundEnabled);
      const newMistakes = [...mistakeIndices, index];
      setMistakeIndices(newMistakes);
      setStreak(1);
      setScore((s) => Math.max(0, s - 100));

      if (newMistakes.length >= 2) {
        setPhase('failed');
        setTimeout(() => {
          const prevLevel = Math.max(1, level - 1);
          setLevel(prevLevel);
          generateNewRound(prevLevel);
        }, 1500);
      }
    }
  };

  const handleGameOver = () => {
    playSound('complete', profile.soundEnabled);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    const accuracy = totalAttempts > 0 ? Math.round((correctClicks / totalAttempts) * 100) : 85;
    onFinishGame({
      gameName: 'Memory Matrix',
      score,
      level,
      accuracy,
      durationSeconds: 105 - timeLeft,
      pointsEarned: Math.round(score / 10),
      categoryBoost: {
        category: 'Memory',
        amount: 4,
      },
    });
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen w-full overflow-hidden flex flex-col relative bg-[#F8F8F8] dark:bg-[#121212] text-neutral-900 dark:text-white">
      <div className="absolute inset-0 bg-neural-grid z-0 pointer-events-none opacity-30"></div>

      {/* Top HUD */}
      <header className="flex justify-between items-start p-4 md:p-6 w-full absolute top-0 left-0 z-20">
        <button
          onClick={() => {
            playSound('tap', profile.soundEnabled);
            setPhase((p) => (p === 'paused' ? 'recall' : 'paused'));
          }}
          className="w-10 h-10 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-black dark:text-white cursor-pointer"
        >
          {phase === 'paused' ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
        </button>

        <div className="flex flex-col items-center bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 px-6 py-2.5 min-w-[260px] md:min-w-[320px]">
          <div className="flex items-center justify-between w-full mb-2">
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">TIME:</span>
              <span className="font-mono text-base md:text-lg font-bold text-black dark:text-white tracking-widest">
                {formatTimer(timeLeft)}
              </span>
            </div>
            <div className="h-4 w-[1px] bg-black/20 dark:bg-white/20 mx-3"></div>
            <div className="flex items-center space-x-1.5">
              <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">SCORE:</span>
              <span className="font-mono text-base md:text-lg font-bold text-black dark:text-white">
                {score.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 border border-black/20 dark:border-white/20 overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-300"
              style={{ width: `${Math.min(100, (level / 9) * 100)}%` }}
            ></div>
          </div>
        </div>

        <button
          onClick={() => {
            playSound('tap', profile.soundEnabled);
            handleGameOver();
          }}
          className="w-10 h-10 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-black dark:text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </header>

      {/* Main Grid Stage */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 mt-12 mb-24">
        <div className="mb-5">
          <span
            className={`px-3.5 py-1 border border-black dark:border-white text-[11px] font-mono uppercase font-bold tracking-[0.2em] transition-all ${
              phase === 'memorize'
                ? 'bg-black text-white dark:bg-white dark:text-black animate-pulse'
                : phase === 'recall'
                ? 'bg-white text-black dark:bg-[#1A1A1A] dark:text-white'
                : phase === 'success'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : phase === 'paused'
                ? 'bg-neutral-200 text-neutral-800 dark:bg-neutral-800 dark:text-white'
                : 'bg-red-600 text-white border-red-600'
            }`}
          >
            {phase === 'memorize' && `MEMORIZE ACTIVE COORDINATES (LVL ${level})`}
            {phase === 'recall' && `RECALL ${targetIndices.length} ACTIVE TARGETS`}
            {phase === 'success' && 'COORDINATES CONFIRMED +LEVEL UP'}
            {phase === 'failed' && 'CALIBRATION MISALIGNMENT'}
            {phase === 'paused' && 'SYSTEM PAUSED'}
          </span>
        </div>

        <div className="p-6 md:p-8 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 relative">
          <div className="grid grid-cols-4 gap-3 md:gap-4 relative z-10">
            {Array.from({ length: 16 }).map((_, idx) => {
              const isTarget = targetIndices.includes(idx);
              const isSelected = selectedIndices.includes(idx);
              const isMistake = mistakeIndices.includes(idx);
              const isShowingInMemorize = phase === 'memorize' && isTarget;

              return (
                <button
                  key={idx}
                  onClick={() => handleTileClick(idx)}
                  disabled={phase !== 'recall'}
                  className={`w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 transition-all duration-150 relative flex items-center justify-center cursor-pointer select-none border ${
                    isShowingInMemorize || isSelected
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold'
                      : isMistake
                      ? 'bg-red-500 text-white border-red-500'
                      : 'bg-neutral-50 dark:bg-neutral-900/60 border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {(isShowingInMemorize || isSelected) && (
                    <div className="w-3.5 h-3.5 border-2 border-current rotate-45"></div>
                  )}
                  {isMistake && (
                    <span className="material-symbols-outlined text-lg font-bold">close</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </main>

      {/* AI Guidance Footer */}
      <div className="fixed bottom-6 left-0 right-0 px-4 flex justify-center z-20 pb-safe">
        <div className="max-w-md w-full bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 p-3.5 flex items-center space-x-3.5">
          <div className="flex-shrink-0 w-8 h-8 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
            <div className="w-3 h-3 border border-current rotate-45"></div>
          </div>
          <div className="flex-1">
            <p className="text-xs font-mono text-neutral-800 dark:text-neutral-200 leading-snug">
              {aiGuidance}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
