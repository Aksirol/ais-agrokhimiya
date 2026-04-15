const express = require('express');
const cors = require('cors');
require('dotenv').config();

const purchaseRoutes = require('./routes/purchases');
const inventoryRoutes = require('./routes/inventory'); // НОВЕ: Імпортуємо маршрут складу

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер працює!' });
});

app.use('/api/purchases', purchaseRoutes);
app.use('/api/inventory', inventoryRoutes); // НОВЕ: Підключаємо маршрут складу

app.listen(PORT, () => {
  console.log(`Сервер успішно запущено на порту ${PORT}`);
});