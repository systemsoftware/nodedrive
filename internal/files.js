const { Router } = require('express');
const { info, error } = require('../logs');
const fs = require('fs/promises');
const { createReadStream } = require('fs');
const { drives, users } = require('../db');
const pth = require('path');

const router = Router();

// Helper to prevent path traversal
const getSafePath = async (driveName, requestedPath) => {
    const driveDoc = await drives.get(driveName).read();
    if (!driveDoc) return null;
    
    const rootPath = pth.resolve(driveDoc.path);
    const fullPath = pth.resolve(pth.join(rootPath, requestedPath));

    // Security: Ensure the resulting path is still inside the rootPath
    if (!fullPath.startsWith(rootPath)) {
        throw new Error('Access Denied: Path traversal detected');
    }
    return fullPath;
};

router.get('/files/json', async (req, res) => {
    const { path: reqPath, drive } = req.query;

    if (!reqPath || !drive) {
        return res.status(400).json({ error: 'Path and Drive are required' });
    }

    try {
        const u = await users.get(req.user.username).read();
        if (u.denyAccess?.includes(drive)) {
            return res.status(403).json({ error: 'Access denied to this drive' });
        }

        const fullPath = await getSafePath(drive, reqPath);
        const files = await fs.readdir(fullPath);

        // Filter and Map
        const fileDetails = await Promise.all(
            files
                .filter(file => !u.denyAccess?.includes(pth.join(reqPath, file))) // Safe filtering
                .map(async file => {
                    const stats = await fs.stat(pth.join(fullPath, file));
                    return {
                        name: file,
                        isDirectory: stats.isDirectory(),
                        size: stats.size,
                        modified: stats.mtime,
                        // This is the relative path to send back to frontend
                        path: pth.join(reqPath, file).replace(/\\/g, '/') 
                    };
                })
        );

        res.json({ files: fileDetails });
    } catch (err) {
        error(`Error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

router.get('/files/raw', async (req, res) => {
    const { path: reqPath, drive } = req.query;
    try {
        const fullPath = await getSafePath(drive, reqPath);
        const readStream = createReadStream(fullPath);
        readStream.pipe(res);
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

module.exports = router;