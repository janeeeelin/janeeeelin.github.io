-- Jane's Lens — 後台管理權限（限定 janeeeelin@gmail.com 這個帳號可以新增/編輯/刪除文章）
-- 用法：貼到 Supabase 專案的 SQL Editor 執行一次即可。
--
-- 在這之前，請先手動建立你的登入帳號（僅此一次，我不會經手你的密碼）：
--   Supabase 專案 → 左側選單 Authentication → Users → Add user
--   → 填入 email：janeeeelin@gmail.com，設一個密碼
--   → 記得勾選「Auto Confirm User」，不然要先收驗證信才能登入

-- authenticated 角色（也就是任何登入成功的使用者）需要有這張表的操作權限，
-- 但實際能動哪些 row，還是由下面的 RLS policy 決定 —— 不是任何登入的人都能寫。
grant select, insert, update, delete on public.articles to authenticated;

-- 讓管理員登入後可以看到「全部」文章（含未來 member_only = true 的），
-- 一般訪客／未登入使用者則還是只能看 member_only = false 的（沿用原本的 public policy）。
drop policy if exists "Owner can read all articles" on public.articles;
create policy "Owner can read all articles"
  on public.articles
  for select
  to authenticated
  using (auth.jwt() ->> 'email' = 'janeeeelin@gmail.com');

drop policy if exists "Owner can insert articles" on public.articles;
create policy "Owner can insert articles"
  on public.articles
  for insert
  to authenticated
  with check (auth.jwt() ->> 'email' = 'janeeeelin@gmail.com');

drop policy if exists "Owner can update articles" on public.articles;
create policy "Owner can update articles"
  on public.articles
  for update
  to authenticated
  using (auth.jwt() ->> 'email' = 'janeeeelin@gmail.com')
  with check (auth.jwt() ->> 'email' = 'janeeeelin@gmail.com');

drop policy if exists "Owner can delete articles" on public.articles;
create policy "Owner can delete articles"
  on public.articles
  for delete
  to authenticated
  using (auth.jwt() ->> 'email' = 'janeeeelin@gmail.com');
