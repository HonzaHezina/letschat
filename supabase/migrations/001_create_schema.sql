DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.room_rows CASCADE;
DROP TABLE IF EXISTS public.room_participants CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.codes CASCADE;
DROP TABLE IF EXISTS public.logs CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE; -- Stará tabulka profilů

-- Ensure pgcrypto is available for gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- 1. Tabulka pro uživatele (nahrazuje 'profiles')
CREATE TABLE public.users (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  lang VARCHAR(5) DEFAULT 'cs',
  status SMALLINT DEFAULT 1, -- 0: neaktivní, 1: čeká na autorizaci, 2: aktivní
  email VARCHAR(255) UNIQUE NOT NULL,
  token VARCHAR(255) UNIQUE,
  fname VARCHAR(255) NOT NULL,
  sname VARCHAR(255) NOT NULL,
  sex SMALLINT, -- 1: muž, 2: žena, null: neuvedeno
  nickname VARCHAR(255),
  birth DATE,
  photo VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS pro uživatele
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, fname, sname, sex, token)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'fname', NEW.raw_user_meta_data->>'sname', (NEW.raw_user_meta_data->>'sex')::smallint, gen_random_uuid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Tabulka pro párové kódy
CREATE TABLE public.codes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code VARCHAR(5) NOT NULL UNIQUE,
  linked_to BIGINT REFERENCES public.codes(id),
  used SMALLINT DEFAULT 0, -- 0: nepoužit, 1: použit
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Kdo kód vlastní (pro registrované)
  pin_hash TEXT, -- Hash 5místného PINu
  anonymous_hash TEXT, -- Hash pro ověření anonymního uživatele bez PINu
  date_first TIMESTAMPTZ,
  date_last TIMESTAMPTZ,
  used_count INT DEFAULT 0,
  room_id BIGINT, -- Bude propojeno později
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX ON public.codes(code);
CREATE INDEX ON public.codes(used);


-- 3. Tabulka pro chatovací místnosti
CREATE TABLE public.rooms (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  status SMALLINT DEFAULT 1, -- 1: aktivní, 0: neaktivní
  name VARCHAR(255),
  description VARCHAR(255),
  date_create TIMESTAMPTZ DEFAULT NOW(),
  date_last TIMESTAMPTZ
);

-- Přidání cizího klíče zpět do 'codes' po vytvoření 'rooms'
ALTER TABLE public.codes ADD CONSTRAINT fk_room_id FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL;


-- 4. Tabulka pro účastníky v místnostech
CREATE TABLE public.room_participants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  room_id BIGINT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Pro registrované uživatele
  anonymous_id UUID, -- Pro anonymní uživatele (z localStorage)
  code_id BIGINT NOT NULL REFERENCES public.codes(id), -- Kód, kterým vstoupil
  role VARCHAR(50), -- např. 'Účastník A', 'Účastník B'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  profile_visible BOOLEAN DEFAULT FALSE
);


-- 5. Tabulka pro zprávy (dříve 'room_row')
CREATE TABLE public.room_rows (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  room_id BIGINT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  participant_id BIGINT NOT NULL REFERENCES public.room_participants(id) ON DELETE CASCADE,
  content TEXT,
  image VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 6. Tabulka pro logování
CREATE TABLE public.logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  lang VARCHAR(5),
  ip_address INET,
  user_agent TEXT,
  module VARCHAR(100),
  operation VARCHAR(100),
  data JSONB, -- Pro ukládání strukturovaných dat
  error TEXT
);

-- RLS pro tabulky (základní nastavení, povoluje přihlášeným uživatelům číst a psát)
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow logged-in users to access rooms" ON public.rooms FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow insert" ON public.room_participants FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow logged-in users to access participants" ON public.room_participants FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.room_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow logged-in users to access messages" ON public.room_rows FOR ALL USING (auth.role() = 'authenticated');
