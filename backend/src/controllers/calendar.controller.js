const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getCalendarEvents = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const m = parseInt(month) || new Date().getMonth() + 1;
    const y = parseInt(year) || new Date().getFullYear();

    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);

    const events = await prisma.event.findMany({
      where: { status: 'PUBLISHED', eventDate: { gte: start, lte: end } },
      select: { id: true, title: true, slug: true, eventDate: true, venue: true, coverImage: true, category: true },
      orderBy: { eventDate: 'asc' },
    });

    // Group by date string
    const grouped = {};
    events.forEach(e => {
      const dateKey = e.eventDate.toISOString().split('T')[0];
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(e);
    });

    res.json({ success: true, data: { events: grouped, month: m, year: y } });
  } catch (err) { next(err); }
};
