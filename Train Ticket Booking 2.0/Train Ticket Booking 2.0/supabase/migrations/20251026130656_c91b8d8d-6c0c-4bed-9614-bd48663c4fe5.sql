-- Create enum for train classes
CREATE TYPE public.train_class AS ENUM ('AC_1', 'AC_2', 'AC_3', 'SLEEPER', 'GENERAL');

-- Create enum for booking status
CREATE TYPE public.booking_status AS ENUM ('CONFIRMED', 'CANCELLED', 'PENDING');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create trains table
CREATE TABLE public.trains (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  train_number TEXT NOT NULL UNIQUE,
  train_name TEXT NOT NULL,
  source_station TEXT NOT NULL,
  destination_station TEXT NOT NULL,
  departure_time TIME NOT NULL,
  arrival_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Create bookings table
CREATE TABLE public.bookings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pnr_number TEXT NOT NULL UNIQUE,
  train_id UUID NOT NULL REFERENCES public.trains(id) ON DELETE RESTRICT,
  passenger_name TEXT NOT NULL,
  passenger_age INTEGER NOT NULL,
  passenger_gender TEXT NOT NULL,
  from_station TEXT NOT NULL,
  to_station TEXT NOT NULL,
  journey_date DATE NOT NULL,
  class_type train_class NOT NULL,
  seat_number TEXT,
  booking_status booking_status NOT NULL DEFAULT 'CONFIRMED',
  booking_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trains (public read)
CREATE POLICY "Anyone can view trains"
  ON public.trains FOR SELECT
  USING (true);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bookings"
  ON public.bookings FOR UPDATE
  USING (auth.uid() = user_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_bookings_updated_at
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to generate PNR number
CREATE OR REPLACE FUNCTION public.generate_pnr()
RETURNS TEXT AS $$
DECLARE
  pnr TEXT;
  exists_pnr BOOLEAN;
BEGIN
  LOOP
    -- Generate 10-digit PNR
    pnr := LPAD(FLOOR(RANDOM() * 10000000000)::TEXT, 10, '0');
    
    -- Check if PNR already exists
    SELECT EXISTS(SELECT 1 FROM public.bookings WHERE pnr_number = pnr) INTO exists_pnr;
    
    -- Exit loop if PNR is unique
    EXIT WHEN NOT exists_pnr;
  END LOOP;
  
  RETURN pnr;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Insert sample trains
INSERT INTO public.trains (train_number, train_name, source_station, destination_station, departure_time, arrival_time) VALUES
('12301', 'Rajdhani Express', 'New Delhi', 'Mumbai Central', '16:55:00', '08:35:00'),
('12302', 'Rajdhani Express', 'Mumbai Central', 'New Delhi', '17:00:00', '08:35:00'),
('12951', 'Mumbai Rajdhani', 'New Delhi', 'Mumbai Central', '16:35:00', '08:25:00'),
('12430', 'Lucknow AC SF', 'New Delhi', 'Lucknow', '22:10:00', '06:15:00'),
('12801', 'Purushottam SF Express', 'New Delhi', 'Puri', '18:25:00', '22:55:00'),
('12869', 'Csmt Howrah SF', 'Mumbai CSMT', 'Howrah', '18:35:00', '22:45:00'),
('12259', 'Duronto Express', 'Sealdah', 'New Delhi', '16:50:00', '07:35:00'),
('22691', 'Rajdhani Express', 'New Delhi', 'Bangalore', '20:00:00', '06:00:00'),
('12723', 'Telangana Express', 'Hyderabad', 'New Delhi', '17:50:00', '12:00:00'),
('12621', 'Tamil Nadu Express', 'New Delhi', 'Chennai Central', '22:30:00', '07:05:00');