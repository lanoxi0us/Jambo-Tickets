const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

exports.getEvents = async (req, res, next) => {
  try {
    const { category, search, sort, city, page = 1, limit = 12, featured } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { status: 'PUBLISHED' };
    if (category) where.category = category;
    if (city) where.city = { contains: city, mode: 'insensitive' };
    if (featured === 'true') where.featured = true;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { venue: { contains: search, mode: 'insensitive' } },
        { city: { contains: search, mode: 'insensitive' } },
      ];
    }

    const now = new Date();
    if (sort === 'this-weekend') {
      const day = now.getDay();
      const saturday = new Date(now);
      saturday.setDate(now.getDate() + (6 - day));
      saturday.setHours(0, 0, 0, 0);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      sunday.setHours(23, 59, 59, 999);
      where.eventDate = { gte: saturday, lte: sunday };
    } else if (sort === 'this-week') {
      const end = new Date(now);
      end.setDate(now.getDate() + 7);
      where.eventDate = { gte: now, lte: end };
    } else if (sort === 'this-month') {
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      where.eventDate = { gte: now, lte: end };
    } else {
      where.eventDate = { gte: now };
    }

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organiser: { select: { fullName: true } },
          ticketTiers: { select: { price: true, soldQuantity: true, totalQuantity: true } },
        },
        orderBy: { eventDate: 'asc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        events,
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) { next(err); }
};

exports.getEventBySlug = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: req.params.slug },
      include: {
        organiser: { select: { fullName: true, email: true } },
        ticketTiers: true,
      },
    });
    if (!event || event.status !== 'PUBLISHED') return next(new AppError('Event not found.', 404));

    const related = await prisma.event.findMany({
      where: {
        status: 'PUBLISHED',
        category: event.category,
        id: { not: event.id },
        eventDate: { gte: new Date() },
      },
      include: { ticketTiers: { select: { price: true } } },
      take: 4,
      orderBy: { eventDate: 'asc' },
    });

    res.json({ success: true, data: { event, related } });
  } catch (err) { next(err); }
};

exports.createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { title, description, category, venue, city, eventDate, endDate, ticketTiers } = req.body;
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.event.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }

    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;
    const tiers = typeof ticketTiers === 'string' ? JSON.parse(ticketTiers) : ticketTiers;

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        category,
        venue,
        city: city || 'Nairobi',
        eventDate: new Date(eventDate),
        endDate: endDate ? new Date(endDate) : null,
        coverImage,
        organiserId: req.user.id,
        status: req.user.role === 'ADMIN' ? 'PUBLISHED' : 'DRAFT',
        ticketTiers: {
          create: tiers.map(t => ({
            name: t.name,
            price: parseFloat(t.price),
            totalQuantity: parseInt(t.totalQuantity),
            description: t.description || null,
          })),
        },
      },
      include: { ticketTiers: true },
    });

    res.status(201).json({ success: true, data: { event }, message: 'Event created successfully.' });
  } catch (err) { next(err); }
};

exports.updateEvent = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return next(new AppError('Event not found.', 404));
    if (event.organiserId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorised.', 403));
    }

    const { title, description, category, venue, city, eventDate, endDate, status } = req.body;
    const coverImage = req.file ? `/uploads/${req.file.filename}` : event.coverImage;

    const updated = await prisma.event.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        category,
        venue,
        city,
        eventDate: eventDate ? new Date(eventDate) : event.eventDate,
        endDate: endDate ? new Date(endDate) : event.endDate,
        coverImage,
        status: status || event.status,
      },
    });

    res.json({ success: true, data: { event: updated }, message: 'Event updated.' });
  } catch (err) { next(err); }
};

exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({ where: { id: req.params.id } });
    if (!event) return next(new AppError('Event not found.', 404));
    if (event.organiserId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorised.', 403));
    }

    // Delete in order to respect foreign key constraints:
    // BookingItems → Bookings → TicketTiers → Event
    await prisma.$transaction(async (tx) => {
      // Get all booking IDs for this event
      const bookings = await tx.booking.findMany({
        where: { eventId: req.params.id },
        select: { id: true },
      });
      const bookingIds = bookings.map(b => b.id);

      // Delete booking items first
      if (bookingIds.length > 0) {
        await tx.bookingItem.deleteMany({
          where: { bookingId: { in: bookingIds } },
        });
      }

      // Delete bookings
      await tx.booking.deleteMany({ where: { eventId: req.params.id } });

      // Delete ticket tiers
      await tx.ticketTier.deleteMany({ where: { eventId: req.params.id } });

      // Finally delete the event
      await tx.event.delete({ where: { id: req.params.id } });
    });

    res.json({ success: true, message: 'Event deleted.' });
  } catch (err) { next(err); }
};

exports.getEventAnalytics = async (req, res, next) => {
  try {
    const event = await prisma.event.findUnique({
      where: { id: req.params.id },
      include: {
        ticketTiers: true,
        bookings: {
          where: { status: 'CONFIRMED' },
          include: {
            bookingItems: { include: { ticketTier: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!event) return next(new AppError('Event not found.', 404));
    if (event.organiserId !== req.user.id && req.user.role !== 'ADMIN') {
      return next(new AppError('Not authorised.', 403));
    }

    const totalRevenue = event.bookings.reduce((sum, b) => sum + b.totalAmount, 0);
    const totalTickets = event.bookings.reduce(
      (sum, b) => sum + b.bookingItems.reduce((s, i) => s + i.quantity, 0), 0
    );

    // Group sales by date
    const salesByDate = {};
    event.bookings.forEach(b => {
      const date = b.createdAt.toISOString().split('T')[0];
      if (!salesByDate[date]) salesByDate[date] = { date, tickets: 0, revenue: 0 };
      salesByDate[date].tickets += b.bookingItems.reduce((s, i) => s + i.quantity, 0);
      salesByDate[date].revenue += b.totalAmount;
    });

    const attendees = event.bookings.map(b => ({
      name: b.buyerName,
      email: b.buyerEmail,
      phone: b.buyerPhone,
      ref: b.bookingRef,
      tickets: b.bookingItems.map(i => ({ tier: i.ticketTier.name, qty: i.quantity })),
      date: b.createdAt,
    }));

    res.json({
      success: true,
      data: {
        totalRevenue,
        totalTickets,
        totalBookings: event.bookings.length,
        salesChart: Object.values(salesByDate),
        tierBreakdown: event.ticketTiers.map(t => ({
          name: t.name,
          sold: t.soldQuantity,
          total: t.totalQuantity,
          revenue: t.soldQuantity * t.price,
        })),
        attendees,
      },
    });
  } catch (err) { next(err); }
};

exports.getAllEventsAdmin = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };

    const [events, total] = await Promise.all([
      prisma.event.findMany({
        where,
        include: {
          organiser: { select: { fullName: true, email: true } },
          ticketTiers: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.event.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        events,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (err) { next(err); }
};

exports.approveEvent = async (req, res, next) => {
  try {
    const event = await prisma.event.update({
      where: { id: req.params.id },
      data: { status: 'PUBLISHED' },
    });
    res.json({ success: true, data: { event }, message: 'Event published.' });
  } catch (err) { next(err); }
};

exports.getOrganiserEvents = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { organiserId: req.user.id },
      include: {
        ticketTiers: true,
        _count: { select: { bookings: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { events } });
  } catch (err) { next(err); }
};