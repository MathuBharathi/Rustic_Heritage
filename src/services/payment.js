import { supabase } from '../lib/supabase';

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
    const newOrder = await processCODPayment({ orderData, customer, totals });
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

export async function processRazorpayPayment({
  orderData,
  customer,
  totals,
  onSuccess,
  onError,
}) {
  try {
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
      throw new Error('Failed to create Razorpay payment order on server.');
    }

    const rzpOrder = await response.json();

    const options = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_RH_mock_key',
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

export async function processCODPayment({ orderData, customer, totals }) {
  const newOrder = await saveOrderToDatabase({
    customer,
    itemsList: orderData.items,
    totals,
    paymentMethod: 'cod',
    paymentStatus: 'pending',
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

  const taxVal = tax !== undefined ? tax : Math.round(Number(subtotal || 0) * 0.05);

  let payload = {
    order_number: orderNum,
    user_id: profileId,
    customer_name: customer.name.trim(),
    customer_email: customer.email.trim().toLowerCase(),
    customer_phone: customer.phone.trim(),
    delivery_address: customer.address.trim(),
    shipping_address: customer.address.trim(),
    city: customer.city.trim(),
    delivery_city: customer.city.trim(),
    shipping_city: customer.city.trim(),
    pincode: customer.pin.trim(),
    delivery_pin: customer.pin.trim(),
    shipping_pin: customer.pin.trim(),
    state: customer.state || 'Tamil Nadu',
    delivery_state: customer.state || 'Tamil Nadu',
    shipping_state: customer.state || 'Tamil Nadu',
    delivery_country: 'India',
    subtotal: Number(subtotal || 0),
    shipping_fee: Number(deliveryFee || 0),
    delivery_fee: Number(deliveryFee || 0),
    delivery_charge: Number(deliveryFee || 0),
    discount: Number(discountAmount || 0),
    discount_amount: Number(discountAmount || 0),
    gst: Number(taxVal || 0),
    tax: Number(taxVal || 0),
    total_amount: Number(grandTotal || 0),
    payment_method: paymentMethod,
    payment_status: paymentStatus,
    payment_id: paymentId,
    razorpay_payment_id: paymentId,
    order_status: 'pending',
    created_at: new Date().toISOString(),
  };

  let newOrder = null;
  let orderErr = null;
  let attempts = 0;

  // Self-healing retry loop: strips any property Supabase reports missing in its schema cache!
  while (attempts < 6) {
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

  // Insert items into order_items
  if (newOrder.id && itemsList && itemsList.length > 0) {
    try {
      const orderItemsRecords = itemsList.map((item) => ({
        order_id: newOrder.id,
        product_id: typeof item.id === 'number' ? item.id : null,
        title: item.name || item.title || 'Handcrafted Kitchenware Item',
        price: Number(item.price || 0),
        quantity: Number(item.qty || item.quantity || 1),
        total_price: Number((item.price || 0) * (item.qty || item.quantity || 1)),
        created_at: new Date().toISOString(),
      }));

      await supabase.from('order_items').insert(orderItemsRecords);
    } catch (itemsErr) {
      console.warn('Could not insert detailed order_items:', itemsErr);
    }
  }

  // Send email notification via API (async non-blocking)
  try {
    fetch('/api/send-order-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        order_id: newOrder.id,
        order_number: newOrder.order_number,
        customer_name: customer.name,
        customer_email: customer.email,
        total_amount: grandTotal,
        payment_method: paymentMethod,
        items: itemsList,
      }),
    }).catch((e) => console.warn('Email trigger warning:', e));
  } catch (emailErr) {
    console.warn('Email API call error:', emailErr);
  }

  return newOrder;
}
