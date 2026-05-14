const PDFDocument = require('pdfkit');
const { generateQRCodeBuffer } = require('./qr.service');

async function generateTicketPDF(res, { booking, event, items }) {
  const doc = new PDFDocument({ size: 'A4', margin: 50 });

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="ticket-${booking.bookingRef}.pdf"`);
  doc.pipe(res);

  // Header block
  doc
    .rect(0, 0, doc.page.width, 100)
    .fill('#1A1A2E');

  doc
    .fillColor('#FFFFFF')
    .font('Helvetica-Bold')
    .fontSize(26)
    .text('JAMBO TICKETS', 50, 30, { align: 'left' });

  doc
    .fillColor('#E94560')
    .font('Helvetica')
    .fontSize(11)
    .text("Kenya's Premier Event Ticketing Platform", 50, 62, { align: 'left' });

  doc.moveDown(2);

  // Event name
  doc
    .fillColor('#1A1A2E')
    .font('Helvetica-Bold')
    .fontSize(22)
    .text(event.title, 50, 130);

  // Divider
  doc.moveTo(50, 165).lineTo(545, 165).stroke('#E5E7EB');

  // Event details
  const details = [
    ['Date', new Date(event.eventDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
    ['Time', new Date(event.eventDate).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })],
    ['Venue', event.venue],
    ['City', event.city || 'Nairobi'],
  ];

  let y = 180;
  details.forEach(([label, value]) => {
    doc.fillColor('#6B7280').font('Helvetica').fontSize(10).text(label.toUpperCase(), 50, y);
    doc.fillColor('#0D0D0D').font('Helvetica-Bold').fontSize(12).text(value, 150, y);
    y += 22;
  });

  // Divider
  doc.moveTo(50, y + 10).lineTo(545, y + 10).stroke('#E5E7EB');
  y += 25;

  // Buyer info
  doc.fillColor('#1A1A2E').font('Helvetica-Bold').fontSize(13).text('Buyer Information', 50, y);
  y += 22;
  doc.fillColor('#6B7280').font('Helvetica').fontSize(10).text('NAME', 50, y);
  doc.fillColor('#0D0D0D').font('Helvetica-Bold').fontSize(12).text(booking.buyerName, 150, y);
  y += 22;
  doc.fillColor('#6B7280').font('Helvetica').fontSize(10).text('EMAIL', 50, y);
  doc.fillColor('#0D0D0D').font('Helvetica').fontSize(12).text(booking.buyerEmail, 150, y);
  y += 22;
  doc.fillColor('#6B7280').font('Helvetica').fontSize(10).text('PHONE', 50, y);
  doc.fillColor('#0D0D0D').font('Helvetica').fontSize(12).text(booking.buyerPhone, 150, y);
  y += 22;
  doc.fillColor('#6B7280').font('Helvetica').fontSize(10).text('BOOKING REF', 50, y);
  doc.fillColor('#E94560').font('Helvetica-Bold').fontSize(12).text(booking.bookingRef, 150, y);

  // Divider
  y += 30;
  doc.moveTo(50, y).lineTo(545, y).stroke('#E5E7EB');
  y += 15;

  // Ticket tiers table header
  doc.fillColor('#1A1A2E').font('Helvetica-Bold').fontSize(13).text('Tickets', 50, y);
  y += 22;
  doc.fillColor('#6B7280').font('Helvetica').fontSize(10)
    .text('TICKET TYPE', 50, y)
    .text('QTY', 280, y)
    .text('UNIT PRICE', 340, y)
    .text('SUBTOTAL', 450, y);
  y += 16;
  doc.moveTo(50, y).lineTo(545, y).stroke('#E5E7EB');
  y += 8;

  items.forEach(item => {
    doc.fillColor('#0D0D0D').font('Helvetica').fontSize(11)
      .text(item.tierName, 50, y)
      .text(String(item.quantity), 280, y)
      .text(`KES ${item.unitPrice.toLocaleString()}`, 340, y)
      .text(`KES ${(item.quantity * item.unitPrice).toLocaleString()}`, 450, y);
    y += 20;
  });

  doc.moveTo(50, y).lineTo(545, y).stroke('#E5E7EB');
  y += 10;
  doc.fillColor('#1A1A2E').font('Helvetica-Bold').fontSize(13)
    .text('Total Paid', 340, y)
    .text(`KES ${booking.totalAmount.toLocaleString()}`, 450, y);

  // QR Code
  y += 50;
  const qrBuffer = await generateQRCodeBuffer(booking.bookingRef);
  doc.image(qrBuffer, (doc.page.width - 160) / 2, y, { width: 160, height: 160 });
  y += 170;
  doc.fillColor('#6B7280').font('Helvetica').fontSize(10).text('Scan QR code at the gate for entry', 0, y, { align: 'center', width: doc.page.width });
  y += 14;
  doc.text(booking.bookingRef, 0, y, { align: 'center', width: doc.page.width });

  // Footer
  const footerY = doc.page.height - 80;
  doc.rect(0, footerY, doc.page.width, 80).fill('#F8F9FC');
  doc
    .fillColor('#6B7280')
    .font('Helvetica')
    .fontSize(9)
    .text('This ticket is valid for one-time entry only. Present QR code at the gate.', 50, footerY + 20, { align: 'center', width: doc.page.width - 100 });
  doc.text('Jambo Tickets | www.jambotikets.co.ke | info@jambotikets.co.ke', 50, footerY + 38, { align: 'center', width: doc.page.width - 100 });

  doc.end();
}

module.exports = { generateTicketPDF };
