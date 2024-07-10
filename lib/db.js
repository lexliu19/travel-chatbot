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
  const packages = await db.all('SELECT * FROM Packages');
  return packages;
}

export async function getPackageNames() {
  const db = await openDB();
  const packageNames = await db.all('SELECT name FROM Packages');
  return packageNames;
}

export async function getFlightPrice(origin, destination) {
  const db = await openDB();
  const flight = await db.get(
    'SELECT price FROM Flights WHERE origin = ? AND destination = ?',
    [origin, destination]
  );
  return flight;
}
