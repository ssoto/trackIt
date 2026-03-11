/**
 * Get the start of the week (Monday) for a given date
 */
export function getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    return new Date(d.setDate(diff));
}

/**
 * Get the end of the week (Sunday) for a given date
 */
export function getWeekEnd(date: Date): Date {
    const weekStart = getWeekStart(date);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return weekEnd;
}

/**
 * Get an array of dates for the current week (Monday to Sunday)
 */
export function getWeekDates(date: Date): Date[] {
    const weekStart = getWeekStart(date);
    const dates: Date[] = [];

    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        dates.push(day);
    }

    return dates;
}

/**
 * Format a date as YYYY-MM-DD
 */
export function formatDate(date: Date): string {
    return date.toISOString().split('T')[0] ?? '';
}

/**
 * Format duration in milliseconds to HH:MM:SS
 */
export function formatDuration(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format duration in minutes to hours and minutes (e.g., "2h 30m")
 */
export function formatMinutes(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);

    if (hours === 0) {
        return `${mins}m`;
    }

    if (mins === 0) {
        return `${hours}h`;
    }

    return `${hours}h ${mins}m`;
}

/**
 * Calculate duration between two dates in milliseconds
 */
export function calculateDuration(startTime: string, endTime: string): number {
    return new Date(endTime).getTime() - new Date(startTime).getTime();
}

/**
 * Check if a date is today
 */
export function isToday(date: Date): boolean {
    const today = new Date();
    return formatDate(date) === formatDate(today);
}

/**
 * Get day name (e.g., "Monday")
 */
export function getDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'long' });
}

/**
 * Get short day name (e.g., "Mon")
 */
export function getShortDayName(date: Date): string {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

/**
 * Get month and day (e.g., "Feb 17")
 */
export function getMonthDay(date: Date): string {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
