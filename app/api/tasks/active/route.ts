import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Task } from '@/lib/types';

// GET /api/tasks/active - Get the currently running task for a profile
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const profileIdParam = searchParams.get('profileId');

        if (!profileIdParam) {
            return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
        }

        const profileId = parseInt(profileIdParam, 10);
        if (isNaN(profileId)) {
            return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
        }

        const db = getDb();

        const stmt = db.prepare('SELECT * FROM tasks WHERE end_time IS NULL AND profile_id = ? ORDER BY start_time DESC LIMIT 1');
        const activeTask = stmt.get(profileId) as Task | undefined;

        return NextResponse.json({ task: activeTask || null });
    } catch (error) {
        console.error('Error fetching active task:', error);
        return NextResponse.json(
            { error: 'Failed to fetch active task' },
            { status: 500 }
        );
    }
}
