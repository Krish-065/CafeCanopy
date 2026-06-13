import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface ReceiptData {
  order: any;
  items: any[];
  payments: any[];
  settings: Record<string, string>;
}

export const sendReceiptEmail = async (to: string, receiptData: ReceiptData) => {
  const { order, items, payments, settings } = receiptData;
  const currencySymbol = settings.currency_symbol || '₹';

  const itemRows = items.map(item => `
    <tr>
      <td style="padding:6px 8px;border-bottom:1px solid #f0e8de;">${item.product_name}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0e8de;text-align:center;">${item.quantity}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0e8de;text-align:right;">${currencySymbol}${item.price.toFixed(2)}</td>
      <td style="padding:6px 8px;border-bottom:1px solid #f0e8de;text-align:right;">${currencySymbol}${item.line_total.toFixed(2)}</td>
    </tr>
  `).join('');

  const paymentRows = payments.map(p =>
    `<p style="margin:2px 0;">${p.payment_method_name}: ${currencySymbol}${p.amount.toFixed(2)}</p>`
  ).join('');

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f5efe6;font-family:'Segoe UI',Arial,sans-serif;">
  <div style="max-width:480px;margin:20px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(160,120,74,0.12);">
    <div style="background:linear-gradient(135deg,#c8a97a,#a0784a);padding:32px 24px;text-align:center;">
      <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:2px;">☕ CafeCanopy</h1>
      <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Thank you for your visit!</p>
    </div>
    <div style="padding:24px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:16px;">
        <div>
          <p style="margin:0;color:#888;font-size:12px;">ORDER NUMBER</p>
          <p style="margin:4px 0 0;font-weight:700;color:#3d2b1f;font-size:18px;">${order.order_number}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0;color:#888;font-size:12px;">DATE</p>
          <p style="margin:4px 0 0;color:#3d2b1f;font-size:14px;">${new Date(order.created_at).toLocaleString('en-IN')}</p>
        </div>
      </div>
      ${order.table_number ? `<p style="color:#888;font-size:13px;margin:0 0 16px;">Table: <strong>${order.table_number}</strong></p>` : ''}
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
        <thead>
          <tr style="background:#f5efe6;">
            <th style="padding:8px;text-align:left;color:#a0784a;font-size:12px;">ITEM</th>
            <th style="padding:8px;text-align:center;color:#a0784a;font-size:12px;">QTY</th>
            <th style="padding:8px;text-align:right;color:#a0784a;font-size:12px;">PRICE</th>
            <th style="padding:8px;text-align:right;color:#a0784a;font-size:12px;">TOTAL</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <div style="border-top:2px solid #f0e8de;padding-top:12px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#666;">Subtotal</span><span>${currencySymbol}${order.subtotal.toFixed(2)}</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#666;">Tax</span><span>${currencySymbol}${order.tax_amount.toFixed(2)}</span>
        </div>
        ${order.discount_amount > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:4px;">
          <span style="color:#e07b4a;">Discount</span><span style="color:#e07b4a;">-${currencySymbol}${order.discount_amount.toFixed(2)}</span>
        </div>` : ''}
        <div style="display:flex;justify-content:space-between;margin-top:8px;padding-top:8px;border-top:1px solid #f0e8de;">
          <span style="font-weight:700;font-size:18px;color:#3d2b1f;">TOTAL</span>
          <span style="font-weight:700;font-size:18px;color:#a0784a;">${currencySymbol}${order.total.toFixed(2)}</span>
        </div>
      </div>
      <div style="margin-top:16px;padding:12px;background:#f5efe6;border-radius:8px;">
        <p style="margin:0 0 4px;color:#888;font-size:12px;">PAYMENT</p>
        ${paymentRows}
      </div>
      <div style="margin-top:24px;text-align:center;color:#888;font-size:12px;">
        <p>${settings.receipt_footer || 'Thank you for dining with us!'}</p>
        ${settings.restaurant_address ? `<p>${settings.restaurant_address}</p>` : ''}
        ${settings.gst_number ? `<p>GST: ${settings.gst_number}</p>` : ''}
      </div>
    </div>
  </div>
</body>
</html>
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'CafeCanopy <noreply@cafecanopy.com>',
    to,
    subject: `Your Receipt from CafeCanopy - ${order.order_number}`,
    html,
  });
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || 'CafeCanopy <noreply@cafecanopy.com>',
    to,
    subject: 'Welcome to CafeCanopy! ☕',
    html: `<h2>Welcome, ${name}!</h2><p>Thank you for joining CafeCanopy. Start earning loyalty points with every order!</p>`,
  });
};
