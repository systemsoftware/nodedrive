const { Router } = require('express');

const router = Router();

const { updateSystemHealth } = require('../tracksystemhealth');

router.get('/updatehealth', async (req, res) => {
  await updateSystemHealth();
  res.redirect('/system');
});
module.exports = router;