// Supabase 連線設定
//
// SUPABASE_ANON_KEY 是「publishable / anon key」，設計上就是給前端瀏覽器使用的，
// 曝露在原始碼裡是安全的——實際的存取權限由 Supabase 那邊的 Row Level Security（RLS）
// 政策控制，不是靠這把 key 保密。真正機密的是 service_role key，那把「絕對不能」放進
// 任何前端檔案，這個檔案裡也沒有放。
const SUPABASE_URL = 'https://gaphkhchtmtghhcimwyf.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ViOPaDYEQQyPH3_X-WxOlg_wNm1qhbL';

// 需要先在頁面裡載入 supabase-js（見 test-connection.html 的 <script> 順序），
// 這裡才能拿到 window.supabase.createClient。
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
