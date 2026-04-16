const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // НОВЕ: імпортуємо бібліотеку
const prisma = new PrismaClient();

async function main() {
  // 1. Користувачі (Створюємо 3 різних ролі з однаковим паролем admin123)
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'ivan@agro.com' },
    update: { password: hashedPassword, role: 'admin' },
    create: { name: 'Іван Іванов', email: 'ivan@agro.com', password: hashedPassword, role: 'admin' }
  });

  const agronomist = await prisma.user.upsert({
    where: { email: 'petro@agro.com' },
    update: { password: hashedPassword, role: 'agronomist' },
    create: { name: 'Петро Агроном', email: 'petro@agro.com', password: hashedPassword, role: 'agronomist' }
  });

  const operator = await prisma.user.upsert({
    where: { email: 'olena@agro.com' },
    update: { password: hashedPassword, role: 'operator' },
    create: { name: 'Олена Склад', email: 'olena@agro.com', password: hashedPassword, role: 'operator' }
  });

  // Заміни змінну user на admin у створенні замовлення та використання
  // Наприклад, там де user_id: user.id -> user_id: admin.id

  // 2. Склад
  const warehouse = await prisma.warehouse.create({
    data: { name: 'Головний склад', zone: 'Ангар 1' }
  });

  // 3. Постачальники
  const suppliersData = [{ name: 'АгроХім Сервіс' }, { name: 'Зелений Лан' }];
  await prisma.supplier.createMany({ data: suppliersData });
  const suppliers = await prisma.supplier.findMany();

  // 4. Хімікат
  const chemical = await prisma.chemical.create({
    data: { name: 'Нітроамофоска', category: 'Добриво', base_unit: 'кг', purchase_unit: 'т', unit_factor: 1000 }
  });

  // 5. Залишки на складі
  const inventory = await prisma.inventory.create({
    data: { chemical_id: chemical.id, warehouse_id: warehouse.id, quantity: 500, min_threshold: 100 }
  });

  // 6. Замовлення
  await prisma.purchaseOrder.create({
    data: {
      supplier_id: suppliers[0].id, user_id: admin.id, order_date: new Date('2024-03-12'), total_amount: 25000, status: 'Отримано',
      orderItems: { create: [{ chemical_id: chemical.id, quantity: 500, purchase_unit: 'кг', price_per_unit: 50 }] }
    }
  });

  // 7. Створюємо Поле (НОВЕ)
  const field = await prisma.field.create({
    data: { name: 'Поле Північне', area_ha: 150, crop_type: 'Пшениця озима', location: 'Північний блок', season: '2024' }
  });

  // 8. Створюємо запис про використання (НОВЕ)
  await prisma.application.create({
    data: {
      chemical_id: chemical.id,
      field_id: field.id,
      user_id: admin.id,
      warehouse_id: warehouse.id,
      applied_date: new Date('2024-04-05'),
      quantity_used: 150, // Витратили 150 кг
      base_unit: 'кг',
      norm_per_ha: 1, // 1 кг на гектар
      purpose: 'Весняне підживлення'
    }
  });

  console.log('Тестові дані з полями успішно оновлено!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });