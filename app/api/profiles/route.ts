import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import type { Profile } from '@/lib/types';

// GET /api/profiles - Return all profiles ordered by created_at ASC
export async function GET() {
    try {
        const db = getDb();
        const stmt = db.prepare('SELECT * FROM profiles ORDER BY created_at ASC');
        const profiles = stmt.all() as Profile[];
        return NextResponse.json({ profiles });
    } catch (error) {
        console.error('Error fetching profiles:', error);
        return NextResponse.json({ error: 'Failed to fetch profiles' }, { status: 500 });
    }
}

// POST /api/profiles - Create a new profile
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name || String(name).trim() === '') {
            return NextResponse.json({ error: 'Profile name is required' }, { status: 400 });
        }

        const trimmed = String(name).trim().toLowerCase();

        if (trimmed.length > 16) {
            return NextResponse.json({ error: 'Profile name must be 16 characters or fewer' }, { status: 400 });
        }

        const db = getDb();

        try {
            const stmt = db.prepare('INSERT INTO profiles (name) VALUES (?)');
            const result = stmt.run(trimmed);
            const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(result.lastInsertRowid) as Profile;
            return NextResponse.json({ profile }, { status: 201 });
        } catch (e: any) {
            if (e.message?.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ error: 'A profile with that name already exists' }, { status: 409 });
            }
            throw e;
        }
    } catch (error) {
        if (error instanceof NextResponse) throw error;
        console.error('Error creating profile:', error);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }
}

// PATCH /api/profiles - Rename a profile
export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name } = body;

        if (!id) {
            return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
        }

        if (!name || String(name).trim() === '') {
            return NextResponse.json({ error: 'Profile name is required' }, { status: 400 });
        }

        const trimmed = String(name).trim().toLowerCase();

        if (trimmed.length > 16) {
            return NextResponse.json({ error: 'Profile name must be 16 characters or fewer' }, { status: 400 });
        }

        const db = getDb();

        const existing = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as Profile | undefined;
        if (!existing) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        try {
            db.prepare('UPDATE profiles SET name = ? WHERE id = ?').run(trimmed, id);
            const profile = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as Profile;
            return NextResponse.json({ profile });
        } catch (e: any) {
            if (e.message?.includes('UNIQUE constraint failed')) {
                return NextResponse.json({ error: 'A profile with that name already exists' }, { status: 409 });
            }
            throw e;
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
    }
}

// DELETE /api/profiles?id=<n> - Delete a profile and all its tasks
export async function DELETE(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const idParam = searchParams.get('id');

        if (!idParam) {
            return NextResponse.json({ error: 'Profile ID is required' }, { status: 400 });
        }

        const id = parseInt(idParam, 10);
        if (isNaN(id)) {
            return NextResponse.json({ error: 'Invalid profile ID' }, { status: 400 });
        }

        const db = getDb();

        const existing = db.prepare('SELECT * FROM profiles WHERE id = ?').get(id) as Profile | undefined;
        if (!existing) {
            return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
        }

        const profileCount = (db.prepare('SELECT COUNT(*) as count FROM profiles').get() as { count: number }).count;
        if (profileCount <= 1) {
            return NextResponse.json({ error: 'Cannot delete the only remaining profile' }, { status: 400 });
        }

        db.transaction(() => {
            db.prepare('DELETE FROM tasks WHERE profile_id = ?').run(id);
            db.prepare('DELETE FROM profiles WHERE id = ?').run(id);
        })();

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting profile:', error);
        return NextResponse.json({ error: 'Failed to delete profile' }, { status: 500 });
    }
}
