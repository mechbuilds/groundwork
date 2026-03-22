const express = require('express');
const auth = require('../middleware/auth');
const prisma = require('../prismaClient');

const router = express.Router();


// Get all categories
router.get('/', auth, async (req, res) => {
  try {
    const categories = await prisma.category.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create category
router.post('/', auth, async (req, res) => {
  try {
    const { name, color, icon, type } = req.body;

    if (!name || !color || !type) {
      return res.status(400).json({ message: 'Name, color and type are required' });
    }

    const category = await prisma.category.create({
      data: {
        userId: req.user.id,
        name,
        color,
        icon: icon || 'tag',
        type
      }
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update category
router.put('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ message: 'Category not found' });

    const { name, color, icon, type } = req.body;

    const category = await prisma.category.update({
      where: { id: req.params.id },
      data: {
        name: name || existing.name,
        color: color || existing.color,
        icon: icon || existing.icon,
        type: type || existing.type
      }
    });

    res.json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete category
router.delete('/:id', auth, async (req, res) => {
  try {
    const existing = await prisma.category.findFirst({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!existing) return res.status(404).json({ message: 'Category not found' });

    await prisma.category.delete({ where: { id: req.params.id } });

    res.json({ message: 'Category deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;