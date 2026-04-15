const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/fields - Отримати список полів
router.get('/', async (req, res) => {
  try {
    const fields = await prisma.field.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(fields);
  } catch (error) {
    console.error('Помилка отримання полів:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;