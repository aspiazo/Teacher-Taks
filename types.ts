
export enum Importance {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

export interface Task {
  id: string;
  description: string;
  time: string; // e.g., "10:00", "14:30" or "no fixed time"
  importance: Importance;
  timestamp: number;
  completed?: boolean;
}

export interface DayRecord {
  date: string;
  tasks: Task[];
}

export interface TaskExtractionResponse {
  tasks: {
    description: string;
    time: string;
    importance: string;
  }[];
}
