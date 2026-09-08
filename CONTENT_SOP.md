---
purpose: "Jane's Lens 週報流程 SOP — 給每週排程執行的 Claude session 讀的固定流程文件"
last_updated: 2026-09-08
---

# Jane's Lens 週報 SOP

這份文件是「Jane's Lens 週報：國外行銷雜誌翻譯整合」這個每週排程任務的固定流程。每次排程啟動都是全新的 session、沒有記憶，所以每次執行都要先讀這份文件（`https://raw.githubusercontent.com/janeeeelin/janeeeelin.github.io/main/CONTENT_SOP.md`），再照著做。Jane 也可以自己編輯這份文件來調整流程，之後排程會自動照新版走。

## 0. 網站基本資訊
- 網址：https://janeeeelin.github.io ，GitHub Pages，repo 是 `janeeeelin/janeeeelin.github.io`，預設分支 `main`。
- 讀取原始檔用 `https://raw.githubusercontent.com/janeeeelin/janeeeelin.github.io/main/<檔名>`（WebFetch 直接對這個網址請求「輸出逐字原始內容」，才會拿到完整原始碼；對一般網址發請求常常只會拿到摘要）。
- 文章頁面命名 `note-N.html`，N 從 1 開始遞增。

## 1. 找素材
- 關注兩個領域，優先度相同，依當週素材品質選擇：(1) 社群媒體／KOL網紅行銷 (2) 不動產／都更行銷。
- 用 WebSearch 找近 1-2 週內國外頂尖行銷雜誌/媒體的文章（Marketing Week、Ad Age、Adweek、Marketing Dive、Social Media Today、MarketingProfs、HubSpot Blog、Sprout Social Blog、Later Blog／Inman、RISMedia、Urban Land、NAR 等），找不到夠新的可放寬到 3-4 週。
- 用 WebFetch 讀 `sitemap.xml` 抓目前最大的 note 編號（**用 raw.githubusercontent.com 讀，不要相信 janeeeelin.github.io/sitemap.xml 這個網址本身，它有時候會沒更新到最新，或被摘要工具讀錯**），新文章用 N+1。
- 用 WebFetch 讀 `index.html`（一樣用 raw.githubusercontent.com）看最近幾篇筆記的標題／tag，避免主題跟最近幾篇太像；兩個領域都有好素材時，優先選最近比較少寫過的那個領域。

## 2. 翻譯整合（不是逐字翻譯）
- WebFetch 讀原文全文，吸收論點、數據、案例，用 Jane 的口吻重寫成有個人觀點、連結台灣中小企業主/不動產KOL情境的中文分析文章，不是翻譯稿。
- Jane 的語氣：第一人稱、實務導向、給具體可執行建議、偶爾自我調侃、不寫成公關稿語氣。
- 文末要附原文出處（媒體名稱＋標題＋連結）。

## 3. 產出 note-N.html（固定格式，勿更動結構）

用 raw.githubusercontent.com 讀最新兩篇既有 note 當格式範本，完全比照其 HTML 結構（`<head>`、CSS、nav、note-page-card 等），並把裡面的 note id 全部換成新編號。

**以下幾個元素的 class name／結構是固定的，因為 Jane 有一支 `publish_note.py` 工具會用 regex 從 note-N.html 裡自動擷取這些欄位去更新 sitemap.xml 跟 index.html，格式跑掉會讓工具讀不到資料：**

- `<span class="note-date">YYYY-MM-DD</span>` — 發布日期，用執行當天日期
- `<span class="note-tag 標籤key">標籤中文</span>` — 分類標籤。**標籤key只能用英文小寫+連字號**（例如 `real-estate-trend`、`kol-matching`）。優先重複使用既有標籤（見下方「目前分類清單」），除非文章角度真的跟現有分類都不合，才新增分類（新增分類的額外步驟見第 5 節）
- `<h1 class="note-page-title">標題</h1>`
- `<p class="note-page-subtitle">副標題</p>`
- `<meta property="og:description" content="一句話金句">` — 這句話會被 `publish_note.py` 拿去當首頁列表卡片上顯示的 quote，跟 subtitle 分開寫，建議寫得比 subtitle 更精煉、更像一句可以被引用的金句
- `<div class="note-content"> ... </div>` — 整篇內文（intro 段落 + note-step 們 + 延伸閱讀區塊）都包在這裡面，不要在這個 div 外面放內文

內文結構：
- 開頭一段 `<p>` 破題
- 每個重點用 `<div class="note-step"><div class="step-header"><span class="step-num">01</span>小標題</div><div class="step-body">...</div></div>`，02、03、04 依序編號
- 如果適合寫 FAQ，`step-num` 用文字 `FAQ`（不是數字），內容格式 `<p><strong>Q：...</strong><br>A：...</p>`，通常 2-3 題
- 結論段 `step-num` 用 `💛`，最後一段小字附資料來源（媒體＋標題＋連結）
- 最後是「延伸閱讀」區塊，連到 1-2 篇主題相關的既有筆記

## 4. AI 可讀性檢查清單（每篇都要做到）

Jane 希望文章對 AI（AI搜尋、AI摘要、LLM引用）友善，以下是每篇必做的檢查：

- [ ] `</head>` 前一定要有 JSON-LD `Article` schema（headline / url / image / datePublished / dateModified / author / publisher），格式比照既有文章。**額外建議加上 `"inLanguage": "zh-TW"` 欄位**
- [ ] 如果有寫 FAQ，一定要再加一組 JSON-LD `FAQPage` schema，`mainEntity` 裡的 Q&A 文字要跟頁面上顯示的 FAQ 文字逐字一致
- [ ] `<head>` 裡加一行 `<link rel="canonical" href="https://janeeeelin.github.io/note-N.html">`（目前既有文章沒有這行，這是從 note-26 之後開始補上的新慣例，可以強化 AI／搜尋引擎對這篇文章正確網址的辨識）
- [ ] datePublished / dateModified 用當天日期，ISO 格式加 `+08:00`
- [ ] 內文用清楚的標題分段（note-step），不要整篇塞成一大段，方便 AI 抓取重點結構
- [ ] FAQ 的問答要能獨立成立（不依賴上下文就看得懂），這樣比較容易被 AI 答案引擎直接引用
- [ ] robots.txt 跟 llms.txt 已經是允許 AI 爬蟲、對 AI 友善的設定，不用每週檢查，但如果哪次意外發現被改掉要提醒 Jane

`llms.txt`（`https://janeeeelin.github.io/llms.txt`）是 Jane 手動維護的「重點文章」精選清單，不是每篇都要收錄。**不要自動編輯 llms.txt**；如果這週寫的文章特別重磅、適合收進精選清單，在交付訊息裡跟 Jane 提一句建議，由她自己決定要不要加。

## 5. 交付流程

1. 把完成的 `note-N.html` 存到工作目錄
2. 檢查這次 session 有沒有 `mcp__remote-devices__*` 工具且連得上 Jane 的電腦（資料夾是 `janeeeelin.github.io`）。這只是錦上添花，通常不會有，不用等待或勉強；連得上就直接把檔案寫進那個資料夾，連不上就跳過，不算錯誤。
3. 一定要用 SendUserFile 把 `note-N.html` 送出。
4. 傳訊息告訴 Jane（繁體中文）：
   - 這次選了哪篇原文（標題、媒體、連結）、為什麼選這篇
   - 新文章檔名
   - **接下來只要她做這幾步**（固定流程，`publish_note.py` 已經在她的 repo 裡了）：
     ```bash
     mv ~/Downloads/note-N.html .
     python3 publish_note.py note-N.html
     git diff
     git add note-N.html sitemap.xml index.html
     git commit -m "新增文章：note-N"
     git push
     ```
   - 如果這次用了新的分類標籤（第 3 節提到的情況），額外提醒她要用 `add_category.py` 的做法先把新分類加到 tag-cloud 按鈕清單和 `SIDEBAR_CATS` 陣列（兩處都要），做法可以參考本文件第 6 節，或直接把當週需要的新增分類內容整理成一段 python heredoc 指令給她貼終端機執行
   - 如果 llms.txt 有建議新增的重點文章，這裡提一句
5. **絕對不要自己執行 git push**，永遠留給 Jane 自己確認後執行。
6. 不要自動修改 `index.html` 或 `sitemap.xml`（那是 Jane 在她自己電腦上跑 `publish_note.py` 才會做的事）。

## 6. 目前分類清單（tags）

這份清單同時存在 index.html 兩個地方：`<div class="tag-cloud">` 裡的按鈕，跟 `const SIDEBAR_CATS = [...]` 陣列。兩處的 tag key／中文標籤要完全對應。目前已有：

| tag key | 中文標籤 |
|---|---|
| claude-code | Claude Code |
| mac | Mac 教學 |
| beginner | 新手教學 |
| claude-ai | Claude AI |
| ig | IG 經營 |
| seo-aio | SEO／AIO |
| ai-tools | AI 工具 |
| tech-trend | 科技趨勢分析 |
| ai-observation | AI觀察 |
| kol-matching | 網紅媒合實戰 |
| real-estate-trend | 房產趨勢觀察 |
| channel-strategy | 行銷通路觀察 |

新增分類時（盡量避免，優先重複用上面已有的），要同時：
1. 在 note-N.html 裡用新 tag key
2. 準備一段給 Jane 在終端機跑的 python 指令，同時更新 index.html 的 `tag-cloud` 按鈕清單跟 `SIDEBAR_CATS` 陣列（用字串比對插在最後一個既有項目後面，插入前先檢查該 tag key 是否已存在，已存在就跳過，避免重複執行造成重複插入）
3. 順便把新分類補進上面這張表格（編輯這份 CONTENT_SOP.md 本身）

## 7. 工具清單（都已經在 Jane 的 repo 裡）

- `publish_note.py`：讀 note-N.html，自動把資料同步進 sitemap.xml 和 index.html 的 NOTES 陣列。用法：`python3 publish_note.py note-N.html`。可重複執行，已存在的 note 會自動跳過不重複插入。
- `add_category.py`：新增分類標籤時的參考範例（實際每次分類名稱不同，要重新產生對應的 python 指令給 Jane，不是直接重跑這支舊檔案）。

## 8. 其他注意事項

- 無人值守排程，不要用 AskUserQuestion 等回覆，遇到判斷點（選哪篇素材、下什麼標題）用專業判斷直接做，並在訊息裡簡短說明理由。
- 找不到近期高品質候選文章時，放寬到 3-4 週再找一次；無論如何都要傳訊息告訴 Jane 這次的結果，不要無聲無息結束。
- 回覆 Jane 一律使用繁體中文。
