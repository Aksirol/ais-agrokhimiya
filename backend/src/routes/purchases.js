const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/purchases - Отримати список закупівель
router.get('/', async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true, // Підтягуємо дані постачальника (щоб знати ім'я)
        orderItems: {
          include: { chemical: true } // Підтягуємо товари в замовленні
        }
      },
      orderBy: { order_date: 'desc' } // Сортуємо від новіших до старіших
    });
    
    res.json(orders);
  } catch (error) {
    console.error('Помилка отримання закупівель:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;