
drop policy if exists "debug-files public read" on storage.objects;
create policy "debug-files public read"
on storage.objects for select
using (bucket_id = 'debug-files');

drop policy if exists "debug-files anon upload" on storage.objects;
create policy "debug-files anon upload"
on storage.objects for insert
with check (bucket_id = 'debug-files');
