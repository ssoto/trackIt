import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Task, DailySummary } from '@/lib/types';
import { formatDate, getWeekDates } from '@/lib/timeUtils';

// GET /api/summary - Get daily summaries for a week (profile-scoped)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const weekStartParam = searchParams.get('weekStart');
        const profileIdParam = searchParams.get('profileId');

        if (!profileIdParam) {
            return NextResponse.json({ error: 'profileId is required' }, { status: 400 });
        }

        const profileId = parseInt(profileIdParam, 10);
        if (isNaN(profileId)) {
            return NextResponse.json({ error: 'Invalid profileId' }, { status: 400 });
        }

        const weekStart = weekStartParam ? new Date(weekStartParam) : new Date();
        const weekDates = getWeekDates(weekStart);

        const db = getDb();

        const dailySummaries: DailySummary[] = weekDates.map(date => {
            const dateStr = formatDate(date);

            const stmt = db.prepare(`
        SELECT * FROM tasks 
        WHERE date(start_time) = date(?)
          AND profile_id = ?
        ORDER BY start_time ASC
      `);

            const tasks = stmt.all(dateStr, profileId) as Task[];

            const totalMinutes = tasks.reduce((sum, task) => {
                if (task.duration) {
                    return sum + (task.duration / 1000 / 60);
                }
                return sum;
            }, 0);

            return {
                date: dateStr,
                totalMinutes,
                tasks,
            };
        });

        return NextResponse.json({ summaries: dailySummaries });
    } catch (error) {
        console.error('Error fetching summary:', error);
        return NextResponse.json(
            { error: 'Failed to fetch summary' },
            { status: 500 }
        );
    }
}
