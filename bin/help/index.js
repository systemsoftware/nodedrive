const fs = require('fs/promises');
const path = require('path');

module.exports = {
    name: 'help',
    description: 'Display help information about the NAS',
    usage: 'help',
    async execute(args) {
        const binDir = path.join(__dirname, '..');
        
        try {
            const entries = await fs.readdir(binDir, { withFileTypes: true });
            
            const commandDirs = entries.filter(entry => entry.isDirectory());

            for (const dir of commandDirs) {
                const dirPath = path.join(binDir, dir.name);
                const files = await fs.readdir(dirPath);

                const topCmd = path.basename(dirPath);

                const subCommands = files.filter(file => file.endsWith('.js'));

                for (const subFile of subCommands) {
                    const cmdPath = path.join(dirPath, subFile);
                    const cmd = require(cmdPath);

                    if (cmd.name) {
                        console.log(`Command: ${topCmd} ${cmd.name}`);
                        console.log(`Description: ${cmd.description || 'No description'}`);
                        console.log(`Usage: ${cmd.usage || 'No usage info'}`);
                        console.log('-----------------------------');
                    }
                }
            }
        } catch (err) {
            console.error("Error reading commands directory:", err.message);
        }
    }
}