import React, { useState, useEffect, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Play, Pause, X, RotateCcw } from 'lucide-react';
import { UserProfile, GameResult } from '../../types';
import { playSound } from '../../utils/audio';

interface MemoryMatchGameProps {
  profile: UserProfile;
  initialLevel?: number;
  onFinishGame: (result: GameResult) => void;
  onCloseGame: () => void;
}

interface CardItem {
  id: number;
  symbol: string;
  label: string;
  isFlipped: boolean;
  isMatched: boolean;
}

const ALL_SYMBOLS = [
  { symbol: 'memory', label: 'Memory' },
  { symbol: 'psychology', label: 'Synapse' },
  { symbol: 'bolt', label: 'Impulse' },
  { symbol: 'hub', label: 'Node' },
  { symbol: 'radar', label: 'Sensor' },
  { symbol: 'flare', label: 'Spark' },
  { symbol: 'shield', label: 'Aegis' },
  { symbol: 'terminal', label: 'Logic' },
  { symbol: 'view_in_ar', label: 'Spatial' },
  { symbol: 'token', label: 'Cipher' },
];

export const MemoryMatchGame: React.FC<MemoryMatchGameProps> = ({
  profile,
  initialLevel = 2,
  onFinishGame,
  onCloseGame,
}) => {
  const [level, setLevel] = useState<number>(initialLevel);
  const [score, setScore] = useState<number>(8500);
  const [timeLeft, setTimeLeft] = useState<number>(90);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<number>(0);
  const [streak, setStreak] = useState<number>(1);
  const [flipsCount, setFlipsCount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [aiGuidance, setAiGuidance] = useState<string>(
    `Anchor visual landmarks, ${profile.name}. Link symbols to mental spatial quadrants.`
  );

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const pairCount = Math.min(6 + level, 10); // 7 to 10 pairs

  const initDeck = useCallback(() => {
    const selectedSymbols = ALL_SYMBOLS.slice(0, pairCount);
    const deck: CardItem[] = [];
    selectedSymbols.forEach((item, index) => {
      deck.push({
        id: index * 2,
        symbol: item.symbol,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        id: index * 2 + 1,
        symbol: item.symbol,
        label: item.label,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedCards([]);
    setMatchedPairs(0);
    setIsProcessing(false);
    playSound('tile', profile.soundEnabled);
  }, [pairCount, profile.soundEnabled]);

  useEffect(() => {
    initDeck();
  }, [initDeck, level]);

  // Game timer
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

  const handleCardClick = (cardIndex: number) => {
    if (isProcessing || isPaused) return;
    const card = cards[cardIndex];
    if (card.isFlipped || card.isMatched) return;

    playSound('tap', profile.soundEnabled);
    setFlipsCount((f) => f + 1);

    const newCards = [...cards];
    newCards[cardIndex].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, cardIndex];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      if (firstCard.symbol === secondCard.symbol) {
        // MATCH
        setTimeout(() => {
          playSound('correct', profile.soundEnabled);
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards(newCards);
          setFlippedCards([]);
          setIsProcessing(false);
          setMatchedPairs((m) => {
            const nextMatch = m + 1;
            setScore((s) => s + 350 * streak);
            setStreak((st) => st + 1);

            // Check if all matched
            if (nextMatch === pairCount) {
              playSound('levelUp', profile.soundEnabled);
              confetti({ particleCount: 50, spread: 70, origin: { y: 0.6 } });
              setTimeout(() => {
                setLevel((lvl) => lvl + 1);
                initDeck();
              }, 1200);
            }
            return nextMatch;
          });
        }, 400);
      } else {
        // MISMATCH
        setTimeout(() => {
          playSound('error', profile.soundEnabled);
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards(newCards);
          setFlippedCards([]);
          setStreak(1);
          setIsProcessing(false);
        }, 900);
      }
    }
  };

  const handleGameOver = () => {
    playSound('complete', profile.soundEnabled);
    confetti({ particleCount: 80, spread: 80, origin: { y: 0.6 } });
    const accuracy = flipsCount > 0 ? Math.min(100, Math.round(((matchedPairs * 2) / flipsCount) * 100)) : 80;
    onFinishGame({
      gameName: 'Memory Match',
      score,
      level,
      accuracy,
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
              <span className="text-[10px] font-mono uppercase text-neutral-500 dark:text-neutral-400">PAIRS:</span>
              <span className="font-mono text-base md:text-lg font-bold text-black dark:text-white">
                {matchedPairs}/{pairCount}
              </span>
            </div>
          </div>

          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 border border-black/20 dark:border-white/20 overflow-hidden">
            <div
              className="h-full bg-black dark:bg-white transition-all duration-300"
              style={{ width: `${Math.min(100, (matchedPairs / pairCount) * 100)}%` }}
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

      {/* Main Board Stage */}
      <main className="flex-1 flex flex-col items-center justify-center relative z-10 w-full px-4 mt-14 mb-24">
        <div className="mb-4 flex items-center gap-3">
          <span className="px-3 py-1 border border-black dark:border-white text-[11px] font-mono uppercase font-bold tracking-[0.2em] bg-white text-black dark:bg-[#1A1A1A] dark:text-white">
            DUAL SYMBOL MATRIX • LVL {level}
          </span>
          {streak > 1 && (
            <span className="px-2.5 py-1 border border-black dark:border-white bg-black text-white dark:bg-white dark:text-black text-[10px] font-mono font-bold">
              STREAK ×{streak}
            </span>
          )}
        </div>

        <div className="p-4 md:p-6 bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 relative max-w-xl w-full">
          <div
            className={`grid gap-2.5 md:gap-3.5 ${
              pairCount <= 8 ? 'grid-cols-4' : 'grid-cols-4 sm:grid-cols-5'
            }`}
          >
            {cards.map((card, idx) => {
              const isVisible = card.isFlipped || card.isMatched;

              return (
                <button
                  key={card.id}
                  onClick={() => handleCardClick(idx)}
                  disabled={card.isMatched || isProcessing || isPaused}
                  className={`aspect-square transition-all duration-200 relative flex flex-col items-center justify-center cursor-pointer select-none border ${
                    card.isMatched
                      ? 'bg-neutral-100 dark:bg-neutral-900/40 border-black/10 dark:border-white/10 opacity-40 text-neutral-400'
                      : isVisible
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white shadow-md'
                      : 'bg-neutral-50 dark:bg-neutral-900 border-black/20 dark:border-white/20 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {isVisible ? (
                    <>
                      <span className="material-symbols-outlined text-2xl md:text-3xl mb-0.5">
                        {card.symbol}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-wider font-bold">
                        {card.label}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center opacity-40">
                      <div className="w-3 h-3 border border-current rotate-45 mb-1"></div>
                      <span className="text-[8px] font-mono uppercase">#{idx + 1}</span>
                    </div>
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
