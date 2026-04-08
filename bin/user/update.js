const readline = require('readline');
const bcrypt = require('bcrypt');

const { users:db } = require('../../db');
const { color } = require('../ui');

module.exports = {
    name: "update",
    description: "Update an existing user",
    usage: "update <username>",
    async execute(args) {
           const username = args[0];
        if (!username) {
            console.error('Username is required. Usage: update <username>');
            return;
        }
        const user = db.get(username);
        if (!user) {
            console.error(`User ${username} not found.`);
            return;
        }
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const question = (query) => new Promise(resolve => rl.question(query, resolve));
        const updateKey = await question('Field to update (password/permissions/role/denyAccess): ');
        let updateValue;
        if (updateKey.toLowerCase() === 'password') {
            const newPassword = await question('New password: ');
            updateValue = bcrypt.hashSync(newPassword, 10);
        } else if (updateKey.toLowerCase() === 'permissions') {
            const writePermissions = (await question('Write permissions (Y/N): ')).trim().toLowerCase() === 'y';
            const deletePermissions = (await question('Delete permissions (Y/N): ')).trim().toLowerCase() === 'y';
            updateValue = {
                write: writePermissions,
                delete: deletePermissions
            };
        } else if (updateKey.toLowerCase() === 'role') {
            updateValue = await question('New role (admin/user): ');
        } else if (updateKey.toLowerCase() === 'denyaccess') {
            updateValue = (await question('Deny access to any drives or files? (comma separated, leave blank for none): ')).split(',').map(s => s
                .trim()).filter(s => s);
        } else {
            console.error('Invalid field. Valid fields are: password, permissions, role, denyAccess');
            rl.close();
            return;
        }
        rl.close();
        await db.get(username).kv(updateKey, updateValue);
        console.log(color(`User ${username} updated successfully.`, 'green'));
    }
}