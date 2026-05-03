const { Farm, Product, Order, Order_Items, User, Category } = require('../models');

// --- ВСПОМОГАТЕЛЬНАЯ ФУНКЦИЯ ---
// Возвращает весь объект фермы (чтобы можно было проверить статус)
const getFarm = async (userId) => {
  const farm = await Farm.findOne({ where: { user_id: userId } });
  if (!farm) throw new Error('Профиль фермы не найден');
  return farm;
};


// 1. ДАШБОРД (Доступен всем фермерам, чтобы узнать статус)

exports.getDashboardStats = async (req, res) => {
  try {
    const farm = await getFarm(req.user.userId);
    const farmId = farm.farm_id;

    // Рассчет статистики (для pending она просто будет по нулям, так как товаров еще нет)
    const outOfStockCount = await Product.count({ where: { farm_id: farmId, stock_quantity: 0 } });

    const orderItems = await Order_Items.findAll({
      include:[
        { model: Product, where: { farm_id: farmId }, attributes: [] },
        { model: Order, include:[{ model: User, attributes: ['full_name'] }] }
      ]
    });

    const farmOrdersMap = {};
    let totalRevenue = 0;
    let activeClientsSet = new Set();

    orderItems.forEach(item => {
      const order = item.Order;
      if (!order) return;
      const itemTotal = parseFloat(item.price_per_unit) * item.quantity;

      if (order.status === 'completed') totalRevenue += itemTotal;
      if (order.status !== 'cancelled') activeClientsSet.add(order.user_id);

      if (!farmOrdersMap[order.order_id]) {
        farmOrdersMap[order.order_id] = {
          order_id: order.order_id,
          created_at: order.created_at,
          status: order.status,
          client_name: order.User.full_name,
          farm_total: 0
        };
      }
      farmOrdersMap[order.order_id].farm_total += itemTotal;
    });

    const allFarmOrders = Object.values(farmOrdersMap);
    allFarmOrders.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const newOrdersCount = allFarmOrders.filter(o => o.status === 'pending_payment' || o.status === 'paid').length;
    const recentOrders = allFarmOrders.slice(0, 5);

    res.json({ 
      farmStatus: farm.status,
      newOrdersCount, 
      totalRevenue: totalRevenue.toFixed(2), 
      outOfStockCount, 
      activeClientsCount: activeClientsSet.size, 
      recentOrders 
    });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Ошибка сервера' });
  }
};


// 2. УПРАВЛЕНИЕ ТОВАРАМИ

exports.getProducts = async (req, res) => {
  try {
    const farm = await getFarm(req.user.userId);
    if (farm.status !== 'approved') return res.status(403).json({ message: 'Аккаунт фермера еще не верифицирован' });

    const products = await Product.findAll({
      where: { farm_id: farm.farm_id },
      include:[{ model: Category, attributes: ['name'] }],
      order: [['product_id', 'DESC']]
    });
    res.json(products);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const farm = await getFarm(req.user.userId);
    if (farm.status !== 'approved') return res.status(403).json({ message: 'Аккаунт фермера еще не верифицирован' });

    const { name, description, price, unit, stock_quantity, category_id, image_url } = req.body;
    const newProduct = await Product.create({
      farm_id: farm.farm_id, category_id, name, description, price, unit, stock_quantity: stock_quantity || 0, image_url
    });
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const farm = await getFarm(req.user.userId);
    if (farm.status !== 'approved') return res.status(403).json({ message: 'Аккаунт фермера еще не верифицирован' });

    const { id } = req.params;
    const product = await Product.findOne({ where: { product_id: id, farm_id: farm.farm_id } });
    if (!product) return res.status(404).json({ message: 'Товар не найден' });

    await product.update(req.body);
    res.json({ message: 'Товар обновлен', product });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const farm = await getFarm(req.user.userId);
    if (farm.status !== 'approved') return res.status(403).json({ message: 'Аккаунт фермера еще не верифицирован' });

    const deleted = await Product.destroy({ where: { product_id: req.params.id, farm_id: farm.farm_id } });
    if (!deleted) return res.status(404).json({ message: 'Товар не найден' });
    res.json({ message: 'Товар удален' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};


// 3. УПРАВЛЕНИЕ ЗАКАЗАМИ

exports.getFarmerOrders = async (req, res) => {
  try {
    const farm = await getFarm(req.user.userId);
    if (farm.status !== 'approved') return res.status(403).json({ message: 'Аккаунт фермера еще не верифицирован' });

    const orders = await Order.findAll({
      include:[
        { model: User, attributes: ['full_name', 'phone_number'] },
        {
          model: Order_Items,
          required: true, 
          include:[ { model: Product, where: { farm_id: farm.farm_id }, attributes: ['name', 'unit'] } ]
        }
      ],
      order: [['created_at', 'DESC']]
    });

    const formattedOrders = orders.map(order => {
      let farmTotal = 0;
      const items = order.Order_Items.map(item => {
        farmTotal += parseFloat(item.price_per_unit) * item.quantity;
        return {
          item_id: item.order_item_id,
          name: item.Product.name,
          unit: item.Product.unit,
          quantity: item.quantity,
          price: item.price_per_unit
        };
      });

      return {
        order_id: order.order_id,
        status: order.status,
        created_at: order.created_at,
        client_name: order.User.full_name,
        client_phone: order.User.phone_number,
        farm_total: farmTotal.toFixed(2),
        items: items
      };
    });

    res.json(formattedOrders);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Ошибка загрузки заказов' });
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const farm = await getFarm(req.user.userId);
    if (farm.status !== 'approved') return res.status(403).json({ message: 'Аккаунт фермера еще не верифицирован' });

    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ message: 'Заказ не найден' });

    const hasFarmerItems = await Order_Items.findOne({
      where: { order_id: id },
      include:[{ model: Product, where: { farm_id: farm.farm_id }, required: true }]
    });

    if (!hasFarmerItems) return res.status(403).json({ message: 'Нет доступа к этому заказу' });

    order.status = status;
    await order.save();

    res.json({ message: 'Статус заказа обновлен', order });
  } catch (error) {
    res.status(400).json({ message: error.message || 'Ошибка обновления статуса' });
  }
};


// 4. ПУБЛИЧНОЕ API (Для всех пользователей)
// Получить список всех одобренных фермерских хозяйств
exports.getPublicFarms = async (req, res) => {
  try {
    const farms = await Farm.findAll({
      where: { status: 'approved' },
      include: [
        {
          model: User,
          attributes:['full_name']
        }
      ],
      order: [['farm_id', 'ASC']] // Можно сортировать по ID или названию
    });

    res.json(farms);
  } catch (error) {
    console.error('Ошибка при получении публичного списка ферм:', error);
    res.status(500).json({ message: 'Ошибка сервера при загрузке списка фермеров' });
  }
};