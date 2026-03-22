const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const prisma = require('../prismaClient');

const router = express.Router();

// Multer setup
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
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error('Only image files are allowed'));
  }
});

// Get all entries
router.get('/', auth, async (req, res) => {
  try {
    const { month, year } = req.query;
    let where = { userId: req.user.id };

    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);
      where.entryDate = { gte: start, lte: end };
    }

    const entries = await prisma.logEntry.findMany({
      where,
      orderBy: { entryDate: 'desc' },
      include: { expenses: true }
    });

    res.json(entries);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single entry
router.get('/:id', auth, async (req, res) => {
  try {
    const entry = await prisma.logEntry.findFirst({
      where: { id: req.params.id, userId: req.user.id },
      include: { expenses: true }
    });

    if (!entry) return res.status(404).json({ message: 'Entry not found' });

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create entry
router.post('/', auth, upload.array('photos', 5), async (req, res) => {
  try {
    const { title, description, category, durationHours, entryDate } = req.body;

    if (!title || !entryDate) {
      return res.status(400).json({ message: 'Title and date are required' });
    }

    const photoUrls = req.files
      ? req.files.map(f => `/api/uploads/${req.user.id}/${f.filename}`)
      : [];

    const entry = await prisma.logEntry.create({
      data: {
        userId: req.user.id,
        title,
        description: description || '',
        category: category || 'General',
        durationHours: parseFloat(durationHours) || 0,
        entryDate: new Date(entryDate + 'T12:00:00'),
        photoUrls
      }
    });

    res.status(201).json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update entry
router.put('/:id', auth, upload.array('photos', 5), async (req, res) => {
  try {
    const existing = await prisma.logEntry.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ message: 'Entry not found' });

    const { title, description, category, durationHours, entryDate } = req.body;

    const newPhotoUrls = req.files
      ? req.files.map(f => `/api/uploads/${req.user.id}/${f.filename}`)
      : [];

    const photoUrls = [...(existing.photoUrls || []), ...newPhotoUrls];

    const entry = await prisma.logEntry.update({
      where: { id: req.params.id },
      data: {
        title: title || existing.title,
        description: description || existing.description,
        category: category || existing.category,
        durationHours: parseFloat(durationHours) || existing.durationHours,
        entryDate: entryDate ? new Date(entryDate + 'T12:00:00') : existing.entryDate,
        photoUrls
      }
    });

    res.json(entry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete entry
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.logEntry.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ message: 'Entry not found' });

    await prisma.logEntry.delete({ where: { id: req.params.id } });

    res.json({ message: 'Entry deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;