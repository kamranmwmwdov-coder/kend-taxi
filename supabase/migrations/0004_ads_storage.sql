-- Reklam şəkilləri üçün ictimai (public) storage bucket
insert into storage.buckets (id, name, public)
values ('ads', 'ads', true)
on conflict (id) do nothing;

-- Bucket-ə oxuma icazəsi hər kəsə açıqdır (ictimai reklam şəkilləri)
create policy "Public read access for ads bucket"
on storage.objects for select
using (bucket_id = 'ads');
