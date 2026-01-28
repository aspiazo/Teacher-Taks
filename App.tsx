
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Importance, Task, DayRecord } from './types.ts';
import TaskInput from './components/TaskInput.tsx';
import HistoryModal from './components/HistoryModal.tsx';
import EditTaskModal from './components/EditTaskModal.tsx';
import { extractTasks } from './services/gemini.ts';
import { ICONS } from './constants.tsx';

interface TaskItemProps {
  task: Task;
  isPriority?: boolean;
  onEdit: (task: Task) => void;
  onToggle: (e: React.MouseEvent, id: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, isPriority, onEdit, onToggle }) => (
  <div 
    className={`group flex justify-between items-baseline gap-4 py-2 border-b border-gray-50/50 hover:bg-gray-50/30 px-2 -mx-2 rounded-lg transition-all cursor-pointer ${task.completed ? 'opacity-40' : ''}`}
    onClick={() => onEdit(task)}
  >
    <div className="flex gap-4 items-start flex-1">
      <button 
        onClick={(e) => onToggle(e, task.id)}
        className={`mt-1.5 w-5 h-5 rounded-full border-2 transition-colors flex-shrink-0 flex items-center justify-center ${task.completed ? 'bg-gray-900 border-gray-900' : 'border-gray-200 hover:border-gray-400'}`}
        aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
      >
        {task.completed && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
      </button>
      <div className="flex-1 flex flex-col gap-0.5">
        <span className={`${isPriority ? 'text-lg font-semibold text-gray-800' : 'text-base text-gray-600 font-medium'} ${task.completed ? 'line-through' : ''}`}>
          {task.description}
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-400 whitespace-nowrap">– {task.time}</span>
          <ICONS.Edit className="w-3 h-3 text-gray-200 group-hover:text-gray-400 transition-colors" />
        </div>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [history, setHistory] = useState<DayRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    const storedHistory = localStorage.getItem('teacher_task_history');
    if (storedHistory) {
      try {
        const parsedHistory = JSON.parse(storedHistory);
        setHistory(parsedHistory);
        
        const todayStr = new Date().toLocaleDateString();
        const todayRecord = parsedHistory.find((r: DayRecord) => r.date === todayStr);
        if (todayRecord) {
          setTasks(todayRecord.tasks);
        }
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }
  }, []);

  useEffect(() => {
    if (tasks.length >= 0) {
      const todayStr = new Date().toLocaleDateString();
      setHistory(prev => {
        const newHistory = [...prev];
        const todayIndex = newHistory.findIndex(r => r.date === todayStr);
        if (todayIndex > -1) {
          newHistory[todayIndex].tasks = tasks;
        } else {
          newHistory.unshift({ date: todayStr, tasks });
        }
        localStorage.setItem('teacher_task_history', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [tasks]);

  useEffect(() => {
    if (feedback) {
      const timer = setTimeout(() => setFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [feedback]);

  const showFeedback = useCallback(() => {
    const messages = ["Done.", "Completed.", "Task finished."];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    setFeedback(randomMessage);
  }, []);

  const handleAddTasks = async (userInput: string) => {
    if (userInput.toLowerCase().includes('show history')) {
      setShowHistory(true);
      return;
    }

    setIsLoading(true);
    try {
      const result = await extractTasks(userInput);
      const newTasks: Task[] = result.tasks.map(t => ({
        id: Math.random().toString(36).substring(7),
        description: t.description,
        time: t.time,
        importance: (t.importance || 'medium') as Importance,
        timestamp: Date.now(),
        completed: false
      }));

      setTasks(prev => [...prev, ...newTasks]);
    } catch (error) {
      console.error("Error organizing tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleTask = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        if (!t.completed) showFeedback();
        return { ...t, completed: !t.completed };
      }
      return t;
    }));
  };

  const handleUpdateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setEditingTask(null);
  };

  const sortedActiveTasks = useMemo(() => {
    const active = tasks.filter(t => !t.completed);
    const importanceOrder = { [Importance.HIGH]: 3, [Importance.MEDIUM]: 2, [Importance.LOW]: 1 };

    return active.sort((a, b) => {
      if (importanceOrder[a.importance] !== importanceOrder[b.importance]) {
        return importanceOrder[b.importance] - importanceOrder[a.importance];
      }
      if (a.time === "no fixed time" && b.time !== "no fixed time") return 1;
      if (b.time === "no fixed time" && a.time !== "no fixed time") return -1;
      return (a.time || "").localeCompare(b.time || "");
    });
  }, [tasks]);

  const completedTasks = useMemo(() => {
    return tasks.filter(t => t.completed).sort((a, b) => b.timestamp - a.timestamp);
  }, [tasks]);

  const priorityTasks = sortedActiveTasks.slice(0, 3);
  const otherTasks = sortedActiveTasks.slice(3);

  return (
    <div className="min-h-screen bg-[#FAFAFA] py-12 px-4 sm:px-6 lg:px-8 text-gray-900 selection:bg-gray-200">
      <div className="max-w-xl mx-auto relative">
        {feedback && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg z-[60] animate-in fade-in slide-in-from-top-4 duration-300">
            {feedback}
          </div>
        )}

        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-gray-900">TeacherTask</h1>
            <p className="text-gray-400 text-sm mt-1 font-medium">Daily Organizer</p>
          </div>
          <button 
            onClick={() => setShowHistory(true)}
            className="p-2 text-gray-300 hover:text-gray-900 transition-colors"
            aria-label="View history"
          >
            <ICONS.History className="w-5 h-5" />
          </button>
        </header>

        <TaskInput onAddTasks={handleAddTasks} isLoading={isLoading} />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 animate-pulse">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-800 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Organizing...</p>
          </div>
        ) : tasks.length > 0 ? (
          <div className="mt-8 animate-in fade-in duration-500">
            <h2 className="text-3xl font-bold mb-10 text-gray-900">Today</h2>
            
            <div className="space-y-12">
              <section>
                <h3 className="text-xs font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                  🔴 Priority
                </h3>
                <div className="space-y-4">
                  {priorityTasks.map(task => (
                    <TaskItem key={task.id} task={task} isPriority onEdit={setEditingTask} onToggle={handleToggleTask} />
                  ))}
                  {priorityTasks.length === 0 && sortedActiveTasks.length > 0 && (
                    <p className="text-gray-300 italic text-sm">Priority focus achieved.</p>
                  )}
                  {sortedActiveTasks.length === 0 && completedTasks.length === 0 && (
                    <p className="text-gray-300 italic text-sm">No priority tasks.</p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                  ⚪ Other tasks
                </h3>
                <div className="space-y-3">
                  {otherTasks.length > 0 ? (
                    otherTasks.map(task => (
                      <TaskItem key={task.id} task={task} onEdit={setEditingTask} onToggle={handleToggleTask} />
                    ))
                  ) : (
                    <p className="text-gray-300 italic text-sm">No other pending tasks.</p>
                  )}
                </div>
              </section>

              {completedTasks.length > 0 && (
                <section className="pt-8 border-t border-gray-100">
                  <h3 className="text-xs font-black text-gray-400 mb-6 flex items-center gap-2 uppercase tracking-[0.2em]">
                    Completed
                  </h3>
                  <div className="space-y-3">
                    {completedTasks.map(task => (
                      <TaskItem key={task.id} task={task} onEdit={setEditingTask} onToggle={handleToggleTask} />
                    ))}
                  </div>
                </section>
              )}
            </div>
            
            <div className="mt-24 pt-8 border-t border-gray-100 flex justify-center">
              <button 
                onClick={() => {
                  if(confirm("Clear today's schedule?")) setTasks([]);
                }}
                className="text-[10px] font-bold text-gray-300 hover:text-red-400 transition-colors uppercase tracking-[0.2em]"
              >
                Clear Schedule
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-32">
            <p className="text-gray-300 font-medium italic text-sm">Empty schedule.</p>
          </div>
        )}
      </div>

      {showHistory && (
        <HistoryModal history={history} onClose={() => setShowHistory(false)} />
      )}

      {editingTask && (
        <EditTaskModal 
          task={editingTask} 
          onSave={handleUpdateTask} 
          onDelete={handleDeleteTask}
          onClose={() => setEditingTask(null)} 
        />
      )}
    </div>
  );
};

export default App;
