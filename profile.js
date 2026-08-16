/* ══════════════════════════════════════════════
   RUSTIC HERITAGE KITCHENWARE — profile.js
   User profile: settings, address, orders, invoice
   ══════════════════════════════════════════════ */

/* ── Tab switching ── */
function switchProfileTab(tab) {
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.profile-section').forEach(s => s.classList.remove('active'));
  const tabEl = document.querySelector(`.profile-tab[onclick*="${tab}"]`);
  const secEl = document.getElementById(`tab-${tab}`);
  if (tabEl) tabEl.classList.add('active');
  if (secEl) secEl.classList.add('active');
  if (tab === 'orders') loadUserOrders();
}

/* ══════════════════════════════════════════════
   LOAD PROFILE DATA
   ══════════════════════════════════════════════ */
function loadProfileData() {
  getRHClient(async c => {
    if (!c) return showLoginPrompt();
    try {
      const { data: { session } } = await c.auth.getSession();
      if (!session?.user) return showLoginPrompt();

      const user = session.user;
      const email = user.email;

      /* Fetch from user_profiles for the most complete data */
      let profileData = null;
      try {
        const { data: pf } = await c
          .from('user_profiles')
          .select('*')
          .eq('auth_user_id', user.id)
          .single();
        profileData = pf;
      } catch (e) { /* profile may not exist yet */ }

      const name = profileData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || email.split('@')[0];
      const phone = profileData?.phone || user.user_metadata?.phone || '';
      const addr = profileData?.default_address || '';
      const city = profileData?.default_city || '';
      const pin = profileData?.default_pin || '';
      const state = profileData?.default_state || '';

      const initials = name.slice(0, 2).toUpperCase();

      document.getElementById('profile-avatar').textContent = initials;
      document.getElementById('profile-hero-name').textContent = name;
      document.getElementById('profile-hero-email').textContent = email;
      document.getElementById('settings-name').value = name;
      document.getElementById('settings-email').value = email;
      document.getElementById('settings-phone').value = phone;

      /* Fill address fields if they exist */
      const addrEl = document.getElementById('settings-address');
      const cityEl = document.getElementById('settings-city');
      const pinEl = document.getElementById('settings-pin');
      const stateEl = document.getElementById('settings-state');
      if (addrEl) addrEl.value = addr;
      if (cityEl) cityEl.value = city;
      if (pinEl) pinEl.value = pin;
      if (stateEl) stateEl.value = state;

      /* Cache in localStorage so checkout can auto-fill quickly */
      const profileCache = { name, email, phone, address: addr, city, pin, state };
      localStorage.setItem('rh_user_profile', JSON.stringify(profileCache));

      document.getElementById('profile-hero').style.display = '';
      document.getElementById('profile-tabs-bar').style.display = '';
      document.getElementById('profile-main-content').style.display = '';
      document.getElementById('profile-login-prompt').style.display = 'none';
      document.getElementById('tab-settings').style.display = '';
    } catch (e) {
      console.error('[Profile] Load error:', e);
      showLoginPrompt();
    }
  });
}

function showLoginPrompt() {
  document.getElementById('profile-hero').style.display = 'none';
  document.getElementById('profile-tabs-bar').style.display = 'none';
  document.getElementById('tab-settings').style.display = 'none';
  document.getElementById('tab-orders').style.display = 'none';
  document.getElementById('profile-login-prompt').style.display = '';
}

/* ══════════════════════════════════════════════
   SAVE PERSONAL INFO
   ══════════════════════════════════════════════ */
/* ══════════════════════════════════════════════
   SAVE PERSONAL INFO
   ══════════════════════════════════════════════ */
async function saveProfile() {
  const name = document.getElementById('settings-name').value.trim();
  const email = document.getElementById('settings-email').value.trim();
  const phone = document.getElementById('settings-phone').value.trim();
  const msgEl = document.getElementById('profile-msg');
  const btn = document.getElementById('save-profile-btn');

  if (!name || !email) {
    msgEl.className = 'settings-msg error';
    msgEl.textContent = 'Name and email are required.';
    return;
  }

  btn.disabled = true; btn.textContent = 'Saving…';

  getRHClient(async c => {
    if (!c) { btn.disabled = false; btn.textContent = 'Save Changes'; return; }
    try {
      const { data: { session } } = await c.auth.getSession();
      if (!session?.user?.id) throw new Error('Not logged in. Please sign in first.');

      const user = session.user;

      /* Update auth metadata cleanly without causing email sub-claim errors */
      try {
        await c.auth.updateUser({ data: { full_name: name, phone } });
      } catch (authErr) {
        console.warn('Auth metadata update skipped:', authErr.message);
      }

      /* Update user_profiles table */
      const { error: pfErr } = await c.from('user_profiles')
        .upsert({
          auth_user_id: user.id,
          email: user.email || email,
          full_name: name,
          phone: phone,
          updated_at: new Date().toISOString()
        }, { onConflict: 'auth_user_id' });

      if (pfErr) throw pfErr;

      /* Update localStorage cache */
      try {
        const cache = JSON.parse(localStorage.getItem('rh_user_profile') || '{}');
        cache.name = name; cache.email = user.email || email; cache.phone = phone;
        localStorage.setItem('rh_user_profile', JSON.stringify(cache));
      } catch (e) { }

      msgEl.className = 'settings-msg success';
      msgEl.textContent = '✅ Profile updated successfully!';
      document.getElementById('profile-hero-name').textContent = name;
      document.getElementById('profile-hero-email').textContent = user.email || email;
      document.getElementById('profile-avatar').textContent = name.slice(0, 2).toUpperCase();

    } catch (e) {
      msgEl.className = 'settings-msg error';
      msgEl.textContent = '❌ ' + (e.message || 'Failed to update profile.');
    }
    btn.disabled = false; btn.textContent = 'Save Changes';
  });
}

/* ══════════════════════════════════════════════
   SAVE ADDRESS
   ══════════════════════════════════════════════ */
async function saveAddress() {
  const address = (document.getElementById('settings-address')?.value || '').trim();
  const city = (document.getElementById('settings-city')?.value || '').trim();
  const pin = (document.getElementById('settings-pin')?.value || '').trim();
  const state = (document.getElementById('settings-state')?.value || '').trim();
  const msgEl = document.getElementById('address-msg');
  const btn = document.getElementById('save-address-btn');

  if (!address || !city || !pin || !state) {
    msgEl.className = 'settings-msg error';
    msgEl.textContent = 'Please fill in all address fields.';
    return;
  }

  btn.disabled = true; btn.textContent = 'Saving…';

  getRHClient(async c => {
    if (!c) { btn.disabled = false; btn.textContent = 'Save Address'; return; }
    try {
      const { data: { session } } = await c.auth.getSession();
      if (!session?.user?.id) throw new Error('Not logged in. Please sign in first.');

      const user = session.user;
      const email = user.email;
      const name = document.getElementById('settings-name')?.value?.trim() || user.user_metadata?.full_name || email.split('@')[0];
      const phone = document.getElementById('settings-phone')?.value?.trim() || '';

      /* 1. Save address columns to user_profiles for quick checkout auto-fill */
      const { data: profileData, error: pfErr } = await c.from('user_profiles')
        .upsert({
          auth_user_id: user.id,
          email: email,
          full_name: name,
          phone: phone,
          default_address: address,
          default_city: city,
          default_pin: pin,
          default_state: state,
          updated_at: new Date().toISOString()
        }, { onConflict: 'auth_user_id' }).select('id').single();

      if (pfErr) throw pfErr;

      /* 2. Also insert record into public.addresses table */
      if (profileData?.id) {
        const { error: addrErr } = await c.from('addresses').insert({
          user_id: profileData.id,
          receiver_name: name,
          phone: phone || null,
          address_line1: address,
          city: city,
          state: state,
          pincode: pin,
          country: 'India',
          is_default: true
        });
        if (addrErr) console.warn('addresses table insert notice:', addrErr.message);
      }

      /* Update localStorage cache so checkout picks it up */
      try {
        const cache = JSON.parse(localStorage.getItem('rh_user_profile') || '{}');
        cache.address = address; cache.city = city; cache.pin = pin; cache.state = state;
        localStorage.setItem('rh_user_profile', JSON.stringify(cache));
      } catch (e) { }

      msgEl.className = 'settings-msg success';
      msgEl.textContent = '✅ Address saved! Saved to your profile and addresses database.';

    } catch (e) {
      msgEl.className = 'settings-msg error';
      msgEl.textContent = '❌ ' + (e.message || 'Failed to save address.');
    }
    btn.disabled = false; btn.textContent = 'Save Address';
  });
}

/* ══════════════════════════════════════════════
   CHANGE PASSWORD
   ══════════════════════════════════════════════ */
async function changePassword() {
  const newPw = document.getElementById('settings-new-pw').value;
  const confirmPw = document.getElementById('settings-confirm-pw').value;
  const msgEl = document.getElementById('pw-msg');
  const btn = document.getElementById('change-pw-btn');

  if (newPw.length < 6) {
    msgEl.className = 'settings-msg error';
    msgEl.textContent = 'Password must be at least 6 characters.';
    return;
  }
  if (newPw !== confirmPw) {
    msgEl.className = 'settings-msg error';
    msgEl.textContent = 'Passwords do not match.';
    return;
  }

  btn.disabled = true; btn.textContent = 'Updating…';

  getRHClient(async c => {
    if (!c) { btn.disabled = false; btn.textContent = 'Update Password'; return; }
    try {
      const { error } = await c.auth.updateUser({ password: newPw });
      if (error) throw error;
      msgEl.className = 'settings-msg success';
      msgEl.textContent = '✅ Password updated successfully!';
      document.getElementById('settings-new-pw').value = '';
      document.getElementById('settings-confirm-pw').value = '';
    } catch (e) {
      msgEl.className = 'settings-msg error';
      msgEl.textContent = '❌ ' + (e.message || 'Failed to update password.');
    }
    btn.disabled = false; btn.textContent = 'Update Password';
  });
}

/* ══════════════════════════════════════════════
   LOAD USER ORDERS — direct Supabase query
   ══════════════════════════════════════════════ */
async function loadUserOrders() {
  const container = document.getElementById('orders-container');
  container.innerHTML = '<div class="orders-empty"><div class="icon">⏳</div><p>Loading your orders…</p></div>';

  getRHClient(async c => {
    if (!c) return;
    try {
      const { data: { session } } = await c.auth.getSession();
      if (!session?.user) return;

      const email = session.user.email;
      let orders = [];

      /* Primary: query by email directly */
      try {
        const { data, error } = await c
          .from('orders')
          .select('*, order_items(*)')
          .eq('customer_email', email)
          .order('created_at', { ascending: false });
        if (!error) orders = data || [];
      } catch (e) { console.warn('Orders query failed:', e); }

      /* Also merge rh-order-success events from session storage */
      try {
        const local = JSON.parse(sessionStorage.getItem('rh_last_order') || 'null');
        if (local && !orders.find(o => (o.order_number || o.order_id) === local.order_id)) {
          orders.unshift({ ...local, order_number: local.order_id });
        }
      } catch (e) { }

      if (orders.length === 0) {
        container.innerHTML = `
          <div class="orders-empty">
            <div class="icon">📦</div>
            <p>No orders yet. <a href="products.html" style="color:#5C3D1E;text-decoration:underline;">Start shopping!</a></p>
          </div>`;
        return;
      }

      container.innerHTML = orders.map(order => {
        const date = new Date(order.created_at || Date.now()).toLocaleDateString('en-IN', {
          day: '2-digit', month: 'long', year: 'numeric',
        });
        /* Unify items from order_items relation or items JSON column */
        const rawItems = order.order_items?.length
          ? order.order_items
          : (typeof order.items === 'string' ? JSON.parse(order.items || '[]') : (order.items || []));

        const orderStatus = order.order_status || order.status || 'confirmed';
        const paymentStatus = order.payment_status || 'pending';

        /* Color-coded status system — only 4 valid states */
        const statusColors = {
          pending:   { cls: 'pending',   emoji: '⏳', label: 'Pending' },
          confirmed: { cls: 'confirmed', emoji: '✅', label: 'Confirmed' },
          delivered: { cls: 'delivered', emoji: '🎉', label: 'Delivered' },
          cancelled: { cls: 'cancelled', emoji: '❌', label: 'Cancelled' },
          rejected:  { cls: 'cancelled', emoji: '🚫', label: 'Rejected' },
        };
        const sc = statusColors[orderStatus] || { cls: 'pending', emoji: '⏳', label: 'Pending' };
        const statusText = `${sc.emoji} ${sc.label}`;

        const total = order.total_amount || order.total || 0;
        const orderNum = order.order_number || order.order_id || '—';

        return `
          <div class="order-card">
            <div class="order-header">
              <div>
                <div class="order-id">🏺 ${orderNum}</div>
                <div class="order-date">${date}</div>
              </div>
              <span class="order-status ${sc.cls}">${statusText}</span>
            </div>
            <table class="order-items-table">
              <thead><tr><th>Item</th><th>Qty</th><th class="amt">Amount</th></tr></thead>
              <tbody>
                ${rawItems.map(i => `
                  <tr>
                    <td>${i.product_name || i.name || '—'}</td>
                    <td>×${i.quantity || i.qty || 1}</td>
                    <td class="amt">₹${(i.total || (i.price * (i.quantity || i.qty || 1)) || 0).toLocaleString('en-IN')}</td>
                  </tr>`).join('')}
              </tbody>
            </table>
            <div class="order-footer">
              <div>
                <div class="order-total">Total: ₹${total.toLocaleString('en-IN')}</div>
                <span class="order-payment-badge">${(order.payment_method || 'online').toUpperCase()}</span>
                <span class="order-payment-badge" style="color:${paymentStatus === 'paid' ? '#1a5c34' : '#7a4f0a'};background:${paymentStatus === 'paid' ? '#e8f5e9' : '#fff8e8'};">${paymentStatus.toUpperCase()}</span>
                ${order.coupon_code ? `<span class="order-payment-badge" style="background:#e8f5e9;color:#1a5c34;">🎟 ${order.coupon_code}</span>` : ''}
              </div>
              ${order.rejection_reason ? `<div style="font-size:12px;color:#dc2626;margin-top:8px;padding:6px 10px;background:#fef2f2;border-radius:4px">Reason: ${order.rejection_reason}</div>` : ''}
              <button class="order-invoice-btn" onclick='downloadProfileInvoice(${JSON.stringify({
          order_id: orderNum,
          order_status: orderStatus,
          rejection_reason: order.rejection_reason || null,
          customer_name: order.customer_name,
          customer_email: order.customer_email,
          customer_phone: order.customer_phone,
          delivery_address: order.delivery_address,
          delivery_city: order.delivery_city,
          delivery_state: order.delivery_state,
          delivery_pin: order.delivery_pin,
          payment_method: order.payment_method,
          payment_id: order.payment_id,
          coupon_code: order.coupon_code || null,
          items: rawItems.map(i => ({ name: i.product_name || i.name, qty: i.quantity || i.qty || 1, price: i.price, total: i.total || i.price })),
          subtotal: order.subtotal || total,
          delivery_charge: order.delivery_charge || 0,
          discount: order.discount || 0,
          tax: order.gst || order.tax || 0,
          total,
          created_at: order.created_at,
        }).replace(/'/g, "&#39;")})'>
                🖨 Download Invoice
              </button>
            </div>
          </div>`;
      }).join('');

    } catch (e) {
      console.error('[Profile] Orders load error:', e);
      container.innerHTML = '<div class="orders-empty"><div class="icon">⚠️</div><p>Could not load orders. Please try again.</p></div>';
    }
  });
}

/* ── Order status badge CSS (scoped to profile page) ── */
(function () {
  const s = document.createElement('style');
  s.textContent = `
    .order-status.pending   { background: #fff8e1; color: #f57f17; border-color: #ffe082; }
    .order-status.confirmed { background: #e3f2fd; color: #1565c0; border-color: #90caf9; }
    .order-status.delivered { background: #e8f5e9; color: #2e7d32; border-color: #a5d6a7; }
    .order-status.cancelled { background: #ffebee; color: #c62828; border-color: #ef9a9a; }
  `;
  document.head.appendChild(s);
})();

/* ── Download invoice from profile ── */
function downloadProfileInvoice(order) {
  if (typeof order === 'string') order = JSON.parse(order);
  if (typeof order.items === 'string') order.items = JSON.parse(order.items || '[]');
  if (typeof rhDownloadInvoice === 'function') {
    rhDownloadInvoice(order);
  } else {
    alert('Invoice module not loaded. Please refresh the page.');
  }
}

/* ══════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════ */
/* Save last order to sessionStorage for orders tab */
document.addEventListener('rh-order-success', e => {
  try { sessionStorage.setItem('rh_last_order', JSON.stringify(e.detail)); } catch (e) { }
});

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(loadProfileData, 600);
});
