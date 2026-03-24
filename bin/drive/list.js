const readline = require('readline');
const os = require('os');
const { exists } = require('fs/promises');

const { drives:db } = require('../../db');

module.exports = {
    name: 'list',
    description: 'List all mounted drives',
    usage: 'list',
    aliases: ['ls'],
    async execute(args) {
         const keys = (await db.getAll({ tagOnly:true }))
        if (keys.length === 0) return console.log('No drives found.');
        keys.forEach(key => {
            console.log(key);
        });
    }
}