const readline = require('readline');
const bcrypt = require('bcrypt');

const { users:db } = require('../../db');

module.exports = {
    name: "create",
    description: "Create a new user",
    usage: "create <username>",
    async execute(args) {
            const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const question = (query) => new Promise(resolve => rl.question(query, resolve));
        const username = await question('Username: ');
        const password = await question('Password: ');
        const writePermissions = (await question('Write permissions (Y/N): ')).trim().toLowerCase() === 'y';
        const deletePermissions = (await question('Delete permissions (Y/N): ')).trim().toLowerCase() === 'y';
        const denyAccess = (await question('Deny access to any drives or files? (comma separated, leave blank for none): ')).split(',').map(s => s.trim()).filter(s => s);
        const role = await question('Role (admin/user): ');
        rl.close();
        const hashedPassword = bcrypt.hashSync(password, 10);
        await db.create(username, {
            password: hashedPassword,
            permissions: {
                write: writePermissions,
                delete: deletePermissions
            },
            role,
            denyAccess
        });
        console.log(`User ${username} created.`);
    }
}