const { drives } = require('../../db');
const os = require('os');

const openCmd = os.platform() === 'win32' ? 'start' : os.platform() === 'darwin' ? 'open' : 'xdg-open';

module.exports = {
    name: 'open',
    description: 'Opens a drive in the default file manager.',
    usage: 'open <drive>',
    async execute(args) {
        require('child_process').exec(`${openCmd} ${(await drives.get(args[0]).read()).path}`);  
    }
}