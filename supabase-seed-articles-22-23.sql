-- Jane's Lens — 新增「網紅媒合實戰」分類的 2 篇文章到 articles 表（預售屋/新成屋系列）
-- 用法：貼到 Supabase SQL Editor 執行一次即可。
--
-- 背景：這 2 篇文章的正文實際上是透過 note-22.html / note-23.html 兩個靜態頁面，
-- 以及 index.html 的 NOTES 陣列發布的（跟現有文章的發布機制一致）。
-- 這裡額外把它們也寫進 articles 表，只是為了讓 admin.html 後台看得到、管得到
-- （例如之後要切換「僅會員可看」），id 特別指定成 22 / 23，
-- 對應 note-22.html / note-23.html 的頁面編號，讓會員鎖定機制（article_flags）能正確比對。
-- member_only 先設 false（目前都是公開文章）。

insert into public.articles (id, title, subtitle, content, category, published_date, member_only)
overriding system value
values
(
  22,
  '預售屋/新成屋的信任赤字：買方不信代銷業務，網紅能補上什麼？',
  '樣品屋再美，買方心裡都有一句：這是包裝出來的嗎？',
  '<p style="margin-bottom:0.9rem">走進接待中心，看著精美的樣品屋、燈光美氣氛佳的3D建築模型，大部分買方心裡其實同時跑著另一句話：「這是包裝出來的，實際交屋會是這樣嗎？」預售屋最大的先天劣勢，是買方要在房子還沒蓋好之前，憑一份平面圖、一間樣品屋、一段業務的口頭承諾，決定人生最大一筆支出。新成屋雖然看得到實體，但買方一樣會擔心：照片修得漂亮、實際採光格局是不是有落差？公設比會不會虛坪灌水？社區品質、鄰居素質、日後管理維護，這些代銷業務不會主動告訴你。</p>
<p style="margin-bottom:0.9rem">這種不信任感，不是因為建商不誠實，而是這個產業結構性的資訊不對稱——買方永遠比賣方少知道很多事，而業務的工作就是把房子賣出去。</p>

<div class="note-step">
  <div class="step-header"><span class="step-num">01</span>為什麼業務講的話，買方永遠打折聽</div>
  <div class="step-body">
    <p>同一句「這個社區採光通風非常好」，從代銷業務口中說出來，跟從一個沒有拿佣金、自己花時間跑去看屋的創作者口中說出來，說服力完全不同。買方很清楚業務有業績壓力，所以再誠懇的介紹，都會被自動加上一層「他當然會這樣講」的防衛心。這跟找誰講無關，是立場問題——只要訊息來源被認定「賣方立場」，可信度就會被打折，即使內容完全屬實。</p>
  </div>
</div>

<div class="note-step">
  <div class="step-header"><span class="step-num">02</span>第三方視角能問出買方真正想知道的問題</div>
  <div class="step-body">
    <p>網紅、KOC 的價值，在於他們能問業務不會主動回答、買方自己又不好意思一直追問的問題：實際坪數扣掉公設之後到底剩多少？樑柱有沒有影響傢俱擺放？尖峰時段開車到最近的交流道實際要多久？同建商過去完工的案子，住戶交屋後的真實心得是什麼？這些內容如果由代銷業務自己講，聽起來像業配話術；但由第三方創作者親自跑一趟、用「我自己也想知道」的角度呈現，會更貼近買方真正在意、卻在接待中心不敢問太細的疑慮。</p>
    <p>這種真實體驗感，本質上是把買方從「不信任銷售話術」的預設立場，透過一個沒有利益關係的第三方視角，重新拉回對這個案子的信心。</p>
  </div>
</div>

<div class="note-step">
  <div class="step-header"><span class="step-num">03</span>但這件事一樣有雷要避</div>
  <div class="step-body">
    <p>預售屋、新成屋的網紅內容如果找錯人、拍得太像業配、或迴避了坪數/格局這類買方最敏感的真實落差，不但補不上信任，交屋後反而會被回頭檢視「當初網紅講的跟實際不一樣」，殺傷力比什麼都不做更大。這部分常見的雷區，我會在下一篇拆解。</p>
  </div>
</div>

<div class="note-step">
  <div class="step-header"><span class="step-num">💛</span>結論</div>
  <div class="step-body">
    <p>如果你正在思考怎麼用第三方內容幫買方建立對案子的信心，歡迎找我聊聊，看看你的案子適合什麼樣的操作方式。</p>
  </div>
</div>',
  '網紅媒合實戰',
  '2026-09-02',
  false
),
(
  23,
  '預售屋/新成屋想找網紅合作，該注意哪些眉角？常見雷區與避坑指南',
  '四個常見雷區，比沒做行銷更傷品牌',
  '<p style="margin-bottom:0.9rem">上一篇談到，網紅、KOC 的第三方視角能補上預售屋、新成屋最缺的信任感。但這件事做錯的話，不但補不上信任，交屋後反而會被買方翻出來檢視「當初講的跟實際不一樣」——這種事後反噬，比沒做行銷更傷品牌。這篇整理幾個常見的雷區。</p>

<div class="note-step">
  <div class="step-header"><span class="step-num">01</span>雷區一：找了調性不對的網紅</div>
  <div class="step-body">
    <p>買房是理性程度很高的決策，找一個粉絲數很高但內容偏娛樂、業配感重的網紅來介紹預售案，買方看到的第一印象就是「業配文」，可信度直接打折。比較適合的是居家生活類、開箱評測類、或本身就有看屋/裝潢經驗分享習慣的創作者，粉絲數不用最大，但內容調性要跟「認真研究要不要買房」的受眾心理對得上。</p>
  </div>
</div>

<div class="note-step">
  <div class="step-header"><span class="step-num">02</span>雷區二：只呈現美化過的樣品屋，迴避真實落差</div>
  <div class="step-body">
    <p>這是預售屋內容最容易踩的雷。如果內容只拍樣品屋的美美畫面，卻不誠實揭露公設比、實際坪數扣除梁柱後的可用空間、或跟樣品屋傢俱配置不同時的實際觀感，等到買方交屋後發現落差，會直接把帳算在當初推薦的創作者跟建商頭上，對雙方信譽都是重傷。誠實揭露一些「不完美」的細節，反而更能取得買方信任——太過完美的內容，本身就會啟動買方的防衛心。</p>
  </div>
</div>

<div class="note-step">
  <div class="step-header"><span class="step-num">03</span>雷區三：內容太有「業配感」</div>
  <div class="step-body">
    <p>把代銷的銷售文案原封不動塞給創作者念稿，或要求置入過多品牌訊息，粉絲一眼就能看穿。內容需要保留創作者原有的敘事方式跟提問角度，用「我自己在看房」的真實好奇心包裝，而不是照本宣科的介紹稿。</p>
  </div>
</div>

<div class="note-step">
  <div class="step-header"><span class="step-num">04</span>雷區四：法規與敏感詞沒把關</div>
  <div class="step-body">
    <p>預售屋廣告受公平交易法與內政部「預售屋買賣定型化契約應記載及不得記載事項」規範，坪數計算方式、公設比揭露、增值幅度或保證獲利的宣傳字眼都有明確紅線，講錯話可能引發消費爭議甚至法律責任。一般網紅代操公司未必熟悉這些細節，很容易在腳本審核時漏掉不該講、或講得不夠精確的地方。這也是為什麼預售屋、新成屋的內容合作，需要有懂法規、又懂內容操作的人居中把關，而不是套用一般商品業配的審核流程。</p>
  </div>
</div>

<div class="note-step">
  <div class="step-header"><span class="step-num">💛</span>結論</div>
  <div class="step-body">
    <p>避開這四個雷區，網紅/KOC 內容才能真正發揮補上信任的作用，而不是變成另一場交屋後被回頭檢視的宣傳。如果你正在規劃預售或新成屋案的內容合作，歡迎找我聊聊，一起看看問題出在哪個環節。</p>
  </div>
</div>',
  '網紅媒合實戰',
  '2026-09-03',
  false
);

-- 修正 identity 序列，避免下一次在 admin.html「新增文章」時，
-- 因為序列還停在舊的計數上而跟這裡手動指定的 id (22, 23) 撞號。
select setval(pg_get_serial_sequence('public.articles', 'id'), (select max(id) from public.articles));
