'use client';

interface TimePickerProps {
    value: string;          // "HH:MM"
    onChange: (value: string) => void;
    label?: string;
    dateLabel?: string;     // e.g. "Wed, Feb 18"
    id?: string;
}

export default function TimePicker({ value, onChange, label, dateLabel, id }: TimePickerProps) {
    return (
        <div className="flex flex-col gap-1" id={id}>
            {label && (
                <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">
                    {label}
                </label>
            )}
            <div className="flex items-center gap-2">
                {/* Static date badge */}
                {dateLabel && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 whitespace-nowrap">
                        {dateLabel}
                    </span>
                )}

                {/* Native time input — allows direct keyboard entry */}
                <input
                    type="time"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="
                        px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600
                        bg-white dark:bg-gray-800
                        text-gray-900 dark:text-gray-100
                        font-mono text-sm font-semibold
                        focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        transition-all cursor-text
                    "
                />
            </div>
        </div>
    );
}
