import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Task } from '@/lib/types';

// GET /api/tasks/active - Get the currently running task
export async function GET() {
    try {
        const db = getDb();

        const stmt = db.prepare('SELECT * FROM tasks WHERE end_time IS NULL ORDER BY start_time DESC LIMIT 1');
        const activeTask = stmt.get() as Task | undefined;

        return NextResponse.json({ task: activeTask || null });
    } catch (error) {
        console.error('Error fetching active task:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active task' },
            { status: 500 }
        );
    }
}
