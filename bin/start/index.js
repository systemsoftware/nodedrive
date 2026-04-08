const { color } = require('../ui');

module.exports = {
    name: 'start',
    description: 'Start the NAS server',
    usage: 'start',
    async execute(args) {
        console.log(color('Starting server...', 'dim'));
       process.env.USED_START_COMMAND = 'true';
        require('../../index')
    }
}