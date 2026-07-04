-- ============================================================
-- KƏND TAXI PLATFORMASI - İLKİN DATABASE SXEMİ
-- Mənbə: Hissə 20 (rəsmi ER modeli) + Hissə 7, 12, 13
-- ============================================================

create extension if not exists "uuid-ossp";

-- ---------- ENUM-LAR ----------
create type user_role as enum ('ADMIN', 'DRIVER', 'CUSTOMER');
create type user_status as enum ('ACTIVE', 'INACTIVE', 'BLOCKED');

create type order_status as enum (
  'NEW',
  'WAITING_DRIVER',
  'WAITING_CONFIRMATION',
  'ACTIVE',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED'
);

create type service_type as enum ('BAKU_MORNING', 'BAKU_NOON', 'BAKU_EVENING', 'LOCAL', 'CARGO');

create type driver_request_status as enum (
  'ACCEPTED', 'REJECTED', 'SELECTED', 'CONFIRMED', 'CANCELLED', 'EXPIRED'
);

create type trip_time as enum ('MORNING', 'NOON', 'EVENING');
create type trip_direction as enum ('ONE_WAY', 'ROUND_TRIP');

-- ---------- USERS ----------
create table users (
  id uuid primary key default uuid_generate_v4(),
  role user_role not null,
  first_name text not null,
  last_name text not null,
  phone text not null unique,
  password_hash text not null,
  status user_status not null default 'ACTIVE',
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_users_phone on users(phone);
create index idx_users_role on users(role);
create index idx_users_status on users(status);

-- ---------- VEHICLES ----------
create table vehicles (
  id uuid primary key default uuid_generate_v4(),
  brand text not null,
  model text,
  color text not null,
  plate_number text not null,
  seat_capacity int not null default 10,
  status text not null default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- DRIVERS ----------
create table drivers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete restrict,
  vehicle_id uuid references vehicles(id) on delete set null,
  employee_code text unique,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  unique(user_id)
);
create index idx_drivers_user on drivers(user_id);

-- ---------- CUSTOMER PROFILES ----------
create table customer_profiles (
  user_id uuid primary key references users(id) on delete cascade,
  address text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------- DRIVER SERVICES (hansı xidmətləri aktiv edib) ----------
create table driver_services (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid not null references drivers(id) on delete cascade,
  service_type service_type not null,
  enabled boolean not null default false,
  updated_at timestamptz not null default now(),
  unique(driver_id, service_type)
);
create index idx_driver_services_driver on driver_services(driver_id);

-- ---------- BAKI REYSİ SİFARİŞLƏRİ ----------
create table baku_trip_orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references users(id),
  trip_date date not null,
  trip_time trip_time not null,
  pickup_location text not null,
  dropoff_location text not null,
  contact_phone text not null,
  passenger_count int not null default 1,
  extra_luggage boolean not null default false,
  luggage_info text,
  extra_luggage_price numeric(10,2) default 0,
  base_price numeric(10,2) not null,
  total_price numeric(10,2) not null,
  status order_status not null default 'NEW',
  selected_driver_id uuid references drivers(id),
  confirmed_driver_id uuid references drivers(id),
  price_increase_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_baku_orders_status on baku_trip_orders(status);
create index idx_baku_orders_customer on baku_trip_orders(customer_id);
create index idx_baku_orders_trip on baku_trip_orders(trip_date, trip_time);

-- Bir Bakı reysində olan bütün sərnişinlər (yer sayı hesablamaq üçün)
create table baku_trip_passengers (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references baku_trip_orders(id) on delete cascade,
  name text not null,
  phone text not null,
  pickup text not null,
  dropoff text not null,
  passenger_count int not null default 1,
  created_at timestamptz not null default now()
);
create index idx_baku_passengers_order on baku_trip_passengers(order_id);

-- ---------- EL YÜKÜ (CARGO) ----------
create table cargo_orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references users(id),
  sender_name text not null,
  sender_phone text not null,
  sender_address text not null,
  receiver_name text not null,
  receiver_phone text not null,
  receiver_address text not null,
  cargo_info text,
  price numeric(10,2) not null,
  status order_status not null default 'NEW',
  selected_driver_id uuid references drivers(id),
  confirmed_driver_id uuid references drivers(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_cargo_status on cargo_orders(status);
create index idx_cargo_customer on cargo_orders(customer_id);

-- ---------- RAYON DAXİLİ SİFARİŞLƏR ----------
create table local_trip_orders (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references users(id),
  pickup_location text not null,
  dropoff_location text not null,
  contact_phone text not null,
  trip_type trip_direction not null default 'ONE_WAY',
  waiting_enabled boolean not null default false,
  waiting_hours numeric(4,1),
  price numeric(10,2) not null check (price > 0),
  note text,
  status order_status not null default 'NEW',
  selected_driver_id uuid references drivers(id),
  confirmed_driver_id uuid references drivers(id),
  price_increase_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
create index idx_local_status on local_trip_orders(status);
create index idx_local_customer on local_trip_orders(customer_id);

-- ---------- DRIVER ORDER REQUESTS (hansı sürücü hansı sifarişi qəbul edib) ----------
create table driver_order_requests (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid not null references drivers(id),
  order_type text not null check (order_type in ('BAKU', 'LOCAL', 'CARGO')),
  order_id uuid not null,
  status driver_request_status not null default 'ACCEPTED',
  accepted_at timestamptz,
  selected_at timestamptz,
  confirmed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  unique(driver_id, order_type, order_id)
);
create index idx_dor_driver on driver_order_requests(driver_id);
create index idx_dor_order on driver_order_requests(order_type, order_id);

-- ---------- NOTIFICATIONS ----------
create table notifications (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, is_read);

-- ---------- ADVERTISEMENTS ----------
create table advertisements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  description text,
  image_url text,
  link_url text,
  priority int not null default 0,
  target_role text not null default 'ALL' check (target_role in ('ALL','CUSTOMER','DRIVER')),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  impressions int not null default 0,
  clicks int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- ANNOUNCEMENTS (elanlar) ----------
create table announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  content text not null,
  target_role text not null default 'ALL' check (target_role in ('ALL','CUSTOMER','DRIVER')),
  priority int not null default 0,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  status text not null default 'ACTIVE' check (status in ('ACTIVE','INACTIVE')),
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ---------- SETTINGS ----------
create table settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

insert into settings (key, value) values
  ('baku_base_price', '20'),
  ('driver_confirm_timeout_seconds', '120'),
  ('driver_accept_timeout_seconds', '300'),
  ('local_price_increase_amount', '2'),
  ('local_price_increase_max_count', '2'),
  ('baku_trip_capacity', '10'),
  ('whatsapp_admin_number', '"+994000000000"'),
  ('app_name', '"Kənd Taxi"');

-- ---------- AUDIT LOGS ----------
create table audit_logs (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references users(id),
  action text not null,
  module text not null,
  ip_address text,
  device text,
  meta jsonb,
  created_at timestamptz not null default now()
);
create index idx_audit_user on audit_logs(user_id);
create index idx_audit_created on audit_logs(created_at);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table users enable row level security;
alter table baku_trip_orders enable row level security;
alter table cargo_orders enable row level security;
alter table local_trip_orders enable row level security;
alter table notifications enable row level security;
alter table driver_order_requests enable row level security;

-- Qeyd: Auth Supabase-in öz auth.users sistemi ilə deyil,
-- xüsusi phone+password sistemi ilə işlədiyi üçün RLS policy-ləri
-- server-side (service role) API vasitəsilə tətbiq olunur.
-- Frontend birbaşa DB-yə yox, yalnız Next.js API route-ları vasitəsilə əlaqə saxlayır.
