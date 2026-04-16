const jwt = require('jsonwebtoken');

// 1. Перевірка наявності та валідності токена
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Доступ заборонено. Токен відсутній.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Недійсний або прострочений токен.' });
    req.user = user;
    next();
  });
};

// 2. НОВЕ: Перевірка ролей (RBAC)
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Якщо роль користувача з токена не входить у список дозволених — відмовляємо
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `Доступ заборонено. Ця дія вимагає прав: ${allowedRoles.join(' або ')}` 
      });
    }
    next(); // Якщо все добре - пропускаємо далі
  };
};

module.exports = { authenticateToken, authorizeRoles };