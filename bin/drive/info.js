const os = require('os');

const { drives:db } = require('../../db');

const checkDiskSpace = require('check-disk-space').default;
const cliProgress = require('cli-progress');

async function showStorageProgress(size, free) {
    const used = size - free;

    const bar = new cliProgress.SingleBar({
        format: 'Storage Used: {bar} | {percentage}% ({value}GB / {total}GB)',
        barCompleteChar: '\u2588',
        barIncompleteChar: '\u2591',
        stopOnComplete: true
    });

    const toGB = (bytes) => (bytes / (1024 ** 3)).toFixed(1);

    bar.start(toGB(size), toGB(used));
    bar.stop();
}

const info = async (driveName) => {
    const path = (await db.get(driveName).read()).path;
    return {
        totalDrives: (await db.getAll({ tagOnly:true })).length,
        osType: os.type(),
        osPlatform: os.platform(),
        osRelease: os.release(),
        drivePath: path,
        diskSpace: await checkDiskSpace(path)
    }
}

module.exports = {
    name: 'info',
    description: 'View information about a mounted drive',
    usage: 'info <drive_name>',
    async execute(args) {
      if (args.length < 1) {
            console.log('Please provide a drive name to view info for.');
            process.exit(1);
        }
        const driveName = args[0];
        const drive = db.get(driveName);
        if (!drive) {
            console.log(`Drive ${driveName} does not exist.`);
            process.exit(1);
        }
       const info = await info(driveName);
       for (const [key, value] of Object.entries(info)) {
            if (key === 'diskSpace') {
                console.log('Disk Space:', `Free: ${(value.free / (1024 ** 3)).toFixed(1)}GB / Total: ${(value.size / (1024 ** 3)).toFixed(1)}GB`);
            } else {
                console.log(`${key.charAt(0).toUpperCase() + key.slice(1)}: ${value}`);
            }
        }
        try {
            const diskSpace = await checkDiskSpace(driveInfo.path);
            showStorageProgress(diskSpace.size, diskSpace.free);
        } catch (err) {
            console.log('Could not retrieve disk space info:', err.message);
        }
    },
    info
}