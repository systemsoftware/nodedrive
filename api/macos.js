const { Router, json: expressJSON, raw: expressRaw } = require('express');
const app = Router();
const path = require('path');
const fs = require('fs/promises');
const { drives } = require('../db');
const jwt = require('jsonwebtoken');
const { info } = require('console');

app.use(expressJSON());

const toId = (p) => Buffer.from(p).toString('base64url');
const fromId = (id) => Buffer.from(id, 'base64url').toString('utf8');

app.use((req, res, next) => {
  const _jwt = req.headers.authorization?.replace('Bearer ', '') || req.cookies.token || req.query.token;

  if (_jwt) {
    try {
      const decoded = jwt.verify(_jwt, process.env.JWT_SECRET);
      req.user = decoded;
    } catch (e) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  if(req.user.role == 'admin') {
    return next();
  } 
}
    return res.status(403).json({ error: 'Forbidden' });
});

app.get('/fs/:fileId/children', async (req, res) => {
    const { fileId } = req.params; 
    
    if (fileId === 'root') {
        const driveList = await drives.getAll({ tagOnly: false });
        const seenPaths = new Set();
        const records = [];
        for (const drive of driveList) {
            const driveData = await drive.read();
            if (seenPaths.has(driveData.path)) continue;
            seenPaths.add(driveData.path);
            records.push({
                id: toId(driveData.path),
                parentId: 'NSFileProviderRootContainerItemIdentifier',
                name: driveData.name || path.basename(driveData.path),
                isDirectory: true,
                size: 0
            });
        }
        return res.json(records);
    }

    try{
    const dirPath = fromId(fileId);
    const entries = await fs.readdir(dirPath);
    const records = await Promise.all(entries.map(async entry => {
        const fullPath = path.join(dirPath, entry);
        const stats = await fs.stat(fullPath);
        return {
            id: toId(fullPath),
            parentId: fileId,
            name: entry,
            isDirectory: stats.isDirectory(),
            size: stats.size
        };
    }));

        res.json(records);
}catch(e) {
    console.error(`Error reading directory for ${fileId}:`, e);
    return res.status(500).json({ error: 'Failed to read directory' });
}
});

app.get('/fs/:fileId/content', async (req, res) => {
    const filePath = fromId(req.params.fileId);
    try {
        const fileContent = await fs.readFile(filePath);
        res.setHeader('Content-Type', 'application/octet-stream');
        res.send(fileContent);
    } catch {
        res.status(404).send({ error: 'File not found' });
    }
});

app.put('/fs/:fileId/content', expressRaw({type: '*/*', limit: '50gb'}), async (req, res) => {
    if(process.env.ADVANCED_LOGGING) info(`Received update for ${req.params.fileId}, size: ${req.body.length} bytes from user ${req.user.username} using macOS API`);
    const filePath = fromId(req.params.fileId);
    try {
        await fs.writeFile(filePath, req.body);
        res.status(200).send({ message: 'Updated' });
    } catch {
        res.status(500).send({ error: 'Write failed' });
    }
});

app.post('/fs/:fileId/move', expressJSON(), async (req, res) => {
    if(process.env.ADVANCED_LOGGING) info(`Received move request for ${req.params.fileId} to ${req.body.targetId} from user ${req.user.username} using macOS API`);
    const srcPath = fromId(req.params.fileId);
    const { targetId } = req.body;
    const destPath = fromId(targetId);
    try {
        await fs.rename(srcPath, destPath);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.post('/fs/:fileId/mkdir', async (req, res) => {
    if(process.env.ADVANCED_LOGGING) info(`Received mkdir request for ${req.params.fileId} from user ${req.user.username} using macOS API`);
    const dirPath = fromId(req.params.fileId);
    try {
        await fs.mkdir(dirPath, { recursive: true });
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.delete('/fs/:fileId', async (req, res) => {
    if(process.env.ADVANCED_LOGGING) info(`Received delete request for ${req.params.fileId} from user ${req.user.username} using macOS API`);
    const filePath = fromId(req.params.fileId);
    try {
        const stat = await fs.stat(filePath);
        if (stat.isDirectory()) {
            await fs.rm(filePath, { recursive: true });
        } else {
            await fs.unlink(filePath);
        }
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

module.exports = app;