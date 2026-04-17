const express = require('express');
const prisma = require('../lib/prisma');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();


// GET /api/analytics/dashboard - Отримати реальні дані для графіків
router.get('/dashboard', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // 1. ОПТИМІЗАЦІЯ (СЕД-3): База даних сама рахує загальну суму
    const totalExpensesResult = await prisma.purchaseOrder.aggregate({
      _sum: { total_amount: true }
    });
    const totalExpenses = Number(totalExpensesResult._sum.total_amount || 0);

    // Завантажуємо закупівлі ТІЛЬКИ за поточний рік для графіка
    const currentYearPurchases = await prisma.purchaseOrder.findMany({
      where: {
        order_date: {
          gte: new Date(`${currentYear}-01-01`),
          lte: new Date(`${currentYear}-12-31`)
        }
      },
      include: { orderItems: { include: { chemical: true } } }
    });

    // --- KPI 2: Закуплено товарів (об'єм) ---
    let totalVolume = 0;
    const categoryExpenses = {}; // Для кругової діаграми

    purchases.forEach(p => {
      p.orderItems.forEach(item => {
        totalVolume += Number(item.quantity);
        const cat = item.chemical.category;
        const cost = Number(item.quantity) * Number(item.price_per_unit);
        categoryExpenses[cat] = (categoryExpenses[cat] || 0) + cost;
      });
    });

    // --- KPI 3 & 4: Площі та витрати на гектар ---
    const totalArea = fields.reduce((sum, f) => sum + Number(f.area_ha), 0);
    const treatedArea = fields.filter(f => f.applications.length > 0).reduce((sum, f) => sum + Number(f.area_ha), 0);
    const expensePerHa = treatedArea > 0 ? Math.round(totalExpenses / treatedArea) : 0;

    // --- ГРАФІК 1: Закупівлі по місяцях (Січень - Червень для прикладу) ---
    const monthlyData = new Array(12).fill(0); // Створюємо масив з 12 нулів
    
    currentYearPurchases.forEach(p => {
      const monthIndex = p.order_date.getMonth(); // 0 = Січень, 11 = Грудень
      monthlyData[monthIndex] += Number(p.total_amount);
    });

    // Відправляємо на фронтенд лише ті місяці, які вже настали (до поточного)
    const currentMonthIndex = new Date().getMonth();
    const relevantMonthlyData = monthlyData.slice(0, currentMonthIndex + 1);
    
    // Генеруємо назви місяців динамічно
    const monthNames = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];
    const relevantMonthNames = monthNames.slice(0, currentMonthIndex + 1);

    // --- ГРАФІК 2: Витрати (використання) по полях ---
    const fieldUsage = {};
    applications.forEach(app => {
      const fname = app.field.name;
      fieldUsage[fname] = (fieldUsage[fname] || 0) + Number(app.quantity_used);
    });

    // --- ГРАФІК 3: Топ постачальники ---
    const supplierTotals = {};
    purchases.forEach(p => {
      const sname = p.supplier.name;
      supplierTotals[sname] = (supplierTotals[sname] || 0) + Number(p.total_amount);
    });

    const topSuppliers = Object.entries(supplierTotals)
      .map(([name, total]) => ({ name, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 4); // Беремо топ 4

    // Відправляємо всі згруповані дані на фронтенд
    res.json({
      kpis: { totalExpenses, totalVolume, totalArea, treatedArea, expensePerHa },
      categoryExpenses,
      monthlyData,
      fieldUsage,
      topSuppliers
    });

  } catch (error) {
    console.error('Помилка формування аналітики:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// GET /api/analytics/home - Зведені дані для Головного Дашборду (доступно всім)
router.get('/home', authorizeRoles('admin', 'agronomist', 'operator'), async (req, res) => {
  try {
    // 1. Склад та Сповіщення про низький запас
    const inventory = await prisma.inventory.findMany({ include: { chemical: true } });
    const inventoryCount = inventory.length;
    const lowStockItems = inventory.filter(item => Number(item.quantity) <= Number(item.min_threshold));
    const lowStockCount = lowStockItems.length;

    // 2. Поля
    const fields = await prisma.field.findMany({ include: { applications: true } });
    const totalFieldsCount = fields.length;
    const treatedFieldsCount = fields.filter(f => f.applications.length > 0).length;

    // 3. Використання
    const applications = await prisma.application.findMany();
    const chemicalsUsedTotal = applications.reduce((sum, app) => sum + Number(app.quantity_used), 0);

    // 4. Закупівлі (Останні та Витрати)
    const purchases = await prisma.purchaseOrder.findMany({
      include: { supplier: true, orderItems: { include: { chemical: true } } },
      orderBy: { order_date: 'desc' }
    });

    const purchasesTotal = purchases.reduce((sum, p) => sum + Number(p.total_amount), 0);
    const recentPurchases = purchases.slice(0, 4); // Беремо 4 останні закупівлі

    // Витрати за категоріями (для смужок прогресу)
    const categoryExpenses = {};
    let totalExpenses = 0;

    purchases.forEach(p => {
      p.orderItems.forEach(item => {
        const cat = item.chemical.category;
        const cost = Number(item.quantity) * Number(item.price_per_unit);
        categoryExpenses[cat] = (categoryExpenses[cat] || 0) + cost;
        totalExpenses += cost;
      });
    });

    // 5. Розумні Сповіщення (Alerts)
    const alerts = [];

    // - Сповіщення про критичні залишки (Червоні)
    lowStockItems.forEach(item => {
      alerts.push({
        id: `inv-${item.id}`,
        title: `${item.chemical.name} — залишок ${Number(item.quantity)} ${item.chemical.base_unit}`,
        subtitle: `Мінімальний поріг: ${Number(item.min_threshold)} ${item.chemical.base_unit}`,
        color: 'bg-[#e24b4a]' // Червоний
      });
    });

    // - Сповіщення про незавершені замовлення (Жовті)
    const pendingOrders = purchases.filter(p => p.status === 'Очікує' || p.status === 'Замовлено');
    pendingOrders.forEach(order => {
      alerts.push({
        id: `ord-${order.id}`,
        title: `Замовлення №${order.id} на суму ${Number(order.total_amount).toLocaleString()} грн`,
        subtitle: `${order.supplier.name} · Статус: ${order.status}`,
        color: 'bg-[#ef9f27]' // Жовтий
      });
    });

    res.json({
      kpis: {
        purchasesTotal,
        inventoryCount,
        lowStockCount,
        treatedFieldsCount,
        totalFieldsCount,
        chemicalsUsedTotal
      },
      categoryExpenses,
      totalExpenses: totalExpenses || 1, // Щоб уникнути ділення на нуль
      recentPurchases,
      alerts: alerts.slice(0, 5) // Показуємо тільки топ 5 найважливіших сповіщень
    });

  } catch (error) {
    console.error('Помилка формування дашборду:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;