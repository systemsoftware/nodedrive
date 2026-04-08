const { users: db } = require('../../db');
const { color, section } = require('../ui');

module.exports = {
    name: "list",
    description: "List all users",
    usage: "list",
    async execute() {
        const _users = await db.getAll( { tagOnly: false } )
        const users = await Promise.all(_users.map(async user => {
            const record = await user.read()
            const stat = await user.stats();
            return {
                username: user.tag,
                role: record.role,
                createdAt: new Date(stat.birthtimeMs).toLocaleString(),
                modifiedAt: new Date(stat.mtimeMs).toLocaleString()
            };
        }));

        console.log(section('Users'));

        if (!users.length) {
            console.log(color('No users found.', 'gray'));
            return;
        }

        users.forEach(user => {
            const roleColor = user.role === 'admin' ? 'cyan' : 'green';

            console.log(
                `${color('●', roleColor)} ${color(user.username, 'yellow')} ${color(`(${user.role})`, 'gray')} \n  ${color(`Created: ${user.createdAt}`, 'dim')} ${color('|', 'dim')} ${color(`Modified: ${user.modifiedAt}`, 'dim')}`
            );
        });

        console.log('');
    }
};