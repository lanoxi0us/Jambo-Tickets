const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

exports.getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (role) where.role = role;
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }
    const [users, total] = await Promise.all([
      prisma.user.findMany({ where, select: { id: true, fullName: true, email: true, phone: true, role: true, isActive: true, createdAt: true }, orderBy: { createdAt: 'desc' }, skip, take: parseInt(limit) }),
      prisma.user.count({ where }),
    ]);
    res.json({ success: true, data: { users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['USER', 'ORGANISER', 'ADMIN'].includes(role)) return next(new AppError('Invalid role.', 400));
    const user = await prisma.user.update({ where: { id: req.params.id }, data: { role }, select: { id: true, fullName: true, email: true, role: true } });
    res.json({ success: true, data: { user }, message: 'Role updated.' });
  } catch (err) { next(err); }
};

exports.suspendUser = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return next(new AppError('User not found.', 404));
    const updated = await prisma.user.update({ where: { id: req.params.id }, data: { isActive: !user.isActive }, select: { id: true, isActive: true, fullName: true } });
    res.json({ success: true, data: { user: updated }, message: `User ${updated.isActive ? 'activated' : 'suspended'}.` });
  } catch (err) { next(err); }
};

exports.getAdminDashboard = async (req, res, next) => {
  try {
    const [totalEvents, totalUsers, bookingStats, recentBookings, eventsByCategory] = await Promise.all([
      prisma.event.count(),
      prisma.user.count(),
      prisma.booking.aggregate({ _sum: { totalAmount: true }, _count: true, where: { status: 'CONFIRMED' } }),
      prisma.booking.findMany({ where: { status: 'CONFIRMED' }, include: { event: { select: { title: true } } }, orderBy: { createdAt: 'desc' }, take: 5 }),
      prisma.event.groupBy({ by: ['category'], _count: true }),
    ]);

    // Revenue by month (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const revenueData = await prisma.booking.findMany({
      where: { status: 'CONFIRMED', createdAt: { gte: sixMonthsAgo } },
      select: { totalAmount: true, createdAt: true },
    });

    const revenueByMonth = {};
    revenueData.forEach(b => {
      const key = `${b.createdAt.getFullYear()}-${String(b.createdAt.getMonth() + 1).padStart(2, '0')}`;
      if (!revenueByMonth[key]) revenueByMonth[key] = 0;
      revenueByMonth[key] += b.totalAmount;
    });

    res.json({
      success: true,
      data: {
        totalEvents,
        totalUsers,
        totalRevenue: bookingStats._sum.totalAmount || 0,
        totalBookings: bookingStats._count,
        recentBookings,
        eventsByCategory,
        revenueChart: Object.entries(revenueByMonth).map(([month, revenue]) => ({ month, revenue })),
      },
    });
  } catch (err) { next(err); }
};

exports.getOrganiserDashboard = async (req, res, next) => {
  try {
    const events = await prisma.event.findMany({
      where: { organiserId: req.user.id },
      include: { bookings: { where: { status: 'CONFIRMED' } }, ticketTiers: true },
    });

    const totalEvents = events.length;
    const totalRevenue = events.reduce((sum, e) => sum + e.bookings.reduce((s, b) => s + b.totalAmount, 0), 0);
    const totalTickets = events.reduce((sum, e) => sum + e.bookings.length, 0);

    res.json({ success: true, data: { totalEvents, totalRevenue, totalTickets } });
  } catch (err) { next(err); }
};
