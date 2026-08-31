import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, X, RotateCcw, Delete } from 'lucide-react';
import { UserProfile, GameResult } from '../../types';
import { playSound } from '../../utils/audio';

interface WordWeaverGameProps {
  profile: UserProfile;
  initialLevel?: number;
  onFinishGame: (result: GameResult) => void;
  onCloseGame: () => void;
}

interface WordPuzzle {
  word: string;
  hint: string;
  category: string;
}

const WORD_BANK: WordPuzzle[] = [
  // 4-letter words
  { word: 'NODE', hint: 'A connection point in a neural or data network', category: 'Neuro' },
  { word: 'SYNAPSE', hint: 'Junction across which nerve impulses pass', category: 'Neuro' },
  { word: 'CORTEX', hint: 'Outer layer of cerebrum responsible for higher thought', category: 'Neuro' },
  { word: 'MEMORY', hint: 'The faculty by which the brain encodes & stores data', category: 'Cognition' },
  { word: 'SPATIAL', hint: 'Pertaining to space and three-dimensional relationships', category: 'Perception' },
  { word: 'CIRCUIT', hint: 'Closed loop pathway through which neural signals travel', category: 'Logic' },
  { word: 'FOCUS', hint: 'Center of interest or selective executive attention', category: 'Cognition' },
  { word: 'MATRIX', hint: 'Rectangular grid or environment in which nodes develop', category: 'Math' },
  { word: 'SIGNAL', hint: 'Electrical or biochemical impulse transmitting data', category: 'Neuro' },
  { word: 'NEURON', hint: 'Specialized cell transmitting nerve impulses in the brain', category: 'Neuro' },
  { word: 'CIPHER', hint: 'Algorithm for performing encryption or decryption', category: 'Logic' },
  { word: 'SENSOR', hint: 'Device or organ detecting physical stimulus or change', category: 'Perception' },
  { word: 'VECTOR', hint: 'Quantity possessing both magnitude and spatial direction', category: 'Math' },
  { word: 'REFLEX', hint: 'Automatic involuntary response to sensory stimulus', category: 'Neuro' },
  { word: 'BUFFER', hint: 'Temporary storage holding data before processing', category: 'Logic' },
];

export const WordWeaverGame: React.FC<WordWeaverGameProps> = ({
  profile,
  initialLevel = 2,
  onFinishGame,
  onCloseGame,
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [score, setScore] = useState<number>(9600);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [currentPuzzle, setCurrentPuzzle] = useState<WordPuzzle>(WORD_BANK[0]);
  const [scrambledLetters, setScrambledLetters] = useState<{ id: number; char: string; used: boolean }[]>([]);
  const [userLetters, setUserLetters] = useState<{ id: number; char: string }[]>([]);
  const [streak, setStreak] = useState<number>(1);
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [feedback, setFeedback] = useState<'neutral' | 'correct' | 'wrong'>('neutral');
  const [aiGuidance, setAiGuidance] = useState<string>(
    `Identify root morphs and consonant clusters, ${profile.name}. Verbal decoding relies on phonological buffers.`
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadNewWord = useCallback(() => {
    const available = WORD_BANK.filter((w) => (level <= 2 ? w.word.length <= 6 : w.word.length >= 5));
    const puzzle = available[Math.floor(Math.random() * available.length)] || WORD_BANK[0];
    setCurrentPuzzle(puzzle);

    // Scramble letters ensuring it's not identical to target
    const chars = puzzle.word.split('');
    let shuffled = [...chars].sort(() => Math.random() - 0.5);
    while (shuffled.join('') === puzzle.word && chars.length > 3) {
      shuffled = [...chars].sort(() => Math.random() - 0.5);
    }

    setScrambledLetters(shuffled.map((char, id) => ({ id, char, used: false })));
    setUserLetters([]);
    setFeedback('neutral');
    playSound('tile', profile.soundEnabled);
  }, [level, profile.soundEnabled]);

  useEffect(() => {
    loadNewWord();
  }, [loadNewWord, level]);

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

  const handleSelectLetter = (item: { id: number; char: string; used: boolean }) => {
    if (item.used || isPaused || feedback !== 'neutral') return;

    playSound('tap', profile.soundEnabled);
    const newScrambled = scrambledLetters.map((l) => (l.id === item.id ? { ...l, used: true } : l));
    setScrambledLetters(newScrambled);

    const newUser = [...userLetters, { id: item.id, char: item.char }];
    setUserLetters(newUser);

    // Check if full word formed
    if (newUser.length === currentPuzzle.word.length) {
      const formedWord = newUser.map((u) => u.char).join('');
      if (formedWord === currentPuzzle.word) {
        // CORRECT
        setFeedback('correct');
        playSound('correct', profile.soundEnabled);
        setScore((s) => s + 350 * streak * currentPuzzle.word.length);
        setStreak((st) => st + 1);
        setRoundsCompleted((r) => r + 1);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });

        setTimeout(() => {
          setLevel((lvl) => Math.min(8, lvl + 1));
          loadNewWord();
        }, 1000);
      } else {
        // WRONG
        setFeedback('wrong');
        playSound('error', profile.soundEnabled);
        setStreak(1);
        setScore((s) => Math.max(0, s - 100));

        setTimeout(() => {
          // Reset current word attempt
          setScrambledLetters((prev) => prev.map((l) => ({ ...l, used: false })));
          setUserLetters([]);
          setFeedback('neutral');
        }, 1000);
      }
    }
  };

  const handleRemoveLastLetter = () => {
    if (userLetters.length === 0 || feedback !== 'neutral') return;
    playSound('tap', profile.soundEnabled);
    const last = userLetters[userLetters.length - 1];
    setUserLetters((prev) => prev.slice(0, -1));
    setScrambledLetters((prev) => prev.map((l) => (l.id === last.id ? { ...l, used: false } : l)));
  };

  const handleResetLetters = () => {
    playSound('tap', profile.soundEnabled);
    setUserLetters([]);
    setScrambledLetters((prev) => prev.map((l) => ({ ...l, used: false })));
    setFeedback('neutral');
  };

  const handleGameOver = () => {
    playSound('complete', profile.soundEnabled);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    onFinishGame({
      gameName: 'Word Weaver',
      score,
      level,
      accuracy: 90,
      durationSeconds: 90 - timeLeft,
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
              style={{
                width: `${(userLetters.length / currentPuzzle.word.length) * 100}%`,
              }}
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

      {/* Main Verbal Stage */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 mt-12 mb-24">
        {/* Category & Clue Card */}
        <div className="w-full max-w-md bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 p-4 mb-5 text-center">
          <div className="text-[9px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 mb-1">
            CIPHER CLUE // {currentPuzzle.category.toUpperCase()}
          </div>
          <p className="text-xs font-mono text-neutral-800 dark:text-neutral-200 leading-snug">
            "{currentPuzzle.hint}"
          </p>
        </div>

        {/* Word Assembly Output Slots */}
        <div
          className={`w-full max-w-md p-6 bg-white dark:bg-[#1A1A1A] border-2 transition-all flex flex-col items-center justify-center mb-6 ${
            feedback === 'correct'
              ? 'border-emerald-500 ring-4 ring-emerald-500/20'
              : feedback === 'wrong'
              ? 'border-red-500 ring-4 ring-red-500/20'
              : 'border-black dark:border-white/30'
          }`}
        >
          <div className="flex gap-2 justify-center flex-wrap min-h-[50px] items-center">
            {Array.from({ length: currentPuzzle.word.length }).map((_, idx) => {
              const letter = userLetters[idx];

              return (
                <div
                  key={idx}
                  className={`w-10 h-12 md:w-12 md:h-14 border-2 flex items-center justify-center font-mono text-xl md:text-2xl font-bold uppercase transition-all ${
                    letter
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                      : 'bg-neutral-50 dark:bg-neutral-900 border-dashed border-black/30 dark:border-white/30'
                  }`}
                >
                  {letter?.char || ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Scrambled Letter Choice Nodes */}
        <div className="flex gap-2 justify-center flex-wrap max-w-md w-full mb-6">
          {scrambledLetters.map((item) => (
            <button
              key={item.id}
              onClick={() => handleSelectLetter(item)}
              disabled={item.used || isPaused || feedback !== 'neutral'}
              className={`w-11 h-11 md:w-13 md:h-13 border transition-all flex items-center justify-center font-mono text-lg md:text-xl font-bold uppercase cursor-pointer select-none ${
                item.used
                  ? 'opacity-20 border-black/10 dark:border-white/10 bg-neutral-100 dark:bg-neutral-900'
                  : 'bg-white dark:bg-[#1A1A1A] border-black dark:border-white/40 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black'
              }`}
            >
              {item.char}
            </button>
          ))}
        </div>

        {/* Action Controls */}
        <div className="flex gap-3">
          <button
            onClick={handleRemoveLastLetter}
            disabled={userLetters.length === 0 || feedback !== 'neutral'}
            className="px-3.5 py-1.5 border border-black dark:border-white/30 bg-white dark:bg-[#1A1A1A] text-xs font-mono font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
          >
            <Delete className="w-3.5 h-3.5" />
            BACKSPACE
          </button>
          <button
            onClick={handleResetLetters}
            disabled={userLetters.length === 0 || feedback !== 'neutral'}
            className="px-3.5 py-1.5 border border-black dark:border-white/30 bg-white dark:bg-[#1A1A1A] text-xs font-mono font-bold uppercase hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-30"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            CLEAR
          </button>
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
