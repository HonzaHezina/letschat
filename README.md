# LetsChat - Hybridní Chatovací Aplikace

LetsChat je webová aplikace postavená na Next.js 14, která umožňuje soukromou textovou komunikaci mezi dvěma účastníky. Aplikace využívá unikátní hybridní model, který kombinuje anonymní přístup s prémiovými funkcemi pro registrované uživatele.

## 🚀 Hlavní Koncept: Systém Sdíleného Tajemství

Jádrem aplikace je systém párování pomocí jednoho sdíleného kódu, který zajišťuje soukromí a jednoduchost.

1.  **Vytvoření Kartičky (pouze pro přihlášené):** Registrovaný uživatel může vygenerovat nový, unikátní 5místný kód. Tento kód slouží jako "klíč" k jedné chatovací místnosti.
2.  **Připojení do Chatu (pro kohokoli):**
    *   První osoba, která zadá platný kód, vstoupí do místnosti a je označena jako "Účastník A".
    *   Druhá osoba, která zadá ten samý kód, se připojí a je označena jako "Účastník B".
    *   Jakmile jsou v místnosti dva účastníci, chat se **uzamkne** a nikdo další se nemůže připojit.
3.  **Anonymita a Bezpečnost:**
    *   Všichni uživatelé vstupují do chatu **anonymně**.
    *   Při prvním vstupu si mohou volitelně nastavit 5místný **PIN**, který chrání jejich přístup k dané konverzaci.
4.  **Uložení Chatu:** Anonymní uživatel si může konverzaci "přivlastnit" tím, že se zaregistruje nebo přihlásí. Chat se mu tak uloží na jeho účet.

## ✨ Klíčové funkce

-   **Hybridní Model:** Anonymní vstup pro všechny, pokročilé funkce (vytváření kódů) pro registrované.
-   **Párování 1-na-1:** Každý chat je určen pouze pro dva účastníky.
-   **Ochrana PINem:** Možnost zabezpečit si svůj anonymní vstup do chatu.
-   **Komunikace v reálném čase:** Využití Supabase Realtime pro okamžité doručování zpráv.
-   **Claiming Chatů:** Možnost uložit si anonymní konverzaci k registrovanému účtu.
-   **Detailní Logování:** Server-side logování klíčových operací pro bezpečnost a analýzu.

## 🛠️ Technologický stack

-   **Frontend**: Next.js 14 (App Router), React 18, TypeScript
-   **Stylování**: Tailwind CSS
-   **Backend & Databáze**: Supabase (Auth, Realtime, Database, Edge Functions)
-   **Notifikace**: `react-hot-toast`
-   **Ikony**: `lucide-react`
-   **UUID Generování**: `uuid`

## 🚀 Lokální Spuštění

### 1. Předpoklady
-   Nainstalovaný **Node.js** (v18.x nebo novější) a **npm**.
-   Vytvořený projekt na **[Supabase](https://supabase.com/)**.

### 2. Nastavení Databáze
-   Ve svém Supabase projektu otevřete **SQL Editor**.
-   Zkopírujte a spusťte celý SQL skript níže. Tím se vytvoří všechny potřebné tabulky a funkce.

```sql
-- Smazání starých tabulek pro čistý start (doporučeno, pokud začínáte znovu)
DROP TABLE IF EXISTS public.room_rows CASCADE;
DROP TABLE IF EXISTS public.room_participants CASCADE;
DROP TABLE IF EXISTS public.rooms CASCADE;
DROP TABLE IF EXISTS public.codes CASCADE;
DROP TABLE IF EXISTS public.logs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE; -- Smazání i staré tabulky, pokud existuje

-- 1. Tabulka pro uživatele
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

-- RLS (Row Level Security) pro uživatele
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile." ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile." ON public.users FOR UPDATE USING (auth.uid() = id);

-- Trigger pro automatické vytvoření profilu po registraci v auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, fname, sname, sex, token)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'fname', NEW.raw_user_meta_data->>'sname', (NEW.raw_user_meta_data->>'sex')::smallint, gen_random_uuid());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Smazání starého triggeru, pokud existuje, a vytvoření nového
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Tabulka pro párové kódy
CREATE TABLE public.codes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  code VARCHAR(5) NOT NULL UNIQUE,
  linked_to BIGINT REFERENCES public.codes(id),
  used SMALLINT DEFAULT 0, -- 0: nepoužit, 1: použit
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Kdo kód vlastní
  pin_hash TEXT, -- Hash 5místného PINu
  anonymous_hash TEXT, -- Hash pro ověření anonymního uživatele bez PINu
  date_first TIMESTAMPTZ,
  date_last TIMESTAMPTZ,
  used_count INT DEFAULT 0,
  room_id BIGINT, -- Propojeno níže
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

-- Přidání cizího klíče zpět do 'codes'
ALTER TABLE public.codes ADD CONSTRAINT fk_room_id FOREIGN KEY (room_id) REFERENCES public.rooms(id) ON DELETE SET NULL;


-- 4. Tabulka pro účastníky v místnostech
CREATE TABLE public.room_participants (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  room_id BIGINT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL, -- Pro registrované
  anonymous_id UUID, -- Pro anonymní
  code_id BIGINT NOT NULL REFERENCES public.codes(id), -- Kód, kterým vstoupil
  role VARCHAR(50),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  profile_visible BOOLEAN DEFAULT FALSE
);


-- 5. Tabulka pro zprávy
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
  data JSONB,
  error TEXT
);

-- Základní RLS pravidla
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated user access" ON public.rooms FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow anonymous read access" ON public.rooms FOR SELECT USING (auth.role() = 'anon');


ALTER TABLE public.room_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated user access" ON public.room_participants FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow anonymous read access" ON public.room_participants FOR SELECT USING (auth.role() = 'anon');


ALTER TABLE public.room_rows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow authenticated user access" ON public.room_rows FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Allow anonymous read access" ON public.room_rows FOR SELECT USING (auth.role() = 'anon');
```

### 3. Instalace a Konfigurace
1.  **Instalace závislostí:** V terminálu, ve složce projektu, spusťte:
    ```bash
    npm install
    ```
2.  **Konfigurace prostředí:** Zkopírujte `.env.local.example` do nového souboru `.env.local` a doplňte své klíče ze Supabase.
    ```
    NEXT_PUBLIC_SUPABASE_URL="VASE_SUPABASE_URL"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="VAS_SUPABASE_ANON_KLIC"
    ```

### 4. Spuštění Aplikace
```bash
npm run dev
```
Aplikace poběží na [http://localhost:3000](http://localhost:3000).

## 📁 Struktura projektu
```
.
├── public/
├── supabase/
│   └── functions/
│       ├── _shared/
│       ├── create-card/
│       ├── finalize-join/
│       └── get-code-status/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── chat/[chatId]/
│   │   ├── join/[code]/
│   │   ├── dashboard/
│   │   └── page.tsx
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   └── lib/
├── .env.local.example
├── README.md
└── package.json
```
