const cron = require('node-cron');
const si = require('systeminformation');
const { systemHealth } = require('./db');
const { error, info, success } = require('./logs');

async function trackSystemHealth(returnData = false) {
    try {
        const _cpuLoad = await si.currentLoad();
        const _memInfo = await si.mem();
        const _cpuTemp = await si.cpuTemperature();

        const memInfo = {
            total: _memInfo.total,
            free: _memInfo.free,
            swapTotal: _memInfo.swaptotal,
            swapFree: _memInfo.swapfree
        };

        const cpuLoad = {
            avgLoad: _cpuLoad.avgLoad,
            currentLoad: _cpuLoad.currentLoad,
            cpus: _cpuLoad.cpus.map(core => { return core.load })
        };

        const cpuTemp = _cpuTemp.main;

        if (returnData) {
            return { cpu: cpuLoad, memory: memInfo, cpuTemp: cpuTemp };
        } else{
        
        const cpuFile = systemHealth.get('cpu');
        const memFile = systemHealth.get('memory');
        const cpuTempFile = systemHealth.get('cpuTemp');

        const nowISO = new Date().toISOString();

        if(cpuFile) cpuFile.kv(nowISO, cpuLoad);
        if(memFile) memFile.kv(nowISO, memInfo);
        if(cpuTemp) cpuTempFile.kv(nowISO, cpuTemp);
        }

    } catch (err) {
        error('Failed to track system health:', err);
    }
}

module.exports.init = async () => {
    const healthData = await trackSystemHealth(true);
    const nowISO = new Date().toISOString();

    systemHealth.create('cpu', { [nowISO]: healthData ? healthData.cpu : 0 });
    systemHealth.create('memory', { [nowISO]: healthData ? healthData.memory : 0 });
    systemHealth.create('cpuTemp', { [nowISO]: healthData ? healthData.cpuTemp : 0 });

    cron.schedule(process.env.SYSTEM_HEALTH_CRON || '*/5 * * * *', trackSystemHealth)
    success(`Scheduled system health tracking ${process.env.SYSTEM_HEALTH_CRON || 'every 5 minutes'}`);
};

module.exports.updateSystemHealth = trackSystemHealth;