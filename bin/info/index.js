const { path: dbPath, drives: drivesDb } = require('../../db');
const { color, section, formatKey } = require('../ui');

const info = async () => {
    return {
        version: require('../../package.json').version,
        dbPath,
        connectedDrives: (await drivesDb.getAll({ tagOnly: true })).length
    };
};

module.exports = {
    name: 'info',
    description: 'Display information about the NAS',
    usage: 'info',
    async execute() {
        const i = await info();

        console.log(section('NodeDrive System'));

        const longest = Math.max(...Object.keys(i).map(k => formatKey(k).length));

        for (const [key, value] of Object.entries(i)) {
            const label = formatKey(key).padEnd(longest);
            console.log(
                `${color(label, 'yellow')} ${color('│', 'gray')} ${color(value, 'green')}`
            );
        }

        console.log('');
    },
    info
};