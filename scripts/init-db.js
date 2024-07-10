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
      duration INTEGER
    );
  `);

  // insert sample data to Packages
  await db.run(`
    INSERT INTO Packages (name, description, origin, destination, price, duration, family_friendly)
    VALUES 
    ('Family Fun Europe', 'Explore Europe with your family in this 10-day tour covering France, Germany, and Italy.', 'Singapore', 'Europe', 5000.00, 10, 1),
    ('Romantic Paris', 'Enjoy a romantic 7-day stay in Paris, including visits to the Eiffel Tower and Seine River cruise.', 'Singapore', 'Paris', 3500.00, 7, 0),
    ('Adventure Australia', 'Experience the thrill of Australia with this 8-day adventure tour including scuba diving and hiking.', 'Singapore', 'Australia', 4200.00, 8, 0),
    ('Discover Japan', 'Experience the culture and beauty of Japan in this 7-day tour.', 'Singapore', 'Japan', 3800.00, 7, 1),
    ('Safari Africa', 'Enjoy a 10-day safari adventure in Africa, witnessing the majestic wildlife.', 'Singapore', 'Africa', 6000.00, 10, 1),
    ('Historic Egypt', 'Explore the ancient history of Egypt in this 5-day tour.', 'Singapore', 'Egypt', 3200.00, 5, 0);
  `);

  // insert sample data to Flights
  await db.run(`
    INSERT INTO Flights (origin, destination, price, airline, duration)
    VALUES 
    ('Singapore', 'London', 800.00, 'Singapore Airlines', 13),
    ('Singapore', 'Paris', 750.00, 'Air France', 13),
    ('Singapore', 'New York', 1000.00, 'Singapore Airlines', 18),
    ('Singapore', 'Tokyo', 700.00, 'Japan Airlines', 7),
    ('Singapore', 'Sydney', 850.00, 'Qantas', 8),
    ('Singapore', 'Cairo', 900.00, 'EgyptAir', 11);
  `);

  console.log('Database initialized with example data');
})();
