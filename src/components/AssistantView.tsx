import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, MicOff, Search, PlusCircle, Bell, Sparkles, Trash2, Calendar, Clock, Tag } from 'lucide-react';
import { ChatMessage, MemoryItem, UserProfile } from '../types';
import { playSound } from '../utils/audio';

interface AssistantViewProps {
  messages: ChatMessage[];
  memories: MemoryItem[];
  profile: UserProfile;
  onSendMessage: (text: string) => Promise<void>;
  onAddMemory: (memory: Partial<MemoryItem>) => void;
  onDeleteMemory: (id: string) => void;
  onOpenAddModal: () => void;
  isLoading: boolean;
}

export const AssistantView: React.FC<AssistantViewProps> = ({
  messages,
  memories,
  profile,
  onSendMessage,
  onDeleteMemory,
  onOpenAddModal,
  isLoading,
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'chat' | 'vault'>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText.trim();
    setInputText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    playSound('tap', profile.soundEnabled);
    await onSendMessage(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser environment.');
      return;
    }

    try {
      const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      if (!isListening) {
        setIsListening(true);
        playSound('pulse', profile.soundEnabled);
        recognition.start();

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };
      } else {
        setIsListening(false);
      }
    } catch (err) {
      setIsListening(false);
    }
  };

  const handleQuickAction = (action: string) => {
    playSound('tap', profile.soundEnabled);
    if (action === 'Add Memory') {
      onOpenAddModal();
    } else if (action === 'Search') {
      setActiveTab('vault');
    } else if (action === 'Reminders') {
      setSelectedCategory('Health');
      setActiveTab('vault');
    } else if (action === 'Daily Recap') {
      onSendMessage("Summarize all my active memories and reminders for this week.");
    }
  };

  const filteredMemories = memories.filter((m) => {
    const matchesSearch =
      m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (m.notes && m.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (m.tags && m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = selectedCategory === 'All' || m.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getMemoryIcon = (cat: string) => {
    switch (cat) {
      case 'Work':
        return 'description';
      case 'Personal':
        return 'shopping_cart';
      case 'Health':
        return 'medical_services';
      case 'Tasks':
        return 'task_alt';
      default:
        return 'event';
    }
  };

  return (
    <div className="pt-20 px-4 md:px-8 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 pb-28 min-h-[calc(100vh-80px)]">
      {/* Mobile Tab Toggle for Chat vs Memory Vault */}
      <div className="md:hidden col-span-1 flex items-center bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-1">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex-1 py-2 text-[10px] font-mono uppercase font-bold tracking-wider transition-all ${
            activeTab === 'chat'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          AI Chat Assistant
        </button>
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex-1 py-2 text-[10px] font-mono uppercase font-bold tracking-wider transition-all ${
            activeTab === 'vault'
              ? 'bg-black text-white dark:bg-white dark:text-black'
              : 'text-neutral-600 dark:text-neutral-400'
          }`}
        >
          Memories ({memories.length})
        </button>
      </div>

      {/* Main Chat Column */}
      <section
        className={`md:col-span-8 flex flex-col h-[calc(100vh-170px)] md:h-[calc(100vh-120px)] ${
          activeTab === 'vault' ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto space-y-4 pb-4 pr-1 scrollbar-thin">
          {messages.map((msg) => {
            const isAI = msg.sender === 'ai';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isAI ? '' : 'flex-row-reverse'}`}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 flex items-center justify-center shrink-0 border border-black dark:border-white/30 text-xs font-mono font-bold ${
                    isAI
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'bg-white text-black dark:bg-[#1A1A1A] dark:text-white'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isAI ? 'psychology' : 'person'}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`p-4 max-w-[85%] text-sm leading-relaxed border ${
                    isAI
                      ? 'bg-white dark:bg-[#1A1A1A] text-neutral-900 dark:text-neutral-100 border-black dark:border-white/20'
                      : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-900 dark:text-white border-black dark:border-white/30'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Extracted Memory Metadata Badges */}
                  {msg.extracted && (
                    <div className="mt-3 pt-2.5 border-t border-black/10 dark:border-white/10 flex flex-wrap gap-2">
                      {msg.extracted.date && (
                        <span className="inline-flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-white/20 px-2 py-0.5 text-[10px] font-mono uppercase font-bold text-neutral-800 dark:text-neutral-200">
                          <Calendar className="w-3 h-3 text-black dark:text-white" />
                          {msg.extracted.date}
                        </span>
                      )}
                      {msg.extracted.time && (
                        <span className="inline-flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800 border border-black/20 dark:border-white/20 px-2 py-0.5 text-[10px] font-mono uppercase font-bold text-neutral-800 dark:text-neutral-200">
                          <Clock className="w-3 h-3 text-black dark:text-white" />
                          {msg.extracted.time}
                        </span>
                      )}
                      {msg.extracted.category && (
                        <span className="inline-flex items-center gap-1 bg-black text-white dark:bg-white dark:text-black px-2 py-0.5 text-[10px] font-mono uppercase font-bold">
                          <Tag className="w-3 h-3" />
                          {msg.extracted.category}
                        </span>
                      )}
                    </div>
                  )}

                  <span className="block text-[10px] font-mono text-neutral-400 dark:text-neutral-500 mt-1.5 text-right">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white/30 flex items-center justify-center shrink-0 animate-spin">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-3 text-xs font-mono text-neutral-600 dark:text-neutral-300 flex items-center gap-2">
                <div className="w-2 h-2 bg-black dark:bg-white animate-pulse"></div>
                PROCESSING AND SYNCING PROTOCOL BUFFER...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Pills */}
        <div className="flex gap-2 mb-3 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => handleQuickAction('Add Memory')}
            className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 px-3 py-1.5 flex items-center gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors whitespace-nowrap text-[10px] font-mono uppercase font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Memory
          </button>
          <button
            onClick={() => handleQuickAction('Search')}
            className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 px-3 py-1.5 flex items-center gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors whitespace-nowrap text-[10px] font-mono uppercase font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5" />
            Search
          </button>
          <button
            onClick={() => handleQuickAction('Reminders')}
            className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 px-3 py-1.5 flex items-center gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors whitespace-nowrap text-[10px] font-mono uppercase font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <Bell className="w-3.5 h-3.5" />
            Reminders
          </button>
          <button
            onClick={() => handleQuickAction('Daily Recap')}
            className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 px-3 py-1.5 flex items-center gap-1.5 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors whitespace-nowrap text-[10px] font-mono uppercase font-bold text-neutral-800 dark:text-neutral-200 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Daily Recap
          </button>
        </div>

        {/* Input Area */}
        <form
          onSubmit={handleSend}
          className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-2 flex items-end gap-2 focus-within:border-black dark:focus-within:border-white transition-colors"
        >
          <button
            type="button"
            onClick={onOpenAddModal}
            title="Attach memory or note"
            className="p-2 text-neutral-500 hover:text-black dark:hover:text-white transition-colors"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          <textarea
            ref={textareaRef}
            rows={1}
            value={inputText}
            onChange={(e) => {
              setInputText(e.target.value);
              e.target.style.height = 'auto';
              e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
            }}
            onKeyDown={handleKeyDown}
            placeholder="Type a memory or ask a question..."
            className="flex-1 bg-transparent border-none focus:outline-none text-neutral-900 dark:text-white resize-none p-2 text-xs font-mono placeholder-neutral-400 dark:placeholder-neutral-500 min-h-[36px] max-h-[120px]"
          />

          <button
            type="button"
            onClick={toggleVoiceInput}
            title={isListening ? 'Stop listening' : 'Dictate with voice'}
            className={`p-2 transition-colors ${
              isListening
                ? 'bg-red-600 text-white animate-pulse'
                : 'text-neutral-500 hover:text-black dark:hover:text-white'
            }`}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`px-4 py-2 border border-black dark:border-white text-xs font-mono uppercase font-bold transition-all flex items-center justify-center gap-1.5 ${
              !inputText.trim() || isLoading
                ? 'bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600 border-neutral-300 dark:border-neutral-700 cursor-not-allowed'
                : 'bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 cursor-pointer active:scale-95'
            }`}
          >
            <span>SEND</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </section>

      {/* Right Column / Recent Memories Side Panel */}
      <aside
        className={`md:col-span-4 flex flex-col gap-4 ${
          activeTab === 'chat' ? 'hidden md:flex' : 'flex'
        }`}
      >
        <div className="bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/20 p-5 flex flex-col h-full">
          <div className="flex justify-between items-center mb-4 border-b border-black/10 dark:border-white/10 pb-3">
            <h2 className="font-headline text-base font-bold text-neutral-900 dark:text-white uppercase flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">history</span>
              Recent Memories
            </h2>
            <button
              onClick={onOpenAddModal}
              className="text-[10px] font-mono uppercase font-bold text-black dark:text-white hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              NEW
            </button>
          </div>

          {/* Search Box */}
          <div className="relative mb-3">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search memories..."
              className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Categories Pill Filters */}
          <div className="flex gap-1 overflow-x-auto no-scrollbar pb-2 mb-2">
            {['All', 'Work', 'Health', 'Personal', 'Tasks'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white'
                    : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-black/10 dark:border-white/10 hover:border-black dark:hover:border-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Memory List Items */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
            {filteredMemories.length === 0 ? (
              <div className="text-center py-10 text-xs font-mono text-neutral-400 uppercase">
                No memories recorded.
              </div>
            ) : (
              filteredMemories.map((mem) => (
                <div
                  key={mem.id}
                  className="p-3 bg-neutral-50 dark:bg-neutral-900/60 border border-black/15 dark:border-white/15 hover:border-black dark:hover:border-white transition-all group flex items-start justify-between gap-2.5"
                >
                  <div className="flex gap-2.5 items-start flex-1 min-w-0">
                    <div className="w-8 h-8 border border-black/20 dark:border-white/20 flex items-center justify-center shrink-0 text-black dark:text-white group-hover:bg-black group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-colors">
                      <span className="material-symbols-outlined text-[16px]">
                        {getMemoryIcon(mem.category)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-xs font-bold text-neutral-900 dark:text-white truncate uppercase">
                          {mem.title}
                        </h3>
                        {mem.pinned && (
                          <div className="w-1.5 h-1.5 bg-black dark:bg-white"></div>
                        )}
                      </div>
                      {mem.notes && (
                        <p className="text-[11px] text-neutral-600 dark:text-neutral-300 line-clamp-1 mt-0.5">
                          {mem.notes}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] font-mono text-neutral-500 dark:text-neutral-400">
                        <span>{mem.timestamp}</span>
                        {mem.date && (
                          <span className="font-bold text-black dark:text-white">
                            • {mem.date} {mem.time}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onDeleteMemory(mem.id)}
                    title="Delete memory"
                    className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-red-600 transition-opacity p-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </aside>
    </div>
  );
};
