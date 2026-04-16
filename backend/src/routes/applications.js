const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorizeRoles } = require('../middleware/auth'); // Імпортуємо перевірку ролей

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/applications - Отримати журнал (доступно адміну та агроному)
// Зверни увагу: ми додаємо authorizeRoles тут (у самому маршруті) або в index.js
router.get('/', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    // Реалізація принципу найменших привілеїв (Record-level access control)
    // Якщо роль 'agronomist' - фільтруємо по його ID. Якщо 'admin' - фільтр порожній (бачить все).
    const whereClause = req.user.role === 'agronomist' 
      ? { user_id: req.user.id } 
      : {};

    const applications = await prisma.application.findMany({
      where: whereClause,
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