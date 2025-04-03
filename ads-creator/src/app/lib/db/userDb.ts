'use server';

import bcrypt from 'bcryptjs';
import { supabase } from '../../lib/supabase';

// Define user type
export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  image?: string;
  created_at: string;
}

/**
 * Initialize the database tables if they don't exist
 * This is a no-op with Supabase as tables are created in the dashboard
 */
export async function initDb(): Promise<void> {
  // Tables are created in Supabase dashboard
  // No file-based initialization needed
}

/**
 * Get all users from the database
 */
export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('users')
    .select('*');
  
  if (error) {
    console.error('Error fetching users:', error);
    return [];
  }
  
  return data as User[];
}

/**
 * Find a user by email
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email.toLowerCase())
    .single();
  
  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }
  
  return data as User;
}

/**
 * Find a user by ID
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching user by ID:', error);
    return null;
  }
  
  return data as User;
}

/**
 * Create a new user
 */
export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
}): Promise<User> {
  try {
    // Check if user already exists
    const existingUser = await getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create user object
    const newUser = {
      id: `user-${Date.now()}`,
      name: userData.name,
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      image: `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`,
    };
    
    // Use the RPC function to insert the user
    const { data, error } = await supabase.rpc(
      'create_user',
      {
        user_id: newUser.id,
        user_name: newUser.name,
        user_email: newUser.email,
        user_password: newUser.password,
        user_image: newUser.image
      }
    );
    
    if (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
    
    return data as User;
  } catch (error) {
    console.error('Error in createUser:', error);
    throw error;
  }
}

/**
 * Verify user credentials
 */
export async function verifyCredentials(
  email: string,
  password: string
): Promise<Omit<User, 'password'> | null> {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  // Verify password
  const passwordMatch = await bcrypt.compare(password, user.password);
  
  if (passwordMatch) {
    // Return user without password
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
  
  return null;
}

/**
 * Add initial user if the database is empty (for demo purposes)
 */
export async function seedInitialUser(): Promise<void> {
  try {
    const users = await getUsers();
  
    if (users.length === 0) {
      await createUser({
        name: 'Demo User',
        email: 'user@example.com',
        password: 'password123'
      });
      console.log('Initial demo user created');
    }
  } catch (error) {
    console.error('Error seeding initial user:', error);
  }
} 