const { PrismaClient } = require('@prisma/client');
const { sendPayoutStatusEmail } = require('../services/email.service');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

exports.requestPayout = async (req, res, next) => {
  try {
    const { amount, bankName, accountName, accountNo } = req.body;
    if (!amount || amount <= 0) return next(new AppError('Invalid amount.', 400));

    const payout = await prisma.payoutRequest.create({
      data: { organiserId: req.user.id, amount: parseFloat(amount), bankName, accountName, accountNo },
    });
    res.status(201).json({ success: true, data: { payout }, message: 'Payout request submitted.' });
  } catch (err) { next(err); }
};

exports.getMyPayouts = async (req, res, next) => {
  try {
    const payouts = await prisma.payoutRequest.findMany({
      where: { organiserId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { payouts } });
  } catch (err) { next(err); }
};

exports.getAllPayouts = async (req, res, next) => {
  try {
    const payouts = await prisma.payoutRequest.findMany({
      include: { organiser: { select: { fullName: true, email: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { payouts } });
  } catch (err) { next(err); }
};

exports.updatePayoutStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    if (!['APPROVED', 'REJECTED'].includes(status)) return next(new AppError('Invalid status.', 400));

    const payout = await prisma.payoutRequest.update({
      where: { id: req.params.id },
      data: { status, notes },
      include: { organiser: true },
    });

    try { await sendPayoutStatusEmail(payout.organiser, payout, status); } catch {}

    res.json({ success: true, data: { payout }, message: `Payout ${status.toLowerCase()}.` });
  } catch (err) { next(err); }
};
