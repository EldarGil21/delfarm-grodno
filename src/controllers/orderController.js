const { Order, Order_Items, Address, Product, sequelize } = require('../models');

// Создание заказа
exports.createOrder = async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user?.userId || req.body.userId;
    const { totalPrice, deliveryAddress, deliveryTime, items } = req.body;

    
    // 1. ПРОВЕРКА И СПИСАНИЕ ОСТАТКОВ ТОВАРОВ
    
    for (const item of items) {
      // Поиск товара в БД (с привязкой к текущей транзакции)
      const product = await Product.findByPk(item.product_id, { transaction: t });

      // Если товар вообще удален из базы
      if (!product) {
        await t.rollback();
        return res.status(404).json({ message: `Товар с ID ${item.product_id} не найден в базе` });
      }

      // Если товара не хватает на складе
      if (product.stock_quantity < item.quantity) {
        await t.rollback();
        return res.status(400).json({ 
          message: `Недостаточно товара на складе: ${product.name}. Доступно: ${product.stock_quantity}` 
        });
      }

      // Вычитание купленного количества
      product.stock_quantity -= item.quantity;
      
      // Сохранение обновленного товара в рамках транзакции
      await product.save({ transaction: t });
    }

    
    // 2. СОЗДАНИЕ ЗАКАЗА И ПОЗИЦИЙ
    
    
    // Создание адреса
    const newAddress = await Address.create({
      user_id: userId,
      address_line: deliveryAddress
    }, { transaction: t });

    // Создание заказа
    const newOrder = await Order.create({
      user_id: userId,
      address_id: newAddress.address_id,
      status: 'pending_payment',
      total_price: totalPrice,
    }, { transaction: t });

    // Создание позиции (Order Items)
    const orderItemsData = items.map(item => ({
      order_id: newOrder.order_id,
      product_id: item.product_id,
      quantity: item.quantity,
      price_per_unit: item.price
    }));

    await Order_Items.bulkCreate(orderItemsData, { transaction: t });

    
    // 3. ФИКСАЦИЯ ТРАНЗАКЦИИ
    
    await t.commit();

    res.status(201).json({ message: 'Заказ успешно создан', orderId: newOrder.order_id });
  } catch (error) {
    
    await t.rollback();
    console.error('Ошибка при создании заказа:', error);
    res.status(500).json({ message: 'Ошибка сервера при оформлении заказа' });
  }
};

// Получение истории заказов клиента
exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user.userId;

    const orders = await Order.findAll({
      where: { user_id: userId },
      include: [
        {
          model: Order_Items,
          include:[
            {
              model: Product,
              attributes: ['name', 'image_url', 'unit']
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    res.json(orders);
  } catch (error) {
    console.error('Ошибка при получении истории заказов:', error);
    res.status(500).json({ message: 'Ошибка сервера при загрузке заказов' });
  }
};