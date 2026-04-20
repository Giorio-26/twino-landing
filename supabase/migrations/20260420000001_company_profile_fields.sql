ALTER TABLE public.companies
  ADD COLUMN IF NOT EXISTS email   text,
  ADD COLUMN IF NOT EXISTS phone   text,
  ADD COLUMN IF NOT EXISTS website text;
