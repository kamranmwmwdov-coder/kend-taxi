-- ============================================================
-- İŞ ELANLARI MODULU
-- ============================================================

create type job_listing_status as enum ('PENDING', 'ACTIVE', 'REJECTED', 'EXPIRED');

create table job_listings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id),

  title text not null,               -- İş adı
  category text not null,            -- Kateqoriya
  contact_phone text not null,
  whatsapp_phone text,
  images text[] not null default '{}',
  price numeric(10,2),
  event_date date,                   -- Tarix
  event_time time,                   -- Saat
  address text not null,
  description text,

  status job_listing_status not null default 'PENDING',
  rejection_reason text check (
    rejection_reason is null or rejection_reason in (
      'Söyüş və təhqir', 'Spam', 'Yanlış məlumat', 'Təkrar elan', 'Qaydalara uyğun deyil', 'Digər'
    )
  ),
  rejection_note text,

  views_count int not null default 0,
  likes_count int not null default 0,
  dislikes_count int not null default 0,
  phone_clicks int not null default 0,
  whatsapp_clicks int not null default 0,

  published_at timestamptz,          -- Təsdiq olunub aktiv edildiyi an
  expires_at timestamptz,            -- Bitmə tarixi (published_at + 30 gün)

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_job_listings_status on job_listings(status);
create index idx_job_listings_user on job_listings(user_id);
create index idx_job_listings_expires on job_listings(expires_at);

-- ---------- STORAGE (elan şəkilləri üçün ictimai bucket) ----------
insert into storage.buckets (id, name, public)
values ('job-listings', 'job-listings', true)
on conflict (id) do nothing;

create policy "Public read access for job-listings bucket"
on storage.objects for select
using (bucket_id = 'job-listings');
