# LetsChat - QR Chat Aplikace

LetsChat je webová aplikace pro chat v reálném čase, postavená na Next.js 14. Umožňuje uživatelům vytvářet a připojovat se k dočasným chatovacím místnostem. Aplikace vyžaduje registraci a přihlášení uživatele. Chaty jsou navrženy tak, aby automaticky expiravaly po 24 hodinách pro zajištění soukromí.

## ✨ Klíčové funkce

-   **Uživatelské účty**: Vyžaduje se registrace a přihlášení (e-mail/heslo nebo sociální sítě).
-   **Správa profilu**: Uživatelé si mohou upravovat své jméno a další údaje.
-   **Komunikace v reálném čase**: Okamžité odesílání a příjem zpráv s aktualizacemi v reálném čase pomocí Supabase.
-   **Vytváření a připojování k chatům**: Uživatelé mohou vytvářet nové chatovací místnosti nebo se připojovat k existujícím pomocí kódu.
-   **Automatická expirace chatů**: Chatovací místnosti a jejich zprávy se automaticky smažou po 24 hodinách.
-   **Responzivní design**: Optimalizováno pro mobilní zařízení i desktopy.
-   **Připraveno pro PWA**: Základní konfigurace pro Progressive Web App.
-   **Podpora Dockeru**: Obsahuje Dockerfile pro kontejnerizovanou deployment.

## 🛠️ Technologický stack

-   **Frontend**: Next.js 14 (App Router), React 18, TypeScript
-   **Stylování**: Tailwind CSS
-   **Backend & Databáze**: Supabase (Auth, Realtime, Database)
-   **Notifikace**: `react-hot-toast`
-   **Ikony**: `lucide-react`, `react-icons`
-   **Animace**: `framer-motion`
-   **Datum/Čas**: `date-fns` (s českou lokalizací `cs`)
-   **Deployment**: Docker, Hugging Face Spaces

## 🚀 Začínáme

### Předpoklady

-   [Node.js](https://nodejs.org/) (v18.x nebo novější)
-   [npm](https://www.npmjs.com/) (nebo yarn/pnpm)
-   Projekt na [Supabase](https://supabase.com/)

### Lokální nastavení

1.  **Naklonujte repozitář**:
    ```bash
    git clone https://github.com/your-username/letschat.git # Nahraďte skutečnou URL repozitáře
    cd letschat-repo-name # Nahraďte názvem adresáře, kam jste projekt naklonovali
    ```

2.  **Nainstalujte závislosti**:
    ```bash
    npm install
    ```

3.  **Konfigurujte proměnné prostředí**:
    Zkopírujte soubor `.env.local.example` do `.env.local` a vyplňte údaje k vašemu Supabase projektu:
    ```bash
    cp .env.local.example .env.local
    ```
    Upravte `.env.local`:
    ```env
    NEXT_PUBLIC_SUPABASE_URL="VAS_SUPABASE_URL_SEM"
    NEXT_PUBLIC_SUPABASE_ANON_KEY="VAS_SUPABASE_ANON_KLIC_SEM"
    ```
    Tyto hodnoty naleznete ve vašem Supabase projektu v "Project Settings" > "API".

4.  **Nastavte Supabase databázi**:
    Ve vašem Supabase projektu spusťte následující SQL příkazy pro vytvoření potřebných tabulek a politik.

    **a) Tabulka `profiles` pro uživatelská data:**
    ```sql
    -- Create a table for public user profiles
    create table profiles (
      id uuid references auth.users not null primary key,
      updated_at timestamp with time zone,
      full_name text,
      gender text,
      constraint full_name_length check (char_length(full_name) >= 3)
    );
    -- Set up Row Level Security (RLS)
    alter table profiles enable row level security;
    create policy "Public profiles are viewable by everyone." on profiles for select using (true);
    create policy "Users can insert their own profile." on profiles for insert with check (auth.uid() = id);
    create policy "Users can update own profile." on profiles for update using (auth.uid() = id);
    -- This trigger automatically creates a profile entry when a new user signs up
    create function public.handle_new_user()
    returns trigger as $$
    begin
      insert into public.profiles (id, full_name, gender)
      values (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'gender');
      return new;
    end;
    $$ language plpgsql security definer;
    -- Hook it up to the auth.users table
    create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
    ```

    **b) Tabulka `chats` (ujistěte se, že již existuje, a případně ji upravte):**
    ```sql
    -- Add a "created_by" column linked to the user who creates the chat
    alter table chats add column created_by uuid references auth.users;
    -- Update RLS policies
    create policy "Users can create chats." on chats
      for insert with check (auth.check('authenticated'));
    create policy "Authenticated users can read chats." on chats
      for select using (auth.check('authenticated'));
    ```

    **c) Tabulka `messages` (ujistěte se, že již existuje, a případně ji upravte):**
    ```sql
    -- Add a user_id column that links to the auth.users table
    alter table messages add column user_id uuid references auth.users;
    -- Update RLS policies
    create policy "Users can send messages." on messages
      for insert with check (auth.check('authenticated'));
    create policy "Users can read messages." on messages
      for select using (auth.check('authenticated'));
    ```

### Spuštění vývojového serveru

```bash
npm run dev
```
Aplikace poběží na `http://localhost:3000`.

### Sestavení pro produkci

```bash
npm run build
```

## 🐳 Spuštění pomocí Dockeru

Aplikace obsahuje `Dockerfile` pro sestavení a spuštění Docker kontejneru.

1.  **Sestavte Docker image**:
    ```bash
    docker build -t letschat-app .
    ```

2.  **Spusťte Docker kontejner**:
    ```bash
    docker run -p 3000:3000 -e NEXT_PUBLIC_SUPABASE_URL="VAS_SUPABASE_URL" -e NEXT_PUBLIC_SUPABASE_ANON_KEY="VAS_SUPABASE_ANON_KLIC" letschat-app
    ```

## 📁 Struktura projektu

```
.
├── public/                 # Statické soubory (manifest.json, ikony)
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── app/                # Next.js App Router stránky a layouty
│   │   ├── auth/           # Stránky pro přihlášení a registraci
│   │   ├── chat/
│   │   │   └── [chatId]/
│   │   │       └── page.tsx  # Stránka chatu
│   │   ├── chats/          # Seznam chatů uživatele
│   │   ├── profile/        # Profil uživatele
│   │   ├── layout.tsx      # Kořenový layout
│   │   └── page.tsx        # Domovská stránka
│   ├── components/         # React komponenty
│   │   ├── layout/         # Header, Footer
│   │   └── ui/             # Obecné UI komponenty
│   ├── contexts/           # React Context provideři (SupabaseProvider)
│   └── lib/                # Knihovny a pomocné funkce (supabaseClient)
├── .env.local.example      # Příklad proměnných prostředí
├── Dockerfile              # Docker konfigurace
├── next.config.mjs         # Next.js konfigurace
├── package.json
├── README.md               # README projektu
└── tsconfig.json           # TypeScript konfigurace
```

## 🤝 Přispívání

Příspěvky jsou vítány! Pokud naleznete jakékoli chyby nebo máte návrhy na vylepšení, neváhejte vytvořit Issue nebo Pull Request.
