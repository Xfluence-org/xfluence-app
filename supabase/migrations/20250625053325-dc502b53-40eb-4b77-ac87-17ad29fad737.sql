
-- Add name column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;

-- Update the trigger function to handle the name field
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, user_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'user_type', 'Influencer')::public.user_type
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
