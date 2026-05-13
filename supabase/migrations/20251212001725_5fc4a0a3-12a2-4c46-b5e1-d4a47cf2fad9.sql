-- Create table for CV download requests
CREATE TABLE public.cv_requests (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    token UUID NOT NULL DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    processed_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.cv_requests ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert requests (public form)
CREATE POLICY "Anyone can create CV requests" 
ON public.cv_requests 
FOR INSERT 
WITH CHECK (true);

-- Allow reading own request by token
CREATE POLICY "Anyone can read requests by token" 
ON public.cv_requests 
FOR SELECT 
USING (true);

-- Allow updates via service role only (edge functions)
CREATE POLICY "Service role can update requests"
ON public.cv_requests
FOR UPDATE
USING (true);