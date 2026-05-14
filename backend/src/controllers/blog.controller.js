const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../middleware/errorHandler');

const prisma = new PrismaClient();

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
}

exports.getBlogs = async (req, res, next) => {
  try {
    const { page = 1, limit = 9 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = { publishedAt: { not: null } };

    const [posts, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        include: { author: { select: { fullName: true } } },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.blog.count({ where }),
    ]);
    res.json({ success: true, data: { posts, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) { next(err); }
};

exports.getBlogBySlug = async (req, res, next) => {
  try {
    const post = await prisma.blog.findUnique({
      where: { slug: req.params.slug },
      include: { author: { select: { fullName: true } } },
    });
    if (!post || !post.publishedAt) return next(new AppError('Post not found.', 404));
    res.json({ success: true, data: { post } });
  } catch (err) { next(err); }
};

exports.createBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, publish } = req.body;
    const baseSlug = slugify(title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.blog.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter++}`;
    }
    const coverImage = req.file ? `/uploads/${req.file.filename}` : null;
    const post = await prisma.blog.create({
      data: {
        title, slug, content, excerpt,
        coverImage,
        authorId: req.user.id,
        publishedAt: publish === 'true' ? new Date() : null,
      },
    });
    res.status(201).json({ success: true, data: { post } });
  } catch (err) { next(err); }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const { title, content, excerpt, publish } = req.body;
    const existing = await prisma.blog.findUnique({ where: { id: req.params.id } });
    if (!existing) return next(new AppError('Post not found.', 404));
    const coverImage = req.file ? `/uploads/${req.file.filename}` : existing.coverImage;
    const post = await prisma.blog.update({
      where: { id: req.params.id },
      data: {
        title, content, excerpt, coverImage,
        publishedAt: publish === 'true' ? (existing.publishedAt || new Date()) : null,
      },
    });
    res.json({ success: true, data: { post } });
  } catch (err) { next(err); }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    await prisma.blog.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: 'Post deleted.' });
  } catch (err) { next(err); }
};

exports.getAllBlogsAdmin = async (req, res, next) => {
  try {
    const posts = await prisma.blog.findMany({
      include: { author: { select: { fullName: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: { posts } });
  } catch (err) { next(err); }
};
