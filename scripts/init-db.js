import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import csv from 'csv-parser';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

(async () => {
  const dbPath = path.resolve(__dirname, '../travel_packages.db');

  const db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });

  // create Packages
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Packages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      description TEXT,
      origin TEXT,
      destination TEXT,
      price REAL,
      duration INTEGER,
      family_friendly BOOLEAN
    );
  `);

  // create Flights
  await db.exec(`
    CREATE TABLE IF NOT EXISTS Flights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      origin TEXT,
      destination TEXT,
      price REAL,
      airline TEXT,
      duration REAL
    );
  `);

  // insert data to Packages from CSV file
  const packagesCsvFilePath = path.resolve(
    __dirname,
    '../data/Packages_Dataset.csv'
  );
  const packages = [];

  fs.createReadStream(packagesCsvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      packages.push(row);
    })
    .on('end', async () => {
      for (const pkg of packages) {
        await db.run(
          `
          INSERT INTO Packages (name, description, origin, destination, price, duration, family_friendly)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
          [
            pkg.name,
            pkg.description,
            pkg.origin,
            pkg.destination,
            pkg.price,
            pkg.duration,
            pkg.family_friendly,
          ]
        );
      }
      console.log('Packages data inserted');
    });

  // insert data to Flights from CSV file
  const flightsCsvFilePath = path.resolve(
    __dirname,
    '../data/Flights_Dataset.csv'
  );
  const flights = [];

  fs.createReadStream(flightsCsvFilePath)
    .pipe(csv())
    .on('data', (row) => {
      flights.push(row);
    })
    .on('end', async () => {
      for (const flight of flights) {
        await db.run(
          `
          INSERT INTO Flights (origin, destination, price, airline, duration)
          VALUES (?, ?, ?, ?, ?)
        `,
          [
            flight.source_city,
            flight.destination_city,
            flight.price,
            flight.airline,
            flight.duration,
          ]
        );
      }
      console.log('Flights data inserted');
    });
})();
