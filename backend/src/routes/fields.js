const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// 1. READ: Отримати список полів
router.get('/', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const fields = await prisma.field.findMany({
      orderBy: { id: 'asc' }
    });
    res.json(fields);
  } catch (error) {
    console.error('Помилка отримання полів:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 2. CREATE: Створити нове поле
router.post('/', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const { name, area_ha, crop_type, location, season } = req.body;
    
    const newField = await prisma.field.create({
      data: { 
        name, 
        area_ha: Number(area_ha), 
        crop_type, 
        location, 
        season 
      }
    });
    res.status(201).json(newField);
  } catch (error) {
    console.error('Помилка створення поля:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 3. UPDATE: Редагувати існуюче поле
router.put('/:id', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, area_ha, crop_type, location, season } = req.body;

    const updatedField = await prisma.field.update({
      where: { id: Number(id) },
      data: { 
        name, 
        area_ha: Number(area_ha), 
        crop_type, 
        location, 
        season 
      }
    });
    res.json(updatedField);
  } catch (error) {
    console.error('Помилка оновлення поля:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

// 4. DELETE: Видалити поле
router.delete('/:id', authorizeRoles('admin', 'agronomist'), async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.field.delete({
      where: { id: Number(id) }
    });
    res.json({ message: 'Поле успішно видалено' });
  } catch (error) {
    console.error('Помилка видалення поля:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;