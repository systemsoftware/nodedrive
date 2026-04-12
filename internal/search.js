const { Router } = require('express');
const path = require('path');

const router = Router();

const { indexes, users } = require('../db');

router.get('/files/search/json', async (req, res) => {
    try{
const { drive, q } = req.query;

if(indexes.has(drive) === false) return res.status(400).json({ error: `Drive ${drive} not found` });

const index = indexes.get(drive);

if(!index) return res.status(400).json({ error: `Index for drive ${drive} not found` });

const u = await users.get(req.user.username).read();

const results = (await index.read()).filter(file => 
    !file.path.includes('.trash') 
    && file.path.toLowerCase().includes(q.toLowerCase())
    && !u.denyAccess.some(denyPath => file.path.startsWith(denyPath))
).map(file => ({
    name: path.basename(file.path),
    path: file.path,
    drive: file.drive,
}));


res.json({ files: results });
    }catch(e){
        console.error(e);
        res.status(500).json({ error: e.message.includes('ENOENT') ? 'Index not found, please run "index" command' : e.message });
    }
});
module.exports = router;