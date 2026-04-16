const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

// POST /api/auth/login - Вхід в систему
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Шукаємо користувача за email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ error: 'Користувача з таким email не знайдено' });
    }

    // 2. Перевіряємо, чи співпадає пароль
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Невірний пароль' });
    }

    // 3. Створюємо JWT токен (перепустку)
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Токен діє 1 день
    );

    // Відправляємо токен і дані користувача (без пароля) на фронтенд
    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Помилка авторизації:', error);
    res.status(500).json({ error: 'Помилка сервера' });
  }
});

module.exports = router;