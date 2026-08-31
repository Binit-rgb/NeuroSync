export type TabType = 'dashboard' | 'games' | 'assistant' | 'progress' | 'settings';

export type ThemeMode = 'dark' | 'light';

export interface UserProfile {
  name: string;
  avatarUrl: string;
  theme: ThemeMode;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  dailyGoalMins: number;
  aiPersona: 'supportive' | 'concise' | 'clinical' | 'gentle';
}

export interface MemoryItem {
  id: string;
  title: string;
  date?: string;
  time?: string;
  category: 'Work' | 'Health' | 'Personal' | 'Tasks' | 'Notes' | 'General';
  timestamp: string;
  tags?: string[];
  notes?: string;
  pinned?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  extracted?: {
    title?: string;
    date?: string;
    time?: string;
    category?: string;
    tags?: string[];
  } | null;
}

export interface CognitiveMetrics {
  cognitiveScore: number;
  scoreDelta: number;
  streakDays: number;
  weeklyGoalMet: boolean;
  categories: {
    memory: { score: number; delta: number };
    focus: { score: number; delta: number };
    speed: { score: number; delta: number };
    logic: { score: number; delta: number };
  };
  dailySparkline: { day: string; value: number; isToday?: boolean }[];
  weeklySpline: { day: string; score: number; peak?: boolean }[];
  personalBests: {
    memory: number;
    focus: number;
    speed: number;
    logic: number;
  };
  insight: {
    title: string;
    summary: string;
    recommendation: string;
    percentageGain: number;
  };
  streakCalendar: {
    day: number;
    active: boolean;
    isToday?: boolean;
  }[];
}

export interface GameResult {
  gameName: string;
  score: number;
  level: number;
  accuracy: number;
  durationSeconds: number;
  pointsEarned: number;
  categoryBoost: {
    category: 'Memory' | 'Focus' | 'Speed' | 'Logic';
    amount: number;
  };
}
