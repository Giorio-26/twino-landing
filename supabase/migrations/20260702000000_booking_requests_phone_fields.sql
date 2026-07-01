-- Add phone fields for booking form submissions
ALTER TABLE public.booking_requests
ADD COLUMN IF NOT EXISTS phone_number text;

ALTER TABLE public.booking_requests
ADD COLUMN IF NOT EXISTS country_code text;

COMMENT ON COLUMN public.booking_requests.phone_number IS 'Customer phone number without country dialing code';
COMMENT ON COLUMN public.booking_requests.country_code IS 'International dialing code in +XXX format';
