export type TaskStatus = 'todo' | 'in_progress' | 'done';

export interface Task {
    id: number;
    description: string;
    start_time: string;
    end_time: string | null;
    duration: number | null;
    status: TaskStatus;
    created_at: string;
}

export interface DailySummary {
    date: string;
    totalMinutes: number;
    tasks: Task[];
}

export interface WeekSummary {
    weekStart: string;
    weekEnd: string;
    days: DailySummary[];
}
