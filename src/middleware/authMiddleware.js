const jwt = require('jsonwebtoken');

// Проверка наличия и валидности токена
exports.verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Отсутствует токен авторизации' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    req.user = decoded; 
    next();
  } catch (error) {
    console.error('Ошибка проверки токена:', error.message);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Срок действия токена истек, авторизуйтесь заново' });
    }
    return res.status(403).json({ message: 'Неверный токен авторизации' });
  }
};

// Проверка прав администратора
exports.verifyAdmin = (req, res, next) => {
  // Проверка и подтверждение, что req.user существует (добавлено verifyToken) и роль = admin
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Доступ запрещен. Требуются права администратора.' });
  }
  next();
};