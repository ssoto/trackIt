import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Task } from '@/lib/types';

// POST /api/tasks/create - Create a new task with custom times
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { description, start_time, end_time, duration } = body;

        if (!description || description.trim() === '') {
            return NextResponse.json(
                { error: 'Description is required' },
                { status: 400 }
            );
        }

        if (!start_time) {
            return NextResponse.json(
                { error: 'Start time is required' },
                { status: 400 }
            );
        }

        if (!end_time) {
            return NextResponse.json(
                { error: 'End time is required' },
                { status: 400 }
            );
        }

        const db = getDb();

        const stmt = db.prepare(`
      INSERT INTO tasks (description, start_time, end_time, duration)
      VALUES (?, ?, ?, ?)
    `);

        const result = stmt.run(
            description.trim(),
            start_time,
            end_time,
            duration
        );

        const newTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid) as Task;

        return NextResponse.json({ task: newTask }, { status: 201 });
    } catch (error) {
        console.error('Error creating task:', error);
        return NextResponse.json(
            { error: 'Failed to create task' },
            { status: 500 }
        );
    }
}
