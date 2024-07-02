import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function openDB() {
  const dbPath = path.resolve(__dirname, '../travel_packages.db');

  return open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
}

export async function getPackageOptions() {
  const db = await openDB();
  const packages = await db.all('SELECT * FROM packages');
  return packages;
}
