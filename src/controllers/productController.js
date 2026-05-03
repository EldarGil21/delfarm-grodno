const { Product, Category, Farm, Review, User } = require('../models');
const { Op } = require('sequelize'); 

// Получить все товары (ДЛЯ КАТАЛОГА КЛИЕНТА)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: {
        // Остаток строго больше нуля
        stock_quantity: {
          [Op.gt]: 0 
        }
      },
      include: [
        {
          model: Category,
          attributes: ['name']
        },
        {
          model: Farm,
          attributes: ['farm_name', 'user_id']
        }
      ],
      order: [['product_id', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('Ошибка при получении товаров:', error);
    res.status(500).json({ message: 'Ошибка сервера при получении списка товаров' });
  }
};

// Получить один товар по ID
exports.getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findByPk(id, {
      include: [
        { model: Category, attributes:['category_id', 'name', 'parent_id'] },
        { model: Farm, attributes:['farm_id', 'farm_name', 'description', 'logo_url'] },
        { 
          model: Review, 
          include:[{ model: User, attributes: ['full_name'] }] 
        }
      ],
      order: [[Review, 'created_at', 'DESC']]
    });

    if (!product) {
      return res.status(404).json({ message: 'Товар не найден' });
    }

    res.json(product);
  } catch (error) {
    console.error(`Ошибка при получении товара с ID ${req.params.id}:`, error);
    res.status(500).json({ message: 'Ошибка сервера при поиске товара' });
  }
};