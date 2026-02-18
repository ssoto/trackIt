'use client';

interface ProgressRingProps {
    minutes: number;
    goal?: number; // default 480 (8h)
    size?: number; // default 52
    invertColors?: boolean; // true when rendered on a dark/colored background
}

export default function ProgressRing({ minutes, goal = 480, size = 52, invertColors = false }: ProgressRingProps) {
    const strokeWidth = 4;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const pct = Math.min(minutes / goal, 1);
    const offset = circumference * (1 - pct);
    const done = pct >= 1;

    // Color: purple in progress → emerald when goal met; white when inverted
    const strokeColor = invertColors ? 'rgba(255,255,255,0.95)' : (done ? '#10B981' : '#7C3AED');
    const trackClass = invertColors ? undefined : 'text-gray-200 dark:text-gray-700';
    const trackColor = invertColors ? 'rgba(255,255,255,0.25)' : undefined;
    const labelColor = invertColors
        ? (minutes > 0 ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.5)')
        : (minutes > 0 ? strokeColor : '#9ca3af');

    const hours = Math.floor(minutes / 60);
    const mins = Math.floor(minutes % 60);
    const label = hours > 0 ? (mins > 0 ? `${hours}h${mins}m` : `${hours}h`) : `${mins}m`;

    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                {/* Track */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={trackColor ?? 'currentColor'}
                    strokeWidth={strokeWidth}
                    className={trackClass}
                />
                {/* Progress */}
                {minutes > 0 && (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{ transition: 'stroke-dashoffset 0.5s ease-in-out, stroke 0.3s ease' }}
                    />
                )}
            </svg>
            {/* Center label */}
            <span
                className="absolute text-center leading-none font-bold tabular-nums"
                style={{
                    fontSize: size < 48 ? '9px' : '10px',
                    color: labelColor,
                }}
            >
                {label}
            </span>
        </div>
    );
}
