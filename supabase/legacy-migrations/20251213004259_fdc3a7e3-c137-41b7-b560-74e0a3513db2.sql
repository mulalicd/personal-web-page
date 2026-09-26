-- Create table for consultation requests
CREATE TABLE public.consultation_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.consultation_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create consultation requests
CREATE POLICY "Anyone can create consultation requests"
ON public.consultation_requests
FOR INSERT
WITH CHECK (true);

-- Allow anyone to read consultation requests (for admin page)
CREATE POLICY "Anyone can read consultation requests"
ON public.consultation_requests
FOR SELECT
USING (true);

-- Allow updates (for admin to confirm/complete)
CREATE POLICY "Anyone can update consultation requests"
ON public.consultation_requests
FOR UPDATE
USING (true);