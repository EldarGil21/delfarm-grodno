const { Review } = require('../models');

exports.addReview = async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;
    const user_id = req.user.userId; // ID клиента из токена

    // Базовая валидация
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Рейтинг должен быть от 1 до 5' });
    }

    const newReview = await Review.create({
      product_id,
      user_id,
      rating,
      comment
    });

    res.status(201).json({ message: 'Отзыв успешно добавлен', review: newReview });
  } catch (error) {
    console.error('Ошибка при добавлении отзыва:', error);
    res.status(500).json({ message: 'Ошибка сервера при сохранении отзыва' });
  }
};