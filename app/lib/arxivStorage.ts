import { ArxivEntry } from '../types/arxiv';
import sqlite3 from 'sqlite3';

// Use environment variable for database path, defaulting to ./data/arxiv.db
const DB_PATH = process.env.ARXIV_DB_PATH || './data/arxiv.db';

// Initialize database connection
const db = new sqlite3.Database(DB_PATH, (err) => {
    if (err) {
        console.error('Error opening database:', err);
    } else {
        // Create table if it doesn't exist
        db.run(`CREATE TABLE IF NOT EXISTS arxiv_entries (
            id TEXT PRIMARY KEY,
            title TEXT,
            abstract TEXT,
            published TEXT,
            authors TEXT,
            link TEXT,
            doi TEXT,
            categories TEXT
        )`);
    }
});

export async function saveData(entries: ArxivEntry[]): Promise<number> {
    return new Promise((resolve, reject) => {
        const stmt = db.prepare(`
            INSERT OR REPLACE INTO arxiv_entries 
            (id, title, abstract, published, authors, link, doi, categories)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        let savedCount = 0;
        
        // Use transaction for better performance
        db.serialize(() => {
            db.run('BEGIN TRANSACTION');
            
            entries.forEach((entry) => {
                stmt.run(
                    entry.id,
                    entry.title,
                    entry.abstract,
                    entry.published,
                    JSON.stringify(entry.authors),
                    entry.link,
                    entry.doi,
                    JSON.stringify(entry.categories),
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (err: any) => {
                        if (err) {
                            console.error('Error saving entry:', err);
                        } else {
                            savedCount++;
                        }
                    }
                );
            });

            stmt.finalize();
            
            db.run('COMMIT', (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(savedCount);
                }
            });
        });
    });
}

export function closeDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
        db.close((err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
} 