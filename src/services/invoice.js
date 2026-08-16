export function downloadInvoice(orderData) {
  const orderNum = orderData.orderId || orderData.order_number || 'RH-ORDER';
  const customer = orderData.customer || {};
  const items = orderData.items || [];
  const grandTotal = orderData.grandTotal || orderData.total_amount || 0;
  const paymentMethod = orderData.paymentMethod || orderData.payment_method || 'cod';

  const invoiceHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Invoice - ${orderNum} - Rustic Heritage</title>
  <style>
    body { font-family: 'Georgia', serif; background: #FFF; color: #3B2A1A; padding: 40px; margin: 0; }
    .invoice-card { max-width: 680px; margin: 0 auto; border: 2px solid #E8D5B7; padding: 40px; border-radius: 8px; background: #FDF6EC; }
    .header { text-align: center; border-bottom: 2px solid #C49A6C; padding-bottom: 20px; margin-bottom: 24px; }
    .brand { font-size: 28px; font-weight: bold; color: #5C3D1E; margin: 0; }
    .subbrand { font-size: 11px; letter-spacing: 3px; color: #C49A6C; text-transform: uppercase; margin-top: 4px; }
    .info-grid { display: flex; justify-content: space-between; margin-bottom: 24px; font-size: 13px; line-height: 1.6; }
    .table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 13.5px; }
    .table th { background: #F5ECD7; color: #5C3D1E; padding: 10px 14px; text-align: left; border-bottom: 1px solid #E8D5B7; }
    .table td { padding: 12px 14px; border-bottom: 1px solid #E8D5B7; }
    .totals { text-align: right; font-size: 14px; margin-top: 20px; }
    .totals-grand { font-size: 18px; font-weight: bold; color: #5C3D1E; margin-top: 8px; border-top: 1px solid #C49A6C; padding-top: 8px; display: inline-block; }
    .footer { text-align: center; margin-top: 40px; font-size: 12px; color: #8B5E3C; border-top: 1px dashed #C49A6C; padding-top: 20px; }
    @media print {
      body { padding: 0; background: #fff; }
      .invoice-card { border: none; padding: 20px; background: #fff; }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <h1 class="brand">🏺 Rustic Heritage</h1>
      <div class="subbrand">Handcrafted Indian Kitchenware · Official Invoice</div>
    </div>

    <div class="info-grid">
      <div>
        <strong>Billed To:</strong><br />
        ${customer.name || 'Valued Customer'}<br />
        ${customer.address || ''}<br />
        ${customer.city || ''} ${customer.pin ? '- ' + customer.pin : ''}<br />
        Phone: ${customer.phone || 'N/A'}<br />
        Email: ${customer.email || 'N/A'}
      </div>
      <div style="text-align: right;">
        <strong>Invoice Date:</strong> ${new Date().toLocaleDateString('en-IN')}<br />
        <strong>Order Ref:</strong> #${orderNum}<br />
        <strong>Payment Method:</strong> ${paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : 'Online Payment (Razorpay)'}<br />
        <strong>Payment Status:</strong> ${paymentMethod === 'cod' ? 'Pending (COD)' : 'Paid'}
      </div>
    </div>

    <table class="table">
      <thead>
        <tr>
          <th>Item Description</th>
          <th style="text-align: center;">Qty</th>
          <th style="text-align: right;">Price</th>
          <th style="text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${items.length > 0 ? items.map(it => `
          <tr>
            <td>${it.name || it.title || 'Handcrafted Kitchenware Item'}</td>
            <td style="text-align: center;">${it.qty || it.quantity || 1}</td>
            <td style="text-align: right;">₹${(it.price || 0).toLocaleString('en-IN')}</td>
            <td style="text-align: right;">₹${((it.price || 0) * (it.qty || it.quantity || 1)).toLocaleString('en-IN')}</td>
          </tr>
        `).join('') : `
          <tr>
            <td>Handcrafted Kitchenware Purchase</td>
            <td style="text-align: center;">1</td>
            <td style="text-align: right;">₹${grandTotal.toLocaleString('en-IN')}</td>
            <td style="text-align: right;">₹${grandTotal.toLocaleString('en-IN')}</td>
          </tr>
        `}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-grand">
        Grand Total: ₹${grandTotal.toLocaleString('en-IN')}
      </div>
    </div>

    <div class="footer">
      Thank you for supporting traditional Indian artisans!<br />
      Rustic Heritage Kitchenware · Coimbatore, Tamil Nadu, India · mathubharathi15@gmail.com
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 400);
    };
  </script>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (printWindow) {
    printWindow.document.write(invoiceHtml);
    printWindow.document.close();
  }
}
