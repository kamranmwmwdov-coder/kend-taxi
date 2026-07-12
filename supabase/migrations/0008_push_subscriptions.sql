-- Web Push subscriptions are device-specific and may be refreshed by the browser.
create table push_subscriptions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references users(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  expiration_time bigint,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_push_subscriptions_user on push_subscriptions(user_id) where deleted_at is null;
alter table push_subscriptions enable row level security;

-- The app writes through its server-side Supabase service role, like notifications.
