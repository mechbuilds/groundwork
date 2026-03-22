const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const prisma = require('../prismaClient');

const router = express.Router();

// Multer setup for receipts
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads', req.user.id);
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|pdf/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    if (ext) return cb(null, true);
    cb(new Error('Only image or PDF files are allowed'));
  }
});

// Get all expenses
router.get('/', auth, async (req, res) => {
  try {
    const { month, year, category } = req.query;
    let where = { userId: req.user.id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.expenseDate = { gte: start, lte: end };
    }

    if (category) {
      where.category = category;
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      include: { logEntry: { select: { title: true } } }
    });

    res.json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create expense
router.post('/', auth, upload.single('receipt'), async (req, res) => {
  try {
    const { description, amount, category, expenseDate, logEntryId } = req.body;

    if (!description || !amount || !expenseDate) {
      return res.status(400).json({ message: 'Description, amount and date are required' });
    }

    const receiptUrl = req.file
      ? `/api/uploads/${req.user.id}/${req.file.filename}`
      : null;

    const expense = await prisma.expense.create({
      data: {
        userId: req.user.id,
        description,
        amount: parseFloat(amount),
        category: category || 'General',
        expenseDate: new Date(expenseDate + 'T12:00:00'),
        logEntryId: logEntryId || null,
        receiptUrl
      }
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update expense
router.put('/:id', auth, upload.single('receipt'), async (req, res) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ message: 'Expense not found' });

    const { description, amount, category, expenseDate, logEntryId } = req.body;

    const receiptUrl = req.file
      ? `/api/uploads/${req.user.id}/${req.file.filename}`
      : existing.receiptUrl;

    const expense = await prisma.expense.update({
      where: { id: req.params.id },
      data: {
        description: description || existing.description,
        amount: amount ? parseFloat(amount) : existing.amount,
        category: category || existing.category,
        expenseDate: expenseDate ? new Date(expenseDate + 'T12:00:00') : existing.expenseDate,
        logEntryId: logEntryId || existing.logEntryId,
        receiptUrl
      }
    });

    res.json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.expense.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ message: 'Expense not found' });

    await prisma.expense.delete({ where: { id: req.params.id } });

    res.json({ message: 'Expense deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;