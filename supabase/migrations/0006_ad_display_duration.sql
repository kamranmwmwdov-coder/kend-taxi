alter table advertisements
  add column if not exists display_duration_seconds integer not null default 5
  check (display_duration_seconds >= 1 and display_duration_seconds <= 3600);
