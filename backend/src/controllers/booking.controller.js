const { PrismaClient } = require('@prisma/client');
const { nanoid } = require('nanoid');
const { initiateStkPush } = require('../services/mpesa.service');
const { generateQRCodeBase64, generateQRCodeDataURL } = require('../services/qr.service');
const { generateTicketPDF } = require('../services/pdf.service');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

exports.initiateBooking = async (req, res, next) => {
  try {
    const { eventId, items, buyerName, buyerEmail, buyerPhone, mpesaPhone } = req.body;

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { ticketTiers: true },
    });
    if (!event || event.status !== 'PUBLISHED') return next(new AppError('Event not found.', 404));

    let totalAmount = 0;
    const validatedItems = [];
    for (const item of items) {
      const tier = event.ticketTiers.find(t => t.id === item.tierId);
      if (!tier) return next(new AppError(`Ticket tier not found: ${item.tierId}`, 400));
      const available = tier.totalQuantity - tier.soldQuantity;
      if (item.quantity > available) {
        return next(new AppError(`Not enough tickets available for "${tier.name}". Only ${available} left.`, 400));
      }
      totalAmount += tier.price * item.quantity;
      validatedItems.push({ tierId: tier.id, quantity: item.quantity, unitPrice: tier.price, tierName: tier.name });
    }

    const bookingRef = nanoid(10).toUpperCase();

    const booking = await prisma.booking.create({
      data: {
        userId: req.user?.id || null,
        eventId,
        bookingRef,
        status: 'PENDING',
        totalAmount,
        buyerName,
        buyerEmail,
        buyerPhone,
        bookingItems: {
          create: validatedItems.map(i => ({
            ticketTierId: i.tierId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
          })),
        },
      },
    });

    let mpesaData;
    try {
      mpesaData = await initiateStkPush({
        phone: mpesaPhone || buyerPhone,
        amount: totalAmount,
        accountRef: bookingRef,
        description: `Tickets - ${event.title}`,
      });

      await prisma.booking.update({
        where: { id: booking.id },
        data: { mpesaCheckoutRequestId: mpesaData.CheckoutRequestID },
      });
    } catch (mpesaErr) {
      await prisma.booking.update({ where: { id: booking.id }, data: { status: 'FAILED' } });
      return next(new AppError(`M-Pesa error: ${mpesaErr.response?.data?.errorMessage || mpesaErr.message}`, 500));
    }

    res.status(201).json({
      success: true,
      message: 'STK Push sent. Complete payment on your phone.',
      data: {
        bookingRef,
        bookingId: booking.id,
        checkoutRequestId: mpesaData.CheckoutRequestID,
        totalAmount,
      },
    });
  } catch (err) { next(err); }
};

exports.confirmBooking = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef: req.params.bookingRef },
      include: {
        event: true,
        bookingItems: { include: { ticketTier: true } },
      },
    });
    if (!booking) return next(new AppError('Booking not found.', 404));
    res.json({ success: true, data: { booking } });
  } catch (err) { next(err); }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.user.id },
      include: {
        event: { select: { title: true, eventDate: true, venue: true, coverImage: true, slug: true } },
        bookingItems: { include: { ticketTier: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { bookings } });
  } catch (err) { next(err); }
};

exports.getSingleBooking = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id },
      include: {
        event: true,
        bookingItems: { include: { ticketTier: true } },
      },
    });
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorised.', 403));
    }
    res.json({ success: true, data: { booking } });
  } catch (err) { next(err); }
};

exports.downloadTicket = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef: req.params.bookingRef },
      include: {
        event: true,
        bookingItems: { include: { ticketTier: true } },
      },
    });
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.status !== 'CONFIRMED') return next(new AppError('Ticket not available — payment not confirmed.', 400));

    const items = booking.bookingItems.map(item => ({
      tierName: item.ticketTier.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    }));

    await generateTicketPDF(res, { booking, event: booking.event, items });
  } catch (err) { next(err); }
};

exports.scanTicket = async (req, res, next) => {
  try {
    const code = req.params.qrCode;

    const booking = await prisma.booking.findFirst({
      where: {
        OR: [
          { bookingRef: code },
          { qrCode: code },
        ],
      },
      include: { event: true, bookingItems: { include: { ticketTier: true } } },
    });

    if (!booking) return next(new AppError('Invalid ticket. Please check the booking reference.', 404));

    if (booking.status === 'USED') {
      return res.status(400).json({
        success: false,
        message: 'Ticket already scanned. Entry not permitted.',
        data: { booking },
      });
    }

    if (booking.status !== 'CONFIRMED') {
      return next(new AppError('Ticket not valid. Payment may not be confirmed.', 400));
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { status: 'USED' },
    });

    res.json({ success: true, message: 'Ticket scanned successfully.', data: { booking } });
  } catch (err) { next(err); }
};

exports.getAllBookingsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { bookingRef: { contains: search, mode: 'insensitive' } },
        { buyerEmail: { contains: search, mode: 'insensitive' } },
        { buyerName: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          event: { select: { title: true } },
          bookingItems: { include: { ticketTier: { select: { name: true } } } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.booking.count({ where }),
    ]);
    res.json({ success: true, data: { bookings, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

exports.getQRCode = async (req, res, next) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef: req.params.bookingRef },
    });
    if (!booking) return next(new AppError('Booking not found.', 404));
    if (booking.status !== 'CONFIRMED') return next(new AppError('Ticket not confirmed.', 400));
    const qrDataUrl = await generateQRCodeDataURL(booking.bookingRef);
    res.json({ success: true, data: { qrCode: qrDataUrl } });
  } catch (err) { next(err); }
};