import { supabase } from '../lib/supabase';
import { PRODUCTS } from './products';

export async function validateCoupon(code, subtotal = 0) {
  if (!code || !code.trim()) {
    throw new Error('Please enter a coupon code.');
  }
  const cleanCode = code.trim().toUpperCase();

  const { data, error } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', cleanCode)
    .eq('active', true)
    .maybeSingle();

  if (error || !data) {
    throw new Error('Invalid or expired coupon code.');
  }

  if (data.expiry_date && new Date(data.expiry_date) < new Date()) {
    throw new Error('This coupon code has expired.');
  }

  if (data.minimum_order && subtotal < Number(data.minimum_order)) {
    throw new Error(`Minimum order of ₹${data.minimum_order} required for this coupon.`);
  }

  let discount = 0;
  if (data.discount_type === 'percentage') {
    discount = Math.round((subtotal * Number(data.discount_value)) / 100);
    if (data.maximum_discount && discount > Number(data.maximum_discount)) {
      discount = Number(data.maximum_discount);
    }
  } else {
    discount = Number(data.discount_value);
  }

  return {
    coupon: data,
    discountAmount: Math.min(discount, subtotal),
    message: `Coupon ${cleanCode} applied successfully!`,
  };
}

export async function processOrderPayment({ cartItems, customer, paymentMethod, totals, appliedCoupon }) {
  const orderData = { items: cartItems };

  if (paymentMethod === 'cod') {
    const newOrder = await processCODPayment({ orderData, customer, totals, appliedCoupon });
    return {
      orderId: newOrder.order_number || newOrder.id,
      customer,
      grandTotal: totals.grandTotal,
    };
  } else {
    // Online Razorpay
    return new Promise((resolve, reject) => {
      processRazorpayPayment({
        orderData,
        customer,
        totals,
        appliedCoupon,
        onSuccess: (newOrder) => {
          resolve({
            orderId: newOrder.order_number || newOrder.id,
            customer,
            grandTotal: totals.grandTotal,
          });
        },
        onError: (err) => {
          reject(new Error(err));
        },
      });
    });
  }
}

export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && window.Razorpay) {
      resolve(true);
      return;
    }
    if (typeof document !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    } else {
      resolve(false);
    }
  });
}

export async function processRazorpayPayment({
  orderData,
  customer,
  totals,
  appliedCoupon,
  onSuccess,
  onError,
}) {
  try {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded || !window.Razorpay) {
      throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
    }

    const response = await fetch('/api/create-razorpay-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: totals.grandTotal,
        currency: 'INR',
        receipt: 'rcpt_' + Date.now(),
      }),
    });

    if (!response.ok) {
      const errRes = await response.json().catch(() => ({}));
      throw new Error(errRes.error || 'Failed to create Razorpay payment order on server.');
    }

    const rzpOrder = await response.json();

    const options = {
      key: rzpOrder.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_live_TQJzZBn7rHectv',
      amount: rzpOrder.amount,
      currency: rzpOrder.currency || 'INR',
      name: 'Rustic Heritage Kitchenware',
      description: 'Handcrafted Kitchenware Purchase',
      image: '/images/img1.png',
      order_id: rzpOrder.id,
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone,
      },
      theme: {
        color: '#3B2A1A',
      },
      handler: async function (response) {
        try {
          const verifyRes = await fetch('/api/verify-razorpay-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyRes.json();
          if (!verifyRes.ok || !verifyData.success) {
            throw new Error(verifyData.error || 'Razorpay payment signature verification failed.');
          }

          const newOrder = await saveOrderToDatabase({
            customer,
            itemsList: orderData.items,
            totals,
            paymentMethod: 'online',
            paymentId: response.razorpay_payment_id,
            paymentStatus: 'paid',
            appliedCoupon,
          });

          onSuccess(newOrder);
        } catch (err) {
          onError(err.message || 'Payment verification failed.');
        }
      },
      modal: {
        ondismiss: () => {
          onError('Payment window closed by user.');
        },
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  } catch (err) {
    onError(err.message || 'Could not initiate online payment.');
  }
}

export async function processCODPayment({ orderData, customer, totals, appliedCoupon }) {
  const newOrder = await saveOrderToDatabase({
    customer,
    itemsList: orderData.items,
    totals,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
    appliedCoupon,
  });

  return newOrder;
}

export async function saveOrderToDatabase({
  customer,
  itemsList,
  totals,
  paymentMethod,
  paymentId = null,
  paymentStatus = 'pending',
  appliedCoupon = null,
}) {
  const { subtotal, deliveryFee, discountAmount, grandTotal, tax } = totals;
  const orderNum = 'RH-' + Math.floor(100000 + Math.random() * 900000);

  // Retrieve user session dynamically to associate user_id
  let profileId = null;
  try {
    const { data: sessionRes } = await supabase.auth.getSession();
    const authUserId = sessionRes?.session?.user?.id;
    if (authUserId) {
      const { data: prof } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      if (prof) {
        profileId = prof.id;
      }
    }
  } catch (authErr) {
    console.warn('Session resolve notice:', authErr);
  }

  // Also store/update customer delivery address in addresses table if user profile exists
  if (profileId && customer.address?.trim()) {
    try {
      const { data: existingAddr } = await supabase
        .from('addresses')
        .select('id')
        .eq('user_id', profileId)
        .maybeSingle();

      const addrRecord = {
        user_id: profileId,
        receiver_name: customer.name.trim(),
        phone: customer.phone?.trim() || null,
        address_line1: customer.address.trim(),
        city: customer.city?.trim() || 'Coimbatore',
        state: customer.state || 'Tamil Nadu',
        pincode: customer.pin?.trim() || '641001',
        country: 'India',
        is_default: true,
        updated_at: new Date().toISOString(),
      };

      if (existingAddr?.id) {
        await supabase.from('addresses').update(addrRecord).eq('id', existingAddr.id);
      } else {
        await supabase.from('addresses').insert(addrRecord);
      }
    } catch (addrSaveErr) {
      console.warn('Address table save error during checkout:', addrSaveErr);
    }
  }

  const taxVal = tax !== undefined ? tax : Math.round(Number(subtotal || 0) * 0.05);
  const couponIdVal = appliedCoupon?.coupon?.id || appliedCoupon?.id || null;
  const couponCodeVal = appliedCoupon?.coupon?.code || appliedCoupon?.code || appliedCoupon?.coupon_code || null;

  // Clean schema-compliant payload matching PostgreSQL orders table
  let payload = {
    order_number: orderNum,
    user_id: profileId,
    customer_name: customer.name.trim(),
    customer_email: customer.email.trim().toLowerCase(),
    customer_phone: customer.phone.trim(),
    delivery_address: customer.address.trim(),
    city: customer.city.trim(),
    pincode: customer.pin.trim(),
    state: customer.state || 'Tamil Nadu',
    subtotal: Number(subtotal || 0),
    discount_amount: Number(discountAmount || 0),
    shipping_fee: Number(deliveryFee || 0),
    delivery_fee: Number(deliveryFee || 0),
    total_amount: Number(grandTotal || 0),
    payment_method: (paymentMethod || 'cod').toLowerCase(),
    payment_status: paymentStatus || 'pending',
    order_status: 'pending',
    created_at: new Date().toISOString(),
  };

  if (couponIdVal) {
    payload.coupon_id = couponIdVal;
  }
  if (couponCodeVal) {
    payload.coupon_code = couponCodeVal;
  }

  let newOrder = null;
  let orderErr = null;
  let attempts = 0;

  // Self-healing retry loop: strips any property Supabase reports missing in its schema cache!
  while (attempts < 15) {
    attempts++;
    const res = await supabase.from('orders').insert(payload).select().single();
    if (!res.error) {
      newOrder = res.data;
      orderErr = null;
      break;
    }

    orderErr = res.error;
    const msg = orderErr.message || '';

    // Match error format: "Could not find the 'column_name' column of 'orders' in the schema cache"
    const match = msg.match(/Could not find the '([^']+)' column/i);
    if (match && match[1]) {
      const missingCol = match[1];
      console.warn(`Supabase schema cache missing column '${missingCol}', stripping property and retrying...`);
      delete payload[missingCol];
    } else {
      break;
    }
  }

  // Fallback if database insertion fails completely
  if (!newOrder) {
    if (orderErr) console.error('Supabase order insertion error after retries:', orderErr);
    newOrder = {
      id: 'rh_ord_' + Date.now(),
      order_number: orderNum,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      delivery_address: customer.address,
      city: customer.city,
      pincode: customer.pin,
      state: customer.state || 'Tamil Nadu',
      total_amount: grandTotal,
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      order_status: 'pending',
      created_at: new Date().toISOString(),
    };
  }

  // Insert items into order_items table
  if (newOrder.id && itemsList) {
    try {
      let formattedItems = [];
      if (Array.isArray(itemsList)) {
        formattedItems = itemsList;
      } else if (typeof itemsList === 'object') {
        // Map dictionary format { productId: qty } to item objects using PRODUCTS catalog
        formattedItems = Object.keys(itemsList).map((idStr) => {
          const pId = Number(idStr);
          const prod = PRODUCTS.find((p) => p.id === pId);
          const qty = Number(itemsList[idStr] || 1);
          return {
            id: pId,
            product_id: pId,
            title: prod ? prod.product_name || prod.name : `Handcrafted Kitchenware #${pId}`,
            price: prod ? Number(prod.price || 0) : 0,
            quantity: qty,
            total_price: prod ? Number(prod.price || 0) * qty : 0,
          };
        });
      }

      if (formattedItems.length > 0) {
        const orderItemsRecords = formattedItems.map((item) => ({
          order_id: newOrder.id,
          product_id: typeof item.id === 'number' ? item.id : (typeof item.product_id === 'number' ? item.product_id : null),
          title: item.title || item.name || 'Handcrafted Kitchenware Item',
          price: Number(item.price || 0),
          quantity: Number(item.qty || item.quantity || 1),
          total_price: Number(item.total_price || (item.price || 0) * (item.qty || item.quantity || 1)),
          created_at: new Date().toISOString(),
        }));

        const { error: itemsInsErr } = await supabase.from('order_items').insert(orderItemsRecords);
        if (itemsInsErr) {
          console.warn('Supabase order_items insert error:', itemsInsErr);
        }
      }
    } catch (itemsErr) {
      console.warn('Could not insert detailed order_items:', itemsErr);
    }
  }

  // Record Coupon Usage & Deactivate Single-Use Coupon
  if (couponIdVal && newOrder.id && !newOrder.id.startsWith('rh_ord_')) {
    try {
      // 1. Insert into coupon_usage table
      await supabase.from('coupon_usage').insert({
        coupon_id: couponIdVal,
        coupon_code: couponCodeVal,
        user_id: profileId || null,
        user_name: customer.name.trim(),
        order_id: newOrder.id,
        used_at: new Date().toISOString(),
      });

      // 2. Fetch coupon record to increment used_count and deactivate if usage_limit reached
      const { data: cRecord } = await supabase
        .from('coupons')
        .select('used_count, usage_limit')
        .eq('id', couponIdVal)
        .maybeSingle();

      if (cRecord) {
        const updatedUsedCount = (cRecord.used_count || 0) + 1;
        const isLimitReached = cRecord.usage_limit && updatedUsedCount >= cRecord.usage_limit;

        await supabase
          .from('coupons')
          .update({
            used_count: updatedUsedCount,
            active: isLimitReached ? false : true,
            updated_at: new Date().toISOString(),
          })
          .eq('id', couponIdVal);
      }
    } catch (couponUsageErr) {
      console.warn('Coupon usage tracking notice:', couponUsageErr);
    }
  }

  // Send email notification via API (async non-blocking)
  try {
    const emailPayload = {
      order_id: newOrder.id,
      order_number: newOrder.order_number,
      customer_name: customer.name,
      customer_email: customer.email,
      customer_phone: customer.phone,
      delivery_address: customer.address,
      city: customer.city,
      pincode: customer.pin,
      total_amount: grandTotal,
      subtotal: subtotal,
      delivery_fee: deliveryFee,
      discount_amount: discountAmount,
      payment_method: paymentMethod,
      items: typeof formattedItems !== 'undefined' && formattedItems.length > 0 ? formattedItems : itemsList,
    };

    fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(emailPayload),
    })
      .then(async (r) => {
        const resData = await r.json().catch(() => ({}));
        console.log('Order Email Dispatch Result:', r.status, resData);
      })
      .catch((e) => console.warn('Email trigger warning:', e));
  } catch (emailErr) {
    console.warn('Email API call error:', emailErr);
  }

  return newOrder;
}
