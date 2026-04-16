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
    const { supplier_id, total_amount, chemical_id, quantity, price_per_unit } = req.body;
    
    // Агроном створює зі статусом "Очікує", Адмін може одразу "Замовлено"
    const initialStatus = req.user.role === 'admin' ? 'Замовлено' : 'Очікує';

    const newOrder = await prisma.purchaseOrder.create({
      data: {
        supplier_id: Number(supplier_id),
        user_id: req.user.id, // ID того, хто створив
        order_date: new Date(),
        total_amount: Number(total_amount),
        status: initialStatus,
        orderItems: {
          create: [{
            chemical_id: Number(chemical_id),
            quantity: Number(quantity),
            purchase_unit: 'шт/кг/л', // Спрощено для прикладу
            price_per_unit: Number(price_per_unit)
          }]
        }
      }
    });
    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Помилка створення замовлення:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 4. Змінити статус замовлення (Адмін затверджує, Оператор приймає)
router.put('/:id/status', authorizeRoles('admin', 'operator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'Замовлено' або 'Отримано'
    
    // Перевірка логіки ролей
    if (req.user.role === 'operator' && status !== 'Отримано') {
      return res.status(403).json({ error: 'Оператор може лише приймати товар (Отримано)' });
    }

    // Отримуємо замовлення з його товарами, щоб знати, що додавати на склад
    const order = await prisma.purchaseOrder.findUnique({
      where: { id: Number(id) },
      include: { orderItems: true }
    });

    if (!order) return res.status(404).json({ error: 'Замовлення не знайдено' });

    // ЛОГІКА СКЛАДУ: Якщо статус змінюється на "Отримано"
    if (status === 'Отримано' && order.status !== 'Отримано') {
      
      // Для простоти приймаємо товар на "Головний склад" (беремо перший зі списку)
      const defaultWarehouse = await prisma.warehouse.findFirst();
      
      if (!defaultWarehouse) {
        return res.status(400).json({ error: 'Не знайдено жодного складу для прийому.' });
      }

      // Використовуємо ТРАНЗАКЦІЮ для гарантії цілісності даних
      await prisma.$transaction(async (tx) => {
        // 1. Оновлюємо статус замовлення
        await tx.purchaseOrder.update({
          where: { id: Number(id) },
          data: { status }
        });

        // 2. Проходимося по всіх товарах у замовленні і додаємо їх на склад
        for (const item of order.orderItems) {
          const existingInventory = await tx.inventory.findFirst({
            where: {
              chemical_id: item.chemical_id,
              warehouse_id: defaultWarehouse.id
            }
          });

          if (existingInventory) {
            // Якщо товар вже є — збільшуємо його залишок
            await tx.inventory.update({
              where: { id: existingInventory.id },
              data: { quantity: Number(existingInventory.quantity) + Number(item.quantity) }
            });
          } else {
            // Якщо товару ще не було — створюємо новий запис
            await tx.inventory.create({
              data: {
                chemical_id: item.chemical_id,
                warehouse_id: defaultWarehouse.id,
                quantity: Number(item.quantity),
                min_threshold: 50 // Встановлюємо базовий поріг
              }
            });
          }
        }
      });

      return res.json({ message: 'Замовлення отримано, склад оновлено!' });
    }

    // Якщо це просто зміна статусу на "Замовлено" (без поповнення складу)
    const updatedOrder = await prisma.purchaseOrder.update({
      where: { id: Number(id) },
      data: { status }
    });
    res.json(updatedOrder);

  } catch (error) {
    console.error('Помилка оновлення статусу:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 5. Видалити замовлення (Тільки Адмін)
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    // Спочатку видаляємо пов'язані елементи замовлення
    await prisma.purchaseOrderItem.deleteMany({ where: { order_id: Number(id) } });
    // Потім саме замовлення
    await prisma.purchaseOrder.delete({ where: { id: Number(id) } });
    res.json({ message: 'Замовлення видалено' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;