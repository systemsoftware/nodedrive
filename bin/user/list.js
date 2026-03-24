
const readline = require('readline');
const bcrypt = require('bcrypt');

const { users:db } = require('../../db');

module.exports = {
    name: "list",
    description: "List all users",
    usage: "list",
    async execute(args) {
        const users = await db.list();
        users.forEach(user => {
            console.log(`- ${user.username} (${user.role})`);
        });
    }
}