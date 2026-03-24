const readline = require('readline');
const os = require('os');

const { drives:db } = require('../../db');

const { walkDir } = require('dubnium/functions');

module.exports = {
    name: 'ind',
    description: 'Index all files on mounted drives',
    usage: 'ind',
    async execute(args) {
        console.log('Indexing drives...');
        const indexFileContentToo = process.argv.includes('--content');
        const allDrives = await db.getAll();
        for (const drive of allDrives) {
            const driveContent = await drive.read();
            const drivePath = driveContent.path;
            const files = await walkDir(drivePath);
            for (const file of files) {
                const relativePath = require('path').relative(drivePath, file);
                const id = `${drive.id}:${relativePath}`;
                const existingFile = db.get(id);
                const stats = await fs.stat(file);
                const fileData = {
                    driveId: drive.id,
                    name: require('path').basename(file),
                    size: stats.size,
                    modified: stats.mtime
                };
                if (indexFileContentToo) {
                    fileData.content = await fs.readFile(file, 'utf-8');
                }
                if (existingFile) {
                    await filesDb.write(id, fileData);
                } else {
                    await filesDb.create(id, fileData);
                }
            }
        }
    }
}