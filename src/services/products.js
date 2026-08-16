import { supabase } from '../lib/supabase';

export const PRODUCTS = [
  {
    id: 1, name: "Stone Mortar & Pestle", emoji: "🪨", price: 599, img: "/images/img1.png", category: "stone",
    material: "Natural Granite Stone", weight: "2.5 kg", dimensions: "15 cm diameter × 10 cm height",
    origin: "Rajasthan, India", care: "Rinse with water, no soap. Season before first use.",
    desc: "Perfect for grinding spices, herbs and pastes. The rough granite surface ensures fine grinding with minimal effort."
  },
  {
    id: 2, name: "Wooden Ladle Set (in Ceramic Holder)", emoji: "🥄", price: 449, img: "/images/img2.png", category: "wood",
    material: "Sheesham Wood + Ceramic Holder", weight: "400 g", dimensions: "30–35 cm length",
    origin: "Saharanpur, Uttar Pradesh", care: "Hand wash only. Dry immediately. Oil monthly.",
    desc: "Set of 5 handcrafted ladles in assorted sizes, presented in a hand-painted ceramic holder."
  },
  {
    id: 3, name: "Traditional Grinding Stone", emoji: "🪨", price: 1299, img: "/images/img3.png", category: "stone",
    material: "Black Basalt Stone", weight: "8 kg", dimensions: "45 cm × 30 cm × 12 cm",
    origin: "Tamil Nadu, India", care: "Wash with water only. Dry in sun after use.",
    desc: "The classic ammikallu used for grinding idli/dosa batter, chutneys, and masalas. Gives authentic flavour unmatched by mixers."
  },
  {
    id: 4, name: "Clay Cooking Pot with Lid", emoji: "🏺", price: 649, img: "/images/img4.png", category: "clay",
    material: "Natural Unglazed Red Clay", weight: "1.2 kg", dimensions: "20 cm diameter × 18 cm height",
    origin: "Khurja, Uttar Pradesh", care: "Soak in water 30 min before first use. Low to medium heat only.",
    desc: "Slow-cooks dal, biryanis, and curries with earthy flavour. The porous clay naturally regulates moisture and heat."
  },
  {
    id: 5, name: "Cast Iron Tawa (Large Flat Griddle)", emoji: "🍳", price: 999, img: "/images/img5.png", category: "cast-iron",
    material: "Pre-Seasoned Cast Iron", weight: "3.8 kg", dimensions: "30 cm diameter",
    origin: "Coimbatore, Tamil Nadu", care: "Wipe dry after use. Re-season with oil. Never soak in water.",
    desc: "Ideal for making dosas, rotis, parathas, and uttapam. Distributes heat evenly for perfect cooking every time."
  },
  {
    id: 6, name: "Brass Bowl Set with Spoons & Tray", emoji: "⚱️", price: 1499, img: "/images/img6.png", category: "brass",
    material: "Pure Brass (85% Copper, 15% Zinc)", weight: "1.8 kg", dimensions: "Bowls: 12 cm / Tray: 35 cm",
    origin: "Moradabad, Uttar Pradesh", care: "Polish with tamarind paste. Avoid dishwasher.",
    desc: "Traditional puja and dining set with 4 bowls, 4 spoons and 1 serving tray. Antimicrobial and food-safe."
  },
  {
    id: 7, name: "Teak Wood Ladle Set (7-piece)", emoji: "🥄", price: 749, img: "/images/img7.png", badge: "Best Seller", category: "wood",
    material: "Aged Teak Wood", weight: "600 g", dimensions: "25–40 cm length",
    origin: "Kerala, India", care: "Hand wash only. Rub with coconut oil monthly to prevent cracking.",
    desc: "7-piece set including spatulas, ladles, and a stirrer. Naturally anti-bacterial, heat-resistant, and chemical-free."
  },
  {
    id: 8, name: "Granite Cookware Set", emoji: "🪨", price: 1399, img: "/images/img8.png", badge: "Best Seller", category: "stone",
    material: "Natural Kalchatti Granite", weight: "4.5 kg (set)", dimensions: "20 cm + 24 cm pots",
    origin: "Salem, Tamil Nadu", care: "Season with gingelly oil before first use. Medium heat only.",
    desc: "Two-piece granite pot set (kalchatti) perfect for simmering rasam, sambar, and milk. Naturally non-stick surface."
  },
  {
    id: 9, name: "Copper Pan Set", emoji: "🥘", price: 1299, img: "/images/img9.png", category: "brass",
    material: "99% Pure Copper", weight: "2.2 kg", dimensions: "22 cm + 26 cm diameter",
    origin: "Jagadhri, Haryana", care: "Polish with lemon + salt. Hand wash only. Avoid acidic foods.",
    desc: "Two copper pans with tin-lined interior. Excellent heat conductor — cooks 3× faster than steel. Enhances food quality."
  },
  {
    id: 10, name: "Banana Leaf Plates", emoji: "🌿", price: 299, img: "/images/img10.png", category: "natural",
    material: "Dried Banana Leaf (Natural)", weight: "300 g", dimensions: "Pack of 20 plates, 35 cm × 25 cm each",
    origin: "Ernakulam, Kerala", care: "Single-use, 100% biodegradable. No washing needed.",
    desc: "Authentic banana leaf plates for traditional South Indian feasts. Food tastes better on banana leaf — a proven fact!"
  },
  {
    id: 11, name: "Ceramic Spice Jar Set (3-piece Floral)", emoji: "🫙", price: 849, img: "/images/img11.png", category: "ceramic",
    material: "Hand-Painted Ceramic", weight: "800 g (set)", dimensions: "Each jar: 8 cm diameter × 12 cm height",
    origin: "Jaipur, Rajasthan", care: "Hand wash only. Dishwasher-safe lid. Airtight cork seal.",
    desc: "3 ceramic jars with hand-painted floral motifs, cork lids and wooden spoons. Perfect for storing salt, turmeric, and chilli."
  },
  {
    id: 12, name: "Brass Uruli + Ladle Set", emoji: "⚱️", price: 1199, img: "/images/img12.png", category: "brass",
    material: "Pure Brass", weight: "2.4 kg", dimensions: "Uruli: 28 cm diameter × 10 cm depth",
    origin: "Thrissur, Kerala", care: "Clean with tamarind and salt paste. Dry thoroughly.",
    desc: "Traditional Kerala uruli for preparing payasam, halwa and temple offerings. Comes with a long brass ladle."
  },
  {
    id: 13, name: "Brass Water Jug & Tumbler Set", emoji: "🥛", price: 1099, img: "/images/img13.png", category: "brass",
    material: "Pure Brass", weight: "1.5 kg", dimensions: "Jug: 1.5 L / Tumblers: 250 ml each",
    origin: "Moradabad, Uttar Pradesh", care: "Wash with tamarind water weekly. Avoid dish soap.",
    desc: "Store water in brass overnight and drink in the morning — Ayurveda recommends it for gut health and immunity."
  },
  {
    id: 14, name: "Clay Water Jug (with Lid & Handle)", emoji: "🏺", price: 399, img: "/images/img14.png", category: "clay",
    material: "Natural Terracotta Clay", weight: "900 g", dimensions: "Height: 28 cm / Capacity: 2 litres",
    origin: "Kutch, Gujarat", care: "Soak in water overnight before first use. Rinse daily.",
    desc: "Keeps water naturally cool without electricity. The clay minerals subtly enrich the water's taste and alkalinity."
  },
  {
    id: 15, name: "Terracotta Water Bottles (Painted)", emoji: "🍶", price: 549, img: "/images/img15.png", badge: "Best Seller", category: "clay",
    material: "Hand-Painted Terracotta", weight: "500 g each", dimensions: "Height: 22 cm / Capacity: 700 ml each",
    origin: "Bikaner, Rajasthan", care: "Do not refrigerate. Rinse with plain water daily. No soap inside.",
    desc: "Pair of hand-painted terracotta bottles with cork stoppers. Keeps water cool for 4–6 hours naturally."
  }
];

export async function fetchProducts() {
  try {
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (error || !Array.isArray(data) || data.length === 0) return PRODUCTS;

    return data.map(p => {
      const staticMatch = PRODUCTS.find(sp => sp.id === p.id) || {};
      let imgPath = p.image || p.image_url || p.img || staticMatch.img || `/images/img${p.id || 1}.png`;
      if (!imgPath.startsWith('/') && !imgPath.startsWith('http')) {
        imgPath = '/' + imgPath;
      }
      return {
        id: p.id || staticMatch.id || Math.random(),
        name: p.product_name || p.name || p.title || staticMatch.name || 'Traditional Kitchenware Item',
        emoji: p.emoji || staticMatch.emoji || '🏺',
        price: Number(p.price !== undefined && p.price !== null ? p.price : (staticMatch.price || 0)),
        img: imgPath,
        badge: p.badge || (p.featured || p.is_bestseller ? 'Best Seller' : staticMatch.badge || null),
        category: p.category || staticMatch.category || 'all',
        material: p.material || staticMatch.material || 'Traditional Material',
        weight: p.weight || staticMatch.weight || 'Standard Weight',
        dimensions: p.dimensions || staticMatch.dimensions || 'Standard Dimensions',
        origin: p.origin || staticMatch.origin || 'India',
        care: p.care_instructions || p.care || staticMatch.care || 'Hand wash carefully',
        desc: p.description || p.desc || staticMatch.desc || ''
      };
    });
  } catch (err) {
    console.warn('Error fetching products from Supabase, using local products array:', err);
    return PRODUCTS;
  }
}
