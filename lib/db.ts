import Database from 'better-sqlite3';
import { readFileSync } from 'fs';
import { join } from 'path';

const dbPath = join(process.cwd(), 'database', 'trackit.db');
let db: Database.Database | null = null;

export function getDb(): Database.Database {
    if (!db) {
        db = new Database(dbPath);
        db.pragma('journal_mode = WAL');

        // Initialize schema (CREATE TABLE IF NOT EXISTS statements)
        const schema = readFileSync(join(process.cwd(), 'database', 'schema.sql'), 'utf-8');

        // Split on the migration comment so we can handle ALTER TABLE separately
        const [createPart, ...migrationParts] = schema.split('-- Migration:');
        db.exec(createPart ?? '');

        // Run each migration statement individually, ignoring "duplicate column" errors
        for (const part of migrationParts) {
            const sql = '-- Migration:' + part;
            try {
                db.exec(sql);
            } catch (e: any) {
                if (!e.message?.includes('duplicate column')) throw e;
            }
        }

        // Migration: add profile_id column to tasks (idempotent)
        try {
            db.exec('ALTER TABLE tasks ADD COLUMN profile_id INTEGER');
        } catch (e: any) {
            if (!e.message?.includes('duplicate column')) throw e;
        }

        // Migration: seed default profile and assign existing tasks (idempotent)
        db.transaction(() => {
            db!.exec(`INSERT OR IGNORE INTO profiles (name) VALUES ('default')`);
            db!.exec(`
                UPDATE tasks
                SET profile_id = (SELECT id FROM profiles WHERE name = 'default')
                WHERE profile_id IS NULL
            `);
        })();
    }

    return db;
}

export function closeDb() {
    if (db) {
        db.close();
        db = null;
    }
}

// Ensure database is closed on process exit
process.on('exit', closeDb);
process.on('SIGINT', () => {
    closeDb();
    process.exit(0);
});
