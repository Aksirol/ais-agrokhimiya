const express = require('express');
const prisma = require('../lib/prisma');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();


// 1. READ: Отримати журнал (Адмін бачить все, Агроном - тільки своє)
router.get('/', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const whereClause = req.user.role === 'agronomist' ? { user_id: req.user.id } : {};

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
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 2. Допоміжний маршрут: Дані для форми
router.get('/form-data', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    // Беремо лише активні позиції на складі, де залишок > 0
    const inventory = await prisma.inventory.findMany({
      where: { quantity: { gt: 0 } },
      include: { chemical: true, warehouse: true }
    });
    const fields = await prisma.field.findMany();
    res.json({ inventory, fields });
  } catch (error) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 3. CREATE: Створити запис і СПИСАТИ зі складу
router.post('/', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const { inventory_id, field_id, applied_date, quantity_used, norm_per_ha, purpose } = req.body;

    // НОВЕ: Базова валідація чисел
    if (Number(quantity_used) <= 0 || Number(norm_per_ha) <= 0) {
      return res.status(400).json({ error: 'Кількість та норма мають бути більшими за нуль' });
    }

    // Знаходимо позицію на складі
    const invItem = await prisma.inventory.findUnique({
      where: { id: Number(inventory_id) },
      include: { chemical: true }
    });

    if (!invItem) return res.status(404).json({ error: 'Позицію на складі не знайдено' });

    // Перевіряємо, чи вистачає товару
    if (Number(invItem.quantity) < Number(quantity_used)) {
      return res.status(400).json({ error: `Недостатньо товару на складі. Доступно: ${invItem.quantity}` });
    }

    // ТРАНЗАКЦІЯ: Створюємо запис і віднімаємо залишок
    const result = await prisma.$transaction(async (tx) => {
      // Віднімаємо зі складу
      await tx.inventory.update({
        where: { id: invItem.id },
        data: { quantity: Number(invItem.quantity) - Number(quantity_used) }
      });

      // Створюємо запис про використання
      const newApp = await tx.application.create({
        data: {
          chemical_id: invItem.chemical_id,
          field_id: Number(field_id),
          user_id: req.user.id,
          warehouse_id: invItem.warehouse_id,
          applied_date: new Date(applied_date),
          quantity_used: Number(quantity_used),
          base_unit: invItem.chemical.base_unit,
          norm_per_ha: Number(norm_per_ha),
          purpose
        }
      });

      await tx.inventoryMovement.create({
        data: {
          inventory_id: invItem.id,
          type: 'OUT',
          quantity: Number(quantity_used),
          source_application_id: newApp.id,
          user_id: req.user.id
        }
      });
      return newApp;
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Помилка створення запису:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 4. DELETE: Видалити запис і ПОВЕРНУТИ товар на склад
router.delete('/:id', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const { id } = req.params;

    const app = await prisma.application.findUnique({ where: { id: Number(id) } });
    if (!app) return res.status(404).json({ error: 'Запис не знайдено' });

    // Перевірка прав (Агроном може видалити тільки свій запис)
    if (req.user.role === 'agronomist' && app.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Ви можете видаляти лише власні записи' });
    }

    await prisma.$transaction(async (tx) => {
      // Шукаємо цей товар на тому ж складі
      const invItem = await tx.inventory.findFirst({
        where: { chemical_id: app.chemical_id, warehouse_id: app.warehouse_id }
      });

      // Якщо позиція на складі ще існує, повертаємо кількість
      if (invItem) {
        await tx.inventory.update({
          where: { id: invItem.id },
          data: { quantity: Number(invItem.quantity) + Number(app.quantity_used) }
        });

        // АУДИТ: Логуємо повернення (для симетрії з OUT)
        await tx.inventoryMovement.create({
          data: {
            inventory_id: invItem.id,
            type: 'RETURN',
            quantity: Number(app.quantity_used),
            source_application_id: app.id,
            user_id: req.user.id
          }
        });
      }

      // Видаляємо сам запис
      await tx.application.delete({ where: { id: Number(id) } });
    });

    res.json({ message: 'Запис видалено, товар повернуто на склад' });
  } catch (error) {
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 5. UPDATE: Завершити використання і повернути залишки на склад
router.put('/:id/complete', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const { id } = req.params;
    const { returned_quantity } = req.body;

    // 1. Знаходимо запис
    const app = await prisma.application.findUnique({ where: { id: Number(id) } });
    if (!app) return res.status(404).json({ error: 'Запис не знайдено' });
    if (app.status === 'COMPLETED') return res.status(400).json({ error: 'Цей запис вже завершено' });

    // 2. Перевірка прав (Агроном може завершувати тільки свої записи)
    if (req.user.role === 'agronomist' && app.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Ви можете завершувати лише власні записи' });
    }

    const returnedNum = Number(returned_quantity) || 0;

    // Захист від помилок: не можна повернути більше, ніж було взято
    if (returnedNum > Number(app.quantity_used)) {
      return res.status(400).json({ error: 'Не можна повернути більше, ніж було взято зі складу' });
    }

    // 3. ТРАНЗАКЦІЯ: Повертаємо товар і оновлюємо статус
    const updatedApp = await prisma.$transaction(async (tx) => {

      // Якщо є залишки, повертаємо їх на склад
      if (returnedNum > 0) {
        const invItem = await tx.inventory.findFirst({
          where: { chemical_id: app.chemical_id, warehouse_id: app.warehouse_id }
        });

        if (invItem) {
          {"{ where: { id: invItem.id }, data: { quantity: Number(invItem.quantity) + returnedNum } }"}
          // АУДИТ: Логуємо повернення
          await tx.inventoryMovement.create({
            data: {
              inventory_id: invItem.id,
              type: 'RETURN',
              quantity: returnedNum,
              source_application_id: app.id,
              user_id: req.user.id
            }
          });
        }
      }

      // Оновлюємо статус і фінальну (фактичну) витрату
      return await tx.application.update({
        where: { id: Number(id) },
        data: {
          status: 'COMPLETED',
          quantity_used: Number(app.quantity_used) - returnedNum // Віднімаємо повернуте
        },
        include: { chemical: true, field: true, user: true, warehouse: true }
      });
    });

    res.json(updatedApp);
  } catch (error) {
    console.error('Помилка завершення:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;