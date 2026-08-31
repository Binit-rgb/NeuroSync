import React, { useState, useEffect } from 'react';
import { TabType, UserProfile, MemoryItem, ChatMessage, CognitiveMetrics, GameResult } from './types';
import { initialProfile, initialMemories, initialChatMessages, initialMetrics } from './data/initialData';
import { Header } from './components/Header';
import { BottomNavBar } from './components/BottomNavBar';
import { DashboardView } from './components/DashboardView';
import { AssistantView } from './components/AssistantView';
import { GamesView } from './components/GamesView';
import { ProgressView } from './components/ProgressView';
import { SettingsView } from './components/SettingsView';
import { NotificationModal } from './components/NotificationModal';
import { AddMemoryModal } from './components/AddMemoryModal';
import { playSound } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('neurosync_profile');
    return saved ? JSON.parse(saved) : initialProfile;
  });

  const [memories, setMemories] = useState<MemoryItem[]>(() => {
    const saved = localStorage.getItem('neurosync_memories');
    return saved ? JSON.parse(saved) : initialMemories;
  });

  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem('neurosync_messages');
    return saved ? JSON.parse(saved) : initialChatMessages;
  });

  const [metrics, setMetrics] = useState<CognitiveMetrics>(() => {
    const saved = localStorage.getItem('neurosync_metrics');
    return saved ? JSON.parse(saved) : initialMetrics;
  });

  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddMemoryOpen, setIsAddMemoryOpen] = useState(false);
  const [activeGameName, setActiveGameName] = useState('Memory Matrix');
  const [activeGameLevel, setActiveGameLevel] = useState(4);
  const [isRefreshingInsights, setIsRefreshingInsights] = useState(false);

  // Sync theme with HTML root class
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [profile.theme]);

  // Persist state to local storage
  useEffect(() => {
    localStorage.setItem('neurosync_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('neurosync_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('neurosync_messages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem('neurosync_metrics', JSON.stringify(metrics));
  }, [metrics]);

  const handleToggleTheme = () => {
    const nextTheme = profile.theme === 'dark' ? 'light' : 'dark';
    playSound('tap', profile.soundEnabled);
    setProfile((prev) => ({ ...prev, theme: nextTheme }));
  };

  const handleUpdateProfile = (updated: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleResetData = () => {
    setProfile(initialProfile);
    setMemories(initialMemories);
    setMessages(initialChatMessages);
    setMetrics(initialMetrics);
    localStorage.clear();
  };

  const handleStartGame = (gameName: string, level = 4) => {
    setActiveGameName(gameName);
    setActiveGameLevel(level);
    setActiveTab('games');
  };

  const handleFinishGame = (result: GameResult) => {
    // Update cognitive score and metrics
    setMetrics((prev) => {
      const newScore = prev.cognitiveScore + result.pointsEarned;
      const catKey = (result.categoryBoost.category.toLowerCase() as keyof typeof prev.categories) || 'memory';
      const currentCat = prev.categories[catKey] || prev.categories.memory;
      const updatedCatScore = Math.min(99, currentCat.score + result.categoryBoost.amount);

      const pbKey = catKey as keyof typeof prev.personalBests;

      return {
        ...prev,
        cognitiveScore: newScore,
        scoreDelta: prev.scoreDelta + result.pointsEarned,
        categories: {
          ...prev.categories,
          [catKey]: {
            score: updatedCatScore,
            delta: currentCat.delta + 1,
          },
        },
        personalBests: {
          ...prev.personalBests,
          [pbKey]: Math.max(prev.personalBests[pbKey] || 0, result.score),
        },
      };
    });
    setActiveTab('progress');
  };

  const handleSendMessage = async (text: string) => {
    const userMsgId = `msg-${Date.now()}`;
    const newMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setIsAiLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-5).map((m) => ({ role: m.sender, content: m.text })),
          memories,
          userName: profile.name,
        }),
      });

      const data = await response.json();
      playSound('correct', profile.soundEnabled);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: data.reply || "I've noted that into your neural memory vault.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        extracted: data.extracted || null,
      };

      setMessages((prev) => [...prev, aiMsg]);

      // If memory extracted, add to memories list
      if (data.extracted && data.extracted.title) {
        const newMemory: MemoryItem = {
          id: `mem-${Date.now()}`,
          title: data.extracted.title,
          date: data.extracted.date || undefined,
          time: data.extracted.time || undefined,
          category: data.extracted.category || 'General',
          tags: data.extracted.tags || [data.extracted.category || 'General'],
          timestamp: 'Just now',
          notes: `Captured from chat with NeuroSync AI assistant.`,
        };
        setMemories((prev) => [newMemory, ...prev]);
      }
    } catch (error) {
      // Fallback response
      const fallbackAiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: "I've recorded that thought into your active memory bank. What would you like to review next?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackAiMsg]);
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleAddMemory = (memoryData: Partial<MemoryItem>) => {
    const newMem: MemoryItem = {
      id: `mem-${Date.now()}`,
      title: memoryData.title || 'Untitled Memory',
      category: memoryData.category || 'Personal',
      date: memoryData.date,
      time: memoryData.time,
      notes: memoryData.notes,
      tags: memoryData.tags || [memoryData.category || 'Personal'],
      timestamp: 'Just now',
      pinned: false,
    };
    setMemories((prev) => [newMem, ...prev]);
  };

  const handleDeleteMemory = (id: string) => {
    playSound('tap', profile.soundEnabled);
    setMemories((prev) => prev.filter((m) => m.id !== id));
  };

  const handleRefreshInsights = async () => {
    setIsRefreshingInsights(true);
    try {
      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cognitiveScore: metrics.cognitiveScore,
          memoryScore: metrics.categories.memory.score,
          focusScore: metrics.categories.focus.score,
          speedScore: metrics.categories.speed.score,
          logicScore: metrics.categories.logic.score,
          streak: metrics.streakDays,
        }),
      });
      const data = await res.json();
      if (data.summary) {
        setMetrics((prev) => ({
          ...prev,
          insight: {
            ...prev.insight,
            title: data.headline || 'AI Cognitive Insight',
            summary: data.summary,
            recommendation: data.recommendation || prev.insight.recommendation,
          },
        }));
      }
    } catch (e) {
      // fallback
    } finally {
      setIsRefreshingInsights(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface bg-pattern transition-colors duration-300">
      {/* Header is shown on all tabs except active gameplay */}
      {activeTab !== 'games' && (
        <Header
          currentTab={activeTab}
          profile={profile}
          onToggleTheme={handleToggleTheme}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
        />
      )}

      {/* Main View Container */}
      <main className="w-full">
        {activeTab === 'dashboard' && (
          <DashboardView
            metrics={metrics}
            profile={profile}
            onStartGame={handleStartGame}
            onOpenAssistant={() => setActiveTab('assistant')}
          />
        )}

        {activeTab === 'assistant' && (
          <AssistantView
            messages={messages}
            memories={memories}
            profile={profile}
            onSendMessage={handleSendMessage}
            onAddMemory={handleAddMemory}
            onDeleteMemory={handleDeleteMemory}
            onOpenAddModal={() => setIsAddMemoryOpen(true)}
            isLoading={isAiLoading}
          />
        )}

        {activeTab === 'games' && (
          <GamesView
            profile={profile}
            activeGameName={activeGameName}
            initialLevel={activeGameLevel}
            onFinishGame={handleFinishGame}
            onCloseGame={() => setActiveTab('dashboard')}
          />
        )}

        {activeTab === 'progress' && (
          <ProgressView
            metrics={metrics}
            profile={profile}
            onRefreshInsights={handleRefreshInsights}
            isRefreshing={isRefreshingInsights}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            profile={profile}
            onUpdateProfile={handleUpdateProfile}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Bottom Navigation Bar (Hidden during active gameplay) */}
      {activeTab !== 'games' && (
        <BottomNavBar
          activeTab={activeTab}
          onChangeTab={(tab) => {
            playSound('tap', profile.soundEnabled);
            setActiveTab(tab);
          }}
        />
      )}

      {/* Notification Center Modal */}
      <NotificationModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        soundEnabled={profile.soundEnabled}
      />

      {/* Manual Memory Capture Modal */}
      <AddMemoryModal
        isOpen={isAddMemoryOpen}
        onClose={() => setIsAddMemoryOpen(false)}
        onSave={handleAddMemory}
        soundEnabled={profile.soundEnabled}
      />
    </div>
  );
}
