const { Router } = require('express');
const { info, error, success, APIError } = require('../logs');

const router = Router();

router.get('/jwt', (req, res) => {

    if(req.query.parse) {
        return res.json(req.user);
    }

   return res.send(req.cookies.token)

})

module.exports = router;