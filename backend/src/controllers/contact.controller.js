const { PrismaClient } = require('@prisma/client');
const { sendContactAcknowledgement } = require('../services/email.service');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return next(new AppError('All fields are required.', 400));
    }
    await prisma.contactMessage.create({ data: { name, email, subject, message } });
    try { await sendContactAcknowledgement({ name, email, subject, message }); } catch {}
    res.json({ success: true, message: 'Message received. We will get back to you shortly.' });
  } catch (err) { next(err); }
};

exports.getAllMessages = async (req, res, next) => {
  try {
    const messages = await prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: { messages } });
  } catch (err) { next(err); }
};
