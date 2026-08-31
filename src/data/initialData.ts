import { CognitiveMetrics, MemoryItem, ChatMessage, UserProfile } from '../types';

export const initialProfile: UserProfile = {
  name: 'Alex',
  avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBwianYQQEVOVh4jlww7YJ_N7jgxM0ZStrm8B8ZkP9GCCGgIGVxn_2_1thYJDPVzcE-OCe5u7kCKAEfJo0Eq1b6GBok44VbIHW3Kz3PWh5MOLxbXHvKcaV4Hc2btAnyZO1pQRDLRBOS0vyL-ahLCj1pjUJT45Y5XJmTZ83qbx9GV1JOYQthJUUjZYhmnjO4j2yRtIFF4ZfhbEuwBtMJuzqorBWk8jZw0UCT6jjgF0zdOS_fmpssiWzo',
  theme: 'dark',
  soundEnabled: true,
  hapticsEnabled: true,
  dailyGoalMins: 15,
  aiPersona: 'supportive',
};

export const initialMemories: MemoryItem[] = [
  {
    id: 'mem-1',
    title: 'Project Meeting Notes',
    category: 'Work',
    timestamp: '2 hours ago',
    tags: ['Work', 'Team', 'Q3'],
    notes: 'Discussed roadmap milestones and UX design reviews for Q3 sprint.',
    pinned: true,
  },
  {
    id: 'mem-2',
    title: 'Grocery List',
    category: 'Personal',
    timestamp: 'Yesterday',
    tags: ['Personal', 'Shopping'],
    notes: 'Almond milk, blueberries, dark chocolate 85%, green tea, walnuts.',
  },
  {
    id: 'mem-3',
    title: 'Doctor Appointment',
    category: 'Health',
    timestamp: '3 days ago',
    date: 'Sept 15',
    time: '2:30 PM',
    tags: ['Health', 'Annual Checkup'],
    notes: 'Dr. Harrison - Clinic 4B. Bring recent blood pressure log.',
  },
  {
    id: 'mem-4',
    title: 'Product Strategy Presentation',
    category: 'Work',
    timestamp: 'Just now',
    date: 'Sept 12',
    time: '10:00 AM',
    tags: ['Work', 'Important'],
    notes: 'Executive board presentation on cognitive AI sync architecture.',
    pinned: true,
  },
];

export const initialChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'ai',
    text: "Hello. I'm ready to assist with your memory management. What would you like to sync today?",
    timestamp: '10:02 AM',
  },
  {
    id: 'msg-2',
    sender: 'user',
    text: 'Remember that my presentation is on September 12 at 10 AM.',
    timestamp: '10:04 AM',
  },
  {
    id: 'msg-3',
    sender: 'ai',
    text: "Got it. I'll remember your presentation on September 12 at 10 AM.",
    timestamp: '10:04 AM',
    extracted: {
      title: 'Presentation',
      date: 'Sept 12',
      time: '10:00 AM',
      category: 'Work',
      tags: ['Work', 'Calendar'],
    },
  },
];

export const initialMetrics: CognitiveMetrics = {
  cognitiveScore: 785,
  scoreDelta: 65,
  streakDays: 14,
  weeklyGoalMet: true,
  categories: {
    memory: { score: 82, delta: 2 },
    focus: { score: 75, delta: 5 },
    speed: { score: 68, delta: -1 },
    logic: { score: 89, delta: 1 },
  },
  dailySparkline: [
    { day: 'Mon', value: 40 },
    { day: 'Tue', value: 60 },
    { day: 'Wed', value: 50 },
    { day: 'Thu', value: 70 },
    { day: 'Today', value: 85, isToday: true },
  ],
  weeklySpline: [
    { day: 'Mon', score: 720 },
    { day: 'Tue', score: 735 },
    { day: 'Wed', score: 750, peak: true },
    { day: 'Thu', score: 745 },
    { day: 'Fri', score: 770, peak: true },
    { day: 'Sat', score: 778 },
    { day: 'Sun', score: 785, peak: true },
  ],
  personalBests: {
    memory: 920,
    focus: 885,
    speed: 750,
    logic: 910,
  },
  insight: {
    title: 'AI Cognitive Insight',
    summary: 'Your visual memory improved 12% this week. Consistent spatial puzzle training is paying off.',
    recommendation: 'Continue daily Memory Matrix sessions to strengthen rapid nodal recall.',
    percentageGain: 12,
  },
  streakCalendar: Array.from({ length: 14 }, (_, i) => ({
    day: i + 1,
    active: true,
    isToday: i === 13,
  })),
};
