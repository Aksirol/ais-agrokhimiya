const express = require('express');
const router = express.Router();
const { authorizeRoles } = require('../middleware/auth');
const prisma = require('../lib/prisma');

// 1. МАРШРУТ ДЛЯ СТОРІНКИ "АНАЛІТИКА" (з фільтрами періодів)
router.get('/dashboard', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const { period = 'year' } = req.query;
    const now = new Date();
    let startDate, endDate;

    // Визначаємо дати початку і кінця для фільтру
    if (period === 'month') {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    } else if (period === 'quarter') {
      const currentQuarter = Math.floor(now.getMonth() / 3);
      startDate = new Date(now.getFullYear(), currentQuarter * 3, 1);
      endDate = new Date(now.getFullYear(), currentQuarter * 3 + 3, 0);
    } else if (period === 'all') {
      startDate = new Date(2000, 0, 1);
      endDate = new Date(2100, 0, 1);
    } else {
      // За замовчуванням - поточний рік
      startDate = new Date(now.getFullYear(), 0, 1);
      endDate = new Date(now.getFullYear(), 11, 31);
    }

    const dateFilter = { gte: startDate, lte: endDate };

    // Розраховуємо загальну суму витрат
    const totalExpensesResult = await prisma.purchaseOrder.aggregate({
      _sum: { total_amount: true },
      where: { order_date: dateFilter }
    });
    const totalExpenses = Number(totalExpensesResult._sum.total_amount || 0);

    // Отримуємо відфільтровані закупівлі
    const filteredPurchases = await prisma.purchaseOrder.findMany({
      where: { order_date: dateFilter },
      include: { supplier: true, orderItems: { include: { chemical: true } } }
    });

    const fields = await prisma.field.findMany({
      include: { applications: true }
    });

    // Отримуємо відфільтровані використання (списання)
    const applications = await prisma.application.findMany({
      where: { applied_date: dateFilter },
      include: { field: true }
    });

    let totalVolume = 0;
    const categoryExpenses = {};

    filteredPurchases.forEach(p => {
      p.orderItems.forEach(item => {
        totalVolume += Number(item.quantity);
        const cat = item.chemical.category;
        const cost = Number(item.quantity) * Number(item.price_per_unit);
        categoryExpenses[cat] = (categoryExpenses[cat] || 0) + cost;
      });
    });

    const totalArea = fields.reduce((sum, f) => sum + Number(f.area_ha), 0);
    const treatedArea = fields.filter(f => f.applications.length > 0).reduce((sum, f) => sum + Number(f.area_ha), 0);
    const expensePerHa = treatedArea > 0 ? Math.round(totalExpenses / treatedArea) : 0;

    // Графік по місяцях
    const relevantMonthlyData = new Array(12).fill(0);
    filteredPurchases.forEach(p => {
      const monthIndex = p.order_date.getMonth();
      relevantMonthlyData[monthIndex] += Number(p.total_amount);
    });

    const fieldUsage = {};
    applications.forEach(app => {
      const fname = app.field.name;
      fieldUsage[fname] = (fieldUsage[fname] || 0) + Number(app.quantity_used);
    });

    const supplierTotals = {};
    filteredPurchases.forEach(p => {
      const sname = p.supplier.name;
      supplierTotals[sname] = (supplierTotals[sname] || 0) + Number(p.total_amount);
    });

    const topSuppliers = Object.entries(supplierTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4);

    const relevantMonthNames = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

    // Відправляємо дані на фронтенд
    res.json({
      kpis: { totalExpenses, totalVolume, totalArea, treatedArea, expensePerHa },
      categoryExpenses,
      monthlyData: relevantMonthlyData,
      monthNames: relevantMonthNames,
      fieldUsage,
      topSuppliers
    });
  } catch (error) {
    console.error('Помилка формування аналітики:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 2. МАРШРУТ ДЛЯ ГОЛОВНОГО "ДАШБОРДУ" (Сповіщення та загальна статистика)
router.get('/home', authorizeRoles('admin', 'agronomist', 'operator'), async (req, res) => {
  try {
    // 1. Завантажуємо всі необхідні дані з бази
    const inventory = await prisma.inventory.findMany({ include: { chemical: true } });
    const fields = await prisma.field.findMany({ include: { applications: true } });
    const purchases = await prisma.purchaseOrder.findMany({
      include: { supplier: true, orderItems: { include: { chemical: true } } },
      orderBy: { order_date: 'desc' } // Сортуємо від найновіших до найстаріших
    });
    const applications = await prisma.application.findMany();

    // 2. Розраховуємо фінанси та об'єми (для KPI та графіка категорій)
    let totalExpenses = 0;
    const categoryExpenses = {};

    purchases.forEach(p => {
      totalExpenses += Number(p.total_amount);
      
      p.orderItems.forEach(item => {
        // Додаємо витрати до відповідної категорії
        const cat = item.chemical.category;
        const cost = Number(item.quantity) * Number(item.price_per_unit);
        categoryExpenses[cat] = (categoryExpenses[cat] || 0) + cost;
      });
    });

    // 3. Розраховуємо використання хімікатів
    let chemicalsUsedTotal = 0;
    applications.forEach(app => {
      chemicalsUsedTotal += Number(app.quantity_used);
    });

    // 4. Рахуємо статистику по складу (позиції та дефіцит)
    const inventoryCount = inventory.length;
    const lowStockCount = inventory.filter(item => Number(item.quantity) <= Number(item.min_threshold)).length;

    // 5. Рахуємо статистику по полях
    const totalFieldsCount = fields.length;
    const treatedFieldsCount = fields.filter(f => f.applications.length > 0).length;

    // 6. Формуємо масив останніх закупівель (беремо перші 5)
    const recentPurchases = purchases.slice(0, 5);

    // 7. Генеруємо сповіщення
    const alerts = [];

    // Сповіщення: запаси нижче норми
    inventory.filter(item => Number(item.quantity) <= Number(item.min_threshold)).forEach(item => {
      alerts.push({ 
        id: `inv-${item.id}`, 
        title: `${item.chemical.name} — залишок ${Number(item.quantity)}`, 
        subtitle: `Мін: ${Number(item.min_threshold)}`, 
        color: 'bg-[#e24b4a]' 
      });
    });

    // Сповіщення: відкриті замовлення
    const pendingOrders = purchases.filter(p => p.status === 'PENDING' || p.status === 'ORDERED');
    pendingOrders.forEach(order => {
      alerts.push({
        id: `ord-${order.id}`,
        title: `Замовлення №${order.id} на суму ${Number(order.total_amount).toLocaleString()} грн`,
        subtitle: `${order.supplier.name} · Статус: ${order.status === 'PENDING' ? 'Очікує' : 'Замовлено'}`,
        color: 'bg-[#ef9f27]'
      });
    });

    // 8. Відправляємо ВСІ дані, які очікує фронтенд
    res.json({
      kpis: { 
        purchasesTotal: totalExpenses, 
        chemicalsUsedTotal,
        inventoryCount,
        lowStockCount,
        treatedFieldsCount,
        totalFieldsCount
      },
      categoryExpenses,
      totalExpenses,
      recentPurchases,
      alerts
    });
  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;