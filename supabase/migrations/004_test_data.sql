-- Testovací data pro Let'sChat
-- Vytvoří více místností, kódů, účastníků i zpráv

-- Místnosti
INSERT INTO rooms (id, name) OVERRIDING SYSTEM VALUE VALUES
  (1, 'ROOM1'),
  (2, 'ROOM2'),
  (3, 'ROOM3'),
  (4, 'ROOM4'),
  (5, 'ROOM5')
ON CONFLICT (id) DO NOTHING;

-- Kódy
INSERT INTO codes (id, code, room_id) OVERRIDING SYSTEM VALUE VALUES
  (1, 'CODE1', 1),
  (2, 'CODE2', 2),
  (3, 'CODE3', 3),
  (4, 'CODE4', 4),
  (5, 'CODE5', 5)
ON CONFLICT (id) DO NOTHING;

-- Účastníci (anonymní + uživatelé)
-- Účastníci se budou vytvářet dynamicky aplikací (anonymní i uživatelé)

-- Zprávy
-- Zprávy se budou vkládat až podle reálných účastníků

-- Pro idempotenci: použijte ON CONFLICT DO NOTHING nebo TRUNCATE tabulky před spuštěním skriptu.
