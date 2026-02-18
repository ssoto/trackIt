'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Task, DailySummary, TaskStatus } from '@/lib/types';
import { formatMinutes, getDayName, getMonthDay } from '@/lib/timeUtils';
import { showToast, dismissToast } from '@/components/Toast';
import TimePicker from '@/components/TimePicker';

interface DailySummaryProps {
    summaries: DailySummary[];
    onDeleteTask: (taskId: number) => void;
    onUpdateTask: (taskId: number, updates: Partial<Task>) => void;
    onCreateTask: (task: { description: string; start_time: string; end_time: string; duration: number }) => Promise<boolean | void>;
    selectedDate: string;
    onDaySelect: (date: string) => void;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; badgeClasses: string; dot: string }> = {
    todo: { label: 'To Do', badgeClasses: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600', dot: 'bg-gray-400' },
    in_progress: { label: 'In Progress', badgeClasses: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/60', dot: 'bg-blue-500' },
    done: { label: 'Done', badgeClasses: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900/60', dot: 'bg-green-500' },
};

// Per-task inline edit state
interface InlineEdit {
    description: string;
    startDate: string;
    startHour: string;
    endDate: string;
    endHour: string;
    saving: 'idle' | 'pending' | 'saved';
    showTimePicker: boolean;
}

// Extract HH:MM from an ISO string
function toHour(isoString: string) {
    const d = new Date(isoString);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// Extract YYYY-MM-DD from an ISO string (local date)
function toDateStr(isoString: string) {
    const d = new Date(isoString);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Combine a YYYY-MM-DD date and HH:MM hour into an ISO string
function toISO(dateStr: string, hourStr: string) {
    const [h, m] = hourStr.split(':').map(Number);
    const d = new Date(dateStr);
    d.setHours(h, m, 0, 0);
    return d.toISOString();
}

// Format a date string for display (e.g. "Mon, Feb 18")
function formatDateLabel(dateStr: string) {
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function initInlineEdit(task: Task): InlineEdit {
    return {
        description: task.description,
        startDate: toDateStr(task.start_time),
        startHour: toHour(task.start_time),
        endDate: task.end_time ? toDateStr(task.end_time) : toDateStr(task.start_time),
        endHour: task.end_time ? toHour(task.end_time) : '',
        saving: 'idle',
        showTimePicker: false,
    };
}

export default function DailySummaryComponent({ summaries, onDeleteTask, onUpdateTask, onCreateTask, selectedDate, onDaySelect }: DailySummaryProps) {
    const [statusPickerTaskId, setStatusPickerTaskId] = useState<number | null>(null);
    const [creatingForDate, setCreatingForDate] = useState<string | null>(null);

    // Per-task inline edit state map
    const [inlineEdits, setInlineEdits] = useState<Record<number, InlineEdit>>({});

    // Debounce timers per task
    const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    // Track pending delete timers so Undo can cancel them
    const deleteTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>({});

    // Refs for click-outside detection on inline time pickers
    const timePickerRefs = useRef<Record<number, HTMLDivElement | null>>({});

    // Close any open TimePicker when clicking outside
    useEffect(() => {
        const handleMouseDown = (e: MouseEvent) => {
            setInlineEdits(prev => {
                const anyOpen = Object.values(prev).some(ed => ed.showTimePicker);
                if (!anyOpen) return prev;

                let changed = false;
                const next = { ...prev };
                for (const [idStr, ed] of Object.entries(prev)) {
                    const id = Number(idStr);
                    if (ed.showTimePicker) {
                        const ref = timePickerRefs.current[id];
                        if (ref && !ref.contains(e.target as Node)) {
                            next[id] = { ...ed, showTimePicker: false };
                            changed = true;
                        }
                    }
                }
                return changed ? next : prev;
            });
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setInlineEdits(prev => {
                    const anyOpen = Object.values(prev).some(ed => ed.showTimePicker);
                    if (!anyOpen) return prev;
                    const next: Record<number, InlineEdit> = {};
                    for (const [idStr, ed] of Object.entries(prev)) {
                        next[Number(idStr)] = ed.showTimePicker ? { ...ed, showTimePicker: false } : ed;
                    }
                    return next;
                });
            }
        };

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Create task form state
    const [createForm, setCreateForm] = useState({
        description: '',
        startDate: '',
        startHour: '09:00',
        endDate: '',
        endHour: '10:00',
    });

    // Collapse all days except selectedDate by default
    const todayStr = new Date().toISOString().slice(0, 10);
    const [collapsedDays, setCollapsedDays] = useState<Record<string, boolean>>(() => {
        const initial: Record<string, boolean> = {};
        summaries.forEach((s) => {
            initial[s.date] = s.date !== selectedDate;
        });
        return initial;
    });

    // When selectedDate changes from outside (WeeklyCalendar click), expand that day and collapse others
    useEffect(() => {
        setCollapsedDays(prev => {
            const next = { ...prev };
            // Collapse all
            Object.keys(next).forEach(d => { next[d] = true; });
            // Expand selected
            next[selectedDate] = false;
            return next;
        });
    }, [selectedDate]);

    // Toggle a day and notify parent of the new selected date
    const toggleDay = (date: string) => {
        const willExpand = !!collapsedDays[date]; // currently collapsed → will expand
        setCollapsedDays((prev) => ({ ...prev, [date]: !prev[date] }));
        if (willExpand) {
            onDaySelect(date);
        }
    };

    const totalWeekMinutes = summaries.reduce((sum, day) => sum + day.totalMinutes, 0);

    const formatTime = (startTime: string, endTime: string | null) => {
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : null;
        const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
        return end ? `${fmt(start)} – ${fmt(end)}` : `${fmt(start)} – Running`;
    };

    const formatDuration = (duration: number | null) => {
        if (!duration) return 'Running';
        return formatMinutes(Math.floor(duration / 1000 / 60));
    };

    // Initialize inline edit for a task (on first focus/click)
    const getOrInitEdit = useCallback((task: Task): InlineEdit => {
        return inlineEdits[task.id] ?? initInlineEdit(task);
    }, [inlineEdits]);

    // Update inline edit field and schedule auto-save
    const updateInlineEdit = useCallback((
        taskId: number,
        patch: Partial<InlineEdit>,
        task: Task,
        saveCallback: (edit: InlineEdit) => Promise<void>
    ) => {
        setInlineEdits(prev => {
            const current = prev[taskId] ?? initInlineEdit(task);
            const updated = { ...current, ...patch, saving: 'pending' as const };
            return { ...prev, [taskId]: updated };
        });

        // Debounce auto-save
        clearTimeout(debounceTimers.current[taskId]);
        debounceTimers.current[taskId] = setTimeout(async () => {
            // Read current state via functional update — do NOT call saveCallback inside the updater
            let snapshot: InlineEdit | undefined;
            setInlineEdits(prev => {
                snapshot = prev[taskId];
                if (!snapshot) return prev;
                return { ...prev, [taskId]: { ...snapshot, saving: 'saved' } };
            });

            // Call saveCallback outside the updater to avoid setState-in-render
            // Use a microtask so the state update above has been scheduled first
            await Promise.resolve();
            if (snapshot) {
                await saveCallback(snapshot);
            }

            // Reset to idle after 1.5s
            setTimeout(() => {
                setInlineEdits(prev => {
                    const current = prev[taskId];
                    if (!current) return prev;
                    return { ...prev, [taskId]: { ...current, saving: 'idle' } };
                });
            }, 1500);
        }, 1500);
    }, []);


    const handleCreateClick = (date: string) => {
        setCreatingForDate(date);
        setStatusPickerTaskId(null);
        setCollapsedDays((prev) => ({ ...prev, [date]: false }));
        setCreateForm({ description: '', startDate: date, startHour: '09:00', endDate: date, endHour: '10:00' });
    };

    const handleCancelCreate = () => {
        setCreatingForDate(null);
    };

    const handleCreateTask = async () => {
        if (!createForm.description.trim() || !createForm.startHour || !createForm.endHour) return;
        const startISO = toISO(createForm.startDate, createForm.startHour);
        const endISO = toISO(createForm.endDate, createForm.endHour);
        const duration = new Date(endISO).getTime() - new Date(startISO).getTime();
        await onCreateTask({ description: createForm.description, start_time: startISO, end_time: endISO, duration });
        setCreatingForDate(null);
        setCreateForm({ description: '', startDate: '', startHour: '09:00', endDate: '', endHour: '10:00' });
    };

    const handleStatusChange = async (taskId: number, newStatus: TaskStatus) => {
        setStatusPickerTaskId(null);
        await onUpdateTask(taskId, { status: newStatus });
    };

    const handleDuplicateTask = async (e: React.MouseEvent, task: Task) => {
        e.stopPropagation();

        // Use original task times
        const startISO = task.start_time;
        let endISO = task.end_time;
        const duration = task.duration ?? 3600000;

        // If original has no end time (running), calculate one to satisfy API requirements
        if (!endISO) {
            endISO = new Date(new Date(startISO).getTime() + duration).toISOString();
        }

        const success = await onCreateTask({
            description: task.description,
            start_time: startISO,
            end_time: endISO,
            duration: duration,
        });

        if (success !== false) { // Handle void return or true
            showToast({ message: "Task duplicated", variant: "success", duration: 2000 });
        } else {
            showToast({ message: "Failed to duplicate task", variant: "danger", duration: 3000 });
        }
    };

    // IDs of tasks pending deletion (shown faded, not yet deleted from DB)
    const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<number>>(new Set());

    const handleDeleteClick = (task: Task) => {
        const DELAY = 5000;
        setPendingDeleteIds(prev => new Set(prev).add(task.id));

        const toastId = showToast({
            message: `"${task.description}" will be deleted`,
            variant: 'danger',
            duration: DELAY,
            action: {
                label: 'Undo',
                onClick: () => {
                    clearTimeout(deleteTimers.current[task.id]);
                    delete deleteTimers.current[task.id];
                    setPendingDeleteIds(prev => {
                        const next = new Set(prev);
                        next.delete(task.id);
                        return next;
                    });
                },
            },
        });

        deleteTimers.current[task.id] = setTimeout(() => {
            delete deleteTimers.current[task.id];
            dismissToast(toastId);
            setPendingDeleteIds(prev => {
                const next = new Set(prev);
                next.delete(task.id);
                return next;
            });
            onDeleteTask(task.id);
        }, DELAY);
    };

    const effectiveStatus = (task: Task): TaskStatus => task.status ?? 'done';

    return (
        <div className="card animate-slide-up">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-primary-500 to-accent-500 bg-clip-text text-transparent">
                    Daily Summary
                </h2>
                <div className="text-right">
                    <div className="text-sm text-gray-600 dark:text-gray-400">Total This Week</div>
                    <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                        {formatMinutes(totalWeekMinutes)}
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                {summaries.map((summary) => {
                    const date = new Date(summary.date);
                    const hasTasks = summary.tasks.length > 0;
                    const isCreating = creatingForDate === summary.date;
                    const isCollapsed = !!collapsedDays[summary.date];
                    const isToday = summary.date.startsWith(todayStr);

                    return (
                        <div
                            key={summary.date}
                            className={`transition-all duration-200 ${isCollapsed
                                ? 'bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4'
                                : 'border-l-4 border-primary-500 pl-4'
                                }`}
                        >
                            {/* Day header */}
                            <div
                                className={`flex items-center justify-between cursor-pointer select-none ${isCollapsed ? '' : 'mb-3'}`}
                                onClick={() => toggleDay(summary.date)}
                            >
                                <div className="flex items-center gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className={`h-4 w-4 text-gray-400 dark:text-gray-500 transition-transform duration-200 ${isCollapsed ? '-rotate-90' : ''}`}
                                        viewBox="0 0 20 20"
                                        fill="currentColor"
                                    >
                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                    <div>
                                        <h3 className={`font-bold text-lg ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-gray-100'}`}>
                                            {getDayName(date)}
                                            {isToday && (
                                                <span className="ml-2 text-xs font-semibold uppercase tracking-wide bg-primary-100 dark:bg-primary-900/40 text-primary-600 dark:text-primary-400 px-2 py-0.5 rounded-full">
                                                    Today
                                                </span>
                                            )}
                                        </h3>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">{getMonthDay(date)}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xl font-bold text-primary-600 dark:text-primary-400">
                                        {summary.totalMinutes > 0 ? formatMinutes(summary.totalMinutes) : '0m'}
                                    </div>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleCreateClick(summary.date); }}
                                        className="btn bg-primary-500 hover:bg-primary-600 text-white text-sm px-3 py-1 flex items-center gap-1"
                                        title="Add task"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Add
                                    </button>
                                </div>
                            </div>

                            {/* Collapsible content */}
                            {!isCollapsed && (
                                <div>
                                    {/* Create Task Form */}
                                    {isCreating && (
                                        <div className="mb-3 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-lg border-2 border-primary-300 dark:border-primary-700">
                                            <div className="space-y-3">
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
                                                    <input
                                                        type="text"
                                                        value={createForm.description}
                                                        onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                                        className="input text-sm"
                                                        placeholder="Task description"
                                                        autoFocus
                                                        onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTask(); if (e.key === 'Escape') handleCancelCreate(); }}
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <TimePicker
                                                        label="Start Time *"
                                                        value={createForm.startHour}
                                                        onChange={(v) => setCreateForm({ ...createForm, startHour: v })}
                                                        dateLabel={formatDateLabel(createForm.startDate)}
                                                        id="create-start-time"
                                                    />
                                                    <TimePicker
                                                        label="End Time *"
                                                        value={createForm.endHour}
                                                        onChange={(v) => setCreateForm({ ...createForm, endHour: v })}
                                                        dateLabel={formatDateLabel(createForm.endDate)}
                                                        id="create-end-time"
                                                    />
                                                </div>
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={handleCancelCreate} className="btn btn-secondary text-sm px-3 py-1">Cancel</button>
                                                    <button
                                                        onClick={handleCreateTask}
                                                        disabled={!createForm.description.trim() || !createForm.startHour || !createForm.endHour}
                                                        className="btn bg-primary-500 hover:bg-primary-600 text-white text-sm px-3 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        Create Task
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {hasTasks ? (
                                        <div className="space-y-2">
                                            {summary.tasks.map((task) => {
                                                const edit = getOrInitEdit(task);
                                                const isPending = pendingDeleteIds.has(task.id);

                                                const saveEdit = async (e: InlineEdit) => {
                                                    const startISO = toISO(e.startDate, e.startHour);
                                                    const updates: Partial<Task> = {
                                                        description: e.description,
                                                        start_time: startISO,
                                                    };
                                                    if (e.endHour) {
                                                        const endISO = toISO(e.endDate, e.endHour);
                                                        updates.end_time = endISO;
                                                        updates.duration = new Date(endISO).getTime() - new Date(startISO).getTime();
                                                    }
                                                    await onUpdateTask(task.id, updates);
                                                };

                                                const patchEdit = (patch: Partial<InlineEdit>) => {
                                                    updateInlineEdit(task.id, patch, task, saveEdit);
                                                };

                                                // Update local state ONLY (no auto-save) for time editing
                                                const patchEditLocal = (patch: Partial<InlineEdit>) => {
                                                    setInlineEdits(prev => {
                                                        const current = prev[task.id] ?? initInlineEdit(task);
                                                        // Ensure 'saving' stays idle or whatever it was, don't trigger pending
                                                        return { ...prev, [task.id]: { ...current, ...patch } };
                                                    });
                                                };

                                                const handleManualSave = async () => {
                                                    const current = inlineEdits[task.id];
                                                    if (current) {
                                                        setInlineEdits(prev => ({ ...prev, [task.id]: { ...current, saving: 'pending' } }));
                                                        await saveEdit(current);
                                                        setInlineEdits(prev => ({ ...prev, [task.id]: { ...current, saving: 'saved', showTimePicker: false } }));
                                                        setTimeout(() => {
                                                            setInlineEdits(prev => {
                                                                const c = prev[task.id];
                                                                return c ? { ...prev, [task.id]: { ...c, saving: 'idle' } } : prev;
                                                            });
                                                        }, 1500);
                                                    }
                                                };

                                                const toggleTimePicker = () => {
                                                    setInlineEdits(prev => {
                                                        const current = prev[task.id];
                                                        const fresh = initInlineEdit(task);

                                                        // If currently open, simplify close
                                                        if (current?.showTimePicker) {
                                                            return { ...prev, [task.id]: { ...current, showTimePicker: false } };
                                                        }

                                                        // If opening, RESET time fields from source 'task' (discard dirty edits)
                                                        // preserve description state in case it's being edited/saved
                                                        return {
                                                            ...prev,
                                                            [task.id]: {
                                                                ...fresh, // Start fresh from DB
                                                                description: current?.description ?? fresh.description, // Keep current description if typing
                                                                saving: current?.saving ?? 'idle',
                                                                showTimePicker: true
                                                            }
                                                        };
                                                    });
                                                };

                                                return (
                                                    <div
                                                        key={task.id}
                                                        className={`group p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all hover:shadow-md ${isPending ? 'opacity-40 pointer-events-none' : ''}`}
                                                    >
                                                        <div className="flex items-start justify-between gap-3">
                                                            {/* Left: description + time (inline editable) */}
                                                            <div className="flex-1 min-w-0">
                                                                {/* Description — inline edit (auto-save) */}
                                                                <div className="flex items-center gap-1.5">
                                                                    <input
                                                                        type="text"
                                                                        value={edit.description}
                                                                        onChange={(e) => patchEdit({ description: e.target.value })}
                                                                        className="inline-edit text-sm font-medium flex-1 min-w-0"
                                                                        title="Click to edit description"
                                                                    />
                                                                    {/* Save indicator */}
                                                                    {edit.saving === 'pending' && (
                                                                        <span className="text-gray-300 dark:text-gray-600 text-xs animate-pulse flex-shrink-0">●</span>
                                                                    )}
                                                                    {edit.saving === 'saved' && (
                                                                        <span className="text-green-500 text-xs flex-shrink-0">✓</span>
                                                                    )}
                                                                </div>

                                                                {/* Time row */}
                                                                <div className="flex items-center gap-3 mt-1">
                                                                    {/* Time display — click to open TimePicker */}
                                                                    <button
                                                                        className="font-mono text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                                                        onClick={toggleTimePicker}
                                                                        title="Click to edit time"
                                                                    >
                                                                        {formatTime(task.start_time, task.end_time)}
                                                                    </button>
                                                                    <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">
                                                                        {formatDuration(task.duration)}
                                                                    </span>
                                                                </div>

                                                                {/* Inline TimePicker — manual update */}
                                                                {edit.showTimePicker && (
                                                                    <div
                                                                        ref={(el) => { timePickerRefs.current[task.id] = el; }}
                                                                        className="mt-2 flex flex-wrap gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-xl z-10 relative"
                                                                    >
                                                                        <TimePicker
                                                                            label="Start"
                                                                            value={edit.startHour}
                                                                            onChange={(v) => patchEditLocal({ startHour: v })}
                                                                            dateLabel={formatDateLabel(edit.startDate)}
                                                                            id={`inline-start-${task.id}`}
                                                                        />
                                                                        <TimePicker
                                                                            label="End"
                                                                            value={edit.endHour}
                                                                            onChange={(v) => patchEditLocal({ endHour: v })}
                                                                            dateLabel={formatDateLabel(edit.endDate)}
                                                                            id={`inline-end-${task.id}`}
                                                                        />

                                                                        <div className="w-full flex justify-end mt-1">
                                                                            <button
                                                                                onClick={handleManualSave}
                                                                                className="px-3 py-1 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold rounded shadow-sm transition-colors"
                                                                            >
                                                                                Update
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Right: status + actions */}
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                {/* Status badge */}
                                                                <div className="relative">
                                                                    <button
                                                                        onClick={() => setStatusPickerTaskId(
                                                                            statusPickerTaskId === task.id ? null : task.id
                                                                        )}
                                                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${STATUS_CONFIG[effectiveStatus(task)].badgeClasses}`}
                                                                        title="Change status"
                                                                    >
                                                                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_CONFIG[effectiveStatus(task)].dot}`} />
                                                                        {STATUS_CONFIG[effectiveStatus(task)].label}
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 opacity-60" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>

                                                                    {statusPickerTaskId === task.id && (
                                                                        <div className="absolute right-0 top-full mt-1 z-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden min-w-[140px]">
                                                                            {(Object.keys(STATUS_CONFIG) as TaskStatus[]).map((s) => (
                                                                                <button
                                                                                    key={s}
                                                                                    onClick={() => handleStatusChange(task.id, s)}
                                                                                    className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-left transition-colors ${effectiveStatus(task) === s
                                                                                        ? STATUS_CONFIG[s].badgeClasses
                                                                                        : 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                                                                                        }`}
                                                                                >
                                                                                    <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                                                                                    {STATUS_CONFIG[s].label}
                                                                                    {effectiveStatus(task) === s && (
                                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 ml-auto" viewBox="0 0 20 20" fill="currentColor">
                                                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                                        </svg>
                                                                                    )}
                                                                                </button>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                {/* Duplicate / Delete — visible on hover */}
                                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={(e) => handleDuplicateTask(e, task)}
                                                                        className="p-2 text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                                                                        aria-label="Duplicate task"
                                                                        title="Duplicate task"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                                                                            <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
                                                                        </svg>
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDeleteClick(task)}
                                                                        className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                                        aria-label="Delete task"
                                                                        title="Delete task"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : !isCreating ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-500 italic">
                                            No tasks tracked this day
                                        </p>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
