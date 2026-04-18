const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // ВИПРАВЛЕНО: bcrypt -> bcryptjs

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Початок роботи seed-скрипта...');

  if (process.env.NODE_ENV === 'production') {
    console.warn('⚠️ Seed-скрипт заблоковано в Production.');
    process.exit(0);
  }

  console.log('🧹 Очищення бази...');
  await prisma.inventoryMovement.deleteMany();
  await prisma.application.deleteMany();
  // ВИПРАВЛЕНО: прибрано prisma.orderItem.deleteMany() — не існує як властивість.
  // OrderItem видаляється автоматично через onDelete: Cascade при видаленні PurchaseOrder.
  await prisma.purchaseOrder.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.chemical.deleteMany();
  await prisma.field.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.user.deleteMany();

  console.log('👥 Створення користувачів...');
  const defaultPassword = process.env.SEED_PASSWORD || 'admin123';
  const hashedPassword = await bcrypt.hash(defaultPassword, 10);

  const admin = await prisma.user.create({ data: { name: 'Іван Директор', email: 'ivan@agro.com', password: hashedPassword, role: 'admin' } });
  const agronomist = await prisma.user.create({ data: { name: 'Петро Агроном', email: 'petro@agro.com', password: hashedPassword, role: 'agronomist' } });
  const operator = await prisma.user.create({ data: { name: 'Олена Комірник', email: 'olena@agro.com', password: hashedPassword, role: 'operator' } });

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
    prisma.warehouse.create({ data: { name: 'Склад ЗЗР (Рідкі)', zone: 'Зона Б (Темна)' } })
  ]);

  const fields = await Promise.all([
    prisma.field.create({ data: { name: 'Лан-1', crop_type: 'Пшениця озима', area_ha: 120, season: '2024' } }),
    prisma.field.create({ data: { name: 'Лан-2', crop_type: 'Пшениця озима', area_ha: 85, season: '2024' } }),
    prisma.field.create({ data: { name: 'Степове', crop_type: 'Соняшник', area_ha: 150, season: '2024' } }),
    prisma.field.create({ data: { name: 'Сонячне', crop_type: 'Соняшник', area_ha: 90, season: '2024' } }),
    prisma.field.create({ data: { name: 'Лісове', crop_type: 'Кукурудза', area_ha: 210, season: '2024' } }),
    prisma.field.create({ data: { name: 'Яр', crop_type: 'Ріпак', area_ha: 65, season: '2024' } })
  ]);

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

  console.log('📦 Наповнення складів...');
  const inventory = [];

  // ВИПРАВЛЕНО (БАГ-1): залишки узгоджені з рухами товарів:
  // inventory[0] Карбамід:   IN 5000 (order1) - OUT 1200 (app1) = 3800 кг
  // inventory[4] Раундап:    IN 150  (order2) - OUT 50   (app2)  = 100 л
  // inventory[1..3, 5..7]:   рухів немає, залишок = початковий
  // inventory[8..13]:        нові позиції з нульовим залишком (ще не надходили)
  const quantities  = [3800, 200, 45, 800, 100, 500, 15, 600, 0, 0, 0, 0, 0, 0];
  const thresholds  = [500,  100, 50, 200,  50, 100, 30, 200, 50, 50, 50, 50, 50, 50];

  for (let i = 0; i < chemicals.length; i++) {
    inventory.push(await prisma.inventory.create({
      data: {
        chemical_id:   chemicals[i].id,
        warehouse_id:  warehouses[i % 2].id,
        quantity:      quantities[i],
        min_threshold: thresholds[i]
      }
    }));
  }

  console.log('🛒 Генерація історії закупівель...');
  const pastDate1 = new Date(); pastDate1.setMonth(pastDate1.getMonth() - 2);
  const pastDate2 = new Date(); pastDate2.setMonth(pastDate2.getMonth() - 1);

  // Замовлення 1: адмін, отримано, заблоковано
  const order1 = await prisma.purchaseOrder.create({
    data: {
      supplier_id: suppliers[0].id, user_id: admin.id, order_date: pastDate1,
      total_amount: 150000, status: 'RECEIVED', is_locked: true,
      orderItems: { create: [{ chemical_id: chemicals[0].id, quantity: 5000, purchase_unit: 'кг', price_per_unit: 30 }] }
    }
  });

  // Замовлення 2: ВИПРАВЛЕНО (ЛОГ-1): user_id -> admin.id (агроном не може отримати товар)
  const order2 = await prisma.purchaseOrder.create({
    data: {
      supplier_id: suppliers[1].id, user_id: admin.id, order_date: pastDate2,
      total_amount: 45000, status: 'RECEIVED', is_locked: true,
      orderItems: { create: [{ chemical_id: chemicals[4].id, quantity: 150, purchase_unit: 'л', price_per_unit: 300 }] }
    }
  });

  // Замовлення 3: агроном подав заявку — з'явиться у жовтих сповіщеннях дашборду
  await prisma.purchaseOrder.create({
    data: {
      supplier_id: suppliers[2].id, user_id: agronomist.id, order_date: new Date(),
      total_amount: 82000, status: 'PENDING', is_locked: false,
      orderItems: { create: [{ chemical_id: chemicals[8].id, quantity: 100, purchase_unit: 'л', price_per_unit: 820 }] }
    }
  });

  console.log('🚜 Генерація робіт на полях...');

  // Завершене використання (кількість = фактична витрата, без повернення)
  const app1 = await prisma.application.create({
    data: {
      chemical_id: chemicals[0].id, field_id: fields[0].id, user_id: agronomist.id,
      warehouse_id: warehouses[0].id, applied_date: pastDate2,
      quantity_used: 1200, base_unit: 'кг', norm_per_ha: 10,
      purpose: 'Весняне підживлення', status: 'COMPLETED'
    }
  });

  // Активне використання (ще в процесі)
  const app2 = await prisma.application.create({
    data: {
      chemical_id: chemicals[4].id, field_id: fields[2].id, user_id: agronomist.id,
      warehouse_id: warehouses[1].id, applied_date: new Date(),
      quantity_used: 50, base_unit: 'л', norm_per_ha: 2.5,
      purpose: 'Десикація', status: 'IN_PROGRESS'
    }
  });

  console.log('📝 Створення журналів руху (аудит)...');
  await prisma.inventoryMovement.createMany({
    data: [
      { inventory_id: inventory[0].id, type: 'IN',  quantity: 5000, source_order_id: order1.id,       user_id: operator.id   },
      { inventory_id: inventory[4].id, type: 'IN',  quantity: 150,  source_order_id: order2.id,       user_id: operator.id   },
      { inventory_id: inventory[0].id, type: 'OUT', quantity: 1200, source_application_id: app1.id,   user_id: agronomist.id },
      // ВИПРАВЛЕНО (БАГ-1, ЛОГ-2): додано OUT для app2 (Раундап -50)
      { inventory_id: inventory[4].id, type: 'OUT', quantity: 50,   source_application_id: app2.id,   user_id: agronomist.id }
    ]
  });

  console.log('✅ Базу даних успішно заповнено та синхронізовано!');
  console.log('');
  console.log('📊 Підсумок залишків (має збігатись зі складом):');
  console.log('   Карбамід (inventory[0]):  IN 5000 - OUT 1200 = 3800 кг');
  console.log('   Раундап  (inventory[4]):  IN 150  - OUT 50   = 100 л');
}

main()
  .catch(e => { console.error('❌ Помилка:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });