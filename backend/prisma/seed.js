const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Користувач
  const user = await prisma.user.upsert({
    where: { email: 'ivan@agro.com' },
    update: {},
    create: { name: 'Іван Іванов', email: 'ivan@agro.com', role: 'admin' }
  });

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
      supplier_id: suppliers[0].id, user_id: user.id, order_date: new Date('2024-03-12'), total_amount: 25000, status: 'Отримано',
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
      user_id: user.id,
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