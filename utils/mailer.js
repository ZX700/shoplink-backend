const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendOrderEmail = async (to, order) => {
  const itemsList = order.items
    .map((i) => `${i.name} x${i.qty} - $${i.price}`)
    .join("\n");

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: "🛍 Order Confirmation - ShopLink",
    text: `
Thank you for your order!

Order ID: ${order._id}
Status: ${order.status}
Total: $${order.total}

Items:
${itemsList}

We’ll notify you when it ships.
    `,
  });
};

module.exports = sendOrderEmail;