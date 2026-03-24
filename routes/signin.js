const router = require('express').Router();
const bcrypt = require('bcrypt');
const { users:db } = require('../db');
const jsonwebtoken = require('jsonwebtoken');

router.use(require('express').urlencoded({ extended: true }));

const { success, error, info } = require('../logs');

router.post('/signin', async (req, res) => {
    info(`Sign-in attempt for username: ${req.body.username}`);
    const { username, password } = req.body;
    const rememberMe = req.body.rememberMe === 'on';
    if(!(await db.has(username))) return res.status(400).send('Invalid username or password');
    const user = await db.get(username).read();
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(400).send('Invalid username or password');
    }
    const jwt = jsonwebtoken.sign(
  { username, role: user.role },
  process.env.JWT_SECRET,
  { expiresIn: rememberMe ? '30d' : '1h' }
);
res.cookie('token', jwt, {
  maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 60 * 60 * 1000,
  path: '/',
  sameSite: 'lax',
}).status(200).send('Signed in successfully');
});

module.exports = router;