const { Router } = require('express');

const router = Router();

const { systemHealth:db } = require('../db');

const si = require('systeminformation');

const os = require('os');

const cronToWords = require('../utils/crontowords')

router.get('/systemhealth', async (req, res) => {
const cpu = await (db.get('cpu')).read();
const memory = await (db.get('memory')).read();
const cpuTemp = await (db.get('cpuTemp')).read();
const networkSpeed = await (db.get('networkSpeed')).read();

const system = await si.system();

const systemString = [
  system.manufacturer,
  system.model
].filter(Boolean).join(' ') +
  (system.version ? ` (${system.version})` : '') +
  ` ${system.virtual ? 'Virtual' : ''}`.trim();

const networkObject = {}

const networkInterfaces = await si.networkInterfaces();

networkInterfaces.forEach(iface => {
  networkObject[iface.iface] = {
    ip4: iface.ip4,
    ip6: iface.ip6,
    internal: iface.internal
  };
});

const netSpeed = await si.networkStats();

netSpeed.forEach(iface => {
  if(networkObject[iface.iface]){
    networkObject[iface.iface].rx_bytes = iface.rx_bytes;
    networkObject[iface.iface].tx_bytes = iface.tx_bytes;
    networkObject[iface.iface].rx_sec = iface.rx_sec;
    networkObject[iface.iface].tx_sec = iface.tx_sec;
  }
});

res.json({ cpu, memory, cpuTemp, networkSpeed, latest:{
   cpu:(await si.currentLoad()).currentLoad,
    memory:(await si.mem()).used,
   system: systemString,
    cpuTemp:(await si.cpuTemperature()).main,
    network: networkObject,
    uptime: {
        os: os.uptime(),
        process: process.uptime()
    }
},
updateEvery: cronToWords(process.env.SYSTEM_HEALTH_CRON || '*/5 * * * *'),
DONT_OVERWRITE_HEALTH_DATA: process.env.DONT_OVERWRITE_HEALTH_DATA ? true : false
});
});
module.exports = router;