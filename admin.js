/* ══════════════════════════════════════════════════════════════════
   RUSTIC HERITAGE KITCHENWARE — ADMIN DASHBOARD CONTROLLER
   Clean, reliable administration without unnecessary log tables.
   ══════════════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://tlhhxpttifgtgnrzjrga.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsaGh4cHR0aWZndGducnpqcmdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyOTQ2MDUsImV4cCI6MjA5ODg3MDYwNX0.ZYB12Ekl1EImXRdxvyGNEvXLxnNOe-36oxvo3z4gSI0';

let _sbAdminClient = null;
function getSbClient() {
  if (!_sbAdminClient && window.supabase) {
    _sbAdminClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
  return _sbAdminClient;
}

// Global State
let _adminProfileId = null;
let _adminEmail = '';
let _ordersData = [];
let _orderItemsData = [];
let _customersData = [];
let _subscribersData = [];
let _couponsData = [];
let _productsData = [];
let _reviewsData = [];
let _enquiriesData = [];
let _couponUsageData = [];
let _activeEnquiry = null;

let _chartDailyOrders = null;
let _chartPaymentMethods = null;

/* ══════════════════════════════════════════════════════════════════
   INIT & SESSION CHECK
   ══════════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', async () => {
  await checkAdminSession();
});

async function checkAdminSession() {
  const sb = getSbClient();
  if (!sb) return;

  try {
    const { data: { session } } = await sb.auth.getSession();
    if (!session?.user) return;

    const user = session.user;
    const userEmail = (user.email || '').toLowerCase();

    let { data: profile } = await sb
      .from('user_profiles')
      .select('id, email, is_admin')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    const isOwnerEmail = (userEmail === 'mathubharathi15@gmail.com');

    if (isOwnerEmail && (!profile || profile.is_admin !== true)) {
      const { data: updatedPf } = await sb.from('user_profiles').upsert({
        auth_user_id: user.id,
        email: userEmail,
        full_name: user.user_metadata?.full_name || 'Admin',
        is_admin: true
      }, { onConflict: 'auth_user_id' }).select().maybeSingle();
      profile = updatedPf || profile;
    }

    if (profile?.is_admin === true || isOwnerEmail) {
      _adminProfileId = profile?.id || null;
      _adminEmail = userEmail;
      showDashboardUI();
    }
  } catch (e) {
    console.warn('Session check failed:', e);
  }
}

/* ══════════════════════════════════════════════════════════════════
   ADMIN LOGIN
   ══════════════════════════════════════════════════════════════════ */
async function adminLogin() {
  const emailInput = document.getElementById('admin-email');
  const pwInput = document.getElementById('admin-pw');
  const errEl = document.getElementById('admin-login-err');
  const btn = document.querySelector('.admin-login-btn');

  const email = (emailInput?.value || '').trim().toLowerCase();
  const password = pwInput?.value || '';

  errEl.style.display = 'none';

  if (!email || !password) {
    errEl.style.display = 'block';
    errEl.textContent = '❌ Email and password are required.';
    return;
  }

  if (btn) { btn.disabled = true; btn.textContent = 'Signing in…'; }

  const sb = getSbClient();
  if (!sb) {
    errEl.style.display = 'block';
    errEl.textContent = '❌ Service unavailable. Refresh and try again.';
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In as Admin →'; }
    return;
  }

  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const user = data.user;
    const isOwnerEmail = (email === 'mathubharathi15@gmail.com');

    let { data: profile } = await sb
      .from('user_profiles')
      .select('id, is_admin')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (isOwnerEmail && (!profile || profile.is_admin !== true)) {
      const { data: updatedPf } = await sb.from('user_profiles').upsert({
        auth_user_id: user.id,
        email: email,
        full_name: user.user_metadata?.full_name || 'Admin',
        is_admin: true
      }, { onConflict: 'auth_user_id' }).select().maybeSingle();
      profile = updatedPf || profile;
    }

    if (!profile || (profile.is_admin !== true && !isOwnerEmail)) {
      await sb.auth.signOut();
      errEl.style.display = 'block';
      errEl.textContent = '❌ Access denied. This account does not have admin privileges.';
      if (btn) { btn.disabled = false; btn.textContent = 'Sign In as Admin →'; }
      return;
    }

    _adminProfileId = profile?.id || null;
    _adminEmail = email;

    showDashboardUI();

  } catch (err) {
    console.error('Login error:', err);
    errEl.style.display = 'block';
    errEl.textContent = `❌ ${err.message || 'Authentication failed. Check credentials.'}`;
    if (btn) { btn.disabled = false; btn.textContent = 'Sign In as Admin →'; }
  }
}

async function adminLogout() {
  const sb = getSbClient();
  if (sb) await sb.auth.signOut();
  document.getElementById('admin-dashboard').style.display = 'none';
  document.getElementById('admin-login-screen').style.display = 'flex';
}

function showDashboardUI() {
  document.getElementById('admin-login-screen').style.display = 'none';
  document.getElementById('admin-dashboard').style.display = 'flex';
  const emailDisplay = document.getElementById('admin-user-email');
  if (emailDisplay) emailDisplay.textContent = _adminEmail;
  loadAllAdminData();
}

/* ══════════════════════════════════════════════════════════════════
   LOAD ALL ADMIN DATA FROM SUPABASE (10 Clean Tables)
   ══════════════════════════════════════════════════════════════════ */
async function loadAllAdminData() {
  const sb = getSbClient();
  if (!sb) return;

  try {
    // 1. Orders
    const { data: orders } = await sb.from('orders').select('*').order('created_at', { ascending: false });
    _ordersData = orders || [];

    // 2. Order Items
    const { data: items } = await sb.from('order_items').select('*');
    _orderItemsData = items || [];

    // 3. Customers
    const { data: customers } = await sb.from('user_profiles').select('*').order('created_at', { ascending: false });
    _customersData = customers || [];

    // 4. Subscribers
    const { data: subscribers } = await sb.from('subscribers').select('*').order('created_at', { ascending: false });
    _subscribersData = subscribers || [];

    // 5. Coupons
    const { data: coupons } = await sb.from('coupons').select('*').order('created_at', { ascending: false });
    _couponsData = coupons || [];

    // 6. Products
    const { data: products } = await sb.from('products').select('*').order('id', { ascending: true });
    _productsData = products || [];

    // 7. Reviews
    try {
      const { data: reviews } = await sb.from('reviews').select('*').order('created_at', { ascending: false });
      _reviewsData = reviews || [];
    } catch (e) { _reviewsData = []; }

    // 8. Contact Enquiries
    try {
      const { data: enquiries } = await sb.from('contact_enquiries').select('*').order('created_at', { ascending: false });
      _enquiriesData = enquiries || [];
    } catch (e) { _enquiriesData = []; }

    // 9. Coupon Usage
    try {
      const { data: cUsage } = await sb.from('coupon_usage').select('*').order('created_at', { ascending: false });
      _couponUsageData = cUsage || [];
    } catch (e) { _couponUsageData = []; }

    // Render Components
    updateAdminStats();
    renderCharts();
    renderRecentOrders();
    renderAllOrders();
    renderCODManagement();
    renderCustomers();
    renderNewsletter();
    renderReviews();
    renderEnquiries();
    renderCoupons();
    renderProducts();

  } catch (err) {
    console.error('Error loading admin data:', err);
  }
}

/* ══════════════════════════════════════════════════════════════════
   UPDATE DASHBOARD KPI METRICS
   ══════════════════════════════════════════════════════════════════ */
function updateAdminStats() {
  const totalRev = _ordersData.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);
  const totalOrders = _ordersData.length;

  const now = new Date();
  const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
  startOfWeek.setHours(0, 0, 0, 0);

  const weekOrders = _ordersData.filter(o => new Date(o.created_at) >= startOfWeek);
  const weekRev = weekOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const paidCount = _ordersData.filter(o => o.payment_status === 'paid').length;
  const pendingPaymentCount = _ordersData.filter(o => o.payment_status === 'pending').length;
  const aov = totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const todayOrders = _ordersData.filter(o => (o.created_at || '').startsWith(todayStr));
  const todayRev = todayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

  const pendingCOD = _ordersData.filter(o => o.payment_method === 'cod' && o.order_status === 'pending').length;
  const codCount = _ordersData.filter(o => o.payment_method === 'cod').length;
  const onlineCount = _ordersData.filter(o => o.payment_method !== 'cod').length;
  const upiCount = _ordersData.filter(o => o.payment_method === 'upi' || o.payment_method === 'razorpay').length;
  const cardCount = _ordersData.filter(o => o.payment_method === 'card').length;

  const fmtR = v => '₹' + Math.round(v).toLocaleString('en-IN');

  const setT = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };

  setT('kpi-total-revenue', fmtR(totalRev));
  setT('kpi-total-orders-sub', `${totalOrders} orders total`);
  setT('kpi-week-revenue', fmtR(weekRev));
  setT('kpi-week-orders-sub', `${weekOrders.length} orders this week`);
  setT('kpi-aov', fmtR(aov));
  setT('kpi-paid-sub', `${paidCount} paid · ${pendingPaymentCount} pending`);
  setT('kpi-customers-count', _customersData.length);
  setT('kpi-subscribers-sub', `${_subscribersData.length} newsletter subscribers`);
  setT('kpi-today-orders', todayOrders.length);
  setT('kpi-today-rev-sub', `${fmtR(todayRev)} revenue today`);
  setT('kpi-pending-cod', pendingCOD);
  setT('kpi-cod-count', codCount);
  setT('kpi-online-count', onlineCount);
  setT('kpi-online-sub', `${upiCount} UPI / Razorpay · ${cardCount} Card`);

  setT('nl-stat-total', _subscribersData.length);
  setT('nl-stat-coupons', _couponsData.filter(c => c.generated_by_system).length);
}

/* ══════════════════════════════════════════════════════════════════
   CHARTS & TOP ITEMS
   ══════════════════════════════════════════════════════════════════ */
function renderCharts() {
  const dates = [];
  const counts = [];
  const revenues = [];

  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    dates.push(label);

    const dayOrders = _ordersData.filter(o => (o.created_at || '').startsWith(dateStr));
    counts.push(dayOrders.length);
    revenues.push(dayOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0));
  }

  const canvas1 = document.getElementById('chart-daily-orders');
  if (canvas1) {
    if (_chartDailyOrders) _chartDailyOrders.destroy();
    _chartDailyOrders = new Chart(canvas1, {
      type: 'bar',
      data: {
        labels: dates,
        datasets: [
          { label: 'Orders', data: counts, backgroundColor: '#C49A6C', yAxisID: 'y' },
          { label: 'Revenue (₹)', data: revenues, type: 'line', borderColor: '#3B2A1A', backgroundColor: 'transparent', tension: 0.3, yAxisID: 'y1' }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        scales: {
          y: { type: 'linear', position: 'left', ticks: { precision: 0 } },
          y1: { type: 'linear', position: 'right', grid: { drawOnChartArea: false } }
        }
      }
    });
  }

  const canvas2 = document.getElementById('chart-payment-methods');
  if (canvas2) {
    const cod = _ordersData.filter(o => o.payment_method === 'cod').length;
    const online = _ordersData.filter(o => o.payment_method !== 'cod').length;

    if (_chartPaymentMethods) _chartPaymentMethods.destroy();
    _chartPaymentMethods = new Chart(canvas2, {
      type: 'doughnut',
      data: {
        labels: ['COD (Cash on Delivery)', 'Online / UPI / Card'],
        datasets: [{ data: [cod, online], backgroundColor: ['#C49A6C', '#3B2A1A'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  renderTopItems();
}

function renderTopItems() {
  const panel = document.getElementById('panel-top-items');
  if (!panel) return;

  const itemStats = {};
  _orderItemsData.forEach(item => {
    const key = item.title || item.product_name || 'Kitchenware Item';
    if (!itemStats[key]) itemStats[key] = { name: key, units: 0, revenue: 0 };
    itemStats[key].units += Number(item.quantity || 1);
    itemStats[key].revenue += Number(item.total_price || item.total || 0);
  });

  const sorted = Object.values(itemStats).sort((a, b) => b.units - a.units).slice(0, 5);

  if (sorted.length === 0) {
    panel.innerHTML = '<p style="color:#8B5E3C;font-size:13px;">No item sales data yet.</p>';
    return;
  }

  panel.innerHTML = sorted.map(i => `
    <div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #F5ECD7;font-size:13px;">
      <span><strong>${i.name}</strong><br><span style="font-size:11px;color:#8B5E3C;">${i.units} units sold</span></span>
      <strong style="color:#5C3D1E;">₹${i.revenue.toLocaleString('en-IN')}</strong>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════════════════════
   RECENT ORDERS & ORDERS TABLES
   ══════════════════════════════════════════════════════════════════ */
function renderRecentOrders() {
  const tbody = document.getElementById('tbl-recent-orders');
  if (!tbody) return;

  const recent = _ordersData.slice(0, 6);
  if (recent.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="table-td-center-30">No orders received yet.</td></tr>';
    return;
  }

  tbody.innerHTML = recent.map(o => `
    <tr>
      <td><code>#${o.order_number || o.id.slice(0,8)}</code></td>
      <td><strong>${o.customer_name}</strong><br><small>${o.customer_email}</small></td>
      <td>₹${Number(o.total_amount).toLocaleString('en-IN')}</td>
      <td><span style="font-size:11px;text-transform:uppercase;">${o.payment_method}</span></td>
      <td><span class="status-badge ${o.order_status}">${o.order_status}</span></td>
      <td style="font-size:12px;">${new Date(o.created_at).toLocaleDateString('en-IN')}</td>
      <td><button class="action-btn-sm" onclick="viewOrderDetails('${o.id}')">View</button></td>
    </tr>
  `).join('');
}

function renderAllOrders() {
  const tbody = document.getElementById('tbl-all-orders');
  if (!tbody) return;

  const search = (document.getElementById('search-orders')?.value || '').toLowerCase();
  const statusFilter = (document.getElementById('filter-order-status')?.value || '').toLowerCase();
  const pmFilter = (document.getElementById('filter-payment-method')?.value || '').toLowerCase();

  let filtered = _ordersData.filter(o => {
    const textStr = `${o.order_number || o.id} ${o.customer_name} ${o.customer_email} ${o.customer_phone}`.toLowerCase();
    const matchesSearch = textStr.includes(search);
    const matchesStatus = !statusFilter || (o.order_status || '').toLowerCase() === statusFilter;
    const matchesPm = !pmFilter || (o.payment_method || '').toLowerCase() === pmFilter;
    return matchesSearch && matchesStatus && matchesPm;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="9" class="table-td-center-30">No matching orders found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(o => `
    <tr>
      <td><code>#${o.order_number || o.id.slice(0,8)}</code></td>
      <td><strong>${o.customer_name}</strong></td>
      <td>${o.customer_email}<br><small>${o.customer_phone}</small></td>
      <td>₹${Number(o.subtotal || o.total_amount).toLocaleString('en-IN')}</td>
      <td><strong>₹${Number(o.total_amount).toLocaleString('en-IN')}</strong></td>
      <td><span style="font-size:11px;text-transform:uppercase;">${o.payment_method}</span></td>
      <td><span class="status-badge ${o.order_status}">${o.order_status}</span></td>
      <td style="font-size:12px;">${new Date(o.created_at).toLocaleDateString('en-IN')}</td>
      <td><button class="action-btn-sm" onclick="viewOrderDetails('${o.id}')">Manage</button></td>
    </tr>
  `).join('');
}

function filterOrdersTable() { renderAllOrders(); }

function renderCODManagement() {
  const tbody = document.getElementById('tbl-cod-orders');
  if (!tbody) return;

  const codOrders = _ordersData.filter(o => o.payment_method === 'cod');
  if (codOrders.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="table-td-center-30">No COD orders available.</td></tr>';
    return;
  }

  tbody.innerHTML = codOrders.map(o => `
    <tr>
      <td><code>#${o.order_number || o.id.slice(0,8)}</code></td>
      <td><strong>${o.customer_name}</strong></td>
      <td>${o.customer_phone}</td>
      <td>${o.city || 'Tamil Nadu'} (${o.pincode || '-'})</td>
      <td><strong>₹${Number(o.total_amount).toLocaleString('en-IN')}</strong></td>
      <td><span class="status-badge ${o.order_status}">${o.order_status}</span></td>
      <td>
        <div style="display:flex;gap:6px;">
          <button class="action-btn-sm" onclick="viewOrderDetails('${o.id}')">Details</button>
          ${o.order_status === 'pending' ? `<button class="action-btn-sm" style="background:#1565c0;" onclick="updateOrderStatus('${o.id}', 'confirmed')">Confirm</button>` : ''}
          ${o.order_status === 'confirmed' ? `<button class="action-btn-sm" style="background:#2e7d32;" onclick="markOrderDelivered('${o.id}')">Deliver</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

/* ══════════════════════════════════════════════════════════════════
   CUSTOMERS DIRECTORY
   ══════════════════════════════════════════════════════════════════ */
function renderCustomers() {
  const tbody = document.getElementById('tbl-customers');
  if (!tbody) return;

  const search = (document.getElementById('search-customers')?.value || '').toLowerCase();

  let filtered = _customersData.filter(c => {
    const textStr = `${c.full_name || ''} ${c.email || ''} ${c.phone || ''}`.toLowerCase();
    return textStr.includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" class="table-td-center-30">No customers found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(c => {
    const userOrders = _ordersData.filter(o => o.customer_email === c.email || o.user_id === c.id);
    const totalSpent = userOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0);

    return `
      <tr>
        <td><strong>${c.full_name || 'Customer'}</strong></td>
        <td>${c.email}</td>
        <td>${c.phone || '—'}</td>
        <td>${userOrders.length} orders</td>
        <td><strong>₹${totalSpent.toLocaleString('en-IN')}</strong></td>
        <td style="font-size:12px;">${new Date(c.created_at).toLocaleDateString('en-IN')}</td>
        <td><button class="action-btn-sm" onclick="viewCustomerOrders('${c.email}')">History</button></td>
      </tr>
    `;
  }).join('');
}

function filterCustomersTable() { renderCustomers(); }

function viewCustomerOrders(email) {
  const input = document.getElementById('search-orders');
  if (input) input.value = email;
  switchAdminTab('sec-orders');
  filterOrdersTable();
}

/* ══════════════════════════════════════════════════════════════════
   NEWSLETTER SUBSCRIBERS
   ══════════════════════════════════════════════════════════════════ */
function renderNewsletter() {
  const tbody = document.getElementById('tbl-newsletter');
  if (!tbody) return;

  const search = (document.getElementById('search-newsletter')?.value || '').toLowerCase();

  let filtered = _subscribersData.filter(s => {
    const textStr = `${s.email || ''} ${s.name || ''} ${s.coupon_code || ''}`.toLowerCase();
    return textStr.includes(search);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" class="table-td-center-30">No subscribers found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(s => `
    <tr>
      <td><strong>${s.email}</strong></td>
      <td>${s.name || 'Subscriber'}</td>
      <td><code style="background:#F5ECD7;padding:3px 8px;border-radius:4px;font-weight:bold;">${s.coupon_code || 'N/A'}</code></td>
      <td style="font-size:12px;">${new Date(s.subscribed_at || s.created_at).toLocaleDateString('en-IN')}</td>
      <td>
        <button class="action-btn-sm" style="background:#c62828;" onclick="deleteSubscriber('${s.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function filterNewsletterTable() { renderNewsletter(); }

async function deleteSubscriber(id) {
  if (!confirm('Are you sure you want to delete this subscriber?')) return;
  const sb = getSbClient();
  if (!sb) return;

  await sb.from('subscribers').delete().eq('id', id);
  await loadAllAdminData();
}

function exportNewsletterCSV() {
  if (_subscribersData.length === 0) { alert('No subscribers to export.'); return; }
  const headers = ['Email', 'Name', 'Coupon Code', 'Subscribed At'];
  const rows = _subscribersData.map(s => [s.email, s.name || '', s.coupon_code || '', s.subscribed_at || s.created_at]);
  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `rustic_subscribers_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* ══════════════════════════════════════════════════════════════════
   DISCOUNT CODES & MANAGE COUPONS
   ══════════════════════════════════════════════════════════════════ */
function renderCoupons() {
  const tbody = document.getElementById('tbl-coupons');
  if (tbody) {
    if (_couponsData.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:30px;color:#8B5E3C;">No discount coupons available.</td></tr>`;
    } else {
      tbody.innerHTML = _couponsData.map(c => {
        const usageText = c.usage_limit === null || c.usage_limit === undefined ? `${c.used_count} / Unlimited` : `${c.used_count} / ${c.usage_limit}`;
        const expiryText = c.expiry_date ? new Date(c.expiry_date).toLocaleDateString('en-IN') : 'No Expiry';

        return `
          <tr>
            <td><code style="background:#F5ECD7;padding:4px 8px;border-radius:4px;font-weight:bold;">${c.code}</code></td>
            <td><strong>${c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}</strong></td>
            <td>₹${c.minimum_order || 0}</td>
            <td>${c.maximum_discount ? `₹${c.maximum_discount}` : 'N/A'}</td>
            <td>${usageText}</td>
            <td style="font-size:12px;">${expiryText}</td>
            <td><span class="status-badge ${c.active ? 'delivered' : 'cancelled'}">${c.active ? 'Active' : 'Inactive'}</span></td>
            <td>
              <div style="display:flex;gap:6px;">
                <button class="action-btn-sm" style="background:${c.active ? '#e65100' : '#2e7d32'};" onclick="toggleCouponStatus('${c.id}', ${!c.active})">
                  ${c.active ? 'Deactivate' : 'Activate'}
                </button>
                <button class="action-btn-sm" style="background:#c62828;" onclick="deleteCoupon('${c.id}')">Delete</button>
              </div>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  const usageTbody = document.getElementById('tbl-coupon-usage');
  if (usageTbody) {
    if (_couponUsageData.length === 0) {
      usageTbody.innerHTML = '<tr><td colspan="4" class="table-td-center-30">No coupons used yet.</td></tr>';
    } else {
      usageTbody.innerHTML = _couponUsageData.map(u => {
        const usedDate = u.used_at || u.created_at
          ? new Date(u.used_at || u.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
          : '—';
        const code = u.coupon_code || 'COUPON';
        const name = u.user_name || 'Customer';
        const orderRef = u.order_id ? `#${String(u.order_id).slice(0, 8)}` : 'N/A';

        return `
          <tr>
            <td>${usedDate}</td>
            <td><code style="background:#F5ECD7;padding:4px 8px;border-radius:4px;font-weight:bold;color:#3B2A1A;">${code}</code></td>
            <td><strong>${name}</strong></td>
            <td>${orderRef}</td>
          </tr>
        `;
      }).join('');
    }
  }
}

function openCreateCouponModal() {
  document.getElementById('modal-coupon').classList.add('open');
}
function closeCreateCouponModal() {
  document.getElementById('modal-coupon').classList.remove('open');
}

function onCouponUsageTypeChange() {
  const type = document.querySelector('input[name="cp-usage-type"]:checked')?.value;
  const box = document.getElementById('cp-max-uses-box');
  if (box) box.style.display = (type === 'multiple') ? 'block' : 'none';
}

function onCouponExpiryOptionChange() {
  const opt = document.querySelector('input[name="cp-expiry-option"]:checked')?.value;
  const box = document.getElementById('cp-expiry-date-box');
  if (box) box.style.display = (opt === 'set_expiry') ? 'block' : 'none';
}

async function submitCreateCoupon() {
  const code = (document.getElementById('cp-code').value || '').trim().toUpperCase();
  const type = document.getElementById('cp-type').value;
  const value = Number(document.getElementById('cp-value').value);
  const minOrder = Number(document.getElementById('cp-min').value || 0);
  const maxDisc = document.getElementById('cp-max').value ? Number(document.getElementById('cp-max').value) : null;

  const usageType = document.querySelector('input[name="cp-usage-type"]:checked')?.value || 'single';
  let usageLimit = null;
  if (usageType === 'single') {
    usageLimit = 1;
  } else if (usageType === 'multiple') {
    usageLimit = Number(document.getElementById('cp-limit').value);
    if (isNaN(usageLimit) || usageLimit <= 0) {
      alert('Please enter a valid Maximum Uses count.');
      return;
    }
  } else if (usageType === 'unlimited') {
    usageLimit = null;
  }

  const expiryOption = document.querySelector('input[name="cp-expiry-option"]:checked')?.value || 'no_expiry';
  let expiryDate = null;
  if (expiryOption === 'set_expiry') {
    expiryDate = document.getElementById('cp-expiry').value || null;
    if (!expiryDate) {
      alert('Please select an Expiry Date.');
      return;
    }
  }

  if (!code || isNaN(value) || value <= 0) {
    alert('Please enter a valid Coupon Code and Discount Value.');
    return;
  }

  const sb = getSbClient();
  if (!sb) return;

  const { error } = await sb.from('coupons').insert({
    code,
    discount_type: type,
    discount_value: value,
    minimum_order: minOrder,
    maximum_discount: maxDisc,
    usage_limit: usageLimit,
    used_count: 0,
    active: true,
    expiry_date: expiryDate,
    generated_by_system: false
  });

  if (error) {
    alert(`❌ Failed to create coupon: ${error.message}`);
    return;
  }

  closeCreateCouponModal();
  await loadAllAdminData();
}

async function toggleCouponStatus(id, newStatus) {
  const sb = getSbClient();
  if (!sb) return;
  await sb.from('coupons').update({ active: newStatus }).eq('id', id);
  await loadAllAdminData();
}

async function deleteCoupon(id) {
  if (!confirm('Delete this coupon?')) return;
  const sb = getSbClient();
  if (!sb) return;
  await sb.from('coupons').delete().eq('id', id);
  await loadAllAdminData();
}

/* ══════════════════════════════════════════════════════════════════
   PRODUCTS & INVENTORY
   ══════════════════════════════════════════════════════════════════ */
function renderProducts() {
  const tbody = document.getElementById('tbl-products');
  if (!tbody) return;

  tbody.innerHTML = _productsData.map(p => `
    <tr>
      <td>${p.id}</td>
      <td><strong>${p.product_name}</strong></td>
      <td>${p.category || 'Kitchenware'}</td>
      <td>₹${p.price}</td>
      <td><strong>${p.stock}</strong> units</td>
      <td><span class="status-badge ${p.active ? 'delivered' : 'cancelled'}">${p.active ? 'In Stock' : 'Hidden'}</span></td>
      <td>
        <button class="action-btn-sm" onclick="editProductStock(${p.id}, ${p.stock})">Edit Stock</button>
      </td>
    </tr>
  `).join('');
}

async function editProductStock(id, currentStock) {
  const newStockStr = prompt(`Enter new stock quantity for Product #${id}:`, currentStock);
  if (newStockStr === null) return;
  const newStock = Number(newStockStr);
  if (isNaN(newStock) || newStock < 0) { alert('Invalid stock quantity.'); return; }

  const sb = getSbClient();
  if (!sb) return;

  await sb.from('products').update({ stock: newStock }).eq('id', id);
  await loadAllAdminData();
}

/* ══════════════════════════════════════════════════════════════════
   ORDER ACTIONS & EMAIL NOTIFICATIONS
   ══════════════════════════════════════════════════════════════════ */
async function updateOrderStatus(orderId, newStatus) {
  const order = _ordersData.find(o => String(o.id) === String(orderId));
  if (!order) return;
  if (!confirm(`Update Order #${order.order_number || order.id.slice(0, 8)} status to ${newStatus.toUpperCase()}?`)) return;

  const sb = getSbClient();
  if (!sb) return;

  const { error } = await sb.from('orders').update({ order_status: newStatus }).eq('id', orderId);
  if (error) { alert(`Failed to update status: ${error.message}`); return; }

  // Send status email trigger
  try {
    await fetch('/api/send-order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        status: newStatus
      })
    });
  } catch (e) {
    console.warn('Status notification trigger notice:', e);
  }

  await loadAllAdminData();
  closeOrderDrawer();
}

async function markOrderPaid(orderId) {
  const order = _ordersData.find(o => String(o.id) === String(orderId));
  if (!order) return;
  if (!confirm(`Mark payment as PAID for Order #${order.order_number || order.id.slice(0, 8)}?`)) return;

  const sb = getSbClient();
  if (!sb) return;

  const { error } = await sb.from('orders').update({ payment_status: 'paid' }).eq('id', orderId);
  if (error) { alert(`Failed to update payment: ${error.message}`); return; }

  await loadAllAdminData();
  closeOrderDrawer();
}

async function markOrderDelivered(orderId) {
  const order = _ordersData.find(o => String(o.id) === String(orderId));
  if (!order) return;
  if (!confirm(`Mark Order #${order.order_number || order.id.slice(0, 8)} as DELIVERED?`)) return;

  const sb = getSbClient();
  if (!sb) return;

  const updatePayload = { order_status: 'delivered' };
  if (order.payment_method === 'cod') updatePayload.payment_status = 'paid';

  const { error } = await sb.from('orders').update(updatePayload).eq('id', orderId);
  if (error) { alert(`Failed to update status: ${error.message}`); return; }

  try {
    await fetch('/api/send-order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        status: 'delivered'
      })
    });
  } catch (e) {
    console.warn('Status email error:', e);
  }

  await loadAllAdminData();
  closeOrderDrawer();
}

function openRejectModal(orderId) {
  document.getElementById('reject-target-order-id').value = orderId;
  document.getElementById('modal-reject').classList.add('open');
}
function closeRejectModal() {
  document.getElementById('modal-reject').classList.remove('open');
}

async function confirmRejectOrder() {
  const orderId = document.getElementById('reject-target-order-id').value;
  const reason = (document.getElementById('reject-reason-text').value || '').trim();
  const order = _ordersData.find(o => String(o.id) === String(orderId));

  const sb = getSbClient();
  if (!sb || !order) return;

  const { error } = await sb.from('orders').update({
    order_status: 'cancelled',
    rejection_reason: reason || 'Cancelled by Store Admin'
  }).eq('id', orderId);

  if (error) { alert(`Failed to cancel order: ${error.message}`); return; }

  try {
    await fetch('/api/send-order-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        status: 'cancelled',
        reason: reason
      })
    });
  } catch (e) {
    console.warn('Status email error:', e);
  }

  closeRejectModal();
  closeOrderDrawer();
  await loadAllAdminData();
}

function viewOrderDetails(orderId) {
  const order = _ordersData.find(o => String(o.id) === String(orderId));
  if (!order) return;

  const items = _orderItemsData.filter(i => String(i.order_id) === String(order.id));

  const content = document.getElementById('drawer-order-content');
  if (!content) return;

  const fmtR = v => '₹' + Number(v || 0).toLocaleString('en-IN');
  const isDelivered = order.order_status === 'delivered';
  const isCancelled = order.order_status === 'cancelled';
  const isConfirmed = order.order_status === 'confirmed';
  const isPending   = order.order_status === 'pending';
  const isUnpaid    = order.payment_status !== 'paid';

  content.innerHTML = `
    <div style="margin-bottom: 20px;">
      <div style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8B5E3C; font-weight: bold;">CUSTOMER DETAILS</div>
      <h4 style="margin: 4px 0 2px; color: #3B2A1A; font-size: 16px;">${order.customer_name}</h4>
      <p style="font-size: 13px; color: #5C3D1E; margin: 2px 0;">📧 ${order.customer_email}</p>
      <p style="font-size: 13px; color: #5C3D1E; margin: 2px 0;">📞 ${order.customer_phone}</p>
      <p style="font-size: 13px; color: #5C3D1E; margin: 6px 0; background: #F5ECD7; padding: 10px; border-radius: 6px;">
        📍 <strong>Delivery Address:</strong><br>${order.delivery_address}<br>${order.city}, ${order.state} - ${order.pincode}
      </p>
    </div>

    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8B5E3C; font-weight: bold; margin-bottom: 8px;">ORDERED ITEMS (${items.length})</div>
      <div style="background: #FFF; border: 1px solid #E8D5B7; border-radius: 8px; padding: 12px;">
        ${items.length === 0 ? '<p style="color:#8B5E3C;font-size:13px;margin:0;">No item breakdown available.</p>' : ''}
        ${items.map(item => `
          <div style="display: flex; justify-content: space-between; font-size: 13px; padding: 6px 0; border-bottom: 1px dashed #E8D5B7;">
            <div>
              <strong style="color: #3B2A1A;">${item.title || item.product_name}</strong><br>
              <span style="font-size: 11px; color: #8B5E3C;">Qty: ${item.quantity} × ${fmtR(item.price)}</span>
            </div>
            <strong style="color: #5C3D1E;">${fmtR(item.total_price || item.total)}</strong>
          </div>
        `).join('')}
        
        <div style="display: flex; justify-content: space-between; font-size: 12px; color: #8B5E3C; margin-top: 10px;">
          <span>Subtotal:</span> <span>${fmtR(order.subtotal)}</span>
        </div>
        ${Number(order.discount_amount) > 0 ? `
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: green;">
            <span>Discount (${order.coupon_code || 'Coupon'}):</span> <span>-${fmtR(order.discount_amount)}</span>
          </div>
        ` : ''}
        <div style="display: flex; justify-content: space-between; font-size: 15px; font-weight: bold; color: #3B2A1A; padding-top: 10px; margin-top: 6px; border-top: 2px solid #C49A6C;">
          <span>Total Amount:</span> <span>${fmtR(order.total_amount)}</span>
        </div>
      </div>
    </div>

    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8B5E3C; font-weight: bold;">PAYMENT &amp; STATUS</div>
      <p style="font-size: 13px; margin: 6px 0;">Method: <strong style="text-transform: uppercase;">${order.payment_method}</strong></p>
      <p style="font-size: 13px; margin: 2px 0;">Payment Status: <strong style="color:${order.payment_status === 'paid' ? 'green' : '#e65100'}">${order.payment_status}</strong></p>
      <p style="font-size: 13px; margin: 2px 0;">Order Status: <span class="status-badge ${order.order_status}">${order.order_status}</span></p>
      ${order.rejection_reason ? `<p style="font-size: 13px; color: #c62828; margin: 6px 0;">Reason: ${order.rejection_reason}</p>` : ''}
    </div>

    <div style="background: #F5ECD7; border-radius: 8px; padding: 16px;">
      <div style="font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: #8B5E3C; font-weight: bold; margin-bottom: 10px;">AVAILABLE ACTIONS</div>
      
      ${isDelivered ? `
        <div style="padding:10px;background:#e8f5e9;border:1px solid #a5d6a7;border-radius:6px;color:#2e7d32;font-size:13px;font-weight:bold;text-align:center;">
          ✅ Order Delivered &amp; Completed
        </div>
      ` : ''}

      ${isCancelled ? `
        <div style="padding:10px;background:#ffebee;border:1px solid #ef9a9a;border-radius:6px;color:#c62828;font-size:13px;font-weight:bold;text-align:center;">
          ❌ Order Cancelled / Rejected
        </div>
      ` : ''}

      ${(!isDelivered && !isCancelled) ? `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${isPending ? `
            <button class="action-btn-sm" style="background:#1565c0;padding:10px;" onclick="updateOrderStatus('${order.id}', 'confirmed')">Confirm Order →</button>
          ` : ''}

          ${isConfirmed ? `
            <button class="action-btn-sm" style="background:#2e7d32;padding:10px;" onclick="markOrderDelivered('${order.id}')">Mark Delivered ✅</button>
          ` : ''}

          ${isUnpaid ? `
            <button class="action-btn-sm" style="background:#C49A6C;color:#3B2A1A;padding:10px;font-weight:bold;" onclick="markOrderPaid('${order.id}')">Mark Payment Paid 💵</button>
          ` : ''}

          <button class="action-btn-sm" style="background:#c62828;padding:10px;" onclick="openRejectModal('${order.id}')">Cancel / Reject Order ✕</button>
        </div>
      ` : ''}
    </div>
  `;

  document.getElementById('order-drawer').classList.add('open');
}

function closeOrderDrawer() {
  document.getElementById('order-drawer').classList.remove('open');
}

/* ══════════════════════════════════════════════════════════════════
   NAVIGATION & TAB SWITCHING
   ══════════════════════════════════════════════════════════════════ */
function switchAdminTab(tabId, el) {
  document.querySelectorAll('.sec-tab').forEach(sec => sec.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));

  const targetSec = document.getElementById(tabId);
  if (targetSec) targetSec.classList.add('active');

  if (el) el.classList.add('active');
  else {
    const navMatch = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    if (navMatch) navMatch.classList.add('active');
  }

  const titleMap = {
    'sec-dashboard': 'Dashboard',
    'sec-orders': 'All Orders',
    'sec-cod': 'COD Management',
    'sec-customers': 'Customer Directory',
    'sec-newsletter': 'Newsletter Subscribers',
    'sec-reviews': 'Customer Reviews',
    'sec-feedback': 'Customer Enquiries',
    'sec-coupons': 'Discount Coupons',
    'sec-products': 'Product Catalog'
  };

  const titleText = document.getElementById('page-title-text');
  if (titleText) titleText.textContent = titleMap[tabId] || 'Admin Panel';

  if (window.innerWidth <= 768) {
    document.getElementById('admin-sidebar')?.classList.remove('open');
  }
}

function toggleAdminSidebar() {
  document.getElementById('admin-sidebar')?.classList.toggle('open');
}

/* ══════════════════════════════════════════════════════════════════
   REVIEWS & ENQUIRIES MODERATION
   ══════════════════════════════════════════════════════════════════ */
function renderReviews() {
  const tbody = document.getElementById('tbl-reviews');
  if (!tbody) return;

  const search = (document.getElementById('search-reviews')?.value || '').toLowerCase();
  const statusFilter = (document.getElementById('filter-review-status')?.value || '').toLowerCase();

  let filtered = _reviewsData.filter(r => {
    const textStr = `${r.customer_name || r.name || ''} ${r.location || ''} ${r.product_name || r.product || ''} ${r.review_text || ''}`.toLowerCase();
    const matchesSearch = textStr.includes(search);
    const matchesStatus = !statusFilter || (r.status || 'approved').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="table-td-center-30">No customer reviews found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(r => {
    const stars = '★'.repeat(r.rating || 5) + '☆'.repeat(5 - (r.rating || 5));
    const status = r.status || 'approved';
    const statusCls = status === 'approved' ? 'delivered' : status === 'pending' ? 'pending' : 'cancelled';
    const date = r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const author = r.customer_name || r.name || 'Anonymous';
    const prod = r.product_name || r.product || '—';

    return `
      <tr>
        <td><strong>${author}</strong></td>
        <td>${r.location || 'India'}</td>
        <td>${prod}</td>
        <td style="color:#f57f17;font-size:14px;">${stars}</td>
        <td style="max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${(r.review_text || '').replace(/"/g, '&quot;')}">${r.review_text || ''}</td>
        <td><span class="status-badge ${statusCls}">${status.toUpperCase()}</span></td>
        <td>${date}</td>
        <td>
          <div style="display:flex;gap:6px;">
            ${status !== 'approved' ? `<button class="action-btn-sm" style="background:#e8f5e9;color:#2e7d32;" onclick="updateReviewStatus('${r.id}', 'approved')">Approve</button>` : ''}
            ${status !== 'rejected' ? `<button class="action-btn-sm" style="background:#ffebee;color:#c62828;" onclick="updateReviewStatus('${r.id}', 'rejected')">Reject</button>` : ''}
            <button class="action-btn-sm" style="background:#f5f5f5;color:#666;" onclick="deleteReview('${r.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterReviewsTable() { renderReviews(); }

async function updateReviewStatus(id, newStatus) {
  const sb = getSbClient();
  if (!sb) return;
  try {
    const { error } = await sb.from('reviews').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    const idx = _reviewsData.findIndex(r => r.id === id);
    if (idx !== -1) _reviewsData[idx].status = newStatus;
    renderReviews();
    updateAdminStats();
  } catch (e) {
    alert('Failed to update review status: ' + (e.message || e));
  }
}

async function deleteReview(id) {
  if (!confirm('Are you sure you want to delete this review?')) return;
  const sb = getSbClient();
  if (!sb) return;
  try {
    const { error } = await sb.from('reviews').delete().eq('id', id);
    if (error) throw error;
    _reviewsData = _reviewsData.filter(r => r.id !== id);
    renderReviews();
    updateAdminStats();
  } catch (e) {
    alert('Failed to delete review: ' + (e.message || e));
  }
}

function renderEnquiries() {
  const tbody = document.getElementById('tbl-feedback');
  if (!tbody) return;

  const search = (document.getElementById('search-enquiries')?.value || '').toLowerCase();
  const statusFilter = (document.getElementById('filter-enquiry-status')?.value || '').toLowerCase();

  let filtered = _enquiriesData.filter(e => {
    const textStr = `${e.name || ''} ${e.email || ''} ${e.phone || ''} ${e.subject || ''} ${e.message || ''}`.toLowerCase();
    const matchesSearch = textStr.includes(search);
    const matchesStatus = !statusFilter || (e.status || 'new').toLowerCase() === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = '<tr><td colspan="8" class="table-td-center-30">No customer enquiries found.</td></tr>';
    return;
  }

  tbody.innerHTML = filtered.map(e => {
    const date = e.created_at ? new Date(e.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
    const status = e.status || 'new';
    const statusCls = status === 'new' ? 'pending' : status === 'replied' ? 'delivered' : status === 'read' ? 'confirmed' : 'cancelled';

    return `
      <tr>
        <td>${date}</td>
        <td><strong>${e.name || '—'}</strong></td>
        <td><a href="mailto:${e.email}" style="color:#5C3D1E;">${e.email}</a>${e.phone ? '<br><small>' + e.phone + '</small>' : ''}</td>
        <td>${e.subject || 'General Enquiry'}</td>
        <td>${e.product_interest || '—'}</td>
        <td style="max-width:220px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${(e.message || '').replace(/"/g, '&quot;')}">${e.message || ''}</td>
        <td><span class="status-badge ${statusCls}">${status.toUpperCase()}</span></td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="action-btn-sm" style="background:#e3f2fd;color:#1565c0;" onclick="viewEnquiryDetails('${e.id}')">View</button>
            ${status === 'new' ? `<button class="action-btn-sm" style="background:#e8f5e9;color:#2e7d32;" onclick="updateEnquiryStatus('${e.id}', 'read')">Mark Read</button>` : ''}
            <button class="action-btn-sm" style="background:#f5f5f5;color:#666;" onclick="deleteEnquiry('${e.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function filterEnquiriesTable() { renderEnquiries(); }

function viewEnquiryDetails(id) {
  const enquiry = _enquiriesData.find(e => e.id === id);
  if (!enquiry) return;

  _activeEnquiry = enquiry;
  document.getElementById('enquiry-modal-subject').textContent = enquiry.subject || 'Customer Enquiry';
  document.getElementById('enquiry-modal-from').innerHTML = `<strong>From:</strong> ${enquiry.name} (${enquiry.email}) ${enquiry.phone ? '· ' + enquiry.phone : ''}<br><strong>Product:</strong> ${enquiry.product_interest || 'N/A'}`;
  document.getElementById('enquiry-modal-body').textContent = enquiry.message || '';

  document.getElementById('modal-enquiry').classList.add('open');

  if (enquiry.status === 'new') {
    updateEnquiryStatus(id, 'read');
  }
}

function closeEnquiryModal() {
  document.getElementById('modal-enquiry').classList.remove('open');
  _activeEnquiry = null;
}

async function markCurrentEnquiryRead() {
  if (_activeEnquiry?.id) {
    await updateEnquiryStatus(_activeEnquiry.id, 'read');
    closeEnquiryModal();
  }
}

async function markCurrentEnquiryReplied() {
  if (_activeEnquiry?.id) {
    await updateEnquiryStatus(_activeEnquiry.id, 'replied');
    closeEnquiryModal();
  }
}

async function updateEnquiryStatus(id, newStatus) {
  const sb = getSbClient();
  if (!sb) return;
  try {
    const { error } = await sb.from('contact_enquiries').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id);
    if (error) throw error;
    const idx = _enquiriesData.findIndex(e => e.id === id);
    if (idx !== -1) _enquiriesData[idx].status = newStatus;
    renderEnquiries();
    updateAdminStats();
  } catch (e) {
    console.warn('Enquiry status update error:', e);
  }
}

async function deleteEnquiry(id) {
  if (!confirm('Are you sure you want to delete this enquiry?')) return;
  const sb = getSbClient();
  if (!sb) return;
  try {
    const { error } = await sb.from('contact_enquiries').delete().eq('id', id);
    if (error) throw error;
    _enquiriesData = _enquiriesData.filter(e => e.id !== id);
    renderEnquiries();
    updateAdminStats();
  } catch (e) {
    alert('Failed to delete enquiry: ' + (e.message || e));
  }
}
