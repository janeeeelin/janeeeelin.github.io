// member-auth.js — 前台會員登入／註冊小工具 + 文章鎖定機制
// 需要先載入 supabase-js CDN 和 supabase-config.js（提供全域的 supabaseClient）。
//
// 用法：
//   1. nav 裡放一個 <li><button id="auth-nav-btn"></button></li> 佔位
//   2. 頁面載入時呼叫 initAuthWidget()
//   3. 文章頁（note-N.html）額外呼叫 applyMemberGate(articleId, document.querySelector('.note-content'))
//   4. index.html 這種自己動態渲染文章列表的頁面，改用 getMemberFlags() / isLoggedIn() 自行決定要不要顯示完整內容，
//      並設定 window.onMemberAuthChange，登入狀態改變時會被呼叫。

(function () {
  const EMAIL_REDIRECT = 'https://janeeeelin.github.io/';

  function escapeHtml(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  // ── 樣式（一次注入，兩種頁面共用同一套視覺）───────────────────────────────
  const STYLE = `
    #auth-nav-btn {
      background: #1a6bb5; color: #fff; border: none; border-radius: 20px;
      padding: 0.4rem 1.1rem; font-size: 0.85rem; font-family: inherit; cursor: pointer;
      transition: background 0.18s;
    }
    #auth-nav-btn:hover { background: #155a9a; }
    @media (max-width: 600px) { #auth-nav-btn { width: 100%; border-radius: 20px; } }

    .auth-modal-backdrop {
      display: none; position: fixed; inset: 0; background: rgba(20,25,40,0.45);
      z-index: 1000; align-items: center; justify-content: center; padding: 1.2rem;
    }
    .auth-modal-backdrop.open { display: flex; }
    .auth-modal {
      width: 100%; max-width: 380px; background: #fff; border-radius: 16px;
      padding: 1.8rem 1.8rem 1.6rem; position: relative; box-shadow: 0 20px 60px rgba(0,0,0,0.25);
      font-family: 'Noto Sans TC', sans-serif;
    }
    .auth-modal-close {
      position: absolute; top: 0.8rem; right: 1rem; background: none; border: none;
      font-size: 1.3rem; color: #aaa; cursor: pointer; line-height: 1;
    }
    .auth-modal-close:hover { color: #666; }
    .auth-modal h2 { font-size: 1.15rem; color: #1a2a4a; margin-bottom: 1rem; }
    .auth-modal-tabs { display: flex; gap: 0.5rem; margin-bottom: 1.2rem; }
    .auth-tab {
      flex: 1; padding: 0.45rem; border-radius: 20px; border: 1.5px solid #dde8ff;
      background: transparent; color: #667; font-size: 0.86rem; font-family: inherit; cursor: pointer;
      transition: all 0.18s;
    }
    .auth-tab.active { background: #1a6bb5; border-color: #1a6bb5; color: #fff; }
    .auth-field { margin-bottom: 0.9rem; }
    .auth-field label { display: block; font-size: 0.8rem; color: #777; margin-bottom: 0.3rem; }
    .auth-field input {
      width: 100%; padding: 0.55rem 0.75rem; border: 1.5px solid #dde8ff; border-radius: 8px;
      font-size: 0.9rem; font-family: inherit; color: #333; outline: none; box-sizing: border-box;
    }
    .auth-field input:focus { border-color: #1a6bb5; }
    .auth-submit-btn {
      width: 100%; padding: 0.6rem; border: none; border-radius: 20px; background: #1a6bb5;
      color: #fff; font-size: 0.92rem; font-family: inherit; cursor: pointer; transition: background 0.18s;
    }
    .auth-submit-btn:hover { background: #155a9a; }
    .auth-submit-btn:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-msg { font-size: 0.83rem; margin-top: 0.8rem; padding: 0.55rem 0.7rem; border-radius: 8px; display: none; }
    .auth-msg.show { display: block; }
    .auth-msg.err { background: #fdf0f0; color: #b3261e; }
    .auth-msg.ok { background: #eafaf0; color: #157347; }

    .member-gate-card {
      margin-top: 1rem; padding: 1.6rem 1.4rem; border-radius: 14px; text-align: center;
      background: linear-gradient(135deg, #eef4ff 0%, #f5f0ff 100%);
      border: 1px solid rgba(26,107,181,0.15);
    }
    .member-gate-card .icon { font-size: 1.8rem; margin-bottom: 0.4rem; }
    .member-gate-card .title { font-size: 1.02rem; font-weight: 700; color: #1a2a4a; margin-bottom: 0.35rem; }
    .member-gate-card .desc { font-size: 0.88rem; color: #667; margin-bottom: 1.1rem; }
    .member-gate-card button {
      padding: 0.55rem 1.4rem; border: none; border-radius: 20px; background: #1a6bb5;
      color: #fff; font-size: 0.9rem; font-family: inherit; cursor: pointer; transition: background 0.18s;
    }
    .member-gate-card button:hover { background: #155a9a; }
  `;

  const MODAL_HTML = `
    <div id="auth-modal-backdrop" class="auth-modal-backdrop" onclick="if(event.target===this) closeAuthModal()">
      <div class="auth-modal">
        <button class="auth-modal-close" onclick="closeAuthModal()" aria-label="關閉">×</button>
        <h2 id="auth-modal-title">登入</h2>
        <div class="auth-modal-tabs">
          <button type="button" class="auth-tab active" data-mode="login" onclick="switchAuthMode('login')">登入</button>
          <button type="button" class="auth-tab" data-mode="signup" onclick="switchAuthMode('signup')">註冊</button>
        </div>
        <form id="auth-form">
          <div class="auth-field">
            <label for="auth-email">Email</label>
            <input type="email" id="auth-email" autocomplete="username" required>
          </div>
          <div class="auth-field">
            <label for="auth-password">密碼</label>
            <input type="password" id="auth-password" autocomplete="current-password" required minlength="6">
          </div>
          <button type="submit" class="auth-submit-btn" id="auth-submit-btn">登入</button>
          <div class="auth-msg" id="auth-msg"></div>
        </form>
      </div>
    </div>
  `;

  let authMode = 'login';

  function injectOnce() {
    if (!document.getElementById('member-auth-style')) {
      const s = document.createElement('style');
      s.id = 'member-auth-style';
      s.textContent = STYLE;
      document.head.appendChild(s);
    }
    if (!document.getElementById('auth-modal-backdrop')) {
      const div = document.createElement('div');
      div.innerHTML = MODAL_HTML;
      document.body.appendChild(div.firstElementChild);
    }
  }

  window.switchAuthMode = function (mode) {
    authMode = mode;
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.toggle('active', t.dataset.mode === mode));
    document.getElementById('auth-modal-title').textContent = mode === 'login' ? '登入' : '註冊';
    document.getElementById('auth-submit-btn').textContent = mode === 'login' ? '登入' : '註冊';
    const msg = document.getElementById('auth-msg');
    msg.className = 'auth-msg';
    msg.textContent = '';
  };

  window.openAuthModal = function (mode) {
    switchAuthMode(mode || 'login');
    document.getElementById('auth-modal-backdrop').classList.add('open');
    setTimeout(() => document.getElementById('auth-email').focus(), 0);
  };

  window.closeAuthModal = function () {
    const backdrop = document.getElementById('auth-modal-backdrop');
    if (backdrop) backdrop.classList.remove('open');
  };

  document.addEventListener('submit', async function (e) {
    if (e.target.id !== 'auth-form') return;
    e.preventDefault();
    const msg = document.getElementById('auth-msg');
    msg.className = 'auth-msg';
    msg.textContent = '';
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;
    const btn = document.getElementById('auth-submit-btn');
    btn.disabled = true;

    if (authMode === 'login') {
      const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
      btn.disabled = false;
      if (error) {
        msg.classList.add('show', 'err');
        msg.textContent = '登入失敗：' + error.message;
        return;
      }
      closeAuthModal();
    } else {
      const { data, error } = await supabaseClient.auth.signUp({
        email, password,
        options: { emailRedirectTo: EMAIL_REDIRECT }
      });
      btn.disabled = false;
      if (error) {
        msg.classList.add('show', 'err');
        msg.textContent = '註冊失敗：' + error.message;
        return;
      }
      msg.classList.add('show', 'ok');
      msg.textContent = '註冊成功！請到你的信箱收驗證信，點裡面的連結完成驗證後就可以登入了。';
    }
  });

  // ── 導覽列的登入／使用者按鈕 ─────────────────────────────────────────────
  async function refreshAuthButton() {
    const btn = document.getElementById('auth-nav-btn');
    if (!btn) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session) {
      btn.textContent = session.user.email;
      btn.onclick = async () => {
        if (confirm('要登出嗎？')) await supabaseClient.auth.signOut();
      };
    } else {
      btn.textContent = '註冊／登入';
      btn.onclick = () => openAuthModal('login');
    }
  }

  window.initAuthWidget = function () {
    injectOnce();
    refreshAuthButton();
  };

  supabaseClient.auth.onAuthStateChange((_event, session) => {
    refreshAuthButton();
    if (typeof window.onMemberAuthChange === 'function') window.onMemberAuthChange(session);
  });

  // ── 給 index.html 這類自己渲染列表的頁面用 ──────────────────────────────
  window.isLoggedIn = async function () {
    const { data: { session } } = await supabaseClient.auth.getSession();
    return !!session;
  };

  window.getMemberFlags = async function () {
    const flags = {};
    try {
      const { data, error } = await supabaseClient.from('article_flags').select('id, member_only');
      if (!error && data) data.forEach(r => { flags[r.id] = !!r.member_only; });
    } catch (e) { /* 讀不到就當作沒有鎖，不擋內容 */ }
    return flags;
  };

  window.memberGateCardHTML = function () {
    return (
      '<div class="member-gate-card">' +
        '<div class="icon">🔒</div>' +
        '<div class="title">這是會員專屬內容</div>' +
        '<div class="desc">登入即可閱讀完整文章</div>' +
        '<button type="button" onclick="openAuthModal(\'login\')">登入 / 註冊</button>' +
      '</div>'
    );
  };

  window.memberPreviewHTML = function (fullHTML, chars) {
    const tmp = document.createElement('div');
    tmp.innerHTML = fullHTML;
    const text = (tmp.textContent || '').trim();
    const preview = text.slice(0, chars || 200);
    return '<p style="margin-bottom:0.9rem">' + escapeHtml(preview) + '…</p>' + window.memberGateCardHTML();
  };

  // ── 給 note-N.html 這種靜態內容頁用：整個容器直接鎖 ─────────────────────
  window.applyMemberGate = async function (articleId, containerEl) {
    if (!containerEl) return;
    const fullHTML = containerEl.innerHTML;

    async function evaluate() {
      let locked = false;
      try {
        const { data } = await supabaseClient
          .from('article_flags')
          .select('member_only')
          .eq('id', articleId)
          .maybeSingle();
        if (data && data.member_only) {
          locked = !(await window.isLoggedIn());
        }
      } catch (e) {
        locked = false; // 查詢失敗就不擋內容，避免誤鎖
      }
      containerEl.innerHTML = locked ? window.memberPreviewHTML(fullHTML, 200) : fullHTML;
    }

    await evaluate();
    supabaseClient.auth.onAuthStateChange(() => evaluate());
  };
})();
