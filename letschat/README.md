# LetsChat - Anonymní QR chat aplikace

LetsChat je webová aplikace pro anonymní chat v reálném čase, postavená na Next.js 14. Umožňuje uživatelům rychle se připojit nebo vytvořit dočasné chatovací místnosti pomocí skenování QR kódu nebo zadáním kódu chatu. Chaty jsou navrženy tak, aby automaticky expiravaly po 24 hodinách pro zajištění soukromí.

## ✨ Klíčové funkce

-   **Anonymní chatování**: Nevyžaduje se žádná registrace ani osobní údaje. Každý uživatel obdrží v chatu unikátní anonymní ID.
-   **Komunikace v reálném čase**: Okamžité odesílání a příjem zpráv s aktualizacemi v reálném čase pomocí Supabase.
-   **Připojení pomocí QR kódu/manuálního kódu**: Snadné připojení k chatu naskenováním QR kódu nebo manuálním zadáním kódu.
-   **Automatická expirace chatů**: Chatovací místnosti a jejich zprávy jsou navrženy tak, aby se automaticky smazaly po 24 hodinách (spravováno databází).
-   **Responzivní design**: Optimalizováno pro mobilní zařízení i desktopy.
-   **Připraveno pro PWA**: Základní konfigurace pro Progressive Web App.
-   **Podpora Dockeru**: Obsahuje Dockerfile pro kontejnerizovanou deployment, optimalizováno zejména pro Hugging Face Spaces.

## 🛠️ Technologický stack

-   **Frontend**: Next.js 14 (App Router), React 18, TypeScript
-   **Stylování**: Tailwind CSS
-   **Databáze & Real-time**: Supabase
-   **QR Funkcionalita**: `html5-qrcode` (pro skenování)
-   **Správa stavu**: Zustand (pro správu anonymního ID uživatele)
-   **Notifikace**: `react-hot-toast`
-   **Ikony**: `lucide-react`
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
    cd letschat
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
    Ve vašem Supabase projektu budete potřebovat vytvořit následující tabulky:
    *   **`chats` tabulka**:
        *   `id` (uuid, primární klíč, default: `uuid_generate_v4()`)
        *   `created_at` (timestamptz, default: `now()`)
        *   `expires_at` (timestamptz, default: `now() + interval '24 hours'`)
        *   `chat_code` (text, unikátní, indexováno)
    *   **`messages` tabulka**:
        *   `id` (uuid, primární klíč, default: `uuid_generate_v4()`)
        *   `chat_id` (uuid, cizí klíč odkazující na `chats.id` ON DELETE CASCADE)
        *   `user_id` (text) (anonymní identifikátor uživatele)
        *   `content` (text)
        *   `created_at` (timestamptz, default: `now()`)

    Ujistěte se, že pro tyto tabulky povolíte Row Level Security (RLS) a definujete politiky podle vašich potřeb přístupu. Například povolte uživatelům vytvářet chaty, číst a psát zprávy v chatech, kterých jsou součástí.

### Spuštění vývojového serveru

```bash
npm run dev
```
Aplikace poběží na `http://localhost:3000`.

### Sestavení pro produkci

```bash
npm run build
```

### Spuštění produkční verze

```bash
npm run start
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
    Nezapomeňte nahradit proměnné prostředí vašimi Supabase údaji. Aplikace poběží v kontejneru na portu 3000 a bude mapována na port 3000 hostitelského systému.

## ☁️ Deployment

### Hugging Face Spaces

Tato aplikace je optimalizována pro Hugging Face Spaces.

1.  Vytvořte nový Space na Hugging Face Spaces.
2.  Zvolte "Docker" jako typ Space a vyberte možnost "Custom" Dockerfile.
3.  Nahrajte váš kód (včetně `Dockerfile`) do repozitáře Space.
4.  V nastavení Space nakonfigurujte potřebné Secret (proměnné prostředí):
    *   `NEXT_PUBLIC_SUPABASE_URL`
    *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5.  Hugging Face Spaces obvykle očekává, že aplikace naslouchá na portu `7860`. Ačkoliv Dockerfile standardně vystavuje port `3000` (Next.js standard), možná budete potřebovat upravit direktivy `EXPOSE` a `CMD` v `Dockerfile`, nebo Hugging Face může mapování portů zvládnout automaticky. V případě potřeby upravte `CMD` v `Dockerfile` na:
    `CMD ["npm", "start", "--", "-p", "7860"]`
    a odpovídajícím způsobem změňte `EXPOSE 7860`.

### Supabase

-   Ujistěte se, že váš Supabase projekt je správně nastaven a že databázové tabulky a politiky Row Level Security (RLS) jsou nakonfigurovány.
-   Zvažte nastavení databázového indexu pro sloupec `expires_at` a případně cron job (pomocí Supabase Edge Functions nebo externího plánovače) pro pravidelné čištění expirovaných chatů, aby se spravovala velikost dat.

## 📁 Struktura projektu

```
letschat/
├── public/                 # Statické soubory (manifest.json, ikony)
│   ├── icons/
│   └── manifest.json
├── src/
│   ├── app/                # Next.js App Router stránky a layouty
│   │   ├── chat/
│   │   │   └── [chatId]/
│   │   │       └── page.tsx  # Stránka chatu
│   │   ├── layout.tsx      # Kořenový layout
│   │   ├── page.tsx        # Domovská stránka
│   │   └── globals.css     # Globální styly
│   ├── components/         # React komponenty
│   │   ├── ui/             # Obecné UI komponenty (Button, Input, Modal)
│   │   ├── Chat.tsx
│   │   ├── Message.tsx
│   │   └── QrScanner.tsx
│   ├── contexts/           # React Context provideři (SupabaseProvider)
│   ├── lib/                # Knihovny a pomocné funkce (supabaseClient)
│   └── stores/             # Zustand store pro správu stavu (userStore)
├── .env.local.example      # Příklad proměnných prostředí
├── .eslintrc.json
├── .gitignore
├── Dockerfile              # Docker konfigurace
├── next.config.mjs         # Next.js konfigurace
├── package.json
├── postcss.config.js       # PostCSS konfigurace (pro Tailwind)
├── README.md               # README projektu
└── tsconfig.json           # TypeScript konfigurace
```

## 🤝 Přispívání

Příspěvky jsou vítány! Pokud naleznete jakékoli chyby nebo máte návrhy na vylepšení, neváhejte vytvořit Issue nebo Pull Request.
