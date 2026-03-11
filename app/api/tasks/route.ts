import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Task } from '@/lib/types';

// GET /api/tasks - Fetch tasks for a date range
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const startDate = searchParams.get('startDate');
        const endDate = searchParams.get('endDate');

        const db = getDb();

        let tasks: Task[];

        if (startDate && endDate) {
            const stmt = db.prepare(`
        SELECT * FROM tasks 
        WHERE date(start_time) >= date(?) AND date(start_time) <= date(?)
        ORDER BY start_time DESC
      `);
            tasks = stmt.all(startDate, endDate) as Task[];
        } else {
            const stmt = db.prepare('SELECT * FROM tasks ORDER BY start_time DESC LIMIT 100');
            tasks = stmt.all() as Task[];
        }

        return NextResponse.json({ tasks });
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tasks' },
            { status: 500 }
        );
    }
}

// POST /api/tasks - Create a new task (start timer)
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { description, status = 'in_progress' } = body;

        if (!description || description.trim() === '') {
            return NextResponse.json(
                { error: 'Description is required' },
                { status: 400 }
            );
        }

        const db = getDb();

        // Check if there's already an active task
        const activeStmt = db.prepare('SELECT * FROM tasks WHERE end_time IS NULL');
        const activeTask = activeStmt.get() as Task | undefined;

        if (activeTask) {
            return NextResponse.json(
                { error: 'There is already an active task. Please stop it first.' },
                { status: 400 }
            );
        }

        const startTime = new Date().toISOString();

        const stmt = db.prepare(`
      INSERT INTO tasks (description, start_time, status)
      VALUES (?, ?, ?)
    `);

        const result = stmt.run(description.trim(), startTime, status);

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

// PATCH /api/tasks/:id - Update a task
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, endTime, description, start_time, end_time, duration, status } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Task ID is required' },
                { status: 400 }
            );
        }

        const db = getDb();

        // Get the task
        const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task | undefined;

        if (!task) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        // Build update query dynamically based on provided fields
        const updates: string[] = [];
        const values: any[] = [];

        if (description !== undefined) {
            updates.push('description = ?');
            values.push(description);
        }

        if (start_time !== undefined) {
            updates.push('start_time = ?');
            values.push(start_time);
        }

        if (end_time !== undefined) {
            updates.push('end_time = ?');
            values.push(end_time);
        }

        if (duration !== undefined) {
            updates.push('duration = ?');
            values.push(duration);
        }

        // Handle legacy endTime parameter (for stopping timer)
        if (endTime !== undefined && end_time === undefined) {
            const end = endTime || new Date().toISOString();
            const calculatedDuration = new Date(end).getTime() - new Date(task.start_time).getTime();
            updates.push('end_time = ?', 'duration = ?');
            values.push(end, calculatedDuration);
        }

        if (status !== undefined) {
            const validStatuses = ['todo', 'in_progress', 'done'];
            if (!validStatuses.includes(status)) {
                return NextResponse.json(
                    { error: 'Invalid status. Must be todo, in_progress, or done' },
                    { status: 400 }
                );
            }
            updates.push('status = ?');
            values.push(status);
        }

        if (updates.length === 0) {
            return NextResponse.json(
                { error: 'No fields to update' },
                { status: 400 }
            );
        }

        values.push(id);

        const stmt = db.prepare(`
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = ?
    `);

        stmt.run(...values);

        const updatedTask = db.prepare('SELECT * FROM tasks WHERE id = ?').get(id) as Task;

        return NextResponse.json({ task: updatedTask });
    } catch (error) {
        console.error('Error updating task:', error);
        return NextResponse.json(
            { error: 'Failed to update task' },
            { status: 500 }
        );
    }
}

// DELETE /api/tasks/:id - Delete a task
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json(
                { error: 'Task ID is required' },
                { status: 400 }
            );
        }

        const db = getDb();

        const stmt = db.prepare('DELETE FROM tasks WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return NextResponse.json(
                { error: 'Task not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting task:', error);
        return NextResponse.json(
            { error: 'Failed to delete task' },
            { status: 500 }
        );
    }
}
