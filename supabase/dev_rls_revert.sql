-- Revert RLS policies back to secure defaults (based on migrations/001_create_schema.sql)
-- Spouštěj po dokončení testů, abys vrátil produkční bezpečnost.

ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all (dev)" ON public.room_participants;
CREATE POLICY "Allow insert" ON public.room_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow logged-in users to access participants" ON public.room_participants FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.room_rows ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all (dev)" ON public.room_rows;
CREATE POLICY "Allow logged-in users to access messages" ON public.room_rows FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all (dev)" ON public.rooms;
CREATE POLICY "Allow logged-in users to access rooms" ON public.rooms FOR ALL USING (auth.role() = 'authenticated');
