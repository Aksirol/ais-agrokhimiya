const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authorizeRoles } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Функція для обробки помилок зв'язків бази даних
const handleError = (res, error) => {
  if (error.code === 'P2003') {
    return res.status(400).json({ error: 'Неможливо видалити: запис вже використовується в системі (на складі або в замовленнях).' });
  }
  console.error(error);
  res.status(500).json({ error: 'Помилка сервера' });
};

// ==================== ХІМІКАТИ ====================
router.get('/chemicals', async (req, res) => {
  try {
    const data = await prisma.chemical.findMany({ orderBy: { name: 'asc' } });
    res.json(data);
  } catch (err) { handleError(res, err); }
});

router.post('/chemicals', authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, category, base_unit } = req.body;
    const newItem = await prisma.chemical.create({
      data: { name, category, base_unit, purchase_unit: base_unit, unit_factor: 1 }
    });
    res.status(201).json(newItem);
  } catch (err) { handleError(res, err); }
});

router.delete('/chemicals/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    await prisma.chemical.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Видалено' });
  } catch (err) { handleError(res, err); }
});

// ==================== СКЛАДИ ====================
router.get('/warehouses', async (req, res) => {
  try {
    const data = await prisma.warehouse.findMany({ orderBy: { name: 'asc' } });
    res.json(data);
  } catch (err) { handleError(res, err); }
});

router.post('/warehouses', authorizeRoles('admin'), async (req, res) => {
  try {
    const { name, zone } = req.body;
    const newItem = await prisma.warehouse.create({ data: { name, zone } });
    res.status(201).json(newItem);
  } catch (err) { handleError(res, err); }
});

router.delete('/warehouses/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    await prisma.warehouse.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Видалено' });
  } catch (err) { handleError(res, err); }
});

// ==================== ПОСТАЧАЛЬНИКИ ====================
router.get('/suppliers', async (req, res) => {
  try {
    const data = await prisma.supplier.findMany({ orderBy: { name: 'asc' } });
    res.json(data);
  } catch (err) { handleError(res, err); }
});

router.post('/suppliers', authorizeRoles('admin'), async (req, res) => {
  try {
    const { name } = req.body;
    const newItem = await prisma.supplier.create({ data: { name } });
    res.status(201).json(newItem);
  } catch (err) { handleError(res, err); }
});

router.delete('/suppliers/:id', authorizeRoles('admin'), async (req, res) => {
  try {
    await prisma.supplier.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Видалено' });
  } catch (err) { handleError(res, err); }
});

module.exports = router;