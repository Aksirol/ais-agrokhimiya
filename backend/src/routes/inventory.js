const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/inventory - Отримати список залишків на складах
// Доступ для всіх трьох ролей
router.get('/', authorizeRoles('admin', 'agronomist', 'operator'), async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        chemical: true,   // Підтягуємо інформацію про сам хімікат (назву, одиниці виміру)
        warehouse: true   // Підтягуємо інформацію про склад (назву)
      },
      orderBy: { last_updated: 'desc' }
    });

    res.json(inventories);
  } catch (error) {
    console.error('Помилка отримання складу:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;