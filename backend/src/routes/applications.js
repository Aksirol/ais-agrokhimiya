const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/applications - Отримати журнал використання
router.get('/', async (req, res) => {
  try {
    const applications = await prisma.application.findMany({
      include: {
        chemical: true,
        field: true,
        user: true,
        warehouse: true
      },
      orderBy: { applied_date: 'desc' }
    });
    res.json(applications);
  } catch (error) {
    console.error('Помилка отримання журналу:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;