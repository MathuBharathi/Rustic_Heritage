/* ══════════════════════════════════════════════
   RUSTIC HERITAGE KITCHENWARE — auth-modal.js
   FULLY FIXED — every bug resolved
══════════════════════════════════════════════ */

const RH_SUPABASE_URL  = 'https://tlhhxpttifgtgnrzjrga.supabase.co';
const RH_SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaGh4cHR0aWZndGducnpqcmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTQ2MDUsImV4cCI6MjA5ODg3MDYwNX0.ZYB12Ekl1EImXRdxvyGNEvXLxnNOe-36oxvo3z4gSI0';

/* ── Supabase client: retries until CDN script is ready ── */
let _rhClient = null;
function getRHClient(cb) {
  if (_rhClient) { cb && cb(_rhClient); return _rhClient; }
  if (window.supabase && window.supabase.createClient) {
    _rhClient = window.supabase.createClient(RH_SUPABASE_URL, RH_SUPABASE_ANON);
    cb && cb(_rhClient); return _rhClient;
  }
  cb && setTimeout(() => getRHClient(cb), 120);
  return null;
}

const RH_AUTH = { tab: 'login', showPw: false, showSignupPw: false, showConfirmPw: false, user: null };

/* ══════════════════════════════════════════════
   INJECT MODAL + STYLES
══════════════════════════════════════════════ */
function injectAuthModal() {
  if (document.getElementById('rh-auth-overlay')) return;

  const style = document.createElement('style');
  style.textContent = `
    #rh-auth-overlay {
      position:fixed;inset:0;z-index:2000;background:rgba(0,0,0,0);pointer-events:none;
      display:flex;align-items:center;justify-content:center;padding:20px;
      transition:background 0.3s ease;font-family:'Georgia',serif;
    }
    #rh-auth-overlay.open{background:rgba(30,15,5,0.65);pointer-events:all;}
    #rh-auth-card{
      background:#FDF6EC;width:100%;max-width:480px;border-radius:6px;overflow:hidden;
      box-shadow:0 24px 80px rgba(0,0,0,0.45);
      transform:translateY(24px) scale(0.97);opacity:0;
      transition:transform 0.35s cubic-bezier(0.4,0,0.2,1),opacity 0.35s ease;
      max-height:92vh;overflow-y:auto;
    }
    #rh-auth-overlay.open #rh-auth-card{transform:translateY(0) scale(1);opacity:1;}
    .rh-auth-header{
      background:linear-gradient(135deg,#3B2A1A 0%,#5C3D1E 50%,#3B2A1A 100%);
      padding:22px 28px 18px;position:relative;
    }
    .rh-auth-logo{display:flex;align-items:center;gap:12px;margin-bottom:4px;}
    .rh-auth-logo-icon{
      width:44px;height:44px;border-radius:50%;background:#fff;
      display:flex;align-items:center;justify-content:center;
      font-size:22px;border:2px solid #C49A6C;flex-shrink:0;
    }
    .rh-auth-logo-text span:first-child{display:block;font-size:17px;font-weight:bold;color:#F5ECD7;letter-spacing:1px;}
    .rh-auth-logo-text span:last-child{display:block;font-size:10px;color:#C49A6C;letter-spacing:3px;text-transform:uppercase;}
    .rh-auth-tagline{font-size:10px;color:rgba(196,154,108,0.75);letter-spacing:3px;text-transform:uppercase;margin-left:56px;}
    .rh-auth-close{
      position:absolute;top:14px;right:16px;
      background:rgba(196,154,108,0.15);border:1px solid rgba(196,154,108,0.3);
      color:#C49A6C;width:30px;height:30px;border-radius:4px;cursor:pointer;font-size:16px;
      display:flex;align-items:center;justify-content:center;transition:background 0.2s;
    }
    .rh-auth-close:hover{background:rgba(196,154,108,0.3);}
    .rh-auth-goldbar{height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C);}
    .rh-auth-tabs{display:flex;border-bottom:1px solid #E8D5B7;background:#F5ECD7;}
    .rh-auth-tab{
      flex:1;padding:14px;text-align:center;background:none;border:none;cursor:pointer;
      font-family:'Georgia',serif;font-size:12px;letter-spacing:2px;text-transform:uppercase;
      color:#8B5E3C;position:relative;transition:color 0.2s;
    }
    .rh-auth-tab.active{color:#3B2A1A;font-weight:bold;}
    .rh-auth-tab.active::after{content:'';position:absolute;bottom:-1px;left:0;right:0;height:2px;background:#5C3D1E;}
    .rh-auth-body{padding:28px;}
    .rh-auth-ornament{
      text-align:center;margin-bottom:20px;font-size:11px;letter-spacing:3px;
      text-transform:uppercase;color:#C49A6C;display:flex;align-items:center;gap:10px;
    }
    .rh-auth-ornament::before,.rh-auth-ornament::after{content:'';flex:1;height:1px;background:#E8D5B7;}
    .rh-auth-alert{padding:12px 14px;border-radius:6px;margin-bottom:16px;font-size:13px;line-height:1.5;}
    .rh-auth-alert.error  {background:#fde8e8;color:#8b1a1a;border:1px solid #f5c6c6;}
    .rh-auth-alert.info   {background:#fff8e8;color:#7a4f0a;border:1px solid #f5dfa0;}
    .rh-auth-alert.success{background:#e8f5ee;color:#1a5c34;border:1px solid #b8e0cc;}
    .rh-auth-field{margin-bottom:18px;}
    .rh-auth-label{display:block;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#5C3D1E;margin-bottom:7px;font-weight:bold;}
    .rh-auth-input-wrap{
      display:flex;align-items:center;border:1.5px solid #E8D5B7;border-radius:4px;
      background:#fff;transition:border-color 0.2s;overflow:hidden;
    }
    .rh-auth-input-wrap:focus-within{border-color:#8B5E3C;}
    .rh-auth-icon{padding:0 12px;font-size:15px;color:#C49A6C;flex-shrink:0;}
    .rh-auth-input{
      flex:1;padding:13px 12px 13px 0;border:none;outline:none;background:transparent;
      font-size:14px;font-family:'Georgia',serif;color:#3B2A1A;
    }
    .rh-auth-input::placeholder{color:#C49A6C;opacity:0.7;}
    .rh-auth-eye{background:none;border:none;cursor:pointer;padding:0 12px;color:#C49A6C;font-size:14px;}
    .rh-auth-err{font-size:12px;color:#8b1a1a;margin-top:5px;font-style:italic;min-height:16px;}
    .rh-auth-row2{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
    .rh-auth-submit{
      width:100%;padding:15px;background:#3B2A1A;color:#F5ECD7;border:none;border-radius:4px;
      cursor:pointer;font-family:'Georgia',serif;font-size:15px;letter-spacing:1px;
      transition:background 0.2s,transform 0.2s;margin-top:4px;margin-bottom:14px;
    }
    .rh-auth-submit:hover:not(:disabled){background:#5C3D1E;transform:translateY(-1px);}
    .rh-auth-submit:disabled{opacity:0.65;cursor:not-allowed;transform:none;}
    .rh-auth-switch{text-align:center;font-size:13px;color:#8B5E3C;font-style:italic;}
    .rh-auth-switch button{background:none;border:none;color:#5C3D1E;cursor:pointer;text-decoration:underline;font-family:'Georgia',serif;font-size:13px;}
    .rh-auth-forgot{text-align:right;margin-top:-10px;margin-bottom:16px;}
    .rh-auth-forgot button{background:none;border:none;color:#8B5E3C;cursor:pointer;font-size:12px;font-family:'Georgia',serif;font-style:italic;text-decoration:underline;}
    .rh-auth-check{display:flex;gap:8px;align-items:flex-start;margin-bottom:18px;}
    .rh-auth-check input{margin-top:3px;accent-color:#5C3D1E;}
    .rh-auth-check label{font-size:12px;color:#8B5E3C;line-height:1.5;}
    .rh-auth-check a{color:#5C3D1E;}
    .rh-pw-bar{height:3px;background:#E8D5B7;border-radius:2px;overflow:hidden;margin-top:5px;}
    .rh-pw-fill{height:100%;border-radius:2px;transition:width 0.3s,background 0.3s;}
    .rh-auth-success{text-align:center;padding:30px 16px;}
    .rh-auth-success-icon{font-size:52px;margin-bottom:14px;}
    .rh-auth-success h3{font-size:22px;color:#3B2A1A;margin-bottom:10px;}
    .rh-auth-success p{font-size:14px;color:#8B5E3C;line-height:1.8;margin-bottom:22px;}
    @keyframes rh-spin{to{transform:rotate(360deg);}}
    .rh-spinner{
      display:inline-block;width:15px;height:15px;
      border:2px solid rgba(245,236,215,0.3);border-top-color:#F5ECD7;
      border-radius:50%;animation:rh-spin 0.7s linear infinite;
      vertical-align:middle;margin-right:8px;
    }
    .rh-nav-user-wrap{display:contents;position:relative;}
    .rh-nav-user-pill{
      display:flex;align-items:center;gap:8px;
      background:rgba(196,154,108,0.15);border:1px solid rgba(196,154,108,0.4);
      color:#F5ECD7;padding:6px 14px;border-radius:20px;cursor:pointer;
      font-family:'Georgia',serif;font-size:13px;transition:background 0.2s;
      position:relative;
    }
    .rh-nav-user-pill:hover{background:rgba(196,154,108,0.3);}
    .rh-nav-avatar{
      width:26px;height:26px;border-radius:50%;background:#C49A6C;color:#3B2A1A;
      display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:bold;flex-shrink:0;
    }
    .rh-nav-dropdown{
      position:absolute;top:100%;right:0;margin-top:6px;
      background:#FDF6EC;border:1px solid #E8D5B7;border-radius:8px;
      box-shadow:0 8px 32px rgba(92,61,30,0.25);min-width:160px;
      opacity:0;transform:translateY(-8px);pointer-events:none;
      transition:opacity 0.2s ease,transform 0.2s ease;z-index:1500;
      overflow:hidden;
    }
    .rh-nav-dropdown.show{opacity:1;transform:translateY(0);pointer-events:all;}
    .rh-nav-dropdown a,.rh-nav-dropdown button{
      display:block;width:100%;text-align:left;padding:10px 16px;
      font-size:13px;font-family:'Georgia',serif;color:#5C3D1E;
      background:none;border:none;cursor:pointer;text-decoration:none;
      transition:background 0.15s;
    }
    .rh-nav-dropdown a:hover,.rh-nav-dropdown button:hover{background:#F5ECD7;}
    .rh-nav-dropdown .divider{height:1px;background:#E8D5B7;margin:0;}
    @media(max-width:480px){.rh-auth-row2{grid-template-columns:1fr;}.rh-auth-body{padding:20px;}}
  `;
  document.head.appendChild(style);

  /* Wrap every .rh-nav-signin-btn in a stable container */
  document.querySelectorAll('.rh-nav-signin-btn').forEach(btn => {
    const wrap = document.createElement('div');
    wrap.className = 'rh-nav-user-wrap';
    btn.parentNode.insertBefore(wrap, btn);
    wrap.appendChild(btn);
  });

  const overlay = document.createElement('div');
  overlay.id = 'rh-auth-overlay';
  overlay.onclick = e => { if (e.target === overlay) closeAuthModal(); };
  overlay.innerHTML = `
    <div id="rh-auth-card">
      <div class="rh-auth-header">
        <div class="rh-auth-logo">
          <div class="rh-auth-logo-icon">🏺</div>
          <div class="rh-auth-logo-text">
            <span>Rustic Heritage</span><span>Kitchenware</span>
          </div>
        </div>
        <p class="rh-auth-tagline">✦ &nbsp;Rooted in Tradition&nbsp; ✦</p>
        <button class="rh-auth-close" onclick="closeAuthModal()">✕</button>
      </div>
      <div class="rh-auth-goldbar"></div>
      <div class="rh-auth-tabs">
        <button class="rh-auth-tab active" id="rh-tab-login"  onclick="switchRHTab('login')">Sign In</button>
        <button class="rh-auth-tab"        id="rh-tab-signup" onclick="switchRHTab('signup')">Create Account</button>
      </div>
      <div class="rh-auth-body" id="rh-auth-body"></div>
    </div>`;
  document.body.appendChild(overlay);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAuthModal(); });
}

/* ══════════════════════════════════════════════
   OPEN / CLOSE
══════════════════════════════════════════════ */
function openAuthModal(tab = 'login') {
  injectAuthModal();
  switchRHTab(tab);
  document.getElementById('rh-auth-overlay').classList.add('open');
  setTimeout(() => document.querySelector('#rh-auth-body input')?.focus(), 360);
}
function closeAuthModal() {
  document.getElementById('rh-auth-overlay')?.classList.remove('open');
}

/* ── Only call switchRHTab when NOT mid-request ── */
function switchRHTab(tab) {
  RH_AUTH.tab = tab;
  document.getElementById('rh-tab-login') ?.classList.toggle('active', tab === 'login');
  document.getElementById('rh-tab-signup')?.classList.toggle('active', tab === 'signup');
  const body = document.getElementById('rh-auth-body');
  if (body) body.innerHTML = tab === 'login' ? buildRHLoginForm() : buildRHSignupForm();
}

/* ── Write to body without touching tabs ── */
function setAuthBody(html) {
  const body = document.getElementById('rh-auth-body');
  if (body) body.innerHTML = html;
}

/* ══════════════════════════════════════════════
   FORMS
══════════════════════════════════════════════ */
function buildRHLoginForm() {
  return `
    <div class="rh-auth-ornament"><span>Welcome Back</span></div>
    <div id="rh-alert-box"></div>
    <div class="rh-auth-field">
      <label class="rh-auth-label">Email Address</label>
      <div class="rh-auth-input-wrap">
        <span class="rh-auth-icon">✉</span>
        <input class="rh-auth-input" type="email" id="rh-li-email"
               placeholder="you@example.com" autocomplete="email"
               oninput="clearRHAlert()" onkeydown="if(event.key==='Enter')handleRHLogin()"/>
      </div>
      <div class="rh-auth-err" id="rh-li-email-err"></div>
    </div>
    <div class="rh-auth-field">
      <label class="rh-auth-label">Password</label>
      <div class="rh-auth-input-wrap">
        <span class="rh-auth-icon">🔒</span>
        <input class="rh-auth-input" type="password" id="rh-li-pw"
               placeholder="Your password" autocomplete="current-password"
               oninput="clearRHAlert()" onkeydown="if(event.key==='Enter')handleRHLogin()"/>
        <button class="rh-auth-eye" type="button"
                onclick="rhTogglePw('rh-li-pw',this)">👁</button>
      </div>
      <div class="rh-auth-err" id="rh-li-pw-err"></div>
    </div>
    <div class="rh-auth-forgot">
      <button type="button" onclick="handleRHForgot()">Forgot password?</button>
    </div>
    <button class="rh-auth-submit" id="rh-login-btn" onclick="handleRHLogin()">Sign In →</button>
    <div class="rh-auth-switch">
      Don't have an account? <button onclick="switchRHTab('signup')">Create one</button>
    </div>
    <div style="text-align:center;margin-top:14px;padding-top:14px;border-top:1px solid #E8D5B7;">
      <button style="background:none;border:none;color:#8B5E3C;cursor:pointer;font-size:12px;font-family:'Georgia',serif;letter-spacing:0.5px;" onclick="window.location.href='admin.html'">🔐 Login as Admin</button>
    </div>`;
}

function buildRHSignupForm() {
  return `
    <div class="rh-auth-ornament"><span>Join Rustic Heritage</span></div>
    <div id="rh-alert-box"></div>
    <div class="rh-auth-row2">
      <div class="rh-auth-field">
        <label class="rh-auth-label">Full Name</label>
        <div class="rh-auth-input-wrap">
          <span class="rh-auth-icon">👤</span>
          <input class="rh-auth-input" type="text" id="rh-su-name"
                 placeholder="Your name" autocomplete="name" oninput="clearRHAlert()"/>
        </div>
        <div class="rh-auth-err" id="rh-su-name-err"></div>
      </div>
      <div class="rh-auth-field">
        <label class="rh-auth-label">Mobile</label>
        <div class="rh-auth-input-wrap">
          <span class="rh-auth-icon">📱</span>
          <input class="rh-auth-input" type="tel" id="rh-su-phone"
                 placeholder="10-digit number" maxlength="10"
                 oninput="this.value=this.value.replace(/\D/g,'').slice(0,10)"/>
        </div>
      </div>
    </div>
    <div class="rh-auth-field">
      <label class="rh-auth-label">Email Address</label>
      <div class="rh-auth-input-wrap">
        <span class="rh-auth-icon">✉</span>
        <input class="rh-auth-input" type="email" id="rh-su-email"
               placeholder="you@example.com" autocomplete="email" oninput="clearRHAlert()"/>
      </div>
      <div class="rh-auth-err" id="rh-su-email-err"></div>
    </div>
    <div class="rh-auth-field">
      <label class="rh-auth-label">Password</label>
      <div class="rh-auth-input-wrap">
        <span class="rh-auth-icon">🔒</span>
        <input class="rh-auth-input" type="password" id="rh-su-pw"
               placeholder="At least 6 characters" autocomplete="new-password"
               oninput="updateRHPwStrength(this.value);clearRHAlert()"/>
        <button class="rh-auth-eye" type="button"
                onclick="rhTogglePw('rh-su-pw',this)">👁</button>
      </div>
      <div class="rh-pw-bar"><div class="rh-pw-fill" id="rh-pw-fill" style="width:0%"></div></div>
      <div id="rh-pw-label" style="font-size:11px;color:#8B5E3C;font-style:italic;margin-top:3px;min-height:16px"></div>
      <div class="rh-auth-err" id="rh-su-pw-err"></div>
    </div>
    <div class="rh-auth-field">
      <label class="rh-auth-label">Confirm Password</label>
      <div class="rh-auth-input-wrap">
        <span class="rh-auth-icon">🔒</span>
        <input class="rh-auth-input" type="password" id="rh-su-pw2"
               placeholder="Repeat password" autocomplete="new-password"
               oninput="clearRHAlert()" onkeydown="if(event.key==='Enter')handleRHSignup()"/>
        <button class="rh-auth-eye" type="button"
                onclick="rhTogglePw('rh-su-pw2',this)">👁</button>
      </div>
      <div class="rh-auth-err" id="rh-su-pw2-err"></div>
    </div>
    <div class="rh-auth-check">
      <input type="checkbox" id="rh-su-terms"/>
      <label for="rh-su-terms">
        I agree to the <a href="#">Terms of Service</a> and
        <a href="#">Privacy Policy</a> of Rustic Heritage Kitchenware.
      </label>
    </div>
    <button class="rh-auth-submit" id="rh-signup-btn" onclick="handleRHSignup()">Create Account →</button>
    <div class="rh-auth-switch">
      Already have an account? <button onclick="switchRHTab('login')">Sign in</button>
    </div>`;
}

/* Toggle password visibility — NO form re-render */
function rhTogglePw(inputId, btn) {
  const inp = document.getElementById(inputId);
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  if (btn) btn.textContent = show ? '🙈' : '👁';
}

/* ══════════════════════════════════════════════
   LOGIN HANDLER
══════════════════════════════════════════════ */
async function handleRHLogin() {
  clearRHAlert();
  clearAllRHErrs();

  const email = (document.getElementById('rh-li-email')?.value || '').trim();
  const pw    = (document.getElementById('rh-li-pw')?.value    || '');

  if (!email) { setRHErr('rh-li-email-err', 'Email is required'); return; }
  if (!pw)    { setRHErr('rh-li-pw-err',    'Password is required'); return; }

  /* Update button directly — do NOT re-render the form */
  const btn = document.getElementById('rh-login-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="rh-spinner"></span>Signing In…'; }

  getRHClient(async c => {
    if (!c) {
      showRHAlert('Authentication service unavailable. Please refresh the page.', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In →'; }
      return;
    }

    let data, error;
    try {
      ({ data, error } = await c.auth.signInWithPassword({ email, password: pw }));
    } catch (networkErr) {
      console.error('[RH Auth] Login network error:', networkErr);
      showRHAlert('Connection failed. Please check your internet and try again.', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In →'; }
      return;
    }

    if (error) {
      console.error('[RH Auth] Login error:', error.message);
      showRHAlert(mapRHError(error.message), 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In →'; }
      return;
    }

    /* ✅ SUCCESS */
    RH_AUTH.user = data.user;
    const name = data.user.user_metadata?.name || email.split('@')[0];
    setAuthBody(`
      <div class="rh-auth-success">
        <div class="rh-auth-success-icon">✅</div>
        <h3>Welcome Back, ${name}!</h3>
        <p>You're signed in to Rustic Heritage.<br/>Ready to explore traditional kitchenware!</p>
        <button class="rh-auth-submit" onclick="closeAuthModal()">Continue Shopping</button>
      </div>`);
    updateNavForUser();
  });
}

/* ══════════════════════════════════════════════
   SIGNUP HANDLER
══════════════════════════════════════════════ */
async function handleRHSignup() {
  clearRHAlert();
  clearAllRHErrs();

  const name  = (document.getElementById('rh-su-name')?.value  || '').trim();
  const phone = (document.getElementById('rh-su-phone')?.value || '').trim();
  const email = (document.getElementById('rh-su-email')?.value || '').trim();
  const pw    = (document.getElementById('rh-su-pw')?.value    || '');
  const pw2   = (document.getElementById('rh-su-pw2')?.value   || '');
  const terms = document.getElementById('rh-su-terms')?.checked;

  let hasErr = false;
  if (!name)                                  { setRHErr('rh-su-name-err',  'Full name is required');        hasErr = true; }
  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) { setRHErr('rh-su-email-err', 'Valid email is required');       hasErr = true; }
  if (pw.length < 6)                          { setRHErr('rh-su-pw-err',    'Minimum 6 characters');          hasErr = true; }
  if (pw !== pw2)                             { setRHErr('rh-su-pw2-err',   'Passwords do not match');        hasErr = true; }
  if (!terms)                                 { showRHAlert('Please agree to the Terms of Service.','error'); hasErr = true; }
  if (hasErr) return;

  const btn = document.getElementById('rh-signup-btn');
  if (btn) { btn.disabled = true; btn.innerHTML = '<span class="rh-spinner"></span>Creating Account…'; }

  getRHClient(async c => {
    if (!c) {
      showRHAlert('Authentication service unavailable. Please refresh the page.', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account →'; }
      return;
    }

    let data, error;
    try {
      ({ data, error } = await c.auth.signUp({
        email, password: pw, options: { data: { name, phone } }
      }));
    } catch (networkErr) {
      console.error('[RH Auth] Signup network error:', networkErr);
      showRHAlert('Connection failed. Please check your internet and try again.', 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account →'; }
      return;
    }

    if (error) {
      console.error('[RH Auth] Signup error:', error.message);
      showRHAlert(mapRHError(error.message), 'error');
      if (btn) { btn.disabled = false; btn.textContent = 'Create Account →'; }
      return;
    }

    /* Save to user_profiles table — the DB trigger auto-creates the row on signup,
       but we upsert here to ensure name/phone are saved correctly */
    const userId = data.user?.id || data.session?.user?.id;
    if (userId) {
      try {
        await c.from('user_profiles').upsert(
          { auth_user_id: userId, full_name: name, email, phone },
          { onConflict: 'auth_user_id' }
        );
      } catch (insertErr) {
        console.warn('[RH Auth] user_profiles upsert failed (non-fatal):', insertErr.message);
      }
    }

    fetch('/api/send-welcome-email', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email })
    }).catch(e => console.warn('[RH] Welcome email skipped:', e.message));

    /* ✅ SUCCESS — works whether email confirmation is on or off */
    const needsConfirm = !data.session;
    setAuthBody(`
      <div class="rh-auth-success">
        <div class="rh-auth-success-icon">🎉</div>
        <h3>Account Created!</h3>
        <p>Welcome, <strong>${name}</strong>!<br/>
          ${needsConfirm
            ? 'Please check your email to confirm your account,<br/>then sign in to start shopping.'
            : 'Your account is ready. You can sign in now!'}
        </p>
        <button class="rh-auth-submit" onclick="switchRHTab('login')">Sign In Now →</button>
      </div>`);

    document.getElementById('rh-tab-login') ?.classList.add('active');
    document.getElementById('rh-tab-signup')?.classList.remove('active');

    if (!needsConfirm && data.session?.user) {
      RH_AUTH.user = data.session.user;
      updateNavForUser();
    }
  });
}

/* ══════════════════════════════════════════════
   FORGOT PASSWORD
══════════════════════════════════════════════ */
async function handleRHForgot() {
  clearAllRHErrs();
  const email = (document.getElementById('rh-li-email')?.value || '').trim();
  if (!email.match(/^[^@]+@[^@]+\.[^@]+$/)) {
    setRHErr('rh-li-email-err', 'Enter your email address above first');
    return;
  }
  getRHClient(async c => {
    if (!c) { showRHAlert('Service unavailable. Please refresh.', 'error'); return; }
    let error;
    try {
      ({ error } = await c.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin }));
    } catch (e) {
      showRHAlert('Connection failed. Try again.', 'error'); return;
    }
    if (error) { showRHAlert(mapRHError(error.message), 'error'); return; }
    setAuthBody(`
      <div class="rh-auth-success">
        <div class="rh-auth-success-icon">📧</div>
        <h3>Reset Email Sent!</h3>
        <p>We sent a reset link to<br/><strong>${email}</strong><br/>
           Check your inbox and spam folder.</p>
        <button class="rh-auth-submit" onclick="switchRHTab('login')">Back to Sign In</button>
      </div>`);
  });
}

/* ══════════════════════════════════════════════
   LOGOUT
══════════════════════════════════════════════ */
async function handleRHLogout() {
  getRHClient(async c => {
    if (c) { try { await c.auth.signOut(); } catch(e) { console.warn(e); } }
    RH_AUTH.user = null;
    updateNavForUser();
    const t = document.getElementById('rh-cart-toast');
    if (t) { t.textContent = '✦ You have been signed out.'; t.classList.add('show'); setTimeout(() => t.classList.remove('show'), 2800); }
  });
}

/* ══════════════════════════════════════════════
   HELPERS
══════════════════════════════════════════════ */
function showRHAlert(msg, type = 'error') {
  const el = document.getElementById('rh-alert-box');
  if (el) el.innerHTML = `<div class="rh-auth-alert ${type}">${msg}</div>`;
}
function clearRHAlert() {
  const el = document.getElementById('rh-alert-box');
  if (el) el.innerHTML = '';
}
function setRHErr(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}
function clearAllRHErrs() {
  document.querySelectorAll('.rh-auth-err').forEach(el => el.textContent = '');
}

function updateRHPwStrength(pw) {
  const fill = document.getElementById('rh-pw-fill');
  const lbl  = document.getElementById('rh-pw-label');
  if (!fill || !lbl) return;
  let s = 0;
  if (pw.length >= 6)           s++;
  if (pw.length >= 10)          s++;
  if (/[A-Z]/.test(pw))         s++;
  if (/[0-9]/.test(pw))         s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  const lvl = [
    ['0%','#E8D5B7',''],
    ['20%','#e57373','Weak'],
    ['40%','#ffb74d','Fair'],
    ['60%','#C49A6C','Good'],
    ['80%','#66bb6a','Strong'],
    ['100%','#2d7a4a','Very Strong'],
  ];
  const [w, bg, label] = lvl[Math.min(s, 5)];
  fill.style.width = w; fill.style.background = bg; lbl.textContent = label;
}

function mapRHError(msg) {
  const m = (msg || '').toLowerCase();
  if (m.includes('invalid login') || m.includes('invalid credentials') || m.includes('invalid email or password'))
    return 'Incorrect email or password. Please try again.';
  if (m.includes('email not confirmed'))
    return 'Please confirm your email first. Check your inbox.';
  if (m.includes('already registered') || m.includes('user already registered'))
    return 'An account with this email already exists. Try signing in.';
  if (m.includes('password should be') || m.includes('password must be') || m.includes('weak password'))
    return 'Password must be at least 6 characters.';
  if (m.includes('rate limit') || m.includes('too many') || m.includes('over_email_send_rate_limit'))
    return 'Too many attempts. Please wait a few minutes.';
  if (m.includes('signup is disabled'))
    return 'New sign-ups are temporarily disabled. Please try again later.';
  if (m.includes('network') || m.includes('fetch'))
    return 'Connection error. Please check your internet.';
  return msg || 'Something went wrong. Please try again.';
}

/* ══════════════════════════════════════════════
   NAV UPDATE — stable wrapper, no replaceWith()
══════════════════════════════════════════════ */
function updateNavForUser() {
  document.querySelectorAll('.rh-nav-user-wrap').forEach(wrap => {
    if (RH_AUTH.user) {
      const name     = RH_AUTH.user.user_metadata?.name || RH_AUTH.user.email.split('@')[0];
      const initials = name.slice(0, 2).toUpperCase();
      wrap.innerHTML = `
        <div style="position:relative;display:inline-block;">
          <button class="rh-nav-user-pill" onclick="toggleNavDropdown(event)">
            <div class="rh-nav-avatar">${initials}</div>
            <span>${name}</span>
            <span style="font-size:10px;opacity:0.65">▾</span>
          </button>
          <div class="rh-nav-dropdown" id="rh-nav-dropdown">
            <a href="profile.html">👤 My Profile</a>
            <div class="divider"></div>
            <button onclick="handleRHLogout()">🚪 Sign Out</button>
          </div>
        </div>`;
    } else {
      wrap.innerHTML = `
        <button class="rh-nav-signin-btn" onclick="openAuthModal('login')">Sign In</button>`;
    }
  });
}

/* ── Toggle nav dropdown ── */
function toggleNavDropdown(e) {
  e.stopPropagation();
  const dd = document.getElementById('rh-nav-dropdown');
  if (dd) dd.classList.toggle('show');
}

/* ── Close dropdown on outside click ── */
document.addEventListener('click', () => {
  const dd = document.getElementById('rh-nav-dropdown');
  if (dd) dd.classList.remove('show');
});

/* ══════════════════════════════════════════════
   SESSION RESTORE
══════════════════════════════════════════════ */
function restoreRHSession() {
  getRHClient(async c => {
    if (!c) return;
    try {
      const { data: { session } } = await c.auth.getSession();
      if (session?.user) { RH_AUTH.user = session.user; updateNavForUser(); }
      c.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN'  && session?.user) { RH_AUTH.user = session.user; updateNavForUser(); }
        if (event === 'SIGNED_OUT')                  { RH_AUTH.user = null;          updateNavForUser(); }
      });
    } catch (e) { console.warn('[RH Auth] Session restore failed:', e); }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  injectAuthModal();
  restoreRHSession();
});