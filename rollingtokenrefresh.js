const { path } = require("./db");

module.exports = (req, res, next) => {
  if(!req.cookies) return next();
  const token = req.cookies.token;
  if (!token && !req.path.includes('signin')) return res.redirect('/signin');

  try {
    const payload = jsonwebtoken.verify(token, process.env.JWT_SECRET);

    const expiresIn = payload.exp * 1000 - Date.now();
    if (expiresIn < 1000 * 60 * 60 * 24 * 7) {

      const newToken = jsonwebtoken.sign(
      { username: payload.username, role: payload.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

      res.cookie('token', newToken, {
        maxAge: 1000 * 60 * 60 * 24 * 30,
        sameSite: 'lax',
        path: '/',
      });
    } 

    req.user = payload;
    next();
  } catch {
    res.redirect('/signin');
  }
};