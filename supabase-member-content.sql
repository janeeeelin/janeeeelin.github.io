-- Jane's Lens — 會員內容鎖定機制需要的資料庫設定
-- 用法：貼到 Supabase 專案的 SQL Editor 執行一次即可。
--
-- 背景：articles 表現有的 RLS 只讓「非會員文章（member_only = false）」對外可見，
-- 這對正文內容來說是對的，但也代表：一個沒登入的訪客甚至查不到「這篇是不是會員文章」
-- 這個旗標本身（因為整個 row 直接被 RLS 擋掉）。前台要能顯示「這篇鎖住了，登入解鎖」，
-- 需要一個只回傳中繼資料（不含正文 content）的管道，讓任何人都查得到 member_only 是
-- true 還是 false，但查不到內容本身。

create or replace view public.article_flags as
  select id, title, subtitle, category, published_date, member_only
  from public.articles;

grant select on public.article_flags to anon, authenticated;
