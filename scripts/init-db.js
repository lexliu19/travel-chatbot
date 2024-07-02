import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const dbPath = path.resolve(__dirname, '../travel_packages.db');

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS packages (
      id INTEGER PRIMARY KEY,
      origin TEXT,
      destination TEXT,
      cost INTEGER,
      details TEXT
    );
  `);

  console.log('Database initialized');
})();
