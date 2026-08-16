/* ══════════════════════════════════════════════
   RUSTIC HERITAGE KITCHENWARE — cart.js
   WITH FULL PRODUCT SPECIFICATIONS
   ══════════════════════════════════════════════ */

const PRODUCTS = [
  {
    id: 1, name: "Stone Mortar & Pestle", emoji: "🪨", price: 599, img: "images/img1.png",
    material: "Natural Granite Stone", weight: "2.5 kg", dimensions: "15 cm diameter × 10 cm height",
    origin: "Rajasthan, India", care: "Rinse with water, no soap. Season before first use.",
    desc: "Perfect for grinding spices, herbs and pastes. The rough granite surface ensures fine grinding with minimal effort."
  },
  {
    id: 2, name: "Wooden Ladle Set (in Ceramic Holder)", emoji: "🥄", price: 449, img: "images/img2.png",
    material: "Sheesham Wood + Ceramic Holder", weight: "400 g", dimensions: "30–35 cm length",
    origin: "Saharanpur, Uttar Pradesh", care: "Hand wash only. Dry immediately. Oil monthly.",
    desc: "Set of 5 handcrafted ladles in assorted sizes, presented in a hand-painted ceramic holder."
  },
  {
    id: 3, name: "Traditional Grinding Stone", emoji: "🪨", price: 1299, img: "images/img3.png",
    material: "Black Basalt Stone", weight: "8 kg", dimensions: "45 cm × 30 cm × 12 cm",
    origin: "Tamil Nadu, India", care: "Wash with water only. Dry in sun after use.",
    desc: "The classic ammikallu used for grinding idli/dosa batter, chutneys, and masalas. Gives authentic flavour unmatched by mixers."
  },
  {
    id: 4, name: "Clay Cooking Pot with Lid", emoji: "🏺", price: 649, img: "images/img4.png",
    material: "Natural Unglazed Red Clay", weight: "1.2 kg", dimensions: "20 cm diameter × 18 cm height",
    origin: "Khurja, Uttar Pradesh", care: "Soak in water 30 min before first use. Low to medium heat only.",
    desc: "Slow-cooks dal, biryanis, and curries with earthy flavour. The porous clay naturally regulates moisture and heat."
  },
  {
    id: 5, name: "Cast Iron Tawa (Large Flat Griddle)", emoji: "🍳", price: 999, img: "images/img5.png",
    material: "Pre-Seasoned Cast Iron", weight: "3.8 kg", dimensions: "30 cm diameter",
    origin: "Coimbatore, Tamil Nadu", care: "Wipe dry after use. Re-season with oil. Never soak in water.",
    desc: "Ideal for making dosas, rotis, parathas, and uttapam. Distributes heat evenly for perfect cooking every time."
  },
  {
    id: 6, name: "Brass Bowl Set with Spoons & Tray", emoji: "⚱️", price: 1499, img: "images/img6.png",
    material: "Pure Brass (85% Copper, 15% Zinc)", weight: "1.8 kg", dimensions: "Bowls: 12 cm / Tray: 35 cm",
    origin: "Moradabad, Uttar Pradesh", care: "Polish with tamarind paste. Avoid dishwasher.",
    desc: "Traditional puja and dining set with 4 bowls, 4 spoons and 1 serving tray. Antimicrobial and food-safe."
  },
  {
    id: 7, name: "Teak Wood Ladle Set (7-piece)", emoji: "🥄", price: 749, img: "images/img7.png", badge: "Best Seller",
    material: "Aged Teak Wood", weight: "600 g", dimensions: "25–40 cm length",
    origin: "Kerala, India", care: "Hand wash only. Rub with coconut oil monthly to prevent cracking.",
    desc: "7-piece set including spatulas, ladles, and a stirrer. Naturally anti-bacterial, heat-resistant, and chemical-free."
  },
  {
    id: 8, name: "Granite Cookware Set", emoji: "🪨", price: 1399, img: "images/img8.png", badge: "Best Seller",
    material: "Natural Kalchatti Granite", weight: "4.5 kg (set)", dimensions: "20 cm + 24 cm pots",
    origin: "Salem, Tamil Nadu", care: "Season with gingelly oil before first use. Medium heat only.",
    desc: "Two-piece granite pot set (kalchatti) perfect for simmering rasam, sambar, and milk. Naturally non-stick surface."
  },
  {
    id: 9, name: "Copper Pan Set", emoji: "🥘", price: 1299, img: "images/img9.png",
    material: "99% Pure Copper", weight: "2.2 kg", dimensions: "22 cm + 26 cm diameter",
    origin: "Jagadhri, Haryana", care: "Polish with lemon + salt. Hand wash only. Avoid acidic foods.",
    desc: "Two copper pans with tin-lined interior. Excellent heat conductor — cooks 3× faster than steel. Enhances food quality."
  },
  {
    id: 10, name: "Banana Leaf Plates", emoji: "🌿", price: 299, img: "images/img10.png",
    material: "Dried Banana Leaf (Natural)", weight: "300 g", dimensions: "Pack of 20 plates, 35 cm × 25 cm each",
    origin: "Ernakulam, Kerala", care: "Single-use, 100% biodegradable. No washing needed.",
    desc: "Authentic banana leaf plates for traditional South Indian feasts. Food tastes better on banana leaf — a proven fact!"
  },
  {
    id: 11, name: "Ceramic Spice Jar Set (3-piece Floral)", emoji: "🫙", price: 849, img: "images/img11.png",
    material: "Hand-Painted Ceramic", weight: "800 g (set)", dimensions: "Each jar: 8 cm diameter × 12 cm height",
    origin: "Jaipur, Rajasthan", care: "Hand wash only. Dishwasher-safe lid. Airtight cork seal.",
    desc: "3 ceramic jars with hand-painted floral motifs, cork lids and wooden spoons. Perfect for storing salt, turmeric, and chilli."
  },
  {
    id: 12, name: "Brass Uruli + Ladle Set", emoji: "⚱️", price: 1199, img: "images/img12.png",
    material: "Pure Brass", weight: "2.4 kg", dimensions: "Uruli: 28 cm diameter × 10 cm depth",
    origin: "Thrissur, Kerala", care: "Clean with tamarind and salt paste. Dry thoroughly.",
    desc: "Traditional Kerala uruli for preparing payasam, halwa and temple offerings. Comes with a long brass ladle."
  },
  {
    id: 13, name: "Brass Water Jug & Tumbler Set", emoji: "🥛", price: 1099, img: "images/img13.png",
    material: "Pure Brass", weight: "1.5 kg", dimensions: "Jug: 1.5 L / Tumblers: 250 ml each",
    origin: "Moradabad, Uttar Pradesh", care: "Wash with tamarind water weekly. Avoid dish soap.",
    desc: "Store water in brass overnight and drink in the morning — Ayurveda recommends it for gut health and immunity."
  },
  {
    id: 14, name: "Clay Water Jug (with Lid & Handle)", emoji: "🏺", price: 399, img: "images/img14.png",
    material: "Natural Terracotta Clay", weight: "900 g", dimensions: "Height: 28 cm / Capacity: 2 litres",
    origin: "Kutch, Gujarat", care: "Soak in water overnight before first use. Rinse daily.",
    desc: "Keeps water naturally cool without electricity. The clay minerals subtly enrich the water's taste and alkalinity."
  },
  {
    id: 15, name: "Terracotta Water Bottles (Painted)", emoji: "🍶", price: 549, img: "images/img15.png", badge: "Best Seller",
    material: "Hand-Painted Terracotta", weight: "500 g each", dimensions: "Height: 22 cm / Capacity: 700 ml each",
    origin: "Bikaner, Rajasthan", care: "Do not refrigerate. Rinse with plain water daily. No soap inside.",
    desc: "Pair of hand-painted terracotta bottles with cork stoppers. Keeps water cool for 4–6 hours naturally."
  },
];

/* ── Cart State (localStorage) ── */
const CART = {
  get items() {
    try { return JSON.parse(localStorage.getItem('rh_cart') || '{}'); } catch { return {}; }
  },
  set items(v) { localStorage.setItem('rh_cart', JSON.stringify(v)); },

  add(id) {
    const c = this.items;
    c[id] = (c[id] || 0) + 1;
    this.items = c;
    renderCartBadge();
    renderCartDrawer();
    showCartToast(id);
  },

  remove(id) {
    const c = this.items;
    if (c[id] > 1) c[id]--;
    else delete c[id];
    this.items = c;
    renderCartBadge();
    renderCartDrawer();
  },

  delete(id) {
    const c = this.items;
    delete c[id];
    this.items = c;
    renderCartBadge();
    renderCartDrawer();
  },

  clear() {
    this.items = {};
    renderCartBadge();
    renderCartDrawer();
  },

  count() { return Object.values(this.items).reduce((a, b) => a + b, 0); },

  subtotal() {
    const c = this.items;
    return PRODUCTS.reduce((sum, p) => sum + (p.price * (c[p.id] || 0)), 0);
  },

  /* Delivery: ₹80 below ₹999, ₹40 at ₹999+. Only coupons can waive this. */
  delivery(couponFreeDelivery) {
    if (couponFreeDelivery) return 0;
    return this.subtotal() >= 999 ? 40 : 80;
  },
  tax() { return Math.round(this.subtotal() * 0.05); },
  total(couponDiscount, couponFreeDelivery) {
    const discount = couponDiscount || 0;
    return Math.max(0, this.subtotal() - discount) + this.delivery(couponFreeDelivery) + this.tax();
  },

  cartProducts() {
    const c = this.items;
    return PRODUCTS.filter(p => c[p.id] > 0);
  },

  toOrderItems() {
    const c = this.items;
    return PRODUCTS
      .filter(p => c[p.id] > 0)
      .map(p => ({
        id: p.id,
        name: p.name,
        emoji: p.emoji,
        price: p.price,
        qty: c[p.id],
        total: p.price * c[p.id],
      }));
  }
};

/* ── Format ── */
const fmt = n => `₹${n.toLocaleString('en-IN')}`;

/* ── Toast notification ── */
function showRHToast(msg) {
  const toast = document.getElementById('rh-cart-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ── Inject cart overlay HTML into page ── */
function initCart() {
  if (!document.getElementById('rh-cart-styles')) {
    const style = document.createElement('style');
    style.id = 'rh-cart-styles';
    style.textContent = `
      #rh-cart-fab {
        position: fixed; bottom: 32px; right: 32px; z-index: 900;
        width: 58px; height: 58px; border-radius: 50%;
        background: var(--brown-dark, #5C3D1E);
        color: #fff; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 6px 24px rgba(92,61,30,0.45);
        transition: transform 0.2s ease, box-shadow 0.2s ease;
        font-size: 22px;
      }
      #rh-cart-fab:hover { transform: scale(1.1); box-shadow: 0 10px 32px rgba(92,61,30,0.55); }
      #rh-cart-badge {
        position: absolute; top: -4px; right: -4px;
        background: #C49A6C; color: #fff;
        width: 22px; height: 22px; border-radius: 50%;
        font-size: 11px; font-weight: bold;
        display: flex; align-items: center; justify-content: center;
        border: 2px solid #fff;
        transition: transform 0.2s ease;
      }
      #rh-cart-badge.pop { animation: badge-pop 0.3s ease; }
      @keyframes badge-pop { 0%{transform:scale(1)} 50%{transform:scale(1.5)} 100%{transform:scale(1)} }
      #rh-cart-overlay {
        position: fixed; inset: 0; z-index: 1000;
        background: rgba(0,0,0,0); pointer-events: none;
        transition: background 0.3s ease;
      }
      #rh-cart-overlay.open { background: rgba(0,0,0,0.25); pointer-events: all; }
      #rh-cart-drawer {
        position: fixed; top: 0; right: -440px; width: 420px; height: 100vh;
        background: #FDF6EC; z-index: 1001;
        display: flex; flex-direction: column;
        box-shadow: -8px 0 40px rgba(92,61,30,0.25);
        transition: right 0.35s cubic-bezier(0.4,0,0.2,1);
        font-family: 'Georgia', serif;
        overflow: hidden;
      }
      #rh-cart-drawer.open { right: 0; }
      .rh-cart-header {
        background: #5C3D1E; padding: 20px 24px;
        display: flex; align-items: center; justify-content: space-between;
        flex-shrink: 0;
      }
      .rh-cart-header-left { display: flex; align-items: center; gap: 10px; }
      .rh-cart-header-left svg { color: #C49A6C; }
      .rh-cart-title { font-size: 16px; font-weight: bold; color: #F5ECD7; letter-spacing: 0.5px; }
      .rh-cart-close {
        background: none; border: none; color: #C49A6C;
        font-size: 20px; cursor: pointer; width: 32px; height: 32px;
        display: flex; align-items: center; justify-content: center;
        border-radius: 50%; transition: background 0.2s;
      }
      .rh-cart-close:hover { background: rgba(196,154,108,0.2); }
      .rh-cart-goldbar { height: 3px; background: linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C); flex-shrink:0; }
      .rh-cart-body { flex: 1; overflow-y: auto; padding: 16px; min-height: 0; }
      .rh-cart-footer {
        padding: 16px; border-top: 1px solid #E8D5B7;
        background: #FDF6EC; flex-shrink: 0;
        position: sticky; bottom: 0;
      }
      .rh-cart-empty { text-align: center; padding: 60px 20px; }
      .rh-cart-empty-icon { font-size: 52px; margin-bottom: 14px; opacity: 0.5; }
      .rh-cart-empty p { color: #8B5E3C; font-style: italic; font-size: 15px; line-height: 1.7; }
      .rh-cart-item {
        display: flex; gap: 12px; align-items: center;
        padding: 12px; margin-bottom: 10px;
        background: #fff; border-radius: 10px;
        border: 1px solid #E8D5B7;
        transition: box-shadow 0.2s;
      }
      .rh-cart-item:hover { box-shadow: 0 4px 12px rgba(92,61,30,0.1); }
      .rh-cart-item-img {
        width: 60px; height: 60px; border-radius: 8px;
        object-fit: cover; flex-shrink: 0; background: #F5ECD7;
      }
      .rh-cart-item-info { flex: 1; min-width: 0; }
      .rh-cart-item-name { font-size: 13px; color: #3B2A1A; font-weight: bold; line-height: 1.4; margin-bottom: 4px; }
      .rh-cart-item-price { font-size: 14px; color: #8B5E3C; font-weight: bold; }
      .rh-cart-item-del {
        background: none; border: none; color: #C49A6C;
        font-size: 16px; cursor: pointer; padding: 2px 6px;
        opacity: 0.6; transition: opacity 0.2s;
      }
      .rh-cart-item-del:hover { opacity: 1; color: #8b1a1a; }
      .rh-qty { display: flex; align-items: center; gap: 6px; margin-top: 6px; }
      .rh-qty-btn {
        width: 26px; height: 26px; border-radius: 50%;
        border: 1.5px solid #C49A6C; background: #FDF6EC;
        color: #5C3D1E; font-size: 16px; cursor: pointer;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.2s; font-family: Georgia, serif; line-height: 1;
      }
      .rh-qty-btn:hover { background: #5C3D1E; color: #F5ECD7; border-color: #5C3D1E; }
      .rh-qty-val { min-width: 24px; text-align: center; font-size: 14px; color: #3B2A1A; font-weight: bold; }
      .rh-cart-row { display: flex; justify-content: space-between; font-size: 13px; color: #8B5E3C; padding: 4px 0; }
      .rh-cart-row .free { color: #2d7a4a; font-weight: bold; }
      .rh-cart-total {
        display: flex; justify-content: space-between;
        font-size: 16px; font-weight: bold; color: #3B2A1A;
        padding: 10px 0 6px; border-top: 1px solid #E8D5B7; margin-top: 6px;
      }
      .rh-free-msg  { font-size: 12px; color: #2d7a4a; text-align: center; margin: 6px 0; }
      .rh-nudge-msg { font-size: 12px; color: #8B5E3C; text-align: center; font-style: italic; margin: 6px 0; }
      .rh-delivery-bar-wrap { margin-bottom: 10px; }
      .rh-delivery-bar-track { height: 6px; background: #E8D5B7; border-radius: 3px; overflow: hidden; }
      .rh-delivery-bar-fill { height: 100%; background: linear-gradient(90deg,#C49A6C,#5C3D1E); border-radius: 3px; transition: width 0.5s ease; }
      .rh-checkout-btn {
        width: 100%; padding: 15px;
        background: linear-gradient(135deg, #5C3D1E, #8B5E3C);
        color: #F5ECD7; border: none; border-radius: 30px;
        font-size: 15px; font-weight: bold; cursor: pointer;
        font-family: 'Georgia', serif; letter-spacing: 1px;
        transition: all 0.3s ease; margin-top: 10px;
      }
      .rh-checkout-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(92,61,30,0.35); }
      #rh-cart-toast {
        position: fixed; bottom: 110px; right: 32px; z-index: 1100;
        background: #5C3D1E; color: #F5ECD7;
        padding: 12px 20px; border-radius: 30px;
        font-size: 13px; font-family: 'Georgia', serif;
        box-shadow: 0 6px 20px rgba(92,61,30,0.4);
        transform: translateY(20px); opacity: 0;
        transition: all 0.3s ease; pointer-events: none;
        border-left: 3px solid #C49A6C; max-width: 260px;
      }
      #rh-cart-toast.show { transform: translateY(0); opacity: 1; }

      /* ── Product Spec Modal ── */
      #rh-spec-overlay {
        position:fixed;inset:0;z-index:2500;background:rgba(0,0,0,0);
        pointer-events:none;display:flex;align-items:center;justify-content:center;padding:20px;
        transition:background 0.3s ease;font-family:'Georgia',serif;
      }
      #rh-spec-overlay.open { background:rgba(20,10,5,0.72);pointer-events:all; }
      #rh-spec-card {
        background:#FDF6EC;width:100%;max-width:540px;border-radius:8px;overflow:hidden;
        box-shadow:0 24px 80px rgba(0,0,0,0.5);
        transform:translateY(28px) scale(0.97);opacity:0;
        transition:transform 0.35s cubic-bezier(0.4,0,0.2,1),opacity 0.35s ease;
        max-height:90vh;overflow-y:auto;
      }
      #rh-spec-overlay.open #rh-spec-card { transform:translateY(0) scale(1);opacity:1; }
      .spec-header {
        background:linear-gradient(135deg,#3B2A1A 0%,#5C3D1E 60%,#3B2A1A 100%);
        padding:20px 26px;display:flex;align-items:center;justify-content:space-between;
      }
      .spec-title { color:#F5ECD7;font-size:17px;font-weight:bold; }
      .spec-close {
        background:none;border:none;color:#C49A6C;font-size:20px;cursor:pointer;
        width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;
        transition:background 0.2s;
      }
      .spec-close:hover { background:rgba(196,154,108,0.2); }
      .spec-goldbar { height:3px;background:linear-gradient(90deg,#C49A6C,#8B5E3C,#C49A6C); }
      .spec-body { padding:22px 26px; }
      .spec-img { width:100%;height:200px;object-fit:cover;border-radius:8px;margin-bottom:16px; }
      .spec-desc { font-size:14px;color:#5C3D1E;line-height:1.8;margin-bottom:18px;font-style:italic; }
      .spec-grid {
        display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:18px;
      }
      .spec-item {
        background:#F5ECD7;border:1px solid #E8D5B7;border-radius:8px;
        padding:10px 14px;border-left:3px solid #C49A6C;
      }
      .spec-item-label { font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#C49A6C;margin-bottom:4px; }
      .spec-item-val { font-size:13px;color:#3B2A1A;font-weight:bold; }
      .spec-care {
        background:#fff8e8;border:1px solid #E8D5B7;border-radius:8px;
        padding:12px 16px;margin-bottom:18px;border-left:3px solid #8B5E3C;
      }
      .spec-care-label { font-size:10px;letter-spacing:2px;text-transform:uppercase;color:#8B5E3C;margin-bottom:6px; }
      .spec-care-val { font-size:13px;color:#5C3D1E;line-height:1.7; }
      .spec-atc-btn {
        width:100%;padding:14px;background:linear-gradient(135deg,#5C3D1E,#8B5E3C);
        color:#F5ECD7;border:none;border-radius:8px;font-size:15px;
        font-family:'Georgia',serif;cursor:pointer;letter-spacing:0.5px;
        transition:all 0.25s;
      }
      .spec-atc-btn:hover { background:linear-gradient(135deg,#8B5E3C,#C49A6C);transform:translateY(-1px); }

      @media (max-width: 480px) {
        #rh-cart-drawer { width: 100vw; }
        #rh-cart-fab { bottom: 20px; right: 20px; }
        .spec-grid { grid-template-columns:1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  if (!document.getElementById('rh-cart-fab')) {
    const fab = document.createElement('button');
    fab.id = 'rh-cart-fab';
    fab.setAttribute('aria-label', 'Open cart');
    fab.onclick = openCartDrawer;
    fab.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
      </svg>
      <span id="rh-cart-badge" style="${CART.count() === 0 ? 'display:none' : ''}">${CART.count()}</span>
    `;
    document.body.appendChild(fab);
  }

  if (!document.getElementById('rh-cart-overlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'rh-cart-overlay';
    overlay.onclick = e => { if (e.target === overlay) closeCartDrawer(); };
    document.body.appendChild(overlay);
  }

  if (!document.getElementById('rh-cart-drawer')) {
    const drawer = document.createElement('div');
    drawer.id = 'rh-cart-drawer';
    document.body.appendChild(drawer);
  }

  if (!document.getElementById('rh-cart-toast')) {
    const toast = document.createElement('div');
    toast.id = 'rh-cart-toast';
    document.body.appendChild(toast);
  }

  /* Spec modal container */
  if (!document.getElementById('rh-spec-overlay')) {
    const so = document.createElement('div');
    so.id = 'rh-spec-overlay';
    so.innerHTML = `<div id="rh-spec-card"></div>`;
    so.addEventListener('click', e => { if (e.target === so) closeSpecModal(); });
    document.body.appendChild(so);
  }

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeCartDrawer(); closeSpecModal(); }
  });

  document.addEventListener('rh-order-success', () => {
    CART.clear();
    closeCartDrawer();
  });

  renderCartBadge();
  renderCartDrawer();
}

/* ── Spec Modal ── */
function openSpecModal(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  const card = document.getElementById('rh-spec-card');
  if (!card) return;
  card.innerHTML = `
    <div class="spec-header">
      <span class="spec-title">${p.emoji} ${p.name}</span>
      <button class="spec-close" onclick="closeSpecModal()">✕</button>
    </div>
    <div class="spec-goldbar"></div>
    <div class="spec-body">
      <img class="spec-img" src="${p.img}" alt="${p.name}" onerror="this.style.display='none'"/>
      <p class="spec-desc">${p.desc}</p>
      <div class="spec-grid">
        <div class="spec-item">
          <div class="spec-item-label">Material</div>
          <div class="spec-item-val">${p.material}</div>
        </div>
        <div class="spec-item">
          <div class="spec-item-label">Weight</div>
          <div class="spec-item-val">${p.weight}</div>
        </div>
        <div class="spec-item">
          <div class="spec-item-label">Dimensions</div>
          <div class="spec-item-val">${p.dimensions}</div>
        </div>
        <div class="spec-item">
          <div class="spec-item-label">Origin</div>
          <div class="spec-item-val">${p.origin}</div>
        </div>
      </div>
      <div class="spec-care">
        <div class="spec-care-label">🧹 Care Instructions</div>
        <div class="spec-care-val">${p.care}</div>
      </div>
      <button class="spec-atc-btn" onclick="CART.add(${p.id}); closeSpecModal();">
        🛒 Add to Cart — ${fmt(p.price)}
      </button>
    </div>
  `;
  document.getElementById('rh-spec-overlay').classList.add('open');
}

function closeSpecModal() {
  const o = document.getElementById('rh-spec-overlay');
  if (o) o.classList.remove('open');
}

function openCartDrawer() {
  /* Measure scrollbar width to prevent layout jump */
  const scrollY = window.scrollY;
  const sw = window.innerWidth - document.documentElement.clientWidth;

  /* Lock scroll on both html and body */
  document.documentElement.style.overflow = 'hidden';
  document.body.style.overflow = 'hidden';
  document.body.style.position = 'fixed';
  document.body.style.top = `-${scrollY}px`;
  document.body.style.width = '100%';
  document.body.style.paddingRight = sw ? `${sw}px` : '';
  document.body.dataset.scrollY = scrollY;

  document.getElementById('rh-cart-overlay').classList.add('open');
  document.getElementById('rh-cart-drawer').classList.add('open');
}

function closeCartDrawer() {
  const scrollY = parseInt(document.body.dataset.scrollY || '0', 10);

  /* Restore scroll */
  document.documentElement.style.overflow = '';
  document.body.style.overflow = '';
  document.body.style.position = '';
  document.body.style.top = '';
  document.body.style.width = '';
  document.body.style.paddingRight = '';
  window.scrollTo(0, scrollY);

  document.getElementById('rh-cart-overlay').classList.remove('open');
  document.getElementById('rh-cart-drawer').classList.remove('open');
}

function renderCartBadge() {
  const badge = document.getElementById('rh-cart-badge');
  if (!badge) return;
  const count = CART.count();
  badge.style.display = count === 0 ? 'none' : 'flex';
  badge.textContent = count;
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');
  const navBadge = document.getElementById('nav-cart-badge');
  if (navBadge) {
    navBadge.style.display = count === 0 ? 'none' : 'flex';
    navBadge.textContent = count;
  }
}

function renderCartDrawer() {
  const drawer = document.getElementById('rh-cart-drawer');
  if (!drawer) return;
  const items = CART.cartProducts();
  const cart = CART.items;
  const sub = CART.subtotal();
  const del = CART.delivery();

  drawer.innerHTML = `
    <div class="rh-cart-header">
      <div class="rh-cart-header-left">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#C49A6C" stroke-width="2">
          <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
          <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
        </svg>
        <span class="rh-cart-title">Your Cart (${CART.count()})</span>
      </div>
      <button class="rh-cart-close" onclick="closeCartDrawer()">✕</button>
    </div>
    <div class="rh-cart-goldbar"></div>
    <div class="rh-cart-body">
      ${items.length === 0 ? `
        <div class="rh-cart-empty">
          <div class="rh-cart-empty-icon">🏺</div>
          <p>Your cart is empty.<br/>Add some traditional pieces!</p>
        </div>
      ` : items.map(p => `
        <div class="rh-cart-item">
          <img class="rh-cart-item-img" src="${p.img}" alt="${p.name}" onerror="this.style.display='none'"/>
          <div class="rh-cart-item-info">
            <div class="rh-cart-item-name">${p.emoji} ${p.name}</div>
            <div class="rh-cart-item-price">${fmt(p.price)} × ${cart[p.id]} = ${fmt(p.price * cart[p.id])}</div>
            <div class="rh-qty">
              <button class="rh-qty-btn" onclick="CART.remove(${p.id})">−</button>
              <span class="rh-qty-val">${cart[p.id]}</span>
              <button class="rh-qty-btn" onclick="CART.add(${p.id})">+</button>
            </div>
          </div>
          <button class="rh-cart-item-del" onclick="CART.delete(${p.id})" title="Remove">✕</button>
        </div>
      `).join('')}
    </div>
    ${items.length > 0 ? `
      <div class="rh-cart-footer">
        <div class="rh-cart-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
        <div class="rh-cart-row"><span>Delivery</span><span>${fmt(del)}</span></div>
        <div class="rh-cart-row"><span>GST (5%)</span><span>${fmt(CART.tax())}</span></div>
        <div class="rh-cart-total"><span>Total</span><span>${fmt(CART.total())}</span></div>
        <p class="rh-nudge-msg" style="color:#8B5E3C;font-size:12px;text-align:center;margin:6px 0;">🎟 Apply coupon at checkout for discounts</p>
        <button class="rh-checkout-btn" onclick="goToCheckout()">Proceed to Checkout →</button>
      </div>
    ` : ''}
  `;
}


function showCartToast(productId) {
  const p = PRODUCTS.find(x => x.id === productId);
  if (!p) return;
  const toast = document.getElementById('rh-cart-toast');
  if (!toast) return;
  toast.textContent = `${p.emoji} ${p.name} added to cart!`;
  toast.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}

function goToCheckout() {
  if (typeof rhOpenCheckout === 'function') {
    closeCartDrawer();
    rhOpenCheckout();
  } else {
    setTimeout(() => {
      if (typeof rhOpenCheckout === 'function') {
        closeCartDrawer();
        rhOpenCheckout();
      } else {
        alert('Checkout could not load. Please refresh the page and try again.');
      }
    }, 800);
  }
}

document.addEventListener('DOMContentLoaded', initCart);