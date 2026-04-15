const express = require('express');
const cors = require('cors');
require('dotenv').config();

const purchaseRoutes = require('./routes/purchases');
const inventoryRoutes = require('./routes/inventory');
const fieldRoutes = require('./routes/fields');
const applicationRoutes = require('./routes/applications');
const analyticsRoutes = require('./routes/analytics'); // НОВЕ

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Сервер працює!' });
});

app.use('/api/purchases', purchaseRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/fields', fieldRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/analytics', analyticsRoutes); // НОВЕ

app.listen(PORT, () => {
  console.log(`Сервер успішно запущено на порту ${PORT}`);
});