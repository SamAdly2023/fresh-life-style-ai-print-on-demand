
import nodemailer from 'nodemailer';

// Configure this with your email provider settings
// For Gmail: Use 'service': 'gmail' and App Password (not normal password)
// For others: Use host, port, secure
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use host: 'smtp.example.com', port: 587 etc.
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendEmail = async (to, subject, html) => {
  if (!process.env.EMAIL_USER) {
    console.log(`[Mock Email] To: ${to} | Subject: ${subject}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: `"Fresh Life Style" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email sending failed:', error);
  }
};

export const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #000;">Welcome to Fresh Life Style!</h1>
      <p>Hi ${user.name},</p>
      <p>We're thrilled to have you join our community of creators and style icons.</p>
      <p>Start designing your unique apparel today using our AI-powered tools.</p>
      <a href="https://fresh-life-style.com/create" style="background-color: #000; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Start Creating</a>
    </div>
  `;
  await sendEmail(user.email, 'Welcome to Fresh Life Style!', html);
};

export const sendOrderConfirmation = async (user, orderId, amount) => {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h1>Order Confirmed!</h1>
      <p>Thanks for your order, ${user.name}.</p>
      <p>Order ID: <strong>${orderId}</strong></p>
      <p>Total: <strong>$${amount}</strong></p>
      <p>We'll notify you when it ships.</p>
    </div>
  `;
  await sendEmail(user.email, `Order Confirmation #${orderId}`, html);
};

export const sendOrderShipped = async (user, orderId, trackingNumber, trackingUrl) => {
  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h1>Your Order has Shipped!</h1>
      <p>Good news! Your order #${orderId} is on its way.</p>
      <p>Tracking Number: <strong>${trackingNumber}</strong></p>
      ${trackingUrl ? `<p><a href="${trackingUrl}">Track your package</a></p>` : ''}
    </div>
  `;
  await sendEmail(user.email, `Order Shipped #${orderId}`, html);
};
