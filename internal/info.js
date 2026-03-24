const { Router } = require('express');

const router = Router();

router.get('/info', (req, res) => {
const info = require('../bin/info').info();
let html = '<h1>NAS Information</h1><ul>';
for (const [key, value] of Object.entries(info)) {
    html += `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</li>`;
}
html += '</ul>';
res.send(html);
});

router.get('/info/drive/:id', (req, res) => {
const info = require('../bin/drive/info').info(req.params.id);
let html = `<h1>${req.params.id} Information</h1><ul><li><strong>Nickname:</strong> ${req.params.id}</li>`;
for (const [key, value] of Object.entries(info)) {
    html += `<li><strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value}</li>`;
}
html += '</ul>';
res.send(html);
});

module.exports = router;