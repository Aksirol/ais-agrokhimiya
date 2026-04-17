const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Початок роботи seed-скрипта...');

  // 1. ЗАХИСТ ПРОДАКШЕНУ
  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ ПОПЕРЕДЖЕННЯ: Seed-скрипт заблоковано в Production-середовищі для безпеки даних.');
    process.exit(0);
  }
  const defaultPassword = process.env.SEED_PASSWORD || 'admin123';

  // 2. ОЧИЩЕННЯ БАЗИ ДАНИХ (в правильному порядку для уникнення помилок зовнішніх ключів)
  console.log('🧹 Очищення старих даних...');
  await prisma.inventoryMovement.deleteMany();
  await prisma.application.deleteMany();
  await prisma.purchaseOrderItem.deleteMany();
  await prisma.purchaseOrder.deleteMany();
  await prisma.inventory.deleteMany();
  
  await prisma.chemical.deleteMany();
  await prisma.field.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  // 3. ГЕНЕРАЦІЯ КОРИСТУВАЧІВ
  console.log('👥 Створення користувачів...');
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.user.create({
    data: { name: 'Іван Директор', email: 'ivan@agro.com', password: hashedPassword, role: 'admin' }
  });

  const agronomist = await prisma.user.create({
    data: { name: 'Петро Агроном', email: 'petro@agro.com', password: hashedPassword, role: 'agronomist' }
  });

  const operator = await prisma.user.create({
    data: { name: 'Олена Комірник', email: 'olena@agro.com', password: hashedPassword, role: 'operator' }
  });

  // 4. СТВОРЕННЯ ДОВІДНИКІВ
  console.log('📖 Заповнення довідників...');
  
  const suppliers = await Promise.all([
    prisma.supplier.create({ data: { name: 'ТОВ "Сингента Україна"' } }),
    prisma.supplier.create({ data: { name: 'Байєр Агрософт' } }),
    prisma.supplier.create({ data: { name: 'ПрАТ "УкрАгроХім"' } }),
    prisma.supplier.create({ data: { name: 'Агро-Трейд Плюс' } }),
    prisma.supplier.create({ data: { name: 'ALFA Smart Agro' } })
  ]);

  const warehouses = await Promise.all([
    prisma.warehouse.create({ data: { name: 'Головний склад', zone: 'Зона А (Суха)' } }),
    prisma.warehouse.create({ data: { name: 'Склад ЗЗР (Рідкі)', zone: 'Зона Б (Темна)' } }),
    prisma.warehouse.create({ data: { name: 'Ангар №3', zone: 'Транзитна' } })
  ]);

  const fields = await Promise.all([
    prisma.field.create({ data: { name: 'Лан-1', crop_type: 'Пшениця озима', area_ha: 120 } }),
    prisma.field.create({ data: { name: 'Лан-2', crop_type: 'Пшениця озима', area_ha: 85 } }),
    prisma.field.create({ data: { name: 'Степове', crop_type: 'Соняшник', area_ha: 150 } }),
    prisma.field.create({ data: { name: 'Сонячне', crop_type: 'Соняшник', area_ha: 90 } }),
    prisma.field.create({ data: { name: 'Лісове', crop_type: 'Кукурудза', area_ha: 210 } }),
    prisma.field.create({ data: { name: 'Яр', crop_type: 'Ріпак', area_ha: 65 } })
  ]);

  // Величезний список хімікатів
  const chemicalsData = [
    { name: 'Карбамід (Сечовина)', category: 'Добриво', base_unit: 'кг', purchase_unit: 'т', unit_factor: 1000 },
    { name: 'Аміачна селітра', category: 'Добриво', base_unit: 'кг', purchase_unit: 'т', unit_factor: 1000 },
    { name: 'Нітроамофоска 16:16:16', category: 'Добриво', base_unit: 'кг', purchase_unit: 'т', unit_factor: 1000 },
    { name: 'Гумат Калію', category: 'Добриво', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Раундап Макс', category: 'Гербіцид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Ураган Форте', category: 'Гербіцид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Євро-Лайтнінг', category: 'Гербіцид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Пріма', category: 'Гербіцид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Амістар Екстра', category: 'Фунгіцид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Коронет', category: 'Фунгіцид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Фалькон', category: 'Фунгіцид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Енжіо', category: 'Інсектицид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Карате Зеон', category: 'Інсектицид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 },
    { name: 'Кораген', category: 'Інсектицид', base_unit: 'л', purchase_unit: 'л', unit_factor: 1 }
  ];

  const chemicals = [];
  for (const c of chemicalsData) {
    chemicals.push(await prisma.chemical.create({ data: c }));
  }

  // 5. НАПОВНЕННЯ СКЛАДУ (Inventory)
  console.log('📦 Наповнення складів...');
  const inventory = [];
  for (let i = 0; i < 8; i++) {
    inventory.push(await prisma.inventory.create({
      data: {
        chemical_id: chemicals[i].id,
        warehouse_id: warehouses[i % 2].id,
        quantity: [1500, 200, 45, 800, 30, 500, 15, 600][i], // Різні кількості (деякі будуть "Критично")
        min_threshold: [500, 100, 50, 200, 50, 100, 30, 200][i]
      }
    }));
  }

  // 6. ІСТОРІЯ ЗАКУПІВЕЛЬ
  console.log('🛒 Генерація історії закупівель...');
  const pastDate1 = new Date(); pastDate1.setMonth(pastDate1.getMonth() - 2);
  const pastDate2 = new Date(); pastDate2.setMonth(pastDate2.getMonth() - 1);

  // Замовлення 1 (Отримано)
  const order1 = await prisma.purchaseOrder.create({
    data: {
      supplier_id: suppliers[0].id, user_id: admin.id, order_date: pastDate1,
      total_amount: 150000, status: 'RECEIVED', is_locked: true,
      orderItems: { create: [{ chemical_id: chemicals[0].id, quantity: 5000, purchase_unit: 'кг', price_per_unit: 30 }] }
    }
  });

  // Замовлення 2 (Отримано)
  const order2 = await prisma.purchaseOrder.create({
    data: {
      supplier_id: suppliers[1].id, user_id: agronomist.id, order_date: pastDate2,
      total_amount: 45000, status: 'RECEIVED', is_locked: true,
      orderItems: { create: [{ chemical_id: chemicals[4].id, quantity: 150, purchase_unit: 'л', price_per_unit: 300 }] }
    }
  });

  // Замовлення 3 (Очікує - для сповіщень на дашборді)
  await prisma.purchaseOrder.create({
    data: {
      supplier_id: suppliers[2].id, user_id: agronomist.id, order_date: new Date(),
      total_amount: 82000, status: 'PENDING', is_locked: false,
      orderItems: { create: [{ chemical_id: chemicals[8].id, quantity: 100, purchase_unit: 'л', price_per_unit: 820 }] }
    }
  });

  // 7. ЖУРНАЛ ВИКОРИСТАННЯ
  console.log('🚜 Генерація робіт на полях...');
  
  // Завершене списання
  const app1 = await prisma.application.create({
    data: {
      chemical_id: chemicals[0].id, field_id: fields[0].id, user_id: agronomist.id, warehouse_id: warehouses[0].id,
      applied_date: pastDate2, quantity_used: 1200, base_unit: 'кг', norm_per_ha: 10, purpose: 'Весняне підживлення', status: 'COMPLETED'
    }
  });

  // Активне списання
  await prisma.application.create({
    data: {
      chemical_id: chemicals[4].id, field_id: fields[2].id, user_id: agronomist.id, warehouse_id: warehouses[1].id,
      applied_date: new Date(), quantity_used: 50, base_unit: 'л', norm_per_ha: 2.5, purpose: 'Десикація', status: 'IN_PROGRESS'
    }
  });

  // 8. ЗАПИСИ В INVENTORY MOVEMENT (Логи рухів)
  console.log('📝 Створення журналів руху (аудит)...');
  await prisma.inventoryMovement.createMany({
    data: [
      { inventory_id: inventory[0].id, type: 'IN', quantity: 5000, source_order_id: order1.id, user_id: operator.id },
      { inventory_id: inventory[4].id, type: 'IN', quantity: 150, source_order_id: order2.id, user_id: operator.id },
      { inventory_id: inventory[0].id, type: 'OUT', quantity: 1200, source_application_id: app1.id, user_id: agronomist.id }
    ]
  });

  console.log('✅ Базу даних успішно заповнено!');
}

main()
  .catch(e => {
    console.error('❌ Помилка під час виконання seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });