const { Router } = require('express');

const router = Router();

router.get('/sign-out', (req, res) => {

    res.clearCookie('token', { path: '/' }).redirect('/signin');

})

module.exports = router;