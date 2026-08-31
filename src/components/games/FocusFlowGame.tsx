import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, X, Zap } from 'lucide-react';
import { UserProfile, GameResult } from '../../types';
import { playSound } from '../../utils/audio';

interface FocusFlowGameProps {
  profile: UserProfile;
  initialLevel?: number;
  onFinishGame: (result: GameResult) => void;
  onCloseGame: () => void;
}

type StroopRule = 'INK_COLOR' | 'WORD_TEXT' | 'INHIBIT_OPPOSITE';

const COLOR_NAMES = ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'ORANGE'] as const;

// Hex mappings for crisp visual rendering in light/dark themes
const COLOR_VALUES: Record<string, { light: string; dark: string; border: string }> = {
  RED: { light: '#DC2626', dark: '#F87171', border: '#DC2626' },
  BLUE: { light: '#2563EB', dark: '#60A5FA', border: '#2563EB' },
  GREEN: { light: '#16A34A', dark: '#4ADE80', border: '#16A34A' },
  YELLOW: { light: '#CA8A04', dark: '#FACC15', border: '#CA8A04' },
  PURPLE: { light: '#9333EA', dark: '#C084FC', border: '#9333EA' },
  ORANGE: { light: '#EA580C', dark: '#FB923C', border: '#EA580C' },
};

export const FocusFlowGame: React.FC<FocusFlowGameProps> = ({
  profile,
  initialLevel = 3,
  onFinishGame,
  onCloseGame,
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [score, setScore] = useState<number>(9200);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentRule, setCurrentRule] = useState<StroopRule>('INK_COLOR');
  const [displayedWord, setDisplayedWord] = useState<string>('BLUE');
  const [inkColor, setInkColor] = useState<string>('RED');
  const [options, setOptions] = useState<string[]>([]);
  const [correctAnswer, setCorrectAnswer] = useState<string>('');
  const [streak, setStreak] = useState<number>(1);
  const [reactionStartTime, setReactionStartTime] = useState<number>(Date.now());
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [feedbackState, setFeedbackState] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const [aiGuidance, setAiGuidance] = useState<string>(
    `Inhibit automatic reading impulses, ${profile.name}. Focus solely on the active protocol rule.`
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const generateQuestion = useCallback(() => {
    // Determine rule based on level
    let rule: StroopRule = 'INK_COLOR';
    if (level >= 3 && Math.random() > 0.4) {
      rule = 'WORD_TEXT';
    }
    if (level >= 5 && Math.random() > 0.6) {
      rule = 'INHIBIT_OPPOSITE';
    }
    setCurrentRule(rule);

    const availableColors = [...COLOR_NAMES];
    const word = availableColors[Math.floor(Math.random() * availableColors.length)];
    
    // Choose ink that is often different from the word (Stroop effect)
    let ink = availableColors[Math.floor(Math.random() * availableColors.length)];
    while (ink === word && Math.random() > 0.2) {
      ink = availableColors[Math.floor(Math.random() * availableColors.length)];
    }

    setDisplayedWord(word);
    setInkColor(ink);

    let answer = '';
    if (rule === 'INK_COLOR') {
      answer = ink;
    } else if (rule === 'WORD_TEXT') {
      answer = word;
    } else {
      // Inhibit: pick a third color that is neither word nor ink
      const filtered = availableColors.filter((c) => c !== word && c !== ink);
      answer = filtered[Math.floor(Math.random() * filtered.length)];
    }
    setCorrectAnswer(answer);

    // Options: 4 choices including the answer
    const opts = new Set<string>([answer, word, ink]);
    while (opts.size < 4) {
      const rand = availableColors[Math.floor(Math.random() * availableColors.length)];
      opts.add(rand);
    }
    const shuffled = Array.from(opts).sort(() => Math.random() - 0.5);
    setOptions(shuffled);
    setReactionStartTime(Date.now());
    setFeedbackState('neutral');
  }, [level]);

  useEffect(() => {
    generateQuestion();
  }, [generateQuestion]);

  // Timer countdown
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

  const handleSelectOption = (option: string) => {
    if (isPaused || feedbackState !== 'neutral') return;

    const reactionMs = Date.now() - reactionStartTime;
    setRoundsCompleted((r) => r + 1);

    if (option === correctAnswer) {
      playSound('correct', profile.soundEnabled);
      setFeedbackState('correct');
      setCorrectCount((c) => c + 1);

      // Speed bonus
      const speedMultiplier = reactionMs < 1200 ? 2 : reactionMs < 2000 ? 1.5 : 1;
      const pts = Math.round(250 * streak * speedMultiplier);
      setScore((s) => s + pts);
      setStreak((st) => st + 1);

      if ((correctCount + 1) % 5 === 0) {
        setLevel((lvl) => Math.min(8, lvl + 1));
        playSound('levelUp', profile.soundEnabled);
      }

      setTimeout(() => {
        generateQuestion();
      }, 300);
    } else {
      playSound('error', profile.soundEnabled);
      setFeedbackState('wrong');
      setStreak(1);
      setScore((s) => Math.max(0, s - 150));

      setTimeout(() => {
        generateQuestion();
      }, 600);
    }
  };

  const handleGameOver = () => {
    playSound('complete', profile.soundEnabled);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    const accuracy = roundsCompleted > 0 ? Math.round((correctCount / roundsCompleted) * 100) : 80;
    onFinishGame({
      gameName: 'Focus Flow',
      score,
      level,
      accuracy,
      durationSeconds: 90 - timeLeft,
      pointsEarned: Math.round(score / 10),
      categoryBoost: {
        category: 'Focus',
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
              style={{ width: `${Math.min(100, ((correctCount % 5) / 5) * 100)}%` }}
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

      {/* Main Focus Stage */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 mt-12 mb-24">
        {/* Active Instruction Banner */}
        <div className="mb-6 flex flex-col items-center">
          <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 mb-1">
            EXECUTIVE INSTRUCTION // PROTOCOL
          </div>
          <div className="px-4 py-1.5 border-2 border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-xs md:text-sm font-mono uppercase font-bold tracking-widest shadow-sm">
            {currentRule === 'INK_COLOR' && '⚡ IDENTIFY FONT INK COLOR'}
            {currentRule === 'WORD_TEXT' && '📖 READ WRITTEN WORD TEXT'}
            {currentRule === 'INHIBIT_OPPOSITE' && '🚫 INHIBIT BOTH: PICK NEITHER'}
          </div>
        </div>

        {/* Big Stimulus Card */}
        <div
          className={`w-full max-w-md p-8 md:p-12 bg-white dark:bg-[#1A1A1A] border-2 transition-all flex flex-col items-center justify-center relative ${
            feedbackState === 'correct'
              ? 'border-emerald-500 ring-4 ring-emerald-500/20'
              : feedbackState === 'wrong'
              ? 'border-red-500 ring-4 ring-red-500/20'
              : 'border-black dark:border-white/30'
          }`}
        >
          <div className="absolute top-2 left-2 text-[9px] font-mono uppercase text-neutral-400">
            TARGET.STIMULUS
          </div>
          <div className="absolute top-2 right-2 text-[9px] font-mono uppercase text-neutral-400">
            LVL {level}
          </div>

          <div
            className="font-headline text-5xl md:text-6xl font-black uppercase tracking-wider select-none my-4"
            style={{
              color: COLOR_VALUES[inkColor]?.light || '#000',
            }}
          >
            {displayedWord}
          </div>

          {streak > 2 && (
            <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-black dark:text-white mt-1">
              FOCUS STREAK: {streak}× BOOST
            </div>
          )}
        </div>

        {/* 4 Geometric Choice Tiles */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-6">
          {options.map((opt) => (
            <button
              key={opt}
              onClick={() => handleSelectOption(opt)}
              disabled={isPaused || feedbackState !== 'neutral'}
              className="p-4 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors text-xs md:text-sm font-mono font-bold uppercase tracking-wider flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full border border-black/30 inline-block"
                  style={{ backgroundColor: COLOR_VALUES[opt]?.light }}
                ></span>
                <span>{opt}</span>
              </div>
              <span className="text-[10px] opacity-40 group-hover:opacity-100">↵</span>
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
