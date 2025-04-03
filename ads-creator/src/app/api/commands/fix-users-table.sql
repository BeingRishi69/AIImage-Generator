-- Drop the existing users table (if it exists)
DROP TABLE IF EXISTS users CASCADE;

-- Create the users table with snake_case column names
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create an index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Check the column names
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users';

-- Create a test user using the raw SQL approach
INSERT INTO users (id, name, email, password, image, created_at)
VALUES ('test-user', 'Test User', 'test@example.com', 'hashed_password', 'https://example.com/image.jpg', NOW()); 