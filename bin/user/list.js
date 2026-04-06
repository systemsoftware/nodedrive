const { users: db } = require('../../db');
const { color, section } = require('../ui');

module.exports = {
    name: "list",
    description: "List all users",
    usage: "list",
    async execute() {
        const users = await db.list();

        console.log(section('Users'));

        if (!users.length) {
            console.log(color('No users found.', 'gray'));
            return;
        }

        users.forEach(user => {
            const roleColor = user.role === 'admin' ? 'cyan' : 'green';

            console.log(
                `${color('●', roleColor)} ${color(user.username, 'yellow')} ${color(`(${user.role})`, 'gray')}`
            );
        });

        console.log('');
    }
};