const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/blog.controller');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getBlogs);
router.get('/admin/all', protect, restrictTo('ADMIN'), ctrl.getAllBlogsAdmin);
router.get('/:slug', ctrl.getBlogBySlug);
router.post('/', protect, restrictTo('ADMIN'), upload.single('coverImage'), ctrl.createBlog);
router.put('/:id', protect, restrictTo('ADMIN'), upload.single('coverImage'), ctrl.updateBlog);
router.delete('/:id', protect, restrictTo('ADMIN'), ctrl.deleteBlog);

module.exports = router;
