const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const token = req.header('x-auth');

  if (!token) {
    return res.status(401).send({ error: 'Access denied. No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).send({ error: e });
  }
};
