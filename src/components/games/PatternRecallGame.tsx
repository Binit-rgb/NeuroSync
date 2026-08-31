import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, X, RotateCcw } from 'lucide-react';
import { UserProfile, GameResult } from '../../types';
import { playSound, playTone } from '../../utils/audio';

interface PatternRecallGameProps {
  profile: UserProfile;
  initialLevel?: number;
  onFinishGame: (result: GameResult) => void;
  onCloseGame: () => void;
}

const PADS = [
  { id: 0, label: 'ALPHA', freq: 329.63, icon: 'change_history' }, // E4
  { id: 1, label: 'BETA', freq: 392.00, icon: 'square' },          // G4
  { id: 2, label: 'GAMMA', freq: 440.00, icon: 'hexagon' },        // A4
  { id: 3, label: 'DELTA', freq: 523.25, icon: 'circle' },         // C5
];

export const PatternRecallGame: React.FC<PatternRecallGameProps> = ({
  profile,
  initialLevel = 5,
  onFinishGame,
  onCloseGame,
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [score, setScore] = useState<number>(11000);
  const [timeLeft, setTimeLeft] = useState<number>(120);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [sequence, setSequence] = useState<number[]>([]);
  const [playbackIndex, setPlaybackIndex] = useState<number>(-1);
  const [activePad, setActivePad] = useState<number | null>(null);
  const [userStep, setUserStep] = useState<number>(0);
  const [phase, setPhase] = useState<'showing' | 'player' | 'success' | 'failed'>('showing');
  const [streak, setStreak] = useState<number>(1);
  const [roundsCompleted, setRoundsCompleted] = useState<number>(0);
  const [aiGuidance, setAiGuidance] = useState<string>(
    `Encode auditory pitches alongside spatial positions, ${profile.name}. Dual-coding strengthens sequence retention.`
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Generate initial sequence with length = level + 1 (e.g. 4 steps for level 3)
  const startNewRound = useCallback(
    (seqLength: number) => {
      const newSeq: number[] = [];
      for (let i = 0; i < seqLength; i++) {
        newSeq.push(Math.floor(Math.random() * 4));
      }
      setSequence(newSeq);
      setUserStep(0);
      setPhase('showing');

      // Playback sequence with delay
      setTimeout(() => {
        playSequence(newSeq);
      }, 600);
    },
    []
  );

  const playSequence = (seq: number[]) => {
    let step = 0;
    const interval = setInterval(() => {
      if (step >= seq.length) {
        clearInterval(interval);
        setActivePad(null);
        setPhase('player');
        return;
      }

      const padId = seq[step];
      setActivePad(padId);
      playTone(PADS[padId].freq, 0.25, profile.soundEnabled);

      setTimeout(() => {
        setActivePad(null);
      }, 350);

      step++;
    }, 550);
  };

  useEffect(() => {
    startNewRound(Math.min(3 + level, 12));
  }, [level, startNewRound]);

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

  const handlePadPress = (padId: number) => {
    if (phase !== 'player' || isPaused) return;

    // Trigger visual and sound
    setActivePad(padId);
    playTone(PADS[padId].freq, 0.2, profile.soundEnabled);
    setTimeout(() => setActivePad(null), 200);

    // Check if match
    if (sequence[userStep] === padId) {
      const nextStep = userStep + 1;
      setUserStep(nextStep);

      // Check if sequence completed
      if (nextStep === sequence.length) {
        setPhase('success');
        playSound('correct', profile.soundEnabled);
        setScore((s) => s + 400 * sequence.length * streak);
        setStreak((st) => st + 1);
        setRoundsCompleted((r) => r + 1);
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });

        setTimeout(() => {
          setLevel((lvl) => lvl + 1);
          startNewRound(sequence.length + 1);
        }, 1200);
      }
    } else {
      // Mistake
      setPhase('failed');
      playSound('error', profile.soundEnabled);
      setStreak(1);
      setScore((s) => Math.max(0, s - 200));

      setTimeout(() => {
        startNewRound(Math.max(3, sequence.length - 1));
      }, 1500);
    }
  };

  const handleGameOver = () => {
    playSound('complete', profile.soundEnabled);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    onFinishGame({
      gameName: 'Pattern Recall',
      score,
      level,
      accuracy: 94,
      durationSeconds: 120 - timeLeft,
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
              <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">STEPS:</span>
              <span className="font-mono text-base md:text-lg font-bold text-black dark:text-white">
                {userStep}/{sequence.length}
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 border border-black/20 dark:border-white/20 overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-300"
              style={{
                width: `${sequence.length > 0 ? (userStep / sequence.length) * 100 : 0}%`,
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

      {/* Main Pattern Stage */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 mt-14 mb-24">
        {/* Phase Notification */}
        <div className="mb-6 flex flex-col items-center">
          <span
            className={`px-4 py-1.5 border border-black dark:border-white text-xs font-mono uppercase font-bold tracking-[0.2em] transition-all ${
              phase === 'showing'
                ? 'bg-black text-white dark:bg-white dark:text-black animate-pulse'
                : phase === 'player'
                ? 'bg-white text-black dark:bg-[#1A1A1A] dark:text-white'
                : phase === 'success'
                ? 'bg-black text-white dark:bg-white dark:text-black'
                : 'bg-red-600 text-white border-red-600'
            }`}
          >
            {phase === 'showing' && `OBSERVE SEQUENCE BUFFER (${sequence.length} STEPS)`}
            {phase === 'player' && `REPLICATE SEQUENCE BUFFER (STEP ${userStep + 1})`}
            {phase === 'success' && 'SEQUENCE SYNCHRONIZED +EXPANDING'}
            {phase === 'failed' && 'BUFFER MISMATCH - RESETTING'}
          </span>
        </div>

        {/* 4 Large Sensory Resonance Pads (2x2) */}
        <div className="p-6 md:p-8 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 relative max-w-sm w-full">
          <div className="grid grid-cols-2 gap-4">
            {PADS.map((pad) => {
              const isLit = activePad === pad.id;

              return (
                <button
                  key={pad.id}
                  onClick={() => handlePadPress(pad.id)}
                  disabled={phase !== 'player' || isPaused}
                  className={`aspect-square transition-all duration-150 flex flex-col items-center justify-center border-2 cursor-pointer select-none ${
                    isLit
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white scale-95 shadow-xl'
                      : 'bg-neutral-50 dark:bg-neutral-900 border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-3xl md:text-4xl mb-1">
                    {pad.icon}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-widest font-bold">
                    {pad.label}
                  </span>
                  <span className="text-[8px] font-mono opacity-50 mt-0.5">
                    {Math.round(pad.freq)}Hz
                  </span>
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
