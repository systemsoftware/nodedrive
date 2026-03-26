const { Router } = require('express');
const path = require('path');

const router = Router();

const { indexes } = require('../db');
const { getSafePath } = require('./files');

router.get('/files/search/json', async (req, res) => {
    try{
const { drive, q } = req.query;

if(indexes.has(drive) === false) return res.status(400).json({ error: `Drive ${drive} not found` });

const index = indexes.get(drive);

if(!index) return res.status(400).json({ error: `Index for drive ${drive} not found` });

const results = (await index.read()).filter(file => !file.path.includes('.trash') && file.path.toLowerCase().includes(q.toLowerCase())).map(file => ({
    name: path.basename(file.path),
    path: file.path,
    drive: file.drive,
}));


res.json({ files: results });
    }catch(e){
        console.error(e);
        res.status(500).json({ error: e.includes('ENOENT') ? 'Index not found, please create an index for this drive' : 'An error occurred while searching' });
    }
});
module.exports = router;