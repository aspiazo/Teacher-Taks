
import React, { useState } from 'react';
import { Task, Importance } from '../types.ts';

interface EditTaskModalProps {
  task: Task;
  onSave: (updatedTask: Task) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
}

const EditTaskModal: React.FC<EditTaskModalProps> = ({ task, onSave, onClose, onDelete }) => {
  const [description, setDescription] = useState(task.description);
  const [time, setTime] = useState(task.time);
  const [importance, setImportance] = useState<Importance>(task.importance);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...task,
      description,
      time,
      importance,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Task</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all resize-none text-gray-800 font-medium"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Time</label>
                <input
                  type="text"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  placeholder="e.g. 10:00"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all text-gray-800 font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                <select
                  value={importance}
                  onChange={(e) => setImportance(e.target.value as Importance)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-gray-200 focus:border-gray-300 outline-none transition-all text-gray-800 font-medium appearance-none"
                >
                  <option value={Importance.HIGH}>High</option>
                  <option value={Importance.MEDIUM}>Medium</option>
                  <option value={Importance.LOW}>Low</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-md active:scale-[0.98]"
              >
                Save Changes
              </button>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => onDelete(task.id)}
                  className="flex-1 bg-white text-red-500 border border-red-50 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-red-50 transition-all"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 bg-white text-gray-400 border border-gray-50 px-4 py-3 rounded-2xl font-bold text-sm hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditTaskModal;
