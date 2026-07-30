CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_in NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_out NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent_on TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO authenticated;
GRANT ALL ON public.entries TO service_role;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read entries" ON public.entries FOR SELECT USING (true);
CREATE POLICY "Anyone can add entries" ON public.entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update entries" ON public.entries FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete entries" ON public.entries FOR DELETE USING (true);
CREATE INDEX entries_entry_date_idx ON public.entries (entry_date DESC);