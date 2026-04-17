const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// 1. Отримати всі закупівлі (Доступно всім)
router.get('/', authorizeRoles('admin', 'agronomist', 'operator'), async (req, res) => {
  try {
    const orders = await prisma.purchaseOrder.findMany({
      include: {
        supplier: true,
        user: true,
        orderItems: { include: { chemical: true } }
      },
      orderBy: { order_date: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Помилка отримання закупівель:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 2. Отримати дані для форми (Доступно адміну та агроному)
router.get('/form-data', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const suppliers = await prisma.supplier.findMany();
    const chemicals = await prisma.chemical.findMany();
    res.json({ suppliers, chemicals });
  } catch (error) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 3. Створити нове замовлення (Адмін та Агроном)
router.post('/', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    // ПРИБРАНО total_amount з деструктуризації — ми не довіряємо фронтенду!
    const { supplier_id, chemical_id, quantity, price_per_unit } = req.body;
    
    // БЕЗПЕКА: Сервер сам рахує суму
    const calculatedTotal = Number(quantity) * Number(price_per_unit);
    // Використовуємо нові ENUM статуси
    const initialStatus = req.user.role === 'admin' ? 'ORDERED' : 'PENDING';

    const newOrder = await prisma.purchaseOrder.create({
      data: {
        supplier_id: Number(supplier_id),
        user_id: req.user.id,
        order_date: new Date(),
        total_amount: calculatedTotal, // Зберігаємо безпечну суму
        status: initialStatus,
        orderItems: {
          create: [{
            chemical_id: Number(chemical_id),
            quantity: Number(quantity),
            purchase_unit: 'шт/кг/л',
            price_per_unit: Number(price_per_unit)
          }]
        }
      }
    });
    res.status(201).json(newOrder);
  } catch (error) { /* обробка помилки */ }
});

// 4. Змінити статус замовлення (Адмін затверджує, Оператор приймає)
router.put('/:id/status', authorizeRoles('admin', 'operator'), async (req, res) => {
  try {
    const { id } = req.params;
    // ТЕПЕР МИ ВИМАГАЄМО warehouse_id ВІД ФРОНТЕНДУ
    const { status, warehouse_id } = req.body; 
    
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: Number(id) },
      include: { orderItems: true }
    });

    if (!order) return res.status(404).json({ error: 'Не знайдено' });
    
    // БЕЗПЕКА: Перевірка is_locked
    if (order.is_locked) return res.status(400).json({ error: 'Замовлення заблоковано' });

    if (status === 'RECEIVED' && order.status !== 'RECEIVED') {
      if (!warehouse_id) return res.status(400).json({ error: 'Оберіть склад для прийому товару' });

      await prisma.$transaction(async (tx) => {
        // Оновлюємо статус і блокуємо замовлення
        await tx.purchaseOrder.update({
          where: { id: Number(id) },
          data: { status, is_locked: true }
        });

        for (const item of order.orderItems) {
          // Шукаємо позицію на КОНКРЕТНОМУ складі
          const existingInv = await tx.inventory.findFirst({
            where: { chemical_id: item.chemical_id, warehouse_id: Number(warehouse_id) }
          });

          let invId;
          if (existingInv) {
            await tx.inventory.update({
              where: { id: existingInv.id },
              data: { quantity: Number(existingInv.quantity) + Number(item.quantity) }
            });
            invId = existingInv.id;
          } else {
            const newInv = await tx.inventory.create({
              data: {
                chemical_id: item.chemical_id,
                warehouse_id: Number(warehouse_id),
                quantity: Number(item.quantity),
                min_threshold: 50
              }
            });
            invId = newInv.id;
          }

          // АУДИТ: Запис в таблицю рухів (СЕР-1)
          await tx.inventoryMovement.create({
            data: {
              inventory_id: invId,
              type: 'IN',
              quantity: Number(item.quantity),
              source_order_id: order.id,
              user_id: req.user.id
            }
          });
        }
      });
      return res.json({ message: 'Отримано' });
    }

    // Для інших статусів
    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(updatedOrder);
  } catch (error) { /* обробка помилки */ }
});

// 5. Видалити замовлення (Тільки Адмін)
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.purchaseOrder.findUnique({ where: { id: Number(id) } });
    
    // БЕЗПЕКА: Перевірка is_locked
    if (order.is_locked) {
      return res.status(400).json({ error: 'Замовлення вже прийняте на склад і заблоковане для видалення.' });
    }

    await prisma.purchaseOrderItem.deleteMany({ where: { order_id: Number(id) } });
    await prisma.purchaseOrder.delete({ where: { id: Number(id) } });
    res.json({ message: 'Замовлення видалено' });
  } catch (error) { /* обробка помилки */ }
});

module.exports = router;