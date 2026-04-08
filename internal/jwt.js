const { Router } = require('express');
const { readFileSync } = require('fs');
const path = require('path');

const router = Router();

router.get('/jwt', (req, res) => {

    let page = readFileSync(path.resolve(__dirname, '../err.html'), 'utf-8');

    page = page.split('Error').join('JWT Token').replace('%error%', req.cookies.token);

    if(req.query.parse) {
        return res.json(req.user);
    }

res.send(page);

})

module.exports = router;