const { drives:db } = require('../../db');

module.exports = {
    name: 'list',
    description: 'List all mounted drives',
    usage: 'list',
    async execute(args) {
         const keys = (await db.getAll({ tagOnly:true }))
        if (keys.length === 0) return console.log('No drives found.');
        keys.forEach(key => {
            console.log(key);
        });
    }
}