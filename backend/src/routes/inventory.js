const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// 1. READ: Отримати список залишків (Доступно всім)
router.get('/', authorizeRoles('admin', 'agronomist', 'operator'), async (req, res) => {
  try {
    const inventories = await prisma.inventory.findMany({
      include: {
        chemical: true,
        warehouse: true
      },
      orderBy: { last_updated: 'desc' }
    });
    res.json(inventories);
  } catch (error) {
    console.error('Помилка отримання складу:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 2. Допоміжний маршрут: Отримати дані для випадаючих списків у формі
router.get('/form-data', authorizeRoles('admin', 'operator'), async (req, res) => {
  try {
    const chemicals = await prisma.chemical.findMany();
    const warehouses = await prisma.warehouse.findMany();
    res.json({ chemicals, warehouses });
  } catch (error) {
    console.error('Помилка отримання даних для форми:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 3. CREATE: Додати нову позицію на склад (Адмін та Оператор)
router.post('/', authorizeRoles('admin', 'operator'), async (req, res) => {
  try {
    const { chemical_id, warehouse_id, quantity, min_threshold } = req.body;
    
    // Перевіряємо, чи немає вже такого хімікату на цьому складі
    const existing = await prisma.inventory.findFirst({
      where: { chemical_id: Number(chemical_id), warehouse_id: Number(warehouse_id) }
    });

    if (existing) {
      return res.status(400).json({ error: 'Цей хімікат вже є на обраному складі. Використовуйте редагування.' });
    }

    const newItem = await prisma.inventory.create({
      data: {
        chemical_id: Number(chemical_id),
        warehouse_id: Number(warehouse_id),
        quantity: Number(quantity),
        min_threshold: Number(min_threshold)
      },
      include: { chemical: true, warehouse: true }
    });
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Помилка створення позиції:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 4. UPDATE: Оновити залишки або поріг (Адмін та Оператор)
router.put('/:id', authorizeRoles('admin', 'operator'), async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, min_threshold } = req.body;

    const updatedItem = await prisma.inventory.update({
      where: { id: Number(id) },
      data: { 
        quantity: Number(quantity), 
        min_threshold: Number(min_threshold) 
      },
      include: { chemical: true, warehouse: true }
    });
    res.json(updatedItem);
  } catch (error) {
    console.error('Помилка оновлення позиції:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 5. DELETE: Видалити позицію (Тільки Адмін)
router.delete('/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.inventory.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Позицію успішно видалено' });
  } catch (error) {
    console.error('Помилка видалення позиції:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;