const { Router } = require('express');

const router = Router();

const { drives:db } = require('../db');

const { info } = require('../bin/drive/info');
 
router.get('/drives', async (req, res) => {
const drives = await db.getAll({ tagOnly:false });
const totalDrives = drives.length;
const resp = await Promise.all(drives.map(async drive => {
    const d = await info(drive.tag)
    delete d.totalDrives;
    d.name = drive.tag;
    return d
}));
res.json({ drives: resp, totalDrives });
});
module.exports = router;