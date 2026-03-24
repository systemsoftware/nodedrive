const { path:dbPath, drives:drivesDb } = require('../../db');

const info = async () => {
return {
version: require('../../package.json').version,
dbPath,
connectedDrives: (await drivesDb.getAll({ tagOnly:true })).length
}
}

module.exports = {
    name: 'info',
    description: 'Display information about the NAS',
    usage: 'info',
    aliases: ['i'],
    async execute(args) {
        const i = await info();
        for (const [key, value] of Object.entries(i)) {
            console.log(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
        }
    },
    info
}