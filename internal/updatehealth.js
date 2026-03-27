const { Router } = require('express');

const router = Router();

const { updateSystemHealth } = require('../tracksystemhealth');

router.get('/updatehealth', async (req, res) => {
  await updateSystemHealth();
  if(!req.user?.role == 'admin') return res.status(403).send('Forbidden');
  res.redirect('/system');
});
module.exports = router;