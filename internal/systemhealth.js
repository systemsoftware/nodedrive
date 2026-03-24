const { Router } = require('express');

const router = Router();

const { systemHealth:db } = require('../db');

const si = require('systeminformation');

const cronToWords = require('../utils/crontowords')

router.get('/systemhealth', async (req, res) => {
const cpu = await (db.get('cpu')).read();
const memory = await (db.get('memory')).read();
const cpuTemp = await (db.get('cpuTemp')).read();

res.json({ cpu, memory, cpuTemp, latest:{
   cpu:(await si.currentLoad()).currentLoad,
    memory:(await si.mem()).used,
    cpuTemp:(await si.cpuTemperature()).main,
    updateEvery: cronToWords(process.env.SYSTEM_HEALTH_CRON || '*/5 * * * *')
} });
});
module.exports = router;