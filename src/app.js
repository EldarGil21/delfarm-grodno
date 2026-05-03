require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');


// 1. ИМПОРТ ВСЕХ МАРШРУТОВ

const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const authRoutes = require('./routes/authRoutes');
const farmerRoutes = require('./routes/farmerRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const adminRoutes = require('./routes/adminRoutes');


// 2. ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ

const app = express();
const PORT = process.env.PORT || 5000;


// 3. БАЗОВЫЕ MIDDLEWARE

app.use(cors());
app.use(express.json());

// Тестовый маршрут для проверки работоспособности
app.get('/', (req, res) => {
  res.send('API FarmFood работает!');
});


// 4. ПОДКЛЮЧЕНИЕ МАРШРУТОВ К API

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/farmer', farmerRoutes);
app.use('/api/reviews', reviewRoutes); 
app.use('/api/admin', adminRoutes);


// 5. ЗАПУСК СЕРВЕРА

const start = async () => {
  try {
    // Проверка подключения к БД
    await sequelize.authenticate();
    console.log('Успешное подключение к базе данных PostgreSQL.'); 
    
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Ошибка подключения к базе данных:', error);
  }
};

start();