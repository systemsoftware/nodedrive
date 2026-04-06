const os = require('os');
const { drives: db } = require('../../db');
const checkDiskSpace = require('check-disk-space').default;
const cliProgress = require('cli-progress');
const { color, section, formatKey } = require('../ui');

const toGB = (bytes) => (bytes / (1024 ** 3)).toFixed(1);

function showStorageProgress(size, free) {
    const used = size - free;

    const bar = new cliProgress.SingleBar({
        format: `${color('Storage', 'cyan')} {bar} ${color('{percentage}%', 'yellow')} (${color('{value}GB', 'green')} / {total}GB)`,
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591'
    });

    bar.start(toGB(size), toGB(used));
    bar.stop();
}

const getInfo = async (driveName) => {
    const path = (await db.get(driveName).read()).path;

    return {
        drive: driveName,
        path,
        os: `${os.type()} (${os.platform()} ${os.release()})`,
        totalDrives: (await db.getAll({ tagOnly: true })).length,
        diskSpace: await checkDiskSpace(path)
    };
};

module.exports = {
    name: 'info',
    description: 'View information about a mounted drive',
    usage: 'info <drive_name>',
    async execute(args) {
        if (args.length < 1) {
            console.log(color('Please provide a drive name.', 'red'));
            return;
        }

        const driveName = args[0];
        const drive = db.get(driveName);

        if (!drive) {
            console.log(color(`Drive "${driveName}" does not exist.`, 'red'));
            return;
        }

        const info = await getInfo(driveName);

        console.log(section(`Drive: ${driveName}`));

        const entries = Object.entries(info).filter(([k]) => k !== 'diskSpace');
        const longest = Math.max(...entries.map(([k]) => formatKey(k).length));

        for (const [key, value] of entries) {
            const label = formatKey(key).padEnd(longest);
            console.log(
                `${color(label, 'yellow')} ${color('│', 'gray')} ${color(value, 'green')}`
            );
        }

        try {
            const { size, free } = info.diskSpace;

            console.log('\n' + color('Disk Usage', 'cyan'));
            console.log(color('─'.repeat(10), 'gray'));

            showStorageProgress(size, free);

            console.log(
                `${color('Free', 'yellow')}: ${color(toGB(free) + ' GB', 'green')}`
            );
        } catch (err) {
            console.log(color('Could not retrieve disk space info.', 'red'));
        }

        console.log('');
    },
    info: getInfo
};