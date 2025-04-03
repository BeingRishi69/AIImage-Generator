-- Create a function to insert users that can be called by the anon role
CREATE OR REPLACE FUNCTION public.create_user(
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  user_password TEXT,
  user_image TEXT
) RETURNS json AS $$
DECLARE
  new_user json;
BEGIN
  INSERT INTO public.users (id, name, email, password, image, created_at)
  VALUES (user_id, user_name, user_email, user_password, user_image, now())
  RETURNING to_json(users.*) INTO new_user;
  
  RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function to the anon role
GRANT EXECUTE ON FUNCTION public.create_user TO anon; 