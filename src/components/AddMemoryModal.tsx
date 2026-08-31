import React, { useState } from 'react';
import { X, Plus, Calendar, Clock, Tag, Sparkles } from 'lucide-react';
import { MemoryItem } from '../types';
import { playSound } from '../utils/audio';

interface AddMemoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (memory: Partial<MemoryItem>) => void;
  soundEnabled: boolean;
}

export const AddMemoryModal: React.FC<AddMemoryModalProps> = ({
  isOpen,
  onClose,
  onSave,
  soundEnabled,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<MemoryItem['category']>('Work');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [notes, setNotes] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    playSound('correct', soundEnabled);
    onSave({
      title: title.trim(),
      category,
      date: date.trim() || undefined,
      time: time.trim() || undefined,
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : [category],
      timestamp: 'Just now',
    });

    setTitle('');
    setDate('');
    setTime('');
    setNotes('');
    setTags([]);
    onClose();
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.trim().replace(/^#/, '');
      if (val && !tags.includes(val)) {
        setTags([...tags, val]);
        setTagInput('');
      }
    }
  };

  const removeTag = (t: string) => {
    setTags(tags.filter((item) => item !== t));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-[#1A1A1A] border border-black dark:border-white/30 p-6 shadow-2xl space-y-4">
        <div className="flex justify-between items-center pb-2 border-b border-black dark:border-white/20">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-black dark:bg-white text-white dark:text-black flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-headline text-base font-bold text-neutral-900 dark:text-white uppercase tracking-tight">
              Capture New Memory Node
            </h3>
          </div>
          <button
            onClick={() => {
              playSound('tap', soundEnabled);
              onClose();
            }}
            className="w-7 h-7 border border-black/20 dark:border-white/20 flex items-center justify-center text-black dark:text-white hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Memory Title */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-1">
              NODE IDENTIFIER *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Dentist appointment with Dr. Lee"
              className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-1">
              CATEGORY CLASSIFICATION
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(['Work', 'Health', 'Personal', 'Tasks'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`py-1.5 border text-xs font-mono uppercase transition-colors cursor-pointer ${
                    category === cat
                      ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white font-bold'
                      : 'bg-neutral-100 dark:bg-neutral-900 border-black/20 dark:border-white/20 text-neutral-700 dark:text-neutral-300 hover:border-black dark:hover:border-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                <Calendar className="w-3 h-3 text-black dark:text-white" />
                DATE (OPTIONAL)
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g., Sept 12"
                className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>

            <div>
              <label className="block text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3 text-black dark:text-white" />
                TIME (OPTIONAL)
              </label>
              <input
                type="text"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="e.g., 10:00 AM"
                className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-1">
              CONTEXT & DETAILS
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional details, location, key discussion points..."
              className="w-full px-3 py-2 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white resize-none"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-[10px] font-mono font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-black dark:text-white" />
              METADATA TAGS
            </label>
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 bg-neutral-100 dark:bg-neutral-900 border border-black/20 dark:border-white/20 px-2 py-0.5 text-[10px] font-mono uppercase text-neutral-800 dark:text-neutral-200"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => removeTag(t)}
                    className="hover:text-red-500 text-xs ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="Type tag and press Enter"
              className="w-full px-3 py-1.5 text-xs font-mono bg-neutral-50 dark:bg-neutral-900 border border-black/20 dark:border-white/20 text-neutral-900 dark:text-white placeholder-neutral-400 focus:outline-none focus:border-black dark:focus:border-white"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-2.5 bg-black text-white dark:bg-white dark:text-black border border-black dark:border-white text-xs font-mono uppercase font-bold tracking-wider hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              REGISTER MEMORY NODE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
