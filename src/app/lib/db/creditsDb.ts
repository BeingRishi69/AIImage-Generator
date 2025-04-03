'use server';

import { pool } from './db';
import { sql } from '@vercel/postgres';
import { auth } from '@/app/lib/auth';

// Define transaction type
export interface Transaction {
  id: number;
  amount: number;
  type: 'add' | 'use' | 'purchase';
  description: string;
  price_usd?: number;
  reference_id?: string;
  created_at: Date;
}

// Initialize the credits tables if they don't exist
export async function initCreditsTables() {
  try {
    // Create user_credits table
    await sql`
      CREATE TABLE IF NOT EXISTS user_credits (
        user_id TEXT PRIMARY KEY,
        credits INTEGER NOT NULL DEFAULT 0,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

    // Create credit_transactions table
    await sql`
      CREATE TABLE IF NOT EXISTS credit_transactions (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        type TEXT NOT NULL,
        description TEXT,
        price_usd DECIMAL(10, 2),
        reference_id TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES user_credits(user_id)
      )
    `;

    console.log('Credits tables initialized successfully');
  } catch (error) {
    console.error('Error initializing credits tables:', error);
    throw error;
  }
}

// Add initial credits for new user
export async function addInitialCredits(userId: string, amount: number = 10): Promise<void> {
  try {
    // Check if user already has credits
    const userCredits = await sql`
      SELECT credits FROM user_credits WHERE user_id = ${userId}
    `;
    
    // If user already has a credits record, do nothing
    if (userCredits.rowCount > 0) {
      return;
    }
    
    // Add initial credits
    await addCredits(
      userId,
      amount,
      'Welcome bonus',
      'initial_credits'
    );
    
    console.log(`Added ${amount} initial credits to new user ${userId}`);
  } catch (error) {
    console.error('Error adding initial credits:', error);
    // Don't throw error to avoid blocking user creation/login
  }
}

// Get user's credit balance
export async function getUserCredits(userId: string): Promise<number> {
  try {
    // Check if user has a record in user_credits
    const result = await sql`
      SELECT credits FROM user_credits WHERE user_id = ${userId}
    `;

    // If user doesn't have a record, create one with default free credits
    if (result.rowCount === 0) {
      await addCredits(userId, 10, 'Welcome bonus', 'welcome_bonus');
      return 10; // Return the default free credits
    }

    return result.rows[0].credits;
  } catch (error) {
    console.error('Error getting user credits:', error);
    throw error;
  }
}

// Add credits to a user's account
export async function addCredits(
  userId: string,
  amount: number,
  reason: string,
  referenceId: string
): Promise<void> {
  try {
    // Begin transaction
    await sql`BEGIN`;

    // Try to update existing record
    const updateResult = await sql`
      UPDATE user_credits
      SET credits = credits + ${amount},
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
      RETURNING credits
    `;

    // If no record was updated, insert a new one
    if (updateResult.rowCount === 0) {
      await sql`
        INSERT INTO user_credits (user_id, credits)
        VALUES (${userId}, ${amount})
      `;
    }

    // Log the transaction
    await sql`
      INSERT INTO credit_transactions (user_id, amount, type, description, reference_id)
      VALUES (${userId}, ${amount}, 'add', ${reason}, ${referenceId})
    `;

    // Commit transaction
    await sql`COMMIT`;
  } catch (error) {
    // Rollback in case of error
    await sql`ROLLBACK`;
    console.error('Error adding credits:', error);
    throw error;
  }
}

// Use credits for a feature (e.g., generating an image)
export async function useCredits(
  userId: string,
  amount: number,
  description: string
): Promise<boolean> {
  try {
    // Begin transaction
    await sql`BEGIN`;

    // Check if user has enough credits
    const userCredits = await sql`
      SELECT credits FROM user_credits WHERE user_id = ${userId}
    `;

    if (userCredits.rowCount === 0 || userCredits.rows[0].credits < amount) {
      await sql`ROLLBACK`;
      return false; // Not enough credits
    }

    // Deduct credits
    await sql`
      UPDATE user_credits
      SET credits = credits - ${amount},
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ${userId}
    `;

    // Log the transaction
    await sql`
      INSERT INTO credit_transactions (user_id, amount, type, description)
      VALUES (${userId}, ${amount}, 'use', ${description})
    `;

    // Commit transaction
    await sql`COMMIT`;
    return true;
  } catch (error) {
    // Rollback in case of error
    await sql`ROLLBACK`;
    console.error('Error using credits:', error);
    throw error;
  }
}

// Log a transaction (for analytics or history)
export async function logTransaction(
  userId: string,
  amount: number,
  type: 'add' | 'use' | 'purchase',
  description: string,
  priceUsd?: number,
  referenceId?: string
): Promise<void> {
  try {
    await sql`
      INSERT INTO credit_transactions (
        user_id, 
        amount, 
        type, 
        description, 
        price_usd, 
        reference_id
      )
      VALUES (
        ${userId}, 
        ${amount}, 
        ${type}, 
        ${description}, 
        ${priceUsd || null}, 
        ${referenceId || null}
      )
    `;
  } catch (error) {
    console.error('Error logging transaction:', error);
    throw error;
  }
}

// Get a user's transaction history
export async function getUserTransactions(userId: string): Promise<Transaction[]> {
  try {
    const result = await sql<Transaction>`
      SELECT 
        id,
        amount,
        type,
        description,
        price_usd,
        reference_id,
        created_at
      FROM credit_transactions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50
    `;
    
    return result.rows;
  } catch (error) {
    console.error('Error getting user transactions:', error);
    throw error;
  }
} 