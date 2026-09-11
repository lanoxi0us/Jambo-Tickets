const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');
const {
  sendOrganiserApplicationReceivedEmail,
  sendOrganiserApprovalEmail,
  sendOrganiserRejectionEmail,
} = require('../services/email.service');

const prisma = new PrismaClient();

// POST /api/organiser-applications — logged-in user submits an application
exports.submitApplication = async (req, res, next) => {
  try {
    const { businessName, description, phone } = req.body;

    if (!businessName || !description || !phone) {
      return next(new AppError('Business name, description, and phone are required.', 400));
    }

    if (req.user.role !== 'USER') {
      return next(new AppError('Only regular user accounts can apply to become an organiser.', 400));
    }

    // Prevent duplicate pending applications
    const existing = await prisma.organiserApplication.findFirst({
      where: { userId: req.user.id, status: 'PENDING' },
    });
    if (existing) {
      return next(new AppError('You already have a pending application. Please wait for a response.', 409));
    }

    const application = await prisma.organiserApplication.create({
      data: {
        userId: req.user.id,
        businessName,
        description,
        phone,
      },
    });

    try {
      await sendOrganiserApplicationReceivedEmail(req.user, application);
    } catch (e) {
      console.error('Failed to send application received email:', e.message);
    }

    res.status(201).json({
      success: true,
      data: { application },
      message: 'Application submitted. We will review it within 1-2 business days.',
    });
  } catch (err) { next(err); }
};

// GET /api/organiser-applications/my — current user's own application(s)
exports.getMyApplications = async (req, res, next) => {
  try {
    const applications = await prisma.organiserApplication.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { applications } });
  } catch (err) { next(err); }
};

// GET /api/organiser-applications — admin only, list all (optionally filter by status)
exports.getAllApplications = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};
    if (status) where.status = status;

    const applications = await prisma.organiserApplication.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, phone: true, role: true, createdAt: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: { applications } });
  } catch (err) { next(err); }
};

// PATCH /api/organiser-applications/:id/status — admin approves or rejects
exports.updateApplicationStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return next(new AppError('Status must be APPROVED or REJECTED.', 400));
    }

    const application = await prisma.organiserApplication.findUnique({
      where: { id: req.params.id },
      include: { user: true },
    });

    if (!application) return next(new AppError('Application not found.', 404));
    if (application.status !== 'PENDING') {
      return next(new AppError('This application has already been reviewed.', 400));
    }

    const updated = await prisma.organiserApplication.update({
      where: { id: req.params.id },
      data: { status, adminNotes: adminNotes || null },
      include: { user: true },
    });

    if (status === 'APPROVED') {
      // Promote the user to ORGANISER
      await prisma.user.update({
        where: { id: application.userId },
        data: { role: 'ORGANISER' },
      });

      try {
        await sendOrganiserApprovalEmail(application.user);
      } catch (e) {
        console.error('Failed to send approval email:', e.message);
      }
    } else {
      try {
        await sendOrganiserRejectionEmail(application.user, updated);
      } catch (e) {
        console.error('Failed to send rejection email:', e.message);
      }
    }

    res.json({
      success: true,
      data: { application: updated },
      message: `Application ${status.toLowerCase()}.`,
    });
  } catch (err) { next(err); }
};
