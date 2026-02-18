'use client';

import { useEffect, useState } from 'react';

export interface ToastOptions {
    id: string;
    message: string;
    variant?: 'danger' | 'success' | 'info';
    duration?: number; // ms, default 3500
    action?: {
        label: string;
        onClick: () => void;
    };
}

interface ToastItemProps extends ToastOptions {
    onDismiss: (id: string) => void;
}

function ToastItem({ id, message, variant = 'danger', duration = 3500, action, onDismiss }: ToastItemProps) {
    const [progress, setProgress] = useState(100);
    const [visible, setVisible] = useState(false);

    // Slide-in on mount
    useEffect(() => {
        requestAnimationFrame(() => setVisible(true));
    }, []);

    // Progress bar countdown
    useEffect(() => {
        const start = Date.now();
        const interval = setInterval(() => {
            const elapsed = Date.now() - start;
            const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
            setProgress(remaining);
            if (remaining === 0) {
                clearInterval(interval);
                handleDismiss();
            }
        }, 30);
        return () => clearInterval(interval);
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(() => onDismiss(id), 300); // wait for slide-out animation
    };

    const handleAction = () => {
        action?.onClick();
        handleDismiss();
    };

    const colors = {
        danger: { bg: 'bg-red-600', bar: 'bg-red-400', icon: '🗑️' },
        success: { bg: 'bg-green-600', bar: 'bg-green-400', icon: '✓' },
        info: { bg: 'bg-blue-600', bar: 'bg-blue-400', icon: 'ℹ' },
    };
    const c = colors[variant];

    return (
        <div
            className={`relative flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-white min-w-[260px] max-w-[360px] overflow-hidden transition-all duration-300 ${c.bg} ${visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
                }`}
        >
            <span className="text-lg select-none">{c.icon}</span>
            <p className="flex-1 text-sm font-medium leading-snug">{message}</p>
            {action && (
                <button
                    onClick={handleAction}
                    className="shrink-0 text-xs font-bold uppercase tracking-wide bg-white/20 hover:bg-white/30 px-2.5 py-1 rounded-lg transition-colors"
                >
                    {action.label}
                </button>
            )}
            <button
                onClick={handleDismiss}
                className="shrink-0 text-white/70 hover:text-white transition-colors text-lg leading-none"
                aria-label="Dismiss"
            >
                ×
            </button>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white/20">
                <div
                    className={`h-full ${c.bar} transition-none`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
}

// ── Hook to manage toasts ──────────────────────────────────────────────────

let _setToasts: React.Dispatch<React.SetStateAction<ToastOptions[]>> | null = null;

export function showToast(options: Omit<ToastOptions, 'id'>) {
    const id = Math.random().toString(36).slice(2);
    _setToasts?.((prev) => [...prev, { ...options, id }]);
    return id;
}

export function dismissToast(id: string) {
    _setToasts?.((prev) => prev.filter((t) => t.id !== id));
}

// ── Container — mount once in layout ──────────────────────────────────────

export function ToastContainer() {
    const [toasts, setToasts] = useState<ToastOptions[]>([]);
    _setToasts = setToasts;

    return (
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col gap-2 pointer-events-none">
            {toasts.map((t) => (
                <div key={t.id} className="pointer-events-auto">
                    <ToastItem {...t} onDismiss={(id) => setToasts((prev) => prev.filter((x) => x.id !== id))} />
                </div>
            ))}
        </div>
    );
}
