#!/usr/bin/env python3
"""
publish_note.py - 自動把 note-N.html 的內容同步進 sitemap.xml 和 index.html
用法： python3 publish_note.py note-26.html
在 janeeeelin.github.io 這個 repo 資料夾裡執行，note-N.html 要已經放在同一個資料夾。
"""
import re, sys, os


def fail(msg):
    print(f"錯誤：{msg}")
    sys.exit(1)


if len(sys.argv) != 2:
    fail("用法：python3 publish_note.py note-26.html")

note_path = sys.argv[1]
if not os.path.exists(note_path):
    fail(f"找不到檔案 {note_path}")

note_id = os.path.splitext(os.path.basename(note_path))[0]  # e.g. note-26
if not re.match(r'^note-\d+$', note_id):
    fail(f"檔名格式不對，應該是 note-數字.html，收到的是 {note_path}")

with open(note_path, encoding='utf-8') as f:
    html = f.read()


def extract(pattern, label, flags=0):
    m = re.search(pattern, html, flags)
    if not m:
        fail(f"在 {note_path} 裡找不到 {label}")
    return m


date = extract(r'<span class="note-date">([^<]+)</span>', "發布日期").group(1).strip()
tag_m = extract(r'<span class="note-tag ([\w-]+)">([^<]+)</span>', "分類標籤")
tag_key, tag_label = tag_m.group(1), tag_m.group(2).strip()
title = extract(r'<h1 class="note-page-title">(.*?)</h1>', "標題", re.S).group(1).strip()
subtitle = extract(r'<p class="note-page-subtitle">(.*?)</p>', "副標題", re.S).group(1).strip()
quote_m = re.search(r'<meta property="og:description" content="([^"]*)">', html)
quote = quote_m.group(1).strip() if quote_m else subtitle

# 抓 note-content 區塊（正確處理裡面巢狀的 div）
start_tag = '<div class="note-content">'
start = html.find(start_tag)
if start == -1:
    fail('找不到 <div class="note-content"> 區塊')
pos = start + len(start_tag)
depth = 1
content_end = None
for m in re.finditer(r'<div\b|</div>', html[pos:]):
    if m.group(0) == '<div':
        depth += 1
    else:
        depth -= 1
    if depth == 0:
        content_end = pos + m.start()
        break
if content_end is None:
    fail("note-content 區塊沒有正確結束（div 數量對不起來）")
content = html[pos:content_end].strip()


def js_escape_single(s):
    return s.replace('\\', '\\\\').replace("'", "\\'")


def js_escape_template(s):
    return s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${')


title_js = js_escape_single(title)
subtitle_js = js_escape_single(subtitle)
quote_js = js_escape_single(quote)
content_js = js_escape_template(content)

print(f"讀到的資料：\n  note_id = {note_id}\n  date = {date}\n  tag = {tag_key} / {tag_label}\n  title = {title}\n")

# ---------- 更新 sitemap.xml ----------
sitemap_path = 'sitemap.xml'
if os.path.exists(sitemap_path):
    with open(sitemap_path, encoding='utf-8') as f:
        sitemap = f.read()
    if f'{note_id}.html' in sitemap:
        print(f"sitemap.xml 已經有 {note_id}，跳過")
    else:
        url_block = (
            f'  <url>\n'
            f'    <loc>https://janeeeelin.github.io/{note_id}.html</loc>\n'
            f'    <lastmod>{date}</lastmod>\n'
            f'    <changefreq>monthly</changefreq>\n'
            f'    <priority>0.7</priority>\n'
            f'  </url>\n'
        )
        if '</urlset>' not in sitemap:
            fail("sitemap.xml 裡找不到 </urlset>")
        sitemap = sitemap.replace('</urlset>', url_block + '</urlset>')
        with open(sitemap_path, 'w', encoding='utf-8') as f:
            f.write(sitemap)
        print(f"已將 {note_id} 加入 sitemap.xml")
else:
    print("找不到 sitemap.xml，跳過這一步")

# ---------- 更新 index.html ----------
index_path = 'index.html'
if not os.path.exists(index_path):
    fail("找不到 index.html")
with open(index_path, encoding='utf-8') as f:
    index_html = f.read()

if f"id: '{note_id}'" in index_html:
    print(f"index.html 已經有 {note_id}，跳過")
else:
    entry = (
        "      {\n"
        f"        id: '{note_id}',\n"
        f"        date: '{date}',\n"
        f"        tags: ['{tag_key}'],\n"
        f"        tagLabels: {{ '{tag_key}': '{tag_label}' }},\n"
        f"        title: '{title_js}',\n"
        f"        subtitle: '{subtitle_js}',\n"
        f"        quote: '{quote_js}',\n"
        f"        content: `{content_js}`,\n"
        "      },\n"
    )
    marker = 'const NOTES = ['
    if marker not in index_html:
        fail("index.html 裡找不到 const NOTES = [")
    index_html = index_html.replace(marker, marker + '\n' + entry, 1)
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_html)
    print(f"已將 {note_id} 加入 index.html 的 NOTES 陣列")

print()
print("完成！接下來確認沒問題後自己執行：")
print(f"  git add {note_id}.html sitemap.xml index.html")
print(f'  git commit -m "新增文章：{note_id}"')
print("  git push")
