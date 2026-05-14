const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.subscribe = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email is required.' });
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {},
      create: { email },
    });
    res.json({ success: true, message: 'Subscribed successfully.' });
  } catch (err) { next(err); }
};

exports.getSubscribers = async (req, res, next) => {
  try {
    const subscribers = await prisma.newsletterSubscriber.findMany({ orderBy: { subscribedAt: 'desc' } });
    res.json({ success: true, data: { subscribers, total: subscribers.length } });
  } catch (err) { next(err); }
};
