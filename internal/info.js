const { Router } = require('express');

const router = Router();

const fs = require('fs/promises');

const { getSafePath } = require('./files');

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

router.get('/files/info', async (req, res) => {
    const { drive, path } = req.query;
    try{
        const p = await getSafePath(drive, path);
        const stat = await fs.stat(p);
        const info = {
            size: stat.size,
            created: stat.birthtime,
            modified: stat.mtime,
        };
        res.json(info);
    }catch(e){
        console.error(e);
        res.status(500).json({ error: 'An error occurred while retrieving file information' });
    }
});

module.exports = router;