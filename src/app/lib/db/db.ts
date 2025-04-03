'use server';

import { sql } from '@vercel/postgres';
import { hash } from 'bcrypt';
import { initCreditsTables } from './creditsDb';

export const pool = sql;

export async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        image TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Check if there's a demo user already
    const demoResult = await sql`
      SELECT * FROM users WHERE email = 'demo@example.com'
    `;

    // Create a demo user if it doesn't exist
    if (demoResult.rowCount === 0) {
      const hashedPassword = await hash('demouser', 10);
      await sql`
        INSERT INTO users (id, name, email, password)
        VALUES ('demo-user', 'Demo User', 'demo@example.com', ${hashedPassword})
      `;
      console.log('Demo user created');
    }

    // Initialize credits system tables
    await initCreditsTables();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
} 