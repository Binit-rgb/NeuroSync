import React, { useState, useEffect } from 'react';
import { ChevronRight, Filter, Play } from 'lucide-react';
import { UserProfile, GameResult } from '../types';
import { playSound } from '../utils/audio';

import { MemoryMatrixGame } from './games/MemoryMatrixGame';
import { MemoryMatchGame } from './games/MemoryMatchGame';
import { FocusFlowGame } from './games/FocusFlowGame';
import { PatternRecallGame } from './games/PatternRecallGame';
import { SpeedMathGame } from './games/SpeedMathGame';
import { WordWeaverGame } from './games/WordWeaverGame';

interface GamesViewProps {
  profile: UserProfile;
  activeGameName?: string;
  initialLevel?: number;
  onFinishGame: (result: GameResult) => void;
  onCloseGame: () => void;
}

interface GameDefinition {
  id: string;
  name: string;
  category: 'Memory' | 'Focus' | 'Logic' | 'Speed';
  icon: string;
  defaultLevel: number;
  duration: string;
  description: string;
  cognitiveTarget: string;
}

const GAME_CATALOG: GameDefinition[] = [
  {
    id: 'memory-matrix',
    name: 'Memory Matrix',
    category: 'Memory',
    icon: 'grid_view',
    defaultLevel: 4,
    duration: '5 MIN',
    description: 'Train spatial working memory by recalling node coordinates in shifting grid patterns.',
    cognitiveTarget: 'Spatial Memory',
  },
  {
    id: 'memory-match',
    name: 'Memory Match',
    category: 'Memory',
    icon: 'view_cozy',
    defaultLevel: 2,
    duration: '3 MIN',
    description: 'Pair complementary cognitive symbols to increase short-term associative recall.',
    cognitiveTarget: 'Associative Recall',
  },
  {
    id: 'focus-flow',
    name: 'Focus Flow',
    category: 'Focus',
    icon: 'waves',
    defaultLevel: 3,
    duration: '4 MIN',
    description: 'Strengthen selective attention and executive inhibition under conflicting stimuli.',
    cognitiveTarget: 'Executive Inhibition',
  },
  {
    id: 'pattern-recall',
    name: 'Pattern Recall',
    category: 'Focus',
    icon: 'pattern',
    defaultLevel: 4,
    duration: '5 MIN',
    description: 'Replicate expanding multi-step harmonic sequences to bolster working memory buffers.',
    cognitiveTarget: 'Sequence Buffer',
  },
  {
    id: 'speed-math',
    name: 'Logic Circuit',
    category: 'Logic',
    icon: 'calculate',
    defaultLevel: 3,
    duration: '4 MIN',
    description: 'Execute rapid mental arithmetic and algebraic resolution under strict timing.',
    cognitiveTarget: 'Numerical Processing',
  },
  {
    id: 'word-weaver',
    name: 'Word Weaver',
    category: 'Speed',
    icon: 'spellcheck',
    defaultLevel: 2,
    duration: '3 MIN',
    description: 'Decrypt scientific and cognitive anagrams to sharpen verbal fluency and phonological buffers.',
    cognitiveTarget: 'Verbal Fluency',
  },
];

export const GamesView: React.FC<GamesViewProps> = ({
  profile,
  activeGameName = 'Memory Matrix',
  initialLevel = 3,
  onFinishGame,
  onCloseGame,
}) => {
  const [selectedGame, setSelectedGame] = useState<string>(activeGameName);
  const [currentLevel, setCurrentLevel] = useState<number>(initialLevel);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<'All' | 'Memory' | 'Focus' | 'Logic' | 'Speed'>('All');

  // If initial active game was requested, open directly into it
  useEffect(() => {
    if (activeGameName) {
      setSelectedGame(activeGameName);
      setCurrentLevel(initialLevel);
    }
  }, [activeGameName, initialLevel]);

  const handleSelectGame = (game: GameDefinition) => {
    playSound('tap', profile.soundEnabled);
    setSelectedGame(game.name);
    setCurrentLevel(game.defaultLevel);
    setIsPlaying(true);
  };

  const handleGameFinished = (result: GameResult) => {
    setIsPlaying(false);
    onFinishGame(result);
  };

  const handleCloseActiveGame = () => {
    setIsPlaying(false);
    onCloseGame();
  };

  // If in active gameplay mode, route to the selected game component
  if (isPlaying) {
    if (selectedGame === 'Memory Matrix') {
      return (
        <MemoryMatrixGame
          profile={profile}
          initialLevel={currentLevel}
          onFinishGame={handleGameFinished}
          onCloseGame={handleCloseActiveGame}
        />
      );
    }

    if (selectedGame === 'Memory Match') {
      return (
        <MemoryMatchGame
          profile={profile}
          initialLevel={currentLevel}
          onFinishGame={handleGameFinished}
          onCloseGame={handleCloseActiveGame}
        />
      );
    }

    if (selectedGame === 'Focus Flow') {
      return (
        <FocusFlowGame
          profile={profile}
          initialLevel={currentLevel}
          onFinishGame={handleGameFinished}
          onCloseGame={handleCloseActiveGame}
        />
      );
    }

    if (selectedGame === 'Pattern Recall') {
      return (
        <PatternRecallGame
          profile={profile}
          initialLevel={currentLevel}
          onFinishGame={handleGameFinished}
          onCloseGame={handleCloseActiveGame}
        />
      );
    }

    if (selectedGame === 'Logic Circuit' || selectedGame === 'Speed Math') {
      return (
        <SpeedMathGame
          profile={profile}
          initialLevel={currentLevel}
          onFinishGame={handleGameFinished}
          onCloseGame={handleCloseActiveGame}
        />
      );
    }

    if (selectedGame === 'Word Weaver') {
      return (
        <WordWeaverGame
          profile={profile}
          initialLevel={currentLevel}
          onFinishGame={handleGameFinished}
          onCloseGame={handleCloseActiveGame}
        />
      );
    }
  }

  // Games Directory / Protocol Lobby
  const filteredCatalog = GAME_CATALOG.filter(
    (g) => activeCategoryFilter === 'All' || g.category === activeCategoryFilter
  );

  return (
    <div className="pt-20 px-4 md:px-8 max-w-4xl mx-auto space-y-6 pb-28">
      {/* Header */}
      <div className="border-b border-black dark:border-white/20 pb-4">
        <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-neutral-500 dark:text-neutral-400 mb-0.5">
          CALIBRATION PROTOCOLS // {GAME_CATALOG.length} MODULES AVAILABLE
        </div>
        <h1 className="font-headline text-2xl md:text-3xl font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
          Cognitive Training Modules
        </h1>
        <p className="text-xs font-mono text-neutral-500 dark:text-neutral-400 mt-1">
          Clinically formulated neuroplasticity protocols designed to reinforce working memory, executive focus, calculation logic, and processing speed.
        </p>
      </div>

      {/* Category Filter Bar */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {(['All', 'Memory', 'Focus', 'Logic', 'Speed'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => {
              playSound('tap', profile.soundEnabled);
              setActiveCategoryFilter(cat);
            }}
            className={`px-3.5 py-1.5 text-xs font-mono uppercase border transition-colors cursor-pointer whitespace-nowrap ${
              activeCategoryFilter === cat
                ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold'
                : 'bg-white dark:bg-[#1A1A1A] border-black/20 dark:border-white/20 text-neutral-600 dark:text-neutral-400 hover:border-black dark:hover:border-white'
            }`}
          >
            {cat === 'All' ? 'ALL PROTOCOLS' : cat}
          </button>
        ))}
      </div>

      {/* Grid of All 6 Training Modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredCatalog.map((game) => (
          <div
            key={game.id}
            onClick={() => handleSelectGame(game)}
            className="border border-black dark:border-white/20 bg-white dark:bg-[#1A1A1A] p-5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 border border-black dark:border-white/30 text-black dark:text-white flex items-center justify-center group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                  <span className="material-symbols-outlined text-xl">{game.icon}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono font-bold text-white bg-black dark:bg-white dark:text-black px-2 py-0.5">
                    LVL {game.defaultLevel}
                  </span>
                  <span className="text-[10px] font-mono text-neutral-500 dark:text-neutral-400 border border-black/20 dark:border-white/20 px-1.5 py-0.5">
                    {game.duration}
                  </span>
                </div>
              </div>
              <h3 className="font-headline text-lg font-bold text-neutral-900 dark:text-white uppercase">
                {game.name}
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-1 leading-relaxed">
                {game.description}
              </p>
            </div>

            <div className="flex justify-between items-center mt-5 pt-3 border-t border-black/10 dark:border-white/10 text-[10px] font-mono uppercase font-bold text-black dark:text-white">
              <span className="text-neutral-500 dark:text-neutral-400">
                DOMAIN: {game.cognitiveTarget}
              </span>
              <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                EXECUTE <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
