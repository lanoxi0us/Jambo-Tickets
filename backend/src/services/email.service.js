const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT) || 587,
  secure: parseInt(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const brandColor = '#E94560';
const navyColor = '#1A1A2E';

function emailLayout(title, content) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#F8F9FC;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F8F9FC;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">
          <tr>
            <td style="background:${navyColor};padding:28px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.5px;">Jambo Tickets</h1>
              <p style="margin:4px 0 0;color:#a0aec0;font-size:13px;">Kenya's Premier Event Ticketing Platform</p>
            </td>
          </tr>
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>
          <tr>
            <td style="background:#F8F9FC;padding:24px 40px;border-top:1px solid #E5E7EB;">
              <p style="margin:0;color:#6B7280;font-size:12px;text-align:center;">
                &copy; ${new Date().getFullYear()} Jambo Tickets. All rights reserved.<br/>
                Nairobi, Kenya | infojambotickets@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

async function sendWelcomeEmail(user) {
  const content = `
    <h2 style="color:${navyColor};margin:0 0 16px;">Welcome to Jambo Tickets, ${user.fullName}!</h2>
    <p style="color:#374151;line-height:1.6;margin:0 0 16px;">Your account has been created successfully. You can now browse and book tickets for the best events across Kenya.</p>
    <p style="color:#374151;line-height:1.6;margin:0 0 24px;">Start exploring upcoming events and secure your spot today.</p>
    <a href="${process.env.FRONTEND_URL}/events" style="display:inline-block;background:${brandColor};color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Browse Events</a>
    <p style="color:#6B7280;font-size:13px;margin:24px 0 0;">If you did not create this account, please contact us immediately at infojambotickets@gmail.com</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Welcome to Jambo Tickets',
    html: emailLayout('Welcome to Jambo Tickets', content),
  });
}

async function sendBookingConfirmationEmail({ booking, event, items, qrCodeBase64 }) {
  const itemsHtml = items.map(item => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;color:#374151;">${item.tierName}</td>
      <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;color:#374151;text-align:center;">${item.quantity}</td>
      <td style="padding:10px 0;border-bottom:1px solid #E5E7EB;color:#374151;text-align:right;">KES ${(item.unitPrice * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  const content = `
    <div style="background:#F0FDF4;border:1px solid #BBF7D0;border-radius:8px;padding:16px 20px;margin:0 0 28px;">
      <h3 style="margin:0;color:#065F46;font-size:16px;">Booking Confirmed!</h3>
      <p style="margin:6px 0 0;color:#047857;font-size:14px;">Your payment was successful. Booking reference: <strong>${booking.bookingRef}</strong></p>
    </div>
    <h2 style="color:${navyColor};margin:0 0 8px;font-size:20px;">${event.title}</h2>
    <p style="color:#6B7280;margin:0 0 24px;font-size:14px;">${new Date(event.eventDate).toLocaleDateString('en-KE', { weekday:'long', year:'numeric', month:'long', day:'numeric' })} &bull; ${event.venue}</p>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <thead>
        <tr>
          <th style="text-align:left;padding:10px 0;border-bottom:2px solid #E5E7EB;color:#374151;font-size:13px;text-transform:uppercase;">Ticket Type</th>
          <th style="text-align:center;padding:10px 0;border-bottom:2px solid #E5E7EB;color:#374151;font-size:13px;text-transform:uppercase;">Qty</th>
          <th style="text-align:right;padding:10px 0;border-bottom:2px solid #E5E7EB;color:#374151;font-size:13px;text-transform:uppercase;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr>
          <td colspan="2" style="padding:12px 0 0;font-weight:700;color:${navyColor};">Total Paid</td>
          <td style="padding:12px 0 0;font-weight:700;color:${navyColor};text-align:right;">KES ${booking.totalAmount.toLocaleString()}</td>
        </tr>
      </tfoot>
    </table>
    ${qrCodeBase64 ? `<div style="text-align:center;margin:24px 0;"><p style="color:#374151;font-weight:600;margin:0 0 12px;">Your Ticket QR Code</p><img src="data:image/png;base64,${qrCodeBase64}" alt="QR Code" width="180" height="180" style="border:4px solid #E5E7EB;border-radius:8px;"/><p style="color:#6B7280;font-size:12px;margin:12px 0 0;">Present this QR code at the gate for entry</p></div>` : ''}
    <div style="text-align:center;margin:28px 0;">
      <a href="${process.env.FRONTEND_URL}/booking-confirmation/${booking.bookingRef}" style="display:inline-block;background:${brandColor};color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">View &amp; Download Ticket</a>
    </div>
    <p style="color:#6B7280;font-size:12px;margin:0;text-align:center;">Buyer: ${booking.buyerName} &bull; Phone: ${booking.buyerPhone}</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: booking.buyerEmail,
    subject: `Booking Confirmed — ${event.title} | Ref: ${booking.bookingRef}`,
    html: emailLayout('Booking Confirmation', content),
  });
}

async function sendPasswordResetEmail(user, resetUrl) {
  const content = `
    <h2 style="color:${navyColor};margin:0 0 16px;">Password Reset Request</h2>
    <p style="color:#374151;line-height:1.6;margin:0 0 16px;">You requested a password reset for your Jambo Tickets account. Click the button below to set a new password. This link expires in 1 hour.</p>
    <div style="text-align:center;margin:28px 0;">
      <a href="${resetUrl}" style="display:inline-block;background:${brandColor};color:#ffffff;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">Reset My Password</a>
    </div>
    <p style="color:#6B7280;font-size:13px;margin:0;">If you did not request a password reset, you can safely ignore this email. Your password will not change.</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: user.email,
    subject: 'Reset Your Jambo Tickets Password',
    html: emailLayout('Password Reset', content),
  });
}

async function sendContactAcknowledgement({ name, email, subject, message }) {
  // 1. Send acknowledgement to the person who submitted the form
  const userContent = `
    <h2 style="color:${navyColor};margin:0 0 16px;">We received your message</h2>
    <p style="color:#374151;line-height:1.6;margin:0 0 16px;">Thank you for reaching out, ${name}. We have received your message regarding <strong>"${subject}"</strong> and will respond within 1–2 business days.</p>
    <p style="color:#374151;line-height:1.6;margin:0;">For urgent queries, you can call us at <strong>+254 110 999 653</strong>.</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'We received your message — Jambo Tickets',
    html: emailLayout('Message Received', userContent),
  });

  // 2. Forward the full message to the company inbox
  const companyContent = `
    <h2 style="color:${navyColor};margin:0 0 16px;">New Contact Form Submission</h2>
    <table style="width:100%;border-collapse:collapse;">
      <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;width:100px;">Name</td><td style="padding:8px 0;color:#0D0D0D;font-weight:600;">${name}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Email</td><td style="padding:8px 0;color:#0D0D0D;font-weight:600;">${email}</td></tr>
      <tr><td style="padding:8px 0;color:#6B7280;font-size:13px;">Subject</td><td style="padding:8px 0;color:#0D0D0D;font-weight:600;">${subject}</td></tr>
    </table>
    <div style="margin-top:16px;padding:16px;background:#F8F9FC;border-radius:8px;border-left:4px solid #E94560;">
      <p style="margin:0;color:#374151;line-height:1.7;white-space:pre-wrap;">${message}</p>
    </div>
    <p style="margin-top:16px;color:#6B7280;font-size:13px;">Reply directly to this email to respond to ${name}.</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: 'infojambotickets@gmail.com',
    replyTo: email,
    subject: `New Contact: ${subject} — from ${name}`,
    html: emailLayout('New Contact Form Submission', companyContent),
  });
}

async function sendPayoutStatusEmail(organiser, payoutRequest, status) {
  const isApproved = status === 'APPROVED';
  const content = `
    <h2 style="color:${navyColor};margin:0 0 16px;">Payout Request ${isApproved ? 'Approved' : 'Rejected'}</h2>
    <p style="color:#374151;line-height:1.6;margin:0 0 16px;">Your payout request of <strong>KES ${payoutRequest.amount.toLocaleString()}</strong> has been <strong>${status.toLowerCase()}</strong>.</p>
    ${isApproved ? `<p style="color:#374151;line-height:1.6;margin:0 0 16px;">Funds will be transferred to your account within 2–3 business days.</p>` : `<p style="color:#374151;line-height:1.6;margin:0 0 16px;">If you believe this is an error, please contact our support team.</p>`}
    <p style="color:#6B7280;font-size:13px;margin:0;">Reference: ${payoutRequest.id}</p>
  `;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: organiser.email,
    subject: `Payout Request ${isApproved ? 'Approved' : 'Rejected'} — Jambo Tickets`,
    html: emailLayout('Payout Update', content),
  });
}

module.exports = {
  sendWelcomeEmail,
  sendBookingConfirmationEmail,
  sendPasswordResetEmail,
  sendContactAcknowledgement,
  sendPayoutStatusEmail,
};
