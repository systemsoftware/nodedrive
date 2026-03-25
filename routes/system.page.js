const { Router } = require('express');
const { info, error, success, APIError } = require('../logs');
const path = require('path');

const router = Router();

router.get('/system', (req, res) => {

 if(req.user?.role === 'admin'){
    res.sendFile(path.join(__dirname, '..', 'system.html'));
 } else {
    res.send(APIError('Access denied', 403));
 }

})

module.exports = router;