'use client';

import { getWeekDates, formatDate, isToday, getShortDayName, getMonthDay } from '@/lib/timeUtils';
import ProgressRing from '@/components/ProgressRing';

interface WeeklyCalendarProps {
    currentWeek: Date;
    onWeekChange: (date: Date) => void;
    dailyTotals: { [date: string]: number };
    showWeekends: boolean;
    selectedDate: string;
    onDaySelect: (date: string) => void;
}

export default function WeeklyCalendar({ currentWeek, onWeekChange, dailyTotals, showWeekends, selectedDate, onDaySelect }: WeeklyCalendarProps) {
    const allWeekDates = getWeekDates(currentWeek);

    const weekDates = showWeekends
        ? allWeekDates
        : allWeekDates.filter(date => {
            const dayOfWeek = date.getDay();
            return dayOfWeek !== 0 && dayOfWeek !== 6;
        });

    const handlePreviousWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() - 7);
        onWeekChange(newDate);
    };

    const handleNextWeek = () => {
        const newDate = new Date(currentWeek);
        newDate.setDate(newDate.getDate() + 7);
        onWeekChange(newDate);
    };

    const handleToday = () => onWeekChange(new Date());

    return (
        <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    Weekly Overview
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={handlePreviousWeek}
                        className="btn btn-secondary px-3 py-2 hover:scale-105 transform transition-transform"
                        aria-label="Previous week"
                    >
                        ←
                    </button>
                    <button
                        onClick={handleToday}
                        className="btn btn-secondary px-4 py-2 hover:scale-105 transform transition-transform"
                    >
                        Today
                    </button>
                    <button
                        onClick={handleNextWeek}
                        className="btn btn-secondary px-3 py-2 hover:scale-105 transform transition-transform"
                        aria-label="Next week"
                    >
                        →
                    </button>
                </div>
            </div>

            <div className={`grid gap-2 ${showWeekends ? 'grid-cols-7' : 'grid-cols-5'}`}>
                {weekDates.map((date) => {
                    const dateStr = formatDate(date);
                    const totalMinutes = dailyTotals[dateStr] || 0;
                    const today = isToday(date);
                    const hasTime = totalMinutes > 0;

                    return (
                        <div
                            key={dateStr}
                            onClick={() => onDaySelect(dateStr)}
                            className={`
                                group relative p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 flex flex-col items-center gap-2 cursor-pointer
                                ${selectedDate === dateStr
                                    ? 'border-primary-400 bg-primary-50/50 dark:bg-primary-900/20'
                                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'
                                }
                            `}
                            style={selectedDate === dateStr ? {
                                boxShadow: '0 0 0 2px rgba(124, 58, 237, 0.25)'
                            } : undefined}
                        >
                            {/* Today badge */}
                            {today && (
                                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md whitespace-nowrap">
                                    Today
                                </div>
                            )}

                            {/* Day name */}
                            <div className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                {getShortDayName(date)}
                            </div>

                            {/* Day number */}
                            <div className="text-lg font-bold leading-none text-gray-900 dark:text-gray-100">
                                {getMonthDay(date)}
                            </div>

                            {/* Progress Ring or empty state for future */}
                            {hasTime || dateStr <= new Date().toLocaleDateString('en-CA') ? (
                                <ProgressRing minutes={totalMinutes} />
                            ) : (
                                <div className="w-[52px] h-[52px] flex items-center justify-center">
                                    <span className="text-gray-200 dark:text-gray-700 text-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 select-none">
                                        +
                                    </span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
