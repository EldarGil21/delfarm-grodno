const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Farm, sequelize } = require('../models');

// Регистрация
exports.register = async (req, res) => {
  // 1. Открытие транзакции
  const t = await sequelize.transaction();

  try {
    const { email, password, full_name, phone_number, role, farm_name } = req.body;

    // ЖЕСТКАЯ ПРОВЕРКА РОЛИ (защита от создания admin через API)
    const safeRole = (role === 'farmer') ? 'farmer' : 'client';

    // 2. Проверка, не занят ли email
    const existingUser = await User.findOne({ where: { email }, transaction: t });
    if (existingUser) {
      await t.rollback();
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // 3. Хеширование пароля
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Создание пользователя в рамках транзакции
    const newUser = await User.create({
      email,
      password_hash: hashedPassword,
      full_name,
      phone_number,
      role: safeRole
    }, { transaction: t });

    // 5. ЕСЛИ ЭТО ФЕРМЕР -> Обязательно создается профиль хозяйства
    if (safeRole === 'farmer') {
      if (!farm_name || !farm_name.trim()) {
        await t.rollback();
        return res.status(400).json({ message: 'Для регистрации фермера необходимо указать название хозяйства' });
      }

      await Farm.create({
        user_id: newUser.user_id,
        farm_name: farm_name.trim(),
        status: 'pending' // Статус по умолчанию (ждет модерации админом)
      }, { transaction: t });
    }

    // 6. Фиксация транзакции в БД
    await t.commit();

    // 7. Генерация токена
    const token = jwt.sign(
      { userId: newUser.user_id, role: newUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Регистрация прошла успешно',
      token,
      user: {
        id: newUser.user_id,
        email: newUser.email,
        name: newUser.full_name,
        role: newUser.role,
        phone_number: newUser.phone_number
      }
    });

  } catch (error) {
    // Откат всех изменений при любой ошибке
    await t.rollback();
    console.error('Ошибка при регистрации:', error);
    res.status(500).json({ message: 'Ошибка сервера при регистрации' });
  }
};

// Вход
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: 'Неверный email или пароль' });

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ message: 'Неверный email или пароль' });

    const token = jwt.sign({ userId: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: 'Успешный вход',
      token,
      user: {
        id: user.user_id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        phone_number: user.phone_number
      }
    });
  } catch (error) {
    console.error('Ошибка при авторизации:', error);
    res.status(500).json({ message: 'Ошибка сервера при авторизации' });
  }
};

// Обновление профиля
exports.updateProfile = async (req, res) => {
  try {
    const { phone_number } = req.body;
    const userId = req.user.userId; 

    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

    if (phone_number !== undefined) {
      user.phone_number = phone_number;
      await user.save();
    }

    res.json({
      message: 'Профиль успешно обновлен',
      user: {
        id: user.user_id,
        email: user.email,
        name: user.full_name,
        role: user.role,
        phone_number: user.phone_number
      }
    });
  } catch (error) {
    console.error('Ошибка обновления профиля:', error);
    res.status(500).json({ message: 'Ошибка сервера при обновлении профиля' });
  }
};