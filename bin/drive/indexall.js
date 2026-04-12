const fs = require('fs/promises');

const { drives:db, indexes } = require('../../db');

const path = require('path');

const walkDir = async (dir) => {
    let results = [];
    const files = await fs.readdir(dir);
    
    for (const f of files) {
        const fullPath = path.join(dir, f);
        const stats = await fs.stat(fullPath);
        
        if (stats.isDirectory()) {
            const subResults = await walkDir(fullPath);
            results = results.concat(subResults);
        } else {
            results.push(fullPath);
        }
    }
    
    return results;
}

module.exports = {
    name: 'indexall',
    description: 'Creates an index of all files in all drives.',
    usage: 'indexall',
    async execute() {
        const drives = await db.getAll({ tagOnly:false });

        const indexedFiles = [];
        
        for (const drive of drives) {
            const data = await drive.read();
            
            if(!data.path) continue;

            const files = await walkDir(data.path);

            const indexData = files.map(file => ({
                path: file,
                drive: {
                    path: data.path,
                    name: drive.tag
                }
            }));
            indexedFiles.push(...indexData);

            await indexes.create(drive.tag, indexData);

        }
    }
}