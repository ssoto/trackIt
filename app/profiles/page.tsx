'use client';

import { useState, useEffect } from 'react';
import type { Profile } from '@/lib/types';
import { getActiveProfileId, clearActiveProfileId } from '@/lib/profileUtils';

export default function ProfilesPage() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [newProfileName, setNewProfileName] = useState('');
    const [createError, setCreateError] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingName, setEditingName] = useState('');
    const [editError, setEditError] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            const res = await fetch('/api/profiles');
            const data = await res.json();
            setProfiles(data.profiles || []);
        } catch (err) {
            console.error('Error loading profiles:', err);
        }
    };

    const handleCreate = async () => {
        setCreateError(null);
        const name = newProfileName.trim();
        if (!name) {
            setCreateError('El nombre no puede estar vacío.');
            return;
        }
        const res = await fetch('/api/profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        const data = await res.json();
        if (!res.ok) {
            setCreateError(data.error || 'Error al crear el perfil.');
            return;
        }
        setNewProfileName('');
        await loadProfiles();
    };

    const handleEditStart = (profile: Profile) => {
        setEditingId(profile.id);
        setEditingName(profile.name);
        setEditError(null);
    };

    const handleEditSave = async (id: number) => {
        setEditError(null);
        const name = editingName.trim();
        if (!name) {
            setEditError('El nombre no puede estar vacío.');
            return;
        }
        const res = await fetch('/api/profiles', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, name }),
        });
        const data = await res.json();
        if (!res.ok) {
            setEditError(data.error || 'Error al actualizar el perfil.');
            return;
        }
        setEditingId(null);
        setEditingName('');
        await loadProfiles();
    };

    const handleEditCancel = () => {
        setEditingId(null);
        setEditingName('');
        setEditError(null);
    };

    const handleDeleteRequest = (profile: Profile) => {
        setDeleteError(null);
        if (profiles.length <= 1) {
            setDeleteError('No puedes eliminar el único perfil existente.');
            return;
        }
        setConfirmDeleteId(profile.id);
    };

    const handleDeleteConfirm = async (id: number) => {
        setDeleteError(null);
        const res = await fetch(`/api/profiles?id=${id}`, { method: 'DELETE' });
        const data = await res.json();
        if (!res.ok) {
            setDeleteError(data.error || 'Error al eliminar el perfil.');
            setConfirmDeleteId(null);
            return;
        }
        // If deleted profile was the active one, clear localStorage
        const activeId = getActiveProfileId();
        if (activeId === id) {
            clearActiveProfileId();
        }
        setConfirmDeleteId(null);
        await loadProfiles();
    };

    const handleDeleteCancel = () => {
        setConfirmDeleteId(null);
        setDeleteError(null);
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Back link */}
                <a
                    href="/"
                    className="inline-flex items-center gap-1.5 text-sm text-primary-600 dark:text-primary-400 hover:underline mb-6"
                >
                    ← Volver al inicio
                </a>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8">
                    Gestionar perfiles
                </h1>

                {/* Create new profile form */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 p-6 mb-6">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                        Crear nuevo perfil
                    </h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            value={newProfileName}
                            onChange={e => setNewProfileName(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleCreate()}
                            placeholder="Nombre del perfil"
                            maxLength={16}
                            className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all placeholder-gray-400 dark:placeholder-gray-600 text-gray-900 dark:text-gray-100"
                        />
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
                        >
                            Crear
                        </button>
                    </div>
                    {createError && (
                        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{createError}</p>
                    )}
                </div>

                {/* Profile list */}
                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-md border border-gray-200 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-800">
                    {profiles.length === 0 ? (
                        <div className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                            No hay perfiles. Crea uno arriba.
                        </div>
                    ) : (
                        profiles.map(profile => (
                            <div key={profile.id} className="px-6 py-4">
                                {editingId === profile.id ? (
                                    /* Inline edit mode */
                                    <div className="space-y-2">
                                        <div className="flex gap-3 items-center">
                                            <input
                                                type="text"
                                                value={editingName}
                                                onChange={e => setEditingName(e.target.value)}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') handleEditSave(profile.id);
                                                    if (e.key === 'Escape') handleEditCancel();
                                                }}
                                                maxLength={16}
                                                autoFocus
                                                className="flex-1 px-3 py-1.5 text-sm bg-gray-50 dark:bg-gray-800 border border-primary-300 dark:border-primary-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-900 dark:text-gray-100"
                                            />
                                            <button
                                                onClick={() => handleEditSave(profile.id)}
                                                className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Guardar
                                            </button>
                                            <button
                                                onClick={handleEditCancel}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                        {editError && (
                                            <p className="text-sm text-red-600 dark:text-red-400">{editError}</p>
                                        )}
                                    </div>
                                ) : confirmDeleteId === profile.id ? (
                                    /* Delete confirmation */
                                    <div className="space-y-2">
                                        <p className="text-sm text-gray-700 dark:text-gray-300">
                                            ¿Eliminar <strong className="capitalize">&apos;{profile.name}&apos;</strong> y todos sus datos? Esta acción no se puede deshacer.
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDeleteConfirm(profile.id)}
                                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Confirmar
                                            </button>
                                            <button
                                                onClick={handleDeleteCancel}
                                                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                                            >
                                                Cancelar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* Normal view */
                                    <div className="flex items-center gap-4">
                                        <span className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                                            {profile.name.charAt(0)}
                                        </span>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-gray-900 dark:text-gray-100 capitalize truncate">
                                                {profile.name}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                                Creado: {new Date(profile.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="flex gap-2 flex-shrink-0">
                                            <button
                                                onClick={() => handleEditStart(profile)}
                                                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                            >
                                                Editar
                                            </button>
                                            <button
                                                onClick={() => handleDeleteRequest(profile)}
                                                className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                Eliminar
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>

                {deleteError && (
                    <p className="mt-3 text-sm text-red-600 dark:text-red-400">{deleteError}</p>
                )}
            </div>
        </main>
    );
}
