import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, X, Zap, Check } from 'lucide-react';
import { UserProfile, GameResult } from '../../types';
import { playSound } from '../../utils/audio';

interface SpeedMathGameProps {
  profile: UserProfile;
  initialLevel?: number;
  onFinishGame: (result: GameResult) => void;
  onCloseGame: () => void;
}

interface MathProblem {
  expression: string;
  answer: number;
  options: number[];
}

export const SpeedMathGame: React.FC<SpeedMathGameProps> = ({
  profile,
  initialLevel = 3,
  onFinishGame,
  onCloseGame,
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [score, setScore] = useState<number>(10400);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [problem, setProblem] = useState<MathProblem>({ expression: '14 × 6', answer: 84, options: [78, 84, 94, 72] });
  const [streak, setStreak] = useState<number>(1);
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [aiGuidance, setAiGuidance] = useState<string>(
    `Decompose composite equations into simpler factor components, ${profile.name}. Mental math speed compounds rapidly.`
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateProblem = useCallback(() => {
    let expr = '';
    let ans = 0;

    const opType = Math.floor(Math.random() * (level >= 4 ? 4 : level >= 2 ? 3 : 2));

    if (opType === 0) {
      // Addition / Subtraction
      const a = Math.floor(Math.random() * (30 + level * 10)) + 10;
      const b = Math.floor(Math.random() * (30 + level * 10)) + 10;
      const isAdd = Math.random() > 0.4;
      expr = isAdd ? `${a} + ${b}` : `${Math.max(a, b) + 15} - ${Math.min(a, b)}`;
      ans = isAdd ? a + b : Math.max(a, b) + 15 - Math.min(a, b);
    } else if (opType === 1) {
      // Multiplication
      const a = Math.floor(Math.random() * (8 + level)) + 3;
      const b = Math.floor(Math.random() * 12) + 2;
      expr = `${a} × ${b}`;
      ans = a * b;
    } else if (opType === 2) {
      // Missing variable equation
      const a = Math.floor(Math.random() * 20) + 5;
      const b = Math.floor(Math.random() * 25) + 10;
      expr = `? + ${a} = ${a + b}`;
      ans = b;
    } else {
      // Compound chain
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 6) + 2;
      const c = Math.floor(Math.random() * 15) + 3;
      expr = `(${a} × ${b}) - ${c}`;
      ans = a * b - c;
    }

    // Generate 4 plausible distinct option choices
    const opts = new Set<number>([ans]);
    while (opts.size < 4) {
      const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() > 0.5 ? 1 : -1) * (ans > 20 ? (Math.random() > 0.5 ? 10 : 2) : 1);
      const fake = ans + delta;
      if (fake >= 0) opts.add(fake);
    }
    const shuffled = Array.from(opts).sort(() => Math.random() - 0.5);

    setProblem({ expression: expr, answer: ans, options: shuffled });
    setQuestionStartTime(Date.now());
    setFeedback('neutral');
  }, [level]);

  useEffect(() => {
    generateProblem();
  }, [generateProblem]);

  // Countdown timer
  useEffect(() => {
    if (isPaused) return;

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
  }, [isPaused]);

  const handleSelectOption = (opt: number) => {
    if (isPaused || feedback !== 'neutral') return;

    const reactionMs = Date.now() - questionStartTime;
    setRoundsCompleted((r) => r + 1);

    if (opt === problem.answer) {
      playSound('correct', profile.soundEnabled);
      setFeedback('correct');
      setCorrectCount((c) => c + 1);

      const speedMultiplier = reactionMs < 1500 ? 2 : reactionMs < 2500 ? 1.5 : 1;
      const pts = Math.round(300 * streak * speedMultiplier);
      setScore((s) => s + pts);
      setStreak((st) => st + 1);

      if ((correctCount + 1) % 4 === 0) {
        setLevel((l) => Math.min(8, l + 1));
        playSound('levelUp', profile.soundEnabled);
      }

      setTimeout(() => {
        generateProblem();
      }, 350);
    } else {
      playSound('error', profile.soundEnabled);
      setFeedback('wrong');
      setStreak(1);
      setScore((s) => Math.max(0, s - 150));

      setTimeout(() => {
        generateProblem();
      }, 650);
    }
  };

  const handleGameOver = () => {
    playSound('complete', profile.soundEnabled);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    const accuracy = roundsCompleted > 0 ? Math.round((correctCount / roundsCompleted) * 100) : 85;
    onFinishGame({
      gameName: 'Logic Circuit',
      score,
      level,
      accuracy,
      durationSeconds: 90 - timeLeft,
      pointsEarned: Math.round(score / 10),
      categoryBoost: {
        category: 'Logic',
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
            setIsPaused((p) => !p);
          }}
          className="w-10 h-10 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 flex items-center justify-center hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-black dark:text-white cursor-pointer"
        >
          {isPaused ? <Play className="w-4 h-4 ml-0.5" /> : <Pause className="w-4 h-4" />}
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
              style={{ width: `${Math.min(100, ((correctCount % 4) / 4) * 100)}%` }}
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

      {/* Main Math Stage */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 mt-12 mb-24">
        {/* Tier Indicator */}
        <div className="mb-6 flex flex-col items-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 mb-1">
            SPEED CALCULATION // LOGIC CIRCUIT
          </div>
          <span className="px-4 py-1 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-xs font-mono uppercase font-bold tracking-[0.2em]">
            CALCULATION CIRCUIT • LVL {level}
          </span>
        </div>

        {/* Equation Stage Box */}
        <div
          className={`w-full max-w-md p-8 md:p-12 bg-white dark:bg-[#1A1A1A] border-2 transition-all flex flex-col items-center justify-center relative ${
            feedback === 'correct'
              ? 'border-emerald-500 ring-4 ring-emerald-500/20'
              : feedback === 'wrong'
              ? 'border-red-500 ring-4 ring-red-500/20'
              : 'border-black dark:border-white/30'
          }`}
        >
          <div className="absolute top-2 left-2 text-[9px] font-mono uppercase text-neutral-400">
            EQUATION.NODE
          </div>
          <div className="absolute top-2 right-2 text-[9px] font-mono uppercase text-neutral-400">
            {streak > 1 ? `STREAK ×${streak}` : 'STANDARD'}
          </div>

          <div className="font-mono text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 dark:text-white my-4 select-none">
            {problem.expression}
          </div>

          <div className="text-[10px] font-mono uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            RESOLVE THE QUANTITY
          </div>
        </div>

        {/* 4 Large Choice Buttons */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-6">
          {problem.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleSelectOption(opt)}
              disabled={isPaused || feedback !== 'neutral'}
              className="p-4 md:p-5 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors font-mono text-xl md:text-2xl font-bold text-center cursor-pointer select-none"
            >
              {opt}
            </button>
          ))}
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
