-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policy to allow the anon role to insert into the users table
CREATE POLICY insert_users_policy 
ON users 
FOR INSERT 
TO anon
WITH CHECK (true);

-- Create policy to allow authenticated users to read their own data
CREATE POLICY read_users_policy 
ON users 
FOR SELECT 
TO authenticated
USING (id = auth.uid() OR auth.role() = 'anon');

-- Grant permissions to the anon role
GRANT SELECT, INSERT ON TABLE users TO anon;

-- Grant permissions to the authenticated role
GRANT SELECT, UPDATE ON TABLE users TO authenticated; 