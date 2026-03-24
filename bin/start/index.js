module.exports = {
    name: 'start',
    description: 'Start the NAS server',
    usage: 'start',
    aliases: ['s'],
    async execute(args) {
        console.log('Starting NAS server...');
       process.env.STARTED = 'true';
        require('../../index')
    }
}