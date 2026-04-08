const log = require('../../logs');

const update = () => {
log.info('Updating NodeDrive to the latest version...');
require('child_process').execSync('npm update -g nodedrive')
log.success('Update complete! Please restart NodeDrive to apply the latest updates.');
}

module.exports = {
    name: 'update',
    description: 'Update NodeDrive to the latest version',
    usage: 'update',
    async execute(args) {
        update();
    },
    update
}