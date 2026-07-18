// ─────────────────────────────────────────────────────────────
//  routes/adminRoutes.js
//  PURPOSE : Admin-only endpoints — manage reports and users
// ─────────────────────────────────────────────────────────────

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // adjust if auth.js exports differently
const isAdmin = require('../middleware/isAdmin');
const Report = require('../models/Report');
const User = require('../models/User');

router.use(protect, isAdmin);

// GET all reports (with optional filters)
router.get('/reports', async (req, res) => {
  const { status, severity } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (severity) filter.severity = severity;

  const reports = await Report.find(filter)
    .populate('userId', 'name email')
    .populate('verifications.userId', 'name email')
    .sort({ createdAt: -1 });

  res.json(reports);
});

// PATCH update any report field (status, severity, etc.)
router.patch('/reports/:id', async (req, res) => {
  const updates = req.body;

  if (updates.status === 'Resolved') {
    updates.resolvedBy = req.user._id;
    updates.resolvedAt = new Date();
  }

  const report = await Report.findByIdAndUpdate(req.params.id, updates, { new: true });
  if (!report) return res.status(404).json({ message: 'Report not found' });

  res.json(report);
});

// DELETE a report
router.delete('/reports/:id', async (req, res) => {
  const report = await Report.findByIdAndDelete(req.params.id);
  if (!report) return res.status(404).json({ message: 'Report not found' });
  res.json({ message: 'Report deleted' });
});

// GET all users
router.get('/users', async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

// PATCH ban/unban a user
router.patch('/users/:id/ban', async (req, res) => {
  const { isBanned } = req.body;
  const user = await User.findByIdAndUpdate(req.params.id, { isBanned }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

// PATCH warn a user
router.patch('/users/:id/warn', async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { $inc: { warnings: 1 } }, { new: true }).select('-password');
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json(user);
});

module.exports = router;