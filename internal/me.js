const { Router } = require('express');

const router = Router();

router.get('/me', (req, res) => {

res.json({
    token: req.cookies.token,
    user: req.user
})

})

module.exports = router;