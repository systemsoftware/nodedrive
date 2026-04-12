const { Router } = require('express');
const { pageError } = require('../logs');
const path = require('path');

const router = Router();

router.get('/system', (req, res) => {

 if(req.user?.role === 'admin'){
    res.sendFile(path.join(__dirname, '..', 'system.html'));
 } else {
    res.send(pageError(res, 'You do not have permission to access this page', 403));
 }

})

module.exports = router;