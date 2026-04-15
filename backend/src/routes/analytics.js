const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/analytics/dashboard - Отримати дані для графіків
router.get('/dashboard', async (req, res) => {
  try {
    // 1. Рахуємо витрати по постачальниках (для кругової діаграми)
    const purchases = await prisma.purchaseOrder.findMany({
      include: { supplier: true }
    });
    
    const supplierExpenses = purchases.reduce((acc, order) => {
      const name = order.supplier.name;
      acc[name] = (acc[name] || 0) + Number(order.total_amount);
      return acc;
    }, {});

    const pieData = Object.keys(supplierExpenses).map(name => ({
      name, 
      value: supplierExpenses[name]
    }));

    // 2. Рахуємо використані хімікати (для стовпчастої діаграми)
    const applications = await prisma.application.findMany({
      include: { chemical: true }
    });

    const chemicalUsage = applications.reduce((acc, app) => {
      const name = app.chemical.name;
      // Додаємо кількість до існуючої або створюємо новий запис
      acc[name] = (acc[name] || 0) + Number(app.quantity_used);
      return acc;
    }, {});

    const barData = Object.keys(chemicalUsage).map(name => ({
      name, 
      amount: chemicalUsage[name]
    }));

    // Відправляємо обидва масиви даних на фронтенд
    res.json({ pieData, barData });
    
  } catch (error) {
    console.error('Помилка формування аналітики:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;