const fs = require('fs/promises');

const { drives:db, indexes } = require('../../db');

const { walkDir } = require('dubnium/functions');
const path = require('path');

module.exports = {
    name: 'indexall',
    description: 'Creates an index of all files in all drives.',
    async execute() {
        const drives = await db.getAll({ tagOnly:false });

        const indexedFiles = [];
        
        for (const drive of drives) {
            const d = await drive.read();
            walkDir(d.path, async (filePath) => {
                const relativePath = filePath.replace(d.path, '');
                    const fileData = {
                        path: relativePath,
                        drive:{
                            path: d.path,
                            name: drive.tag
                        }
                    };
                    indexedFiles.push(fileData);
            });
        }
        await indexes.create('all', indexedFiles);
    }
}