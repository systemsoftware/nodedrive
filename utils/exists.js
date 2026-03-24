const fs = require('fs/promises');

module.exports = async (p) => {
    try {
        await fs.access(p);
        return true;
    } catch {
        return false;
    }
}