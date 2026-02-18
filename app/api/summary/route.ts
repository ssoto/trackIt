import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { Task, DailySummary } from '@/lib/types';
import { formatDate, getWeekDates } from '@/lib/timeUtils';

// GET /api/summary - Get daily summaries for a week
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const weekStartParam = searchParams.get('weekStart');

        const weekStart = weekStartParam ? new Date(weekStartParam) : new Date();
        const weekDates = getWeekDates(weekStart);

        const db = getDb();

        const dailySummaries: DailySummary[] = weekDates.map(date => {
            const dateStr = formatDate(date);

            const stmt = db.prepare(`
        SELECT * FROM tasks 
        WHERE date(start_time) = date(?)
        ORDER BY start_time ASC
      `);

            const tasks = stmt.all(dateStr) as Task[];

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
