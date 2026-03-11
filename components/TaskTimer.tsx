'use client';

import { useState, useEffect, useRef } from 'react';
import type { Task } from '@/lib/types';
import { formatDuration } from '@/lib/timeUtils';

interface TaskTimerProps {
    onTaskUpdate: () => void;
}

export default function TaskTimer({ onTaskUpdate }: TaskTimerProps) {
    const [description, setDescription] = useState('');
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch active task on mount
    useEffect(() => {
        fetchActiveTask();
    }, []);

    // Update elapsed time every second when there's an active task
    useEffect(() => {
        if (!activeTask) {
            setElapsedTime(0);
            return;
        }

        const updateElapsed = () => {
            const start = new Date(activeTask.start_time).getTime();
            const now = Date.now();
            setElapsedTime(now - start);
        };

        updateElapsed();
        const interval = setInterval(updateElapsed, 1000);

        return () => clearInterval(interval);
    }, [activeTask]);

    // Dynamic favicon + document title
    const originalFavicon = useRef<string | null>(null);
    useEffect(() => {
        const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
        if (!link) return;

        if (!originalFavicon.current) {
            originalFavicon.current = link.href;
        }

        if (activeTask) {
            // Draw favicon with red dot via canvas
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            if (ctx) {
                // Purple clock background
                ctx.fillStyle = '#7C3AED';
                ctx.beginPath();
                ctx.arc(16, 16, 14, 0, Math.PI * 2);
                ctx.fill();
                // White clock hands (simplified)
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                ctx.beginPath(); ctx.moveTo(16, 16); ctx.lineTo(16, 9); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(16, 16); ctx.lineTo(21, 16); ctx.stroke();
                // Red dot indicator
                ctx.fillStyle = '#ef4444';
                ctx.beginPath();
                ctx.arc(25, 7, 5, 0, Math.PI * 2);
                ctx.fill();
            }
            link.href = canvas.toDataURL();
        } else {
            link.href = originalFavicon.current;
        }
    }, [activeTask]);

    useEffect(() => {
        if (activeTask) {
            const h = Math.floor(elapsedTime / 3600000);
            const m = Math.floor((elapsedTime % 3600000) / 60000);
            const s = Math.floor((elapsedTime % 60000) / 1000);
            const pad = (n: number) => String(n).padStart(2, '0');

            // Format: H:MM:SS or M:SS if hours is 0
            const timeStr = h > 0
                ? `${h}:${pad(m)}:${pad(s)}`
                : `${m}:${pad(s)}`;

            document.title = `TrackIt - ${timeStr}`;
        } else {
            document.title = 'TrackIt - Simple Time Tracking';
        }
    }, [activeTask, elapsedTime]);

    const fetchActiveTask = async () => {
        try {
            const response = await fetch('/api/tasks/active');
            const data = await response.json();
            setActiveTask(data.task);
        } catch (err) {
            console.error('Error fetching active task:', err);
        }
    };

    const handleStart = async () => {
        if (!description.trim()) {
            setError('Please enter a task description');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ description, status: 'in_progress' }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Failed to start task');
                return;
            }

            setActiveTask(data.task);
            setDescription('');
            onTaskUpdate();
        } catch (err) {
            setError('Failed to start task');
            console.error('Error starting task:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStop = async () => {
        if (!activeTask) return;

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/tasks', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: activeTask.id,
                    endTime: new Date().toISOString(),
                    status: 'done',
                }),
            });

            if (!response.ok) {
                setError('Failed to stop task');
                return;
            }

            setActiveTask(null);
            setElapsedTime(0);
            onTaskUpdate();
        } catch (err) {
            setError('Failed to stop task');
            console.error('Error stopping task:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-4 min-w-[280px] max-w-[320px] animate-slide-up">
            {/* Clock Icon & Timer Display */}
            <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className={`h-10 w-10 ${activeTask ? 'text-primary-500' : 'text-gray-400 dark:text-gray-600'}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                    </svg>
                    {activeTask && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-primary-500"></span>
                        </span>
                    )}
                </div>

                <div className="flex-1">
                    {activeTask ? (
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Tracking</div>
                            <div className="text-2xl font-bold font-mono text-primary-600 dark:text-primary-400 leading-tight">
                                {formatDuration(elapsedTime)}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">Ready</div>
                            <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">Start Timer</div>
                        </div>
                    )}
                </div>
            </div>

            {/* Task Description or Input */}
            {activeTask ? (
                <div className="mb-3">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100 line-clamp-2 bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2">
                        {activeTask.description}
                    </div>
                </div>
            ) : (
                <div className="mb-3">
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleStart()}
                        placeholder="What are you working on?"
                        className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100"
                        disabled={isLoading}
                    />
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="mb-3 px-3 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-xs text-red-600 dark:text-red-400">
                    {error}
                </div>
            )}

            {/* Action Button */}
            {activeTask ? (
                <button
                    onClick={handleStop}
                    disabled={isLoading}
                    className="w-full py-2 px-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? 'Stopping...' : 'Stop'}
                </button>
            ) : (
                <button
                    onClick={handleStart}
                    disabled={isLoading || !description.trim()}
                    className="w-full py-2 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    {isLoading ? 'Starting...' : 'Start'}
                </button>
            )}
        </div>
    );
}
