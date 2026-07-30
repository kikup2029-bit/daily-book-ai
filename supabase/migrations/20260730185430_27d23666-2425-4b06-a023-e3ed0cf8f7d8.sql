DELETE FROM public.entries;

ALTER TABLE public.entries ADD COLUMN user_id uuid NOT NULL;

CREATE INDEX entries_user_id_idx ON public.entries(user_id);

DROP POLICY IF EXISTS "Anyone can add entries" ON public.entries;
DROP POLICY IF EXISTS "Anyone can delete entries" ON public.entries;
DROP POLICY IF EXISTS "Anyone can read entries" ON public.entries;
DROP POLICY IF EXISTS "Anyone can update entries" ON public.entries;

REVOKE ALL ON public.entries FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.entries TO authenticated;
GRANT ALL ON public.entries TO service_role;

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own entries" ON public.entries
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can add their own entries" ON public.entries
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own entries" ON public.entries
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own entries" ON public.entries
  FOR DELETE TO authenticated USING (auth.uid() = user_id);