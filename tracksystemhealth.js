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

        const netspeed = await si.networkStats();

        const _networkSpeed = netspeed.find(iface => iface.rx_bytes)

        const networkSpeed = _networkSpeed ? {
            iface: _networkSpeed.iface,
            rx_bytes: _networkSpeed.rx_bytes,
            tx_bytes: _networkSpeed.tx_bytes,
            rx_sec: _networkSpeed.rx_sec,
            tx_sec: _networkSpeed.tx_sec
        } : null;

        const cpuTemp = _cpuTemp.main;

        if (returnData) {
            return { cpu: cpuLoad, memory: memInfo, cpuTemp: cpuTemp, networkSpeed: networkSpeed };
        } else{
        
        const cpuFile = systemHealth.get('cpu');
        const memFile = systemHealth.get('memory');
        const cpuTempFile = systemHealth.get('cpuTemp');
        const networkSpeedFile = systemHealth.get('networkSpeed');

        const nowISO = new Date().toISOString();

        if(cpuFile) cpuFile.kv(nowISO, cpuLoad);
        if(memFile) memFile.kv(nowISO, memInfo);
        if(cpuTemp) cpuTempFile.kv(nowISO, cpuTemp);
        if(networkSpeedFile) networkSpeedFile.kv(nowISO, networkSpeed);
        }

    } catch (err) {
        error('Failed to track system health:', err);
    }
}

module.exports.init = async () => {
    const healthData = await trackSystemHealth(true);
    const nowISO = new Date().toISOString();

    if(!process.env.DONT_OVERWRITE_HEALTH_DATA) {
        await systemHealth.delete('cpu');
        await systemHealth.delete('memory');
        await systemHealth.delete('cpuTemp');
        await systemHealth.delete('networkSpeed');
    systemHealth.create('cpu', { [nowISO]: healthData ? healthData.cpu : 0 });
    systemHealth.create('memory', { [nowISO]: healthData ? healthData.memory : 0 });
    systemHealth.create('cpuTemp', { [nowISO]: healthData ? healthData.cpuTemp : 0 });
    systemHealth.create('networkSpeed', { [nowISO]: healthData ? healthData.networkSpeed : 0 });
    }

    cron.schedule(process.env.SYSTEM_HEALTH_CRON || '*/5 * * * *', trackSystemHealth)
    success(`Scheduled system health tracking ${process.env.SYSTEM_HEALTH_CRON || 'every 5 minutes'}`);
};

module.exports.updateSystemHealth = trackSystemHealth;