const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/fields - Отримати список полів
// Доступ лише для admin та agronomist
router.get('/', authorizeRoles('admin', 'agronomist'), async (req, res) => {
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