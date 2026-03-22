const express = require('express');
const auth = require('../middleware/auth');
const prisma = require('../prismaClient');

const router = express.Router();

// Get monthly report
router.get('/monthly', auth, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: 'Month and year are required' });
    }

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0, 23, 59, 59);

    // Get all entries for the month
    const entries = await prisma.logEntry.findMany({
      where: {
        userId: req.user.id,
        entryDate: { gte: start, lte: end }
      },
      orderBy: { entryDate: 'asc' }
    });

    // Get all expenses for the month
    const expenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        expenseDate: { gte: start, lte: end }
      },
      orderBy: { expenseDate: 'asc' }
    });

    // Calculate totals
    const totalHours = entries.reduce((sum, e) => sum + e.durationHours, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
    const entriesCount = entries.length;

    // Group entries by category
    const entriesByCategory = entries.reduce((acc, entry) => {
      const cat = entry.category;
      if (!acc[cat]) acc[cat] = { category: cat, count: 0, hours: 0 };
      acc[cat].count += 1;
      acc[cat].hours += entry.durationHours;
      return acc;
    }, {});

    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const cat = expense.category;
      if (!acc[cat]) acc[cat] = { category: cat, total: 0, count: 0 };
      acc[cat].total += expense.amount;
      acc[cat].count += 1;
      return acc;
    }, {});

    res.json({
      month: parseInt(month),
      year: parseInt(year),
      totalHours,
      totalSpent,
      entriesCount,
      byCategory: Object.values(entriesByCategory),
      expensesByCategory: Object.values(expensesByCategory),
      entries,
      expenses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get dashboard stats
router.get('/dashboard', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    // This month entries
    const thisMonthEntries = await prisma.logEntry.findMany({
      where: {
        userId: req.user.id,
        entryDate: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    // This month expenses
    const thisMonthExpenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        expenseDate: { gte: startOfMonth, lte: endOfMonth }
      }
    });

    // Last month expenses
    const lastMonthExpenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        expenseDate: { gte: startOfLastMonth, lte: endOfLastMonth }
      }
    });

    // Last 5 entries
    const recentEntries = await prisma.logEntry.findMany({
      where: { userId: req.user.id },
      orderBy: { entryDate: 'desc' },
      take: 5
    });

   // Last 90 days expenses for chart
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const last30DaysExpenses = await prisma.expense.findMany({
      where: {
        userId: req.user.id,
        expenseDate: { gte: ninetyDaysAgo }
      },
      orderBy: { expenseDate: 'asc' }
    });

    res.json({
      thisMonth: {
        entriesCount: thisMonthEntries.length,
        totalHours: thisMonthEntries.reduce((sum, e) => sum + e.durationHours, 0),
        totalSpent: thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
      },
      lastMonth: {
        totalSpent: lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0)
      },
      recentEntries,
      last30DaysExpenses
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;