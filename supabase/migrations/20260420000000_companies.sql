CREATE TABLE IF NOT EXISTS public.companies (
  id        bigserial   PRIMARY KEY,
  name      text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.booking_requests
  ADD COLUMN IF NOT EXISTS company_id bigint
    REFERENCES public.companies(id) ON DELETE SET NULL;
