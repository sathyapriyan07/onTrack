-- ============================================================
-- SUPABASE STORAGE SETUP
-- Run in Supabase SQL Editor
-- ============================================================

-- Create the bucket (public so images are accessible without auth)
insert into storage.buckets (id, name, public)
values ('f1-images', 'f1-images', true)
on conflict (id) do nothing;

-- Allow public read on all objects in the bucket
create policy "public read f1-images"
  on storage.objects for select
  using (bucket_id = 'f1-images');

-- Allow authenticated users (admins) to upload
create policy "admin upload f1-images"
  on storage.objects for insert
  with check (bucket_id = 'f1-images' and auth.role() = 'authenticated');

-- Allow authenticated users to update (replace)
create policy "admin update f1-images"
  on storage.objects for update
  using (bucket_id = 'f1-images' and auth.role() = 'authenticated');

-- Allow authenticated users to delete
create policy "admin delete f1-images"
  on storage.objects for delete
  using (bucket_id = 'f1-images' and auth.role() = 'authenticated');
