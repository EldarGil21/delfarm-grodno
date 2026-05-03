// seed.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { sequelize, User, Farm, Category, Product, Review } = require('./src/models');

const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

const seedDatabase = async () => {
  try {
    console.log('Начинаем полную переинициализацию базы данных...');

    // 1. Полная очистка таблиц (DROP и CREATE)
    await sequelize.sync({ force: true });
    console.log('База данных очищена.');

    const commonPassword = await hashPassword('password123');

    // 2. Создание пользователей
    console.log('Создание пользователей...');
    const users = await User.bulkCreate([
      {
        email: 'df_admin@gmail.com',
        password_hash: commonPassword,
        full_name: 'Александр Админ',
        role: 'admin'
      },
      {
        email: 'farmer_ivan@gmail.com',
        password_hash: commonPassword,
        full_name: 'Иван Полевой',
        phone_number: '+375291112233',
        role: 'farmer'
      },
      {
        email: 'farmer_maria@gmail.com',
        password_hash: commonPassword,
        full_name: 'Мария Молочникова',
        phone_number: '+375294445566',
        role: 'farmer'
      },
      {
        email: 'client_alex@gmail.com',
        password_hash: commonPassword,
        full_name: 'Алексей Клиентов',
        phone_number: '+375297778899',
        role: 'client'
      }
    ], { returning: true });

    // 3. Создание фермерских хозяйств
    console.log('Создание фермерских хозяйств...');
    const farms = await Farm.bulkCreate([
      {
        user_id: users[1].user_id, // Иван
        farm_name: 'Городенский Сад',
        description: 'Наше хозяйство специализируется на выращивании экологически чистых фруктов и овощей. Мы используем только натуральные удобрения и традиционные методы земледелия.',
        logo_url: 'https://plus.unsplash.com/premium_photo-1661860582550-548368e7e61e?q=80&w=1186&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        status: 'approved'
      },
      {
        user_id: users[2].user_id, // Мария
        farm_name: 'Хуторок У Репина',
        description: 'Семейная ферма с 20-летней историей. Мы гордимся нашими молочными продуктами и мясными деликатесами, приготовленными по старинным рецептам Гродненской области.',
        logo_url: 'https://plus.unsplash.com/premium_photo-1663076394767-d77cec2b327c?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        status: 'approved'
      }
    ], { returning: true });

    // 4. Создание категорий
    console.log('Создание категорий...');
    const categories = await Category.bulkCreate([
      { name: 'Овощи' },            // id: 1
      { name: 'Фрукты' },           // id: 2
      { name: 'Молочные продукты' }, // id: 3
      { name: 'Мясо' },             // id: 4
      { name: 'Мед' }               // id: 5
    ], { returning: true });

    // 5. Создание товаров
    console.log('Наполнение товарами...');
    const productsData = [
      // Товары Городенского Сада (farm_id: 1)
      {
        farm_id: farms[0].farm_id,
        category_id: categories[1].category_id, // Фрукты
        name: 'Яблоки "Уэлси"',
        description: 'Сочные, хрустящие и очень сладкие яблоки осеннего сбора.',
        price: 3.20,
        unit: 'кг',
        stock_quantity: 250,
        image_url: 'https://images.unsplash.com/photo-1700460710625-a413d384d7c9?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        farm_id: farms[0].farm_id,
        category_id: categories[0].category_id, // Овощи
        name: 'Томаты Розовые',
        description: 'Мясистые домашние томаты с тонкой кожицей.',
        price: 7.50,
        unit: 'кг',
        stock_quantity: 45,
        image_url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'
      },
      {
        farm_id: farms[0].farm_id,
        category_id: categories[0].category_id, // Овощи
        name: 'Огурцы "Родничок"',
        description: 'Маленькие, колючие и очень ароматные огурчики для салатов.',
        price: 4.80,
        unit: 'кг',
        stock_quantity: 60,
        image_url: 'https://images.unsplash.com/photo-1568584711271-6c929fb49b60?q=80&w=1172&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      // Товары Хуторка У Репина (farm_id: 2)
      {
        farm_id: farms[1].farm_id,
        category_id: categories[2].category_id, // Молочное
        name: 'Творог Домашний 9%',
        description: 'Зернистый творог из цельного коровьего молока без добавок.',
        price: 9.60,
        unit: 'кг',
        stock_quantity: 15,
        image_url: 'https://images.unsplash.com/photo-1777301401075-739121f0315f?q=80&w=1123&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        farm_id: farms[1].farm_id,
        category_id: categories[3].category_id, // Мясо
        name: 'Свиная вырезка',
        description: 'Нежнейшее охлажденное мясо. Без ГМО и гормонов роста.',
        price: 18.50,
        unit: 'кг',
        stock_quantity: 12,
        image_url: 'https://images.unsplash.com/photo-1700137806109-8b762a0bac0a?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      },
      {
        farm_id: farms[1].farm_id,
        category_id: categories[2].category_id, // Молочное
        name: 'Сыр "Городенский Крафт"',
        description: 'Твердый сыр со сроком созревания 3 месяца. Имеет ореховое послевкусие.',
        price: 32.00,
        unit: 'кг',
        stock_quantity: 8,
        image_url: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?auto=format&fit=crop&w=800&q=80'
      },
      {
        farm_id: farms[1].farm_id,
        category_id: categories[4].category_id, // Мед
        name: 'Луговой мед 2025',
        description: 'Натуральный мед с пасеки, расположенной в лесах Августовского канала.',
        price: 14.00,
        unit: 'кг',
        stock_quantity: 20,
        image_url: 'https://plus.unsplash.com/premium_photo-1726826660959-0c8610396059?q=80&w=1050&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
      }
    ];

    const products = await Product.bulkCreate(productsData, { returning: true });

    // 6. Создание отзывов
    console.log('Создание отзывов...');
    await Review.bulkCreate([
      {
        product_id: products[0].product_id, // Яблоки
        user_id: users[3].user_id, // Алексей
        rating: 5,
        comment: 'Очень сочные яблоки! Дети в восторге. Будем заказывать еще.'
      },
      {
        product_id: products[3].product_id, // Творог
        user_id: users[3].user_id, // Алексей
        rating: 4,
        comment: 'Творог свежий, но жирноват для меня. Качество отличное.'
      }
    ]);

    console.log('БАЗА ДАННЫХ УСПЕШНО НАПОЛНЕНА!');
    console.log('--------------------------------------------------');
    console.log('Логины / пароли для теста:');
    console.log('Админ: df_admin@gmail.com / password123');
    console.log('Фермер 1: farmer_ivan@gmail.com / password123');
    console.log('Фермер 2: farmer_maria@gmail.com / password123');
    console.log('Клиент: client_alex@gmail.com / password123');
    console.log('--------------------------------------------------');

    process.exit(0);

  } catch (error) {
    console.error('Ошибка при наполнении базы:', error);
    process.exit(1);
  }
};

seedDatabase();