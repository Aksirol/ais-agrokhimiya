const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Створюємо тестового користувача
  const user = await prisma.user.upsert({
    where: { email: 'ivan@agro.com' },
    update: {},
    create: { name: 'Іван Іванов', email: 'ivan@agro.com', role: 'admin' }
  });

  // 2. Створюємо склад
  const warehouse = await prisma.warehouse.create({
    data: { name: 'Головний склад', zone: 'Ангар 1' }
  });

  // 3. Створюємо постачальників
  const suppliersData = [
    { name: 'АгроХім Сервіс' },
    { name: 'Зелений Лан' },
    { name: 'Агросвіт' },
    { name: 'ЕкоФарм' }
  ];
  await prisma.supplier.createMany({ data: suppliersData });
  const suppliers = await prisma.supplier.findMany();

  // 4. Створюємо тестовий хімікат
  const chemical = await prisma.chemical.create({
    data: { name: 'Нітроамофоска', category: 'Добриво', base_unit: 'кг', purchase_unit: 'т', unit_factor: 1000 }
  });

  // 5. Додаємо хімікат на склад (Залишки)
  await prisma.inventory.create({
    data: {
      chemical_id: chemical.id,
      warehouse_id: warehouse.id,
      quantity: 500,
      min_threshold: 100
    }
  });

  // 6. Створюємо замовлення
  await prisma.purchaseOrder.create({
    data: {
      supplier_id: suppliers[0].id,
      user_id: user.id,
      order_date: new Date('2024-03-12'),
      total_amount: 25000,
      status: 'Отримано',
      orderItems: {
        create: [{ chemical_id: chemical.id, quantity: 500, purchase_unit: 'кг', price_per_unit: 50 }]
      }
    }
  });

  console.log('Тестові дані успішно оновлено!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });