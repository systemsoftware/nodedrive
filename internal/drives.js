const { Router } = require('express');

const router = Router();

const { drives:db, users } = require('../db');

const { info } = require('../bin/drive/info');
 
router.get('/drives', async (req, res) => {
const drives = await db.getAll({ tagOnly:false });
if(!req.user) return res.status(401).json({ error: 'Unauthorized' });
const u = await users.get(req.user.username).read();
const totalDrives = drives.length;
const resp = await Promise.all(drives.map(async drive => {
    if(u?.denyAccess?.includes(drive.tag)) return false;
    const d = await info(drive.tag)
    delete d.totalDrives;
    d.name = drive.tag;
    return d
}));
res.json({ drives: resp, totalDrives });
});
module.exports = router;