require('dotenv').config();
const nodemailer = require('nodemailer');

const t = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
});

const order = {
    id: 'ORD-434167',
    date: '2026-03-01T05:50:38.317Z',
    total: 400,
    paymentMethod: 'cod',
    transactionId: 'COD',
    items: [{ name: 'Bhaderwahi Rajma Premium - 1kg', price: 400, quantity: 1 }],
    customer: {
        name: 'Mishra',
        phone: '09958776101',
        address: 'Tezu, Lohit District',
        city: 'Tezu',
        pincode: '792001',
        email: 'dantil0902@gmail.com'
    }
};

const itemsHtml = order.items.map(i => `
    <tr>
        <td style="padding:10px;border-bottom:1px solid #eee;">${i.name} × ${i.quantity}</td>
        <td style="padding:10px;border-bottom:1px solid #eee;text-align:right;">₹${i.price * i.quantity}</td>
    </tr>
`).join('');

// ====== ADMIN EMAIL ======
const adminMail = {
    from: `"Nature's Pledge" <${process.env.EMAIL_USER}>`,
    to: 'tilakmishra.76@gmail.com',
    subject: `🛒 NEW ORDER! #${order.id} — ₹${order.total} (COD) — Mishra, Tezu`,
    html: `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:12px;overflow:hidden;color:#333;">
      <div style="background:#5D4037;color:white;padding:22px 25px;text-align:center;">
        <h2 style="margin:0;">🛒 New Order Received!</h2>
        <p style="margin:6px 0 0;opacity:.85;">Order ID: <strong>#${order.id}</strong></p>
        <p style="margin:2px 0 0;opacity:.65;font-size:.8rem;">${new Date(order.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</p>
      </div>

      <!-- CUSTOMER -->
      <div style="padding:20px 25px;background:#fff;">
        <h3 style="color:#5D4037;border-bottom:2px solid #e8d5cc;padding-bottom:8px;margin-top:0;">👤 Customer Info</h3>
        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;">
          <tr><td style="padding:6px 0;color:#888;width:110px;">Name</td><td style="padding:6px 0;font-weight:600;">${order.customer.name}</td></tr>
          <tr><td style="padding:6px 0;color:#888;">📞 Phone</td><td style="padding:6px 0;font-weight:600;"><a href="tel:${order.customer.phone}" style="color:#5D4037;text-decoration:none;">${order.customer.phone}</a></td></tr>
          <tr><td style="padding:6px 0;color:#888;">📧 Email</td><td style="padding:6px 0;">${order.customer.email}</td></tr>
        </table>

        <h3 style="color:#5D4037;border-bottom:2px solid #e8d5cc;padding-bottom:8px;">📍 Delivery Address</h3>
        <div style="background:#fdfaf7;border:1px solid #e8d5cc;border-radius:8px;padding:14px 18px;margin-bottom:20px;line-height:1.9;font-size:.95rem;">
          ${order.customer.address}<br>
          <strong>${order.customer.city}</strong> — PIN: <strong>${order.customer.pincode}</strong><br>
          📞 <a href="tel:${order.customer.phone}" style="color:#5D4037;font-weight:600;text-decoration:none;">${order.customer.phone}</a>
        </div>

        <h3 style="color:#5D4037;border-bottom:2px solid #e8d5cc;padding-bottom:8px;">📦 Items to Dispatch</h3>
        <table style="width:100%;border-collapse:collapse;font-size:.94rem;">
          <thead><tr style="background:#f5ede8;"><th style="padding:10px 12px;text-align:left;color:#5D4037;">Product</th><th style="padding:10px 12px;text-align:right;color:#5D4037;">Amount</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot>
            <tr style="background:#fff8f5;">
              <td style="padding:13px 12px;font-weight:bold;border-top:2px solid #e8d5cc;">Total</td>
              <td style="padding:13px 12px;font-weight:bold;text-align:right;color:#B12704;font-size:1.1rem;border-top:2px solid #e8d5cc;">₹${order.total}</td>
            </tr>
          </tfoot>
        </table>

        <div style="background:#fdfaf7;padding:12px 16px;border-radius:8px;margin-top:14px;border:1px solid #f0e6e0;font-size:.9rem;">
          <strong>💳 Payment:</strong> 🚚 Cash on Delivery (COD) — <span style="color:#e65100;font-weight:600;">Collect ₹${order.total} at delivery</span>
        </div>

        <div style="text-align:center;margin-top:28px;">
          <a href="http://10.240.184.95:5173/admin" style="background:#5D4037;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:1rem;display:inline-block;">🖥️ Open Admin Dashboard →</a>
          <p style="margin:8px 0 0;font-size:.78rem;color:#bbb;">Update status after dispatch</p>
        </div>
      </div>
      <div style="background:#f5f5f5;color:#999;padding:13px;text-align:center;font-size:11px;">© 2026 Nature's Pledge — Admin Alert</div>
    </div>`
};

// ====== CUSTOMER EMAIL ======
const orderDate = new Date(order.date);
const d1 = new Date(orderDate); d1.setDate(d1.getDate() + 5);
const d2 = new Date(orderDate); d2.setDate(d2.getDate() + 7);
const deliveryStr = `${d1.toLocaleDateString('en-IN', { day: 'numeric', month: 'long' })} – ${d2.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}`;

const customerMail = {
    from: `"Nature's Pledge" <${process.env.EMAIL_USER}>`,
    to: order.customer.email,
    subject: `✅ Order Confirmed! #${order.id} — Nature's Pledge`,
    html: `
    <div style="font-family:'Segoe UI',sans-serif;max-width:600px;margin:auto;border:1px solid #ddd;border-radius:12px;overflow:hidden;color:#333;">
      <div style="background:#5D4037;color:white;padding:28px 25px;text-align:center;">
        <div style="font-size:2.5rem;margin-bottom:8px;">🌿</div>
        <h2 style="margin:0;">Thank you for your order!</h2>
        <p style="margin:6px 0 0;opacity:.85;">Order ID: <strong>#${order.id}</strong></p>
        <p style="margin:3px 0 0;opacity:.65;font-size:.8rem;">${new Date(order.date).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
      </div>

      <div style="background:#e8f5e9;padding:13px 25px;text-align:center;border-bottom:1px solid #c8e6c9;">
        <p style="margin:0;font-size:.95rem;color:#2e7d32;">🚚 <strong>Estimated Delivery:</strong> ${deliveryStr}</p>
      </div>

      <div style="padding:25px;background:#fff;">
        <p style="margin:0 0 6px;">Hi <strong>${order.customer.name}</strong>,</p>
        <p style="color:#555;line-height:1.6;margin:0 0 22px;">We've received your order and are preparing it carefully for dispatch. You will receive another update once it's shipped. 🙏</p>

        <h3 style="color:#5D4037;border-bottom:2px solid #e8d5cc;padding-bottom:8px;margin-top:0;">📍 Delivery Address</h3>
        <div style="background:#fdfaf7;border:1px solid #e8d5cc;border-radius:8px;padding:14px 18px;margin-bottom:22px;line-height:1.9;font-size:.94rem;">
          ${order.customer.address}<br>
          ${order.customer.city} — <strong>${order.customer.pincode}</strong><br>
          📞 ${order.customer.phone}
        </div>

        <h3 style="color:#5D4037;border-bottom:2px solid #e8d5cc;padding-bottom:8px;">📦 Your Items</h3>
        <table style="width:100%;border-collapse:collapse;font-size:.93rem;">
          <thead><tr style="background:#f5ede8;"><th style="padding:10px 12px;text-align:left;color:#5D4037;">Product</th><th style="padding:10px 12px;text-align:right;color:#5D4037;">Amount</th></tr></thead>
          <tbody>${itemsHtml}</tbody>
          <tfoot><tr style="background:#fff8f5;"><td style="padding:13px 12px;font-weight:bold;border-top:2px solid #e8d5cc;">Order Total</td><td style="padding:13px 12px;font-weight:bold;text-align:right;color:#B12704;font-size:1.1rem;border-top:2px solid #e8d5cc;">₹${order.total}</td></tr></tfoot>
        </table>

        <div style="background:#fdfaf7;padding:11px 16px;border-radius:8px;margin-top:14px;border:1px solid #f0e6e0;font-size:.88rem;">
          <strong>💳 Payment:</strong> 🚚 Cash on Delivery — Please keep <strong>₹${order.total}</strong> ready at delivery
        </div>

        <div style="text-align:center;margin-top:28px;">
          <a href="http://10.240.184.95:5173/track-order?id=${order.id}" style="background:#5D4037;color:white;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:1rem;display:inline-block;">📦 Track Your Order →</a>
          <p style="margin:8px 0 0;font-size:.78rem;color:#bbb;">Live order status</p>
        </div>

        <div style="margin-top:28px;background:#f9f9f9;border:1px solid #eee;border-radius:8px;padding:16px 18px;">
          <p style="margin:0 0 6px;font-weight:600;color:#5D4037;font-size:.95rem;">🎧 Need Help?</p>
          <p style="margin:0;font-size:.88rem;color:#555;line-height:1.9;">
            📞 Call/WhatsApp: <a href="tel:+919958776101" style="color:#5D4037;font-weight:600;text-decoration:none;">+91 99587 76101</a><br>
            📧 Email: <a href="mailto:tilakmishra.76@gmail.com" style="color:#5D4037;text-decoration:none;">tilakmishra.76@gmail.com</a><br>
            <span style="color:#aaa;font-size:.82rem;">We respond within a few hours.</span>
          </p>
        </div>
      </div>
      <div style="background:#fdfaf7;color:#aaa;padding:14px;text-align:center;font-size:11px;border-top:1px solid #eee;">
        © 2026 Nature's Pledge — Pure Kashmiri Organics<br>
        Jagdamby Gen. Store, Tehsil Panchari, District Udhampur, Jammu & Kashmir — 182125
      </div>
    </div>`
};

Promise.all([
    t.sendMail(adminMail),
    t.sendMail(customerMail)
]).then(([a, b]) => {
    console.log('✅ Admin email sent:', a.response.split(' ').slice(0, 4).join(' '));
    console.log('✅ Customer email sent:', b.response.split(' ').slice(0, 4).join(' '));
}).catch(e => console.error('❌ FAILED:', e.message));
