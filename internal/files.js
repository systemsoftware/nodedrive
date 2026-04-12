const { Router } = require('express');
const { info, error } = require('../logs');
const fs = require('fs/promises');
const { createReadStream } = require('fs');
const { drives, users } = require('../db');
const pth = require('path');
const multer = require('multer');
const crypto = require('crypto');
const archiver = require('archiver');

const createShareId = (data) => {
    const payload = Buffer.from(JSON.stringify(data)).toString('base64url');

    const signature = crypto
        .createHmac('sha256', process.env.ID_SECRET)
        .update(payload)
        .digest('hex');

    return `${payload}.${signature}`;
};

const decodeShareId = (token) => {
    const [payload, signature] = token.split('.');

    const expectedSig = crypto
        .createHmac('sha256', process.env.ID_SECRET)
        .update(payload)
        .digest('hex');

    if (signature !== expectedSig) return null;

    return JSON.parse(Buffer.from(payload, 'base64url').toString());
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

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

        const fileDetails = await Promise.all(
            files
                .filter(file => !u.denyAccess?.includes(pth.join(reqPath, file)))
                .map(async file => {
                    const stats = await fs.stat(pth.join(fullPath, file));
                    return {
                        name: file,
                        isDirectory: stats.isDirectory(),
                        size: stats.size,
                        modified: stats.mtime,
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
        try{
            const stat = await fs.stat(fullPath);
            if(stat.isDirectory()) {
                const archive = archiver('zip', { zlib: { level: 9 } });
                archive.directory(fullPath, false);
                archive.finalize();
                res.attachment(`${pth.basename(reqPath)}.zip`);
                archive.pipe(res);
                return;
            }
        } catch {
            return res.status(404).json({ error: 'File not found' });
        }
        const readStream = createReadStream(fullPath);
        readStream.pipe(res);
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

router.post('/files/upload', upload.single('file'), async (req, res) => {
    const { drive, path: uploadPath } = req.body;
    const file = req.file;

    info(`Upload Attempt: User=${req.user.username}, Drive=${drive}, Path=${uploadPath}, File=${file ? file.originalname : 'No file'}`);

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    try {
        const fullPath = await getSafePath(drive, uploadPath);
        await fs.mkdir(fullPath, { recursive: true });
        await fs.rename(file.path, pth.join(fullPath, file.originalname));
        res.json({ message: 'File uploaded successfully' });
    } catch (err) {
        error(`Upload Error: ${err.message}`);
        res.status(500).json({ error: err.message });
    }
});

router.post('/files/share', async (req, res) => {
    const { path: reqPath, drive, expiresin } = req.body;

    try {
        await getSafePath(drive, reqPath);

        const shareId = createShareId({
            drive,
            path: reqPath,
            expiresAt: Date.now() + (parseInt(expiresin) || 3600000)
        });

        res.json({ shareId });
    } catch (err) {
        res.status(404).json({ error: 'File not found' });
    }
});

const sharedHandler = async (req, res) => {
    const { id } = req.params;
    try {
        const data = decodeShareId(id);
        if (!data) {
            return res.status(400).json({ error: 'Invalid share ID' });
        }
        if (Date.now() > data.expiresAt) {
            return res.status(410).json({ error: 'Share link has expired' });
        }
        const fullPath = await getSafePath(data.drive, data.path);
        try{
            const stat = await fs.stat(fullPath);
            if(stat.isDirectory()) {
                const archive = archiver('zip', { zlib: { level: 9 } });
                archive.directory(fullPath, false);
                archive.finalize();
                res.attachment(`${pth.basename(data.path)}.zip`);
                archive.pipe(res);
                return;
            }
        } catch (e) {
            return res.status(404).json({ error: e.message });
        }
        const readStream = createReadStream(fullPath);
        readStream.pipe(res);
    } catch (err) {
        res.status(400).json({ error: 'Invalid share ID' });
    }
}

router.get('/shared/:id', sharedHandler);
router.get('/s/:id', sharedHandler);


router.post('/file/rename', async (req, res) => {
    const { drive, path: oldPath, newName } = req.body;

    try {
        const fullOldPath = await getSafePath(drive, oldPath);
        const newPath = pth.join(pth.dirname(fullOldPath), newName);
        await fs.rename(fullOldPath, newPath);
        res.json({ message: 'File renamed successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


router.post('/file/mkdir', async (req, res) => {
    const { drive, path: dirPath, name } = req.body;
    try {
        const requestedPath = pth.join(
    (dirPath || '').replace(/^\/+/, ''),
    name || ''
);

        const fullPath = await getSafePath(drive, requestedPath);

        await fs.mkdir(fullPath, { recursive: true });

        res.json({ message: 'Directory created successfully' });
    } catch (err) {
        error(`Mkdir Error: ${err.message}, ${err.stack}`);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

module.exports.getSafePath = getSafePath;