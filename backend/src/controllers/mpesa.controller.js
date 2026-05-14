const { PrismaClient } = require('@prisma/client');
const { queryTransaction } = require('../services/mpesa.service');
const { generateQRCodeBase64 } = require('../services/qr.service');
const { sendBookingConfirmationEmail } = require('../services/email.service');
const { AppError } = require('../middleware/errorHandler');
const { nanoid } = require('nanoid');

const prisma = new PrismaClient();

exports.callback = async (req, res, next) => {
  try {
    const { Body } = req.body;
    if (!Body || !Body.stkCallback) {
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = Body.stkCallback;

    const booking = await prisma.booking.findFirst({
      where: { mpesaCheckoutRequestId: CheckoutRequestID },
      include: {
        event: true,
        bookingItems: { include: { ticketTier: true } },
      },
    });

    if (!booking) return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });

    if (ResultCode !== 0) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: 'FAILED' },
      });
      return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // Extract M-Pesa receipt
    let mpesaReceiptNumber = null;
    if (CallbackMetadata?.Item) {
      const receipt = CallbackMetadata.Item.find(i => i.Name === 'MpesaReceiptNumber');
      if (receipt) mpesaReceiptNumber = receipt.Value;
    }

    const qrCode = nanoid(20);

    // Update booking status and sold quantities
    await prisma.$transaction(async (tx) => {
      await tx.booking.update({
        where: { id: booking.id },
        data: { status: 'CONFIRMED', mpesaReceiptNumber, qrCode },
      });

      for (const item of booking.bookingItems) {
        await tx.ticketTier.update({
          where: { id: item.ticketTierId },
          data: { soldQuantity: { increment: item.quantity } },
        });
      }
    });

    // Send confirmation email
    try {
      const qrBase64 = await generateQRCodeBase64(booking.bookingRef);
      const items = booking.bookingItems.map(i => ({
        tierName: i.ticketTier.name,
        quantity: i.quantity,
        unitPrice: i.unitPrice,
      }));
      await sendBookingConfirmationEmail({ booking: { ...booking, qrCode }, event: booking.event, items, qrCodeBase64: qrBase64 });
    } catch (emailErr) {
      console.error('Failed to send confirmation email:', emailErr.message);
    }

    return res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    res.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
};

exports.pollStatus = async (req, res, next) => {
  try {
    const { checkoutRequestId } = req.params;

    // First check our DB
    const booking = await prisma.booking.findFirst({
      where: { mpesaCheckoutRequestId: checkoutRequestId },
    });

    if (!booking) return next(new AppError('Booking not found.', 404));

    if (booking.status === 'CONFIRMED') {
      return res.json({ success: true, data: { status: 'CONFIRMED', bookingRef: booking.bookingRef } });
    }

    if (booking.status === 'FAILED') {
      return res.json({ success: true, data: { status: 'FAILED' } });
    }

    // Query Daraja
    try {
      const result = await queryTransaction(checkoutRequestId);
      if (result.ResultCode === '0' || result.ResultCode === 0) {
        return res.json({ success: true, data: { status: 'PENDING', mpesaStatus: result } });
      } else {
        await prisma.booking.update({ where: { id: booking.id }, data: { status: 'FAILED' } });
        return res.json({ success: true, data: { status: 'FAILED', message: result.ResultDesc } });
      }
    } catch {
      return res.json({ success: true, data: { status: 'PENDING' } });
    }
  } catch (err) { next(err); }
};
