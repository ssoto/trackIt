'use client';

import { useState, useEffect } from 'react';
import TaskTimer from '@/components/TaskTimer';
import WeeklyCalendar from '@/components/WeeklyCalendar';
import DailySummary from '@/components/DailySummary';
import { DailySummary as DailySummaryType } from '@/lib/types';
import { formatDate, getWeekStart } from '@/lib/timeUtils';

export default function Home() {
    const [currentWeek, setCurrentWeek] = useState(new Date());
    const [summaries, setSummaries] = useState<DailySummaryType[]>([]);
    const [dailyTotals, setDailyTotals] = useState<{ [date: string]: number }>({});
    const [isLoading, setIsLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<string>(() => new Date().toISOString().slice(0, 10));
    // Start with true (matches SSR), then read localStorage after mount to avoid hydration mismatch
    const [showWeekends, setShowWeekends] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('trackit-show-weekends');
        if (saved !== null) {
            setShowWeekends(saved === 'true');
        }
        setMounted(true); // mark as ready after reading localStorage
    }, []);

    useEffect(() => {
        if (!mounted) return; // don't write on the initial SSR render
        localStorage.setItem('trackit-show-weekends', String(showWeekends));
    }, [showWeekends, mounted]);

    useEffect(() => {
        fetchSummaries();
    }, [currentWeek]);

    const fetchSummaries = async (isBackground = false) => {
        if (!isBackground) setIsLoading(true);
        try {
            const weekStart = getWeekStart(currentWeek);
            // Add timestamp to foil caching
            const response = await fetch(`/api/summary?weekStart=${formatDate(weekStart)}&t=${Date.now()}`, {
                cache: 'no-store'
            });
            const data = await response.json();

            setSummaries(data.summaries || []);

            // Create a map of date -> total minutes for the calendar
            const totals: { [date: string]: number } = {};
            data.summaries?.forEach((summary: DailySummaryType) => {
                totals[summary.date] = summary.totalMinutes;
            });
            setDailyTotals(totals);
        } catch (error) {
            console.error('Error fetching summaries:', error);
        } finally {
            if (!isBackground) setIsLoading(false);
        }
    };

    const handleTaskUpdate = () => {
        fetchSummaries(true);
    };

    // Optimistic update helpers — mutate local state immediately, sync API in background
    const updateSummariesLocally = (taskId: number, updates: Record<string, any>) => {
        setSummaries(prev => {
            // Find original task
            let originalTask: any = null;
            let originalDateStr = '';

            for (const day of prev) {
                const found = day.tasks.find(t => t.id === taskId);
                if (found) {
                    originalTask = found;
                    originalDateStr = day.date; // Use the summary date as source of truth
                    break;
                }
            }

            if (!originalTask) return prev;

            const updatedTask = { ...originalTask, ...updates };

            // Determine new date string (YYYY-MM-DD) from start_time
            // We assume start_time is ISO string. We need local YYYY-MM-DD.
            // A safe way is to create a Date and use the same formatting logic as the backend/rest of app
            const d = new Date(updatedTask.start_time);
            const pad = (n: number) => String(n).padStart(2, '0');
            const newDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

            // 1. Simple update in place map
            const next = prev.map(day => {
                const isSource = day.date === originalDateStr;
                const isTarget = day.date === newDateStr;

                // Optimization: skip days irrelevant to this change
                if (!isSource && !isTarget) return day;

                let tasks = [...day.tasks];

                if (isSource) {
                    // Remove from source (even if source == target, we remove first then re-add updated)
                    tasks = tasks.filter(t => t.id !== taskId);
                }

                if (isTarget) {
                    // Add updated to target
                    tasks.push(updatedTask);
                    // Sort by start_time ascending
                    tasks.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
                }

                // Recalculate total minutes for this day
                const totalMinutes = tasks.reduce((sum, t) => sum + Math.floor((t.duration ?? 0) / 1000 / 60), 0);

                return { ...day, tasks, totalMinutes };
            });

            // Keep dailyTotals in sync
            const totals: { [date: string]: number } = {};
            next.forEach(d => { totals[d.date] = d.totalMinutes; });
            setDailyTotals(totals);

            return next;
        });
    };

    const handleDeleteTask = async (taskId: number) => {
        // Optimistic: remove from local state immediately
        setSummaries(prev => {
            const next = prev.map(day => {
                const tasks = day.tasks.filter(t => t.id !== taskId);
                const totalMinutes = tasks.reduce((sum, t) => sum + Math.floor((t.duration ?? 0) / 1000 / 60), 0);
                return { ...day, tasks, totalMinutes };
            });
            const totals: { [date: string]: number } = {};
            next.forEach(d => { totals[d.date] = d.totalMinutes; });
            setDailyTotals(totals);
            return next;
        });

        try {
            const response = await fetch(`/api/tasks?id=${taskId}`, { method: 'DELETE' });
            if (!response.ok) fetchSummaries(); // rollback on failure
        } catch (error) {
            console.error('Error deleting task:', error);
            fetchSummaries(); // rollback
        }
    };

    const handleUpdateTask = async (taskId: number, updates: any) => {
        // Optimistic: apply update to local state immediately
        updateSummariesLocally(taskId, updates);

        try {
            const response = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: taskId, ...updates }),
            });
            if (!response.ok) fetchSummaries(); // rollback on failure
        } catch (error) {
            console.error('Error updating task:', error);
            fetchSummaries(); // rollback
        }
    };

    const handleCreateTask = async (task: any) => {
        // For create we still need the server-assigned ID, so fetch after
        try {
            const response = await fetch('/api/tasks/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(task),
            });
            if (response.ok) {
                await fetchSummaries(true);
                return true;
            } else {
                console.error('Failed to create task:', await response.text());
                return false;
            }
        } catch (error) {
            console.error('Error creating task:', error);
            return false;
        }
    };

    // Filter summaries based on showWeekends — use true before mount to match SSR
    const effectiveShowWeekends = mounted ? showWeekends : true;
    const filteredSummaries = effectiveShowWeekends
        ? summaries
        : summaries.filter(summary => {
            const date = new Date(summary.date);
            const dayOfWeek = date.getDay();
            return dayOfWeek !== 0 && dayOfWeek !== 6; // 0 = Sunday, 6 = Saturday
        });

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <header className="mb-8 text-center animate-fade-in">
                    <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary-600 via-accent-600 to-primary-600 bg-clip-text text-transparent">
                        TrackIt
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Simple time tracking for your daily tasks
                    </p>

                    {/* Weekends Toggle — only render after mount to avoid flash */}
                    {mounted && (
                        <div className="mt-4 flex justify-center">
                            <button
                                onClick={() => setShowWeekends(!showWeekends)}
                                className="btn bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 px-4 py-2 flex items-center gap-2 transition-all"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                                {showWeekends ? 'Hide Weekends' : 'Show Weekends'}
                            </button>
                        </div>
                    )}
                </header>

                {/* Floating Task Timer - Top Right */}
                <div className="fixed top-4 right-4 z-50">
                    <TaskTimer onTaskUpdate={handleTaskUpdate} />
                </div>

                {/* Main Content - Full Width */}
                <div className="space-y-6">
                    <WeeklyCalendar
                        currentWeek={currentWeek}
                        onWeekChange={setCurrentWeek}
                        dailyTotals={dailyTotals}
                        showWeekends={mounted ? showWeekends : true}
                        selectedDate={selectedDate}
                        onDaySelect={setSelectedDate}
                    />

                    {isLoading ? (
                        <div className="card">
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
                            </div>
                        </div>
                    ) : (
                        <DailySummary
                            summaries={filteredSummaries}
                            onDeleteTask={handleDeleteTask}
                            onUpdateTask={handleUpdateTask}
                            onCreateTask={handleCreateTask}
                            selectedDate={selectedDate}
                            onDaySelect={setSelectedDate}
                        />
                    )}
                </div>

                {/* Footer */}
                <footer className="mt-12 text-center text-sm text-gray-500 dark:text-gray-600">
                    <p>Built with Next.js, React, and SQLite</p>
                </footer>
            </div>
        </main>
    );
}
