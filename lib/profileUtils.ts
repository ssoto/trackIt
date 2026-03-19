const KEY = 'trackit:activeProfileId';

/** Returns the stored profile ID, or null if none is set. */
export function getActiveProfileId(): number | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const id = parseInt(raw, 10);
    return isNaN(id) ? null : id;
}

/** Persists the active profile ID to localStorage. */
export function setActiveProfileId(id: number): void {
    localStorage.setItem(KEY, String(id));
}

/** Removes the active profile ID from localStorage. */
export function clearActiveProfileId(): void {
    localStorage.removeItem(KEY);
}
