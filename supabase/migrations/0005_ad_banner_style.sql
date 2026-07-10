alter table advertisements
  add column if not exists background_color text not null default '#EEF2F7',
  add column if not exists text_color text not null default '#1F2430',
  add column if not exists text_style text not null default 'font-semibold',
  add column if not exists lent_color text not null default '#1D6FE0';
