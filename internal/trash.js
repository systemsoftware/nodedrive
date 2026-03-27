const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

const { getSafePath } = require('./files');
const { drives, users, trash } = require('../db');
const { error } = require('console');

const getDrivePath = async (driveName) => {
    const driveDoc = await drives.get(driveName).read();
    if (!driveDoc) throw new Error('Drive not found');
    return driveDoc.path;
};

const getTrashDir = (drivePath) => path.join(drivePath, '.trash');

const generateTrashName = (filePath) =>
    `${Date.now()}_${path.basename(filePath)}`;

const resolveCollision = async (targetPath) => {
    let finalPath = targetPath;
    let counter = 1;

    while (true) {
        try {
            await fs.access(finalPath);

            const parsed = path.parse(targetPath);
            finalPath = path.join(
                parsed.dir,
                `${parsed.name} (${counter})${parsed.ext}`
            );

            counter++;
        } catch {
            return finalPath;
        }
    }
};

//
// 🗑 Move file to trash
//
router.delete('/file', async (req, res) => {
    const { drive, path: filePath } = req.body;

    if (!drive || !filePath) {
        return res.status(400).json({ error: 'Drive and path are required' });
    }

    try {
        const drivePath = await getDrivePath(drive);
        const fullFilePath = await getSafePath(drive, filePath);

        const trashDir = getTrashDir(drivePath);
        const id = generateTrashName(filePath);
        const trashFilePath = path.join(trashDir, id);

        await fs.mkdir(trashDir, { recursive: true });

        // move file first (safer)
        await fs.rename(fullFilePath, trashFilePath);

        // then write DB record
        await trash.create(id, {
            id,
            drive,
            originalPath: filePath,
            trashPath: trashFilePath,
            deletedAt: new Date()
        });

        res.json({ message: 'File moved to trash' });

    } catch (err) {
        console.error('Move to trash error:', err);
        res.status(500).json({ error: err.message });
    }
});

//
// 📂 List trash
//
router.get('/trash/json', async (req, res) => {
    const { drive } = req.query;

    if (!drive) {
        return res.status(400).json({ error: 'Drive is required' });
    }

    try {
        const drivePath = await getDrivePath(drive);
        const trashDir = getTrashDir(drivePath);

        const files = await fs.readdir(trashDir);
        const u = await users.get(req.user.username).read();

        const fileDetails = await Promise.all(
            files
                .filter(file =>
                    !u.denyAccess?.includes(path.join(req.query.path || '', file))
                )
                .map(async file => {
                    const fullPath = path.join(trashDir, file);
                    const stats = await fs.stat(fullPath);

                    return {
                        name: file,
                        isDirectory: stats.isDirectory(),
                        size: stats.size,
                        modified: stats.mtime,
                        path: file // simpler + consistent
                    };
                })
        );

        res.json({ files: fileDetails });

    } catch (err) {
        console.error('Read trash error:', err);
        res.status(500).json({ error: err.message });
    }
});

//
// ♻️ Restore file
//
router.post('/trash/restore', async (req, res) => {
    console.log('Restore request body:', req.body);
    const { drive, path:file } = req.body;

    if (!drive || !file) {
        return res.status(400).json({ error: 'Drive and file are required' });
    }

    try {
        const item = await trash.get(file).read();

        if (!item) {
            error('Trash record not found for file:', file);
            return res.status(404).json({ error: 'Trash record not found' });
        }

        const drivePath = await getDrivePath(drive);
        const trashDir = getTrashDir(drivePath);

        console.log('Trash directory:', trashDir);
        console.log('Trash file path:', path.join(trashDir, file));

        const trashFilePath = path.join(trashDir, file);

        console.log('Checking if trash file exists:', trashFilePath);

        let restorePath = await getSafePath(drive, item.originalPath);

        // ensure directory exists
        await fs.mkdir(path.dirname(restorePath), { recursive: true });

        // avoid overwriting
        restorePath = await resolveCollision(restorePath);

        await fs.rename(trashFilePath, restorePath);

        // remove DB record
        await trash.delete(file);

        res.json({ message: 'File restored' });

    } catch (err) {
        console.error('Restore error:', err);
        res.status(500).json({ error: err.message });
    }
});

//
// ❌ Permanently delete
//
router.delete('/files/rm', async (req, res) => {
    const { drive, path: deletePath } = req.body;

    if (!drive || !deletePath) {
        return res.status(400).json({ error: 'Drive and path are required' });
    }

    try {
        const file = path.basename(deletePath);

        const item = await trash.get(file).read();

        if (!item) {
            return res.status(404).json({ error: 'Trash record not found' });
        }

        await fs.rm(item.trashPath, { recursive: true });

        await trash.delete(file);

        res.json({ message: 'File permanently deleted' });

    } catch (err) {
        console.error('Delete error:', err);
        res.status(500).json({ error: err.message });
    }
});


router.post('/trash/empty', async (req, res) => {
    const { drive } = req.body;

    if (!drive) {
        return res.status(400).json({ error: 'Drive is required' });
    }

    if(req.user?.role != 'admin') return res.status(403).json({ error: 'Admin access required' });

    try {
        const drivePath = await getDrivePath(drive);
        const trashDir = getTrashDir(drivePath);

        const files = await fs.readdir(trashDir);

        for (const file of files) {
            const item = await trash.get(file).read();
            if (item) {
                await fs.rm(item.trashPath, { recursive: true });
                await trash.delete(file);
            } else {
                console.warn('No DB record for trash file:', file);
            }
        }

        res.json({ message: 'Trash emptied' });

    } catch (err) {
        console.error('Empty trash error:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;