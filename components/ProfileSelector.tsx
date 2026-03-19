'use client';

import { useState, useEffect, useRef } from 'react';
import type { Profile } from '@/lib/types';
import { setActiveProfileId } from '@/lib/profileUtils';

interface ProfileSelectorProps {
    activeProfileId: number | null;
    onProfileSelected: (profile: Profile) => void;
}

export default function ProfileSelector({ activeProfileId, onProfileSelected }: ProfileSelectorProps) {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loadingProfiles, setLoadingProfiles] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setLoadingProfiles(true);
        fetch('/api/profiles')
            .then(res => res.json())
            .then(data => setProfiles(data.profiles || []))
            .catch(err => console.error('Error fetching profiles:', err))
            .finally(() => setLoadingProfiles(false));
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeProfile = profiles.find(p => p.id === activeProfileId) ?? null;
    const otherProfiles = profiles.filter(p => p.id !== activeProfileId);

    const handleSelect = (profile: Profile) => {
        setActiveProfileId(profile.id);
        onProfileSelected(profile);
        setDropdownOpen(false);
    };

    // Full-screen overlay for first visit (no active profile)
    if (activeProfileId === null) {
        return (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-sm w-full mx-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6 text-center">
                        Selecciona un perfil
                    </h2>
                    {loadingProfiles ? (
                        <div className="flex justify-center py-4">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                        </div>
                    ) : profiles.length === 0 ? (
                        <div className="text-center">
                            <p className="text-gray-500 dark:text-gray-400 mb-4">
                                No hay perfiles. Crea uno en la página de gestión.
                            </p>
                            <a
                                href="/profiles"
                                className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                            >
                                Gestionar perfiles →
                            </a>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {profiles.map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => handleSelect(profile)}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all text-left group"
                                >
                                    <span className="flex-shrink-0 w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm uppercase">
                                        {profile.name.charAt(0)}
                                    </span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100 capitalize">
                                        {profile.name}
                                    </span>
                                </button>
                            ))}
                            <div className="pt-2 text-center">
                                <a
                                    href="/profiles"
                                    className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium"
                                >
                                    Gestionar perfiles →
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Compact pill button for header when a profile is already active
    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setDropdownOpen(prev => !prev)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900/40 hover:bg-primary-200 dark:hover:bg-primary-900/60 border border-primary-200 dark:border-primary-700 text-primary-700 dark:text-primary-300 transition-all text-sm font-medium"
            >
                <span className="w-5 h-5 rounded-full bg-primary-600 text-white flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                    {activeProfile?.name.charAt(0) ?? '?'}
                </span>
                <span className="capitalize">{activeProfile?.name ?? '...'}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 opacity-60" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {otherProfiles.length > 0 && (
                        <>
                            <div className="px-3 py-1.5 text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">
                                Cambiar a
                            </div>
                            {otherProfiles.map(profile => (
                                <button
                                    key={profile.id}
                                    onClick={() => handleSelect(profile)}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-left transition-colors"
                                >
                                    <span className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center text-xs font-bold uppercase flex-shrink-0">
                                        {profile.name.charAt(0)}
                                    </span>
                                    <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">
                                        {profile.name}
                                    </span>
                                </button>
                            ))}
                            <div className="my-1 border-t border-gray-100 dark:border-gray-800" />
                        </>
                    )}
                    <a
                        href="/profiles"
                        className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 dark:text-primary-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                        onClick={() => setDropdownOpen(false)}
                    >
                        Gestionar perfiles →
                    </a>
                </div>
            )}
        </div>
    );
}
