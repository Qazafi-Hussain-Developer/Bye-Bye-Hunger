// backend/utils/emailService.js - CREATE THIS NEW FILE
import nodemailer from 'nodemailer';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send email
export const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: `"Bye-Bye-Hunger" <${process.env.EMAIL_USER}>`,
      to: options.email,
      subject: options.subject,
      html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email error:', error);
    return false;
  }
};

// Send Welcome Email
export const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FEA116;">Welcome to Bye-Bye-Hunger!</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for joining Bye-Bye-Hunger! We're excited to have you on board.</p>
      <p>You can now:</p>
      <ul>
        <li>🍔 Browse our delicious menu</li>
        <li>📦 Place orders online</li>
        <li>⭐ Earn loyalty points on every order</li>
        <li>🚚 Track your deliveries in real-time</li>
      </ul>
      <p>To get started, <a href="${process.env.FRONTEND_URL}/menu" style="background-color: #FEA116; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Browse Menu</a></p>
      <p>Happy eating!<br><strong>Bye-Bye-Hunger Team</strong></p>
    </div>
  `;
  
  return sendEmail({
    email,
    subject: 'Welcome to Bye-Bye-Hunger! 🍔',
    html
  });
};

// Send Order Confirmation Email
export const sendOrderConfirmation = async (email, name, orderNumber, items, total) => {
  const itemsHtml = items.map(item => `
    <tr>
      <td>${item.name}</td>
      <td>x${item.quantity}</td>
      <td>$${item.price}</td>
      <td>$${(item.price * item.quantity).toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FEA116;">Order Confirmed! 🎉</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your order <strong>#${orderNumber}</strong> has been placed successfully!</p>
      
      <h3>Order Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 8px; text-align: left;">Item</th>
            <th style="padding: 8px; text-align: left;">Qty</th>
            <th style="padding: 8px; text-align: left;">Price</th>
            <th style="padding: 8px; text-align: left;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
      </table>
      
      <div style="margin-top: 20px; padding-top: 10px; border-top: 1px solid #ddd;">
        <p><strong>Total Amount:</strong> $${total.toFixed(2)}</p>
        <p><strong>Payment Method:</strong> Cash on Delivery</p>
      </div>
      
      <p>You can track your order status in your dashboard.</p>
      <p><a href="${process.env.FRONTEND_URL}/my-orders" style="background-color: #FEA116; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a></p>
      <p>Thank you for choosing Bye-Bye-Hunger!</p>
    </div>
  `;
  
  return sendEmail({
    email,
    subject: `Order Confirmed #${orderNumber}`,
    html
  });
};

// Send Password Reset Email
export const sendPasswordResetEmail = async (email, name, resetToken) => {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FEA116;">Reset Your Password</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>You requested to reset your password. Click the button below to create a new password:</p>
      <p><a href="${resetUrl}" style="background-color: #FEA116; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a></p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
      <hr>
      <p style="font-size: 12px; color: #666;">Bye-Bye-Hunger - Your favorite food delivery service</p>
    </div>
  `;
  
  return sendEmail({
    email,
    subject: 'Reset Your Password - Bye-Bye-Hunger',
    html
  });
};

// Send Email Verification Email
export const sendVerificationEmail = async (email, name, verificationToken) => {
  const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FEA116;">Verify Your Email Address</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Please verify your email address to complete your registration:</p>
      <p><a href="${verifyUrl}" style="background-color: #FEA116; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a></p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `;
  
  return sendEmail({
    email,
    subject: 'Verify Your Email - Bye-Bye-Hunger',
    html
  });
};

// Send Order Status Update Email
export const sendOrderStatusUpdate = async (email, name, orderNumber, status, eta) => {
  const statusMessages = {
    confirmed: 'Your order has been confirmed and will be prepared soon.',
    preparing: 'Your order is being prepared by our chefs.',
    ready: 'Your order is ready! Waiting for driver.',
    'out-for-delivery': 'Your order is out for delivery!',
    delivered: 'Your order has been delivered. Enjoy your meal!',
    completed: 'Order completed. Thank you for ordering!'
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #FEA116;">Order Status Update</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Your order <strong>#${orderNumber}</strong> status has been updated to: <strong style="color: #FEA116; text-transform: uppercase;">${status}</strong></p>
      <p>${statusMessages[status] || 'Your order is being processed.'}</p>
      ${eta ? `<p><strong>Estimated Time:</strong> ${eta}</p>` : ''}
      <p><a href="${process.env.FRONTEND_URL}/my-orders" style="background-color: #FEA116; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Track Order</a></p>
      <p>Thank you for choosing Bye-Bye-Hunger!</p>
    </div>
  `;
  
  return sendEmail({
    email,
    subject: `Order #${orderNumber} Status: ${status.toUpperCase()}`,
    html
  });
};