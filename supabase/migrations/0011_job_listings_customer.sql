-- ============================================================
-- İŞ ELANLARI — MÜŞTƏRİ TƏRƏFİ (VIP/Təcili etiketləri + reaksiyalar)
-- ============================================================

-- Admin tərəfindən əl ilə təyin olunan etiketlər (gələcəkdə ödənişli sistemə
-- keçid üçün ayrıca sütun kimi saxlanılır ki, sonra mənbə (admin/ödəniş)
-- fərqləndirilə bilsin)
alter table job_listings
  add column if not exists is_vip boolean not null default false,
  add column if not exists is_urgent boolean not null default false;

create index if not exists idx_job_listings_is_vip on job_listings(is_vip) where is_vip = true;

-- İstifadəçi reaksiyaları: LIKE / DISLIKE / FAVORITE / VIEW
-- Hər istifadəçi hər elana hər tipdən yalnız 1 dəfə reaksiya verə bilər
-- (LIKE/DISLIKE bir-birini əvəz edir, VIEW isə "unikal baxış" sayğacı üçündür)
create type job_listing_interaction_type as enum ('LIKE', 'DISLIKE', 'FAVORITE', 'VIEW');

create table if not exists job_listing_interactions (
  id uuid primary key default uuid_generate_v4(),
  listing_id uuid not null references job_listings(id) on delete cascade,
  user_id uuid not null references users(id) on delete cascade,
  type job_listing_interaction_type not null,
  created_at timestamptz not null default now(),
  unique (listing_id, user_id, type)
);

create index if not exists idx_job_listing_interactions_listing on job_listing_interactions(listing_id);
create index if not exists idx_job_listing_interactions_user on job_listing_interactions(user_id, listing_id);
