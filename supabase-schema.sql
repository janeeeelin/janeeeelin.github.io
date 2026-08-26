-- Jane's Lens — Supabase 初始資料表
-- 用法：複製整段貼到 Supabase 專案的 SQL Editor（左側選單 SQL Editor → New query）執行一次即可。
-- 會員資料表不需要另外建立，直接使用 Supabase 內建的 auth.users。

create table if not exists public.articles (
  id             bigint generated always as identity primary key,
  title          text not null,
  subtitle       text,
  content        text,
  category       text,
  published_date date,
  member_only    boolean not null default false
);

-- 開啟 Row Level Security，避免資料表在沒有任何政策的狀況下被無限制讀寫。
alter table public.articles enable row level security;

-- 只開放「非會員專屬」文章給前端（anon key）讀取；member_only = true 的文章
-- 之後要做會員驗證時，再另外加一條給已登入使用者的政策。
drop policy if exists "Public can read non-member articles" on public.articles;
create policy "Public can read non-member articles"
  on public.articles
  for select
  using (member_only = false);

-- RLS 政策只決定「哪些 row 可以讀」，PostgREST 還需要 table 本身有 GRANT 權限
-- 才會放行，透過 SQL Editor 建表時 Supabase 不會自動加這個 grant（用 Table Editor
-- 建表才會自動加），所以要手動補上，anon 角色才能真的查到資料。
grant select on public.articles to anon;
