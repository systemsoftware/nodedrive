const fs = require('fs/promises');

const { drives:db, indexes } = require('../../db');

const { walkDir } = require('dubnium/functions');

module.exports = {
    name: 'indexdrive',
    description: 'Creates an index of all files in a drive.',
    async execute(args) {
        const driveId = args[0];
        const drive = db.get(driveId);
        if (!drive) {
            console.error(`Drive with ID ${driveId} not found.`);
            return;
        }
        const indexedFiles = [];

        const d = await drive.read();
        
        walkDir(d.path, async (filePath) => {
            const relativePath = filePath.replace(d.path, '');
            const data = {
                path: relativePath,
                drive:{
                    name: d.name,
                    path: d.path
                }
            };
            indexedFiles.push(data);
        });
        await indexes.create(driveId, indexedFiles);
    }
}