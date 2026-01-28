
import React, { useState } from 'react';
import { ICONS } from '../constants.tsx';

interface TaskInputProps {
  onAddTasks: (text: string) => void;
  isLoading: boolean;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTasks, isLoading }) => {
  const [inputText, setInputText] = useState('');

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onAddTasks(inputText);
      setInputText('');
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <form onSubmit={handleTextSubmit} className="relative flex flex-col gap-2">
        <div className="relative">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Brain dump your tasks here... (e.g. 'grade papers meeting at 2 prepare slides high priority')"
            className="w-full px-5 py-5 bg-white border border-gray-200 rounded-3xl shadow-sm focus:ring-2 focus:ring-gray-100 focus:border-gray-300 outline-none transition-all resize-none min-h-[140px] text-gray-800 leading-relaxed placeholder:text-gray-300 text-lg font-medium"
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleTextSubmit(e);
              }
            }}
          />
          <div className="absolute right-4 bottom-4 flex items-center gap-3">
            <span className="text-[9px] text-gray-300 font-bold uppercase tracking-widest hidden sm:inline">Ctrl + Enter</span>
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-gray-900 text-white p-3 rounded-2xl hover:bg-black disabled:opacity-10 transition-all shadow-md"
              aria-label="Organize tasks"
            >
              <ICONS.Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskInput;
