const { Farm, User, Review, Product } = require('../models');

// Получить список ферм, ожидающих верификации (status = 'pending')
exports.getPendingFarms = async (req, res) => {
  try {
    const pendingFarms = await Farm.findAll({
      where: { status: 'pending' },
      include:[
        {
          model: User,
          attributes:['full_name', 'email', 'phone_number']
        }
      ],
      order: [['farm_id', 'DESC']]
    });
    
    res.json(pendingFarms);
  } catch (error) {
    console.error('Ошибка получения заявок фермеров:', error);
    res.status(500).json({ message: 'Ошибка сервера при загрузке заявок' });
  }
};

// Изменить статус фермы (Одобрить / Отклонить)
exports.verifyFarm = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' или 'rejected'

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Неверный статус' });
    }

    const farm = await Farm.findByPk(id);
    if (!farm) {
      return res.status(404).json({ message: 'Фермерское хозяйство не найдено' });
    }

    farm.status = status;
    await farm.save();

    res.json({ message: `Статус хозяйства успешно изменен на ${status}`, farm });
  } catch (error) {
    console.error('Ошибка верификации фермы:', error);
    res.status(500).json({ message: 'Ошибка сервера при верификации' });
  }
};

// Получить все отзывы для модерации
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      include: [
        { model: User, attributes:['full_name', 'email'] }, // Автор отзыва
        { model: Product, attributes:['name', 'farm_id'] }  // К какому товару
      ],
      order: [['created_at', 'DESC']]
    });
    
    res.json(reviews);
  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error);
    res.status(500).json({ message: 'Ошибка сервера при загрузке отзывов' });
  }
};

// Удалить (отмодерировать) отзыв
exports.deleteReview = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Review.destroy({ where: { review_id: id } });
    
    if (!deleted) {
      return res.status(404).json({ message: 'Отзыв не найден' });
    }

    res.json({ message: 'Отзыв успешно удален' });
  } catch (error) {
    console.error('Ошибка удаления отзыва:', error);
    res.status(500).json({ message: 'Ошибка сервера при удалении отзыва' });
  }
};