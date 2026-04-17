const express = require('express');
const cors = require('cors');
require('dotenv').config();

const purchaseRoutes = require('./routes/purchases');
const inventoryRoutes = require('./routes/inventory');
const fieldRoutes = require('./routes/fields');
const applicationRoutes = require('./routes/applications');
const analyticsRoutes = require('./routes/analytics'); // НОВЕ
const authRoutes = require('./routes/auth');
const dictionariesRoutes = require('./routes/dictionaries');

const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

const corsOptions = {
  // У продакшені сюди підставиться реальний домен сайту, а локально дозволяємо localhost
  origin: process.env.FRONTEND_URL || 'http://localhost',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер працює!' });
});

app.use('/api/purchases', authenticateToken, purchaseRoutes);
app.use('/api/inventory', authenticateToken, inventoryRoutes);
app.use('/api/fields', authenticateToken, fieldRoutes);
app.use('/api/applications', authenticateToken, applicationRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/dictionaries', authenticateToken, dictionariesRoutes);

app.listen(PORT, () => {
  console.log(`Сервер успішно запущено на порту ${PORT}`);
});