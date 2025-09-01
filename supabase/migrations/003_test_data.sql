
DELETE FROM auth.users WHERE id IN ('6c670028-67fb-4403-8ead-038409c59ba2', 'b2e7e2e2-1c2a-4e2a-9e2a-2e2a2e2a2e2a');
-- Pozor: upravte pole podle skutečné struktury tabulky auth.users v Supabase!
-- Minimální povinná pole: id, email, encrypted_password, instance_id, aud, role
-- Pokud používáte Supabase, doporučuji vytvořit uživatele přes API nebo admin rozhraní, protože heslo musí být hashované.
-- Pro testovací účely lze použít následující:

INSERT INTO auth.users (id, email, encrypted_password, instance_id, aud, role, raw_user_meta_data)
VALUES
  ('6c670028-67fb-4403-8ead-038409c59ba2', 'test1@example.com', 'testpasshash', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '{"fname": "Jan", "sname": "Novák", "sex": 1}'),
  ('b2e7e2e2-1c2a-4e2a-9e2a-2e2a2e2a2e2a', 'test2@example.com', 'testpasshash', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', '{"fname": "Eva", "sname": "Svobodová", "sex": 2}');



-- Smaž všechny místnosti se stejným názvem, aby byl jen jeden záznam
DELETE FROM public.rooms WHERE name = 'ABCDE';

INSERT INTO public.rooms (status, name, description)
VALUES (1, 'ABCDE', 'Testovací místnost');

DELETE FROM public.codes WHERE code IN ('ABCDE', 'FGHIJ');


INSERT INTO public.codes (code, used, pin_hash)
VALUES
  ('ABCDE', 0, 'hash1'),
  ('FGHIJ', 0, 'hash2');


WITH abcd AS (SELECT id FROM public.codes WHERE code = 'ABCDE'),
     fghij AS (SELECT id FROM public.codes WHERE code = 'FGHIJ')
INSERT INTO public.room_participants (room_id, user_id, code_id, role, profile_visible)
SELECT 1, '6c670028-67fb-4403-8ead-038409c59ba2'::uuid, abcd.id, 'Účastník A', TRUE FROM abcd
UNION ALL
SELECT 1, 'b2e7e2e2-1c2a-4e2a-9e2a-2e2a2e2a2e2a'::uuid, fghij.id, 'Účastník B', TRUE FROM fghij;

-- Vložení anonymního účastníka
INSERT INTO public.room_participants (room_id, anonymous_id, code_id, role, profile_visible)
SELECT 1, gen_random_uuid(), abcd.id, 'Anonymní účastník', TRUE FROM abcd;

INSERT INTO public.room_rows (room_id, participant_id, content)
VALUES
  (1, 1, 'Ahoj, toto je testovací zpráva od Jana.'),
  (1, 2, 'Dobrý den, toto je zpráva od Evy.');

ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow all" ON public.rooms;
CREATE POLICY "Allow all" ON public.rooms FOR SELECT USING (true);

-- Povolení INSERT pro všechny uživatele (RLS policy pro testování)
ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow insert" ON public.room_participants;
CREATE POLICY "Allow insert" ON public.room_participants FOR INSERT WITH CHECK (true);
