import { supabase } from '../lib/supabase';

export async function fetchUserOrders(email) {
  if (!email) return [];
  const { data: userOrders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('customer_email', email.toLowerCase())
    .order('created_at', { ascending: false });

  if (error || !userOrders) return [];

  const orderIds = userOrders.map((o) => o.id);
  let itemsMap = {};
  if (orderIds.length > 0) {
    const { data: items } = await supabase.from('order_items').select('*').in('order_id', orderIds);
    if (items) {
      items.forEach((item) => {
        if (!itemsMap[item.order_id]) itemsMap[item.order_id] = [];
        itemsMap[item.order_id].push(item);
      });
    }
  }

  return userOrders.map((o) => ({
    ...o,
    items: itemsMap[o.id] || [],
  }));
}

export async function fetchAllOrders() {
  const { data: ordersData, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (error || !ordersData) return [];

  const orderIds = ordersData.map((o) => o.id);
  let itemsMap = {};
  if (orderIds.length > 0) {
    const { data: items } = await supabase.from('order_items').select('*').in('order_id', orderIds);
    if (items) {
      items.forEach((it) => {
        if (!itemsMap[it.order_id]) itemsMap[it.order_id] = [];
        itemsMap[it.order_id].push(it);
      });
    }
  }

  return ordersData.map((o) => ({ ...o, items: itemsMap[o.id] || [] }));
}

export async function updateOrderStatus(orderId, newStatus) {
  const { data, error } = await supabase
    .from('orders')
    .update({ order_status: newStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
