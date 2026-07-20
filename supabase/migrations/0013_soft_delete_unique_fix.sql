-- Silinmiş (deleted_at doldurulmuş) istifadəçilərin telefon/email-i yeni qeydiyyatı bloklamasın deyə
-- unikal indeksləri yalnız aktiv (silinməmiş) istifadəçilər üzərində işləyəcək şəkildə dəyişirik.

-- Köhnə tam unikal indeksi (phone) və onun üstündəki "not null unique" məhdudiyyətini götürürük
alter table users drop constraint if exists users_phone_key;
drop index if exists idx_users_phone;

-- Yalnız silinməmiş istifadəçilər arasında unikal olacaq indeks
create unique index if not exists idx_users_phone_active on users(phone) where deleted_at is null;
-- Axtarış performansı üçün adi (unikal olmayan) indeks
create index if not exists idx_users_phone on users(phone);

-- Email üçün də eyni məntiq (əvvəlki indeks deleted_at-ı nəzərə almırdı)
drop index if exists idx_users_email;
create unique index if not exists idx_users_email_active on users(email) where email is not null and deleted_at is null;
