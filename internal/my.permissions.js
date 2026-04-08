const { Router } = require('express');

const router = Router();

const { users } = require('../db');

router.get('/mypermissions', async (req, res) => {
const u = await users.get(req.user?.username).read();
res.json(u.permissions);
});

module.exports = router;