const { PrismaClient } = require('@prisma/client');

// Створюємо єдиний екземпляр PrismaClient
const prisma = global.prisma || new PrismaClient();

// Уникаємо створення нових підключень при гарячому перезавантаженні (Nodemon)
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

module.exports = prisma;