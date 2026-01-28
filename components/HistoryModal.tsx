
import React from 'react';
import { DayRecord } from '../types.ts';

interface HistoryModalProps {
  history: DayRecord[];
  onClose: () => void;
}

const HistoryModal: React.FC<HistoryModalProps> = ({ history, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800">History</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 font-medium"
          >
            Close
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-8">
          {history.length === 0 ? (
            <div className="text-center py-10 text-gray-400">No records found.</div>
          ) : (
            history.map((record, idx) => (
              <div key={idx} className="border-b border-gray-100 pb-6 last:border-0">
                <h3 className="text-lg font-bold mb-4 text-gray-700">{record.date}</h3>
                <div className="bg-gray-50 rounded-xl p-4 font-mono text-sm">
                  <pre className="whitespace-pre-wrap">{formatRecord(record)}</pre>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

const formatRecord = (record: DayRecord) => {
  const sortedTasks = [...record.tasks].sort((a, b) => {
    const importanceMap = { high: 3, medium: 2, low: 1 };
    if (importanceMap[a.importance as keyof typeof importanceMap] !== importanceMap[b.importance as keyof typeof importanceMap]) {
      return importanceMap[b.importance as keyof typeof importanceMap] - importanceMap[a.importance as keyof typeof importanceMap];
    }
    return (a.time || '').localeCompare(b.time || '');
  });

  const priority = sortedTasks.slice(0, 3);
  const other = sortedTasks.slice(3);

  let output = `Today\n🔴 Priority\n\n`;
  priority.forEach(t => output += `${t.description} – ${t.time}\n`);
  if (priority.length === 0) output += `None\n`;
  
  output += `\n⚪ Other tasks\n\n`;
  other.forEach(t => output += `${t.description} – ${t.time}\n`);
  if (other.length === 0) output += `None\n`;

  return output;
};

export default HistoryModal;
