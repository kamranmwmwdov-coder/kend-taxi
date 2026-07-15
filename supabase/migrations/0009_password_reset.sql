-- ============================================================
-- ŞİFRƏ BƏRPASI (email ilə) — Hissə 9-a əlavə
-- Mövcud strukturu pozmadan yalnız əlavə sütun/cədvəl yaradılır
-- ============================================================

-- İstifadəçilər üçün könüllü email (parol bərpası üçün lazımdır)
alter table users add column if not exists email text;
create unique index if not exists idx_users_email on users(email) where email is not null;

-- Bərpa token-ləri: token özü heç vaxt saxlanmır, yalnız hash-i
create table if not exists password_reset_tokens (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists idx_password_reset_user on password_reset_tokens(user_id);
create index if not exists idx_password_reset_expires on password_reset_tokens(expires_at);
