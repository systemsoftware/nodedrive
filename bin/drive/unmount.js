const { drives:db } = require('../../db');
const bcrypt = require('bcrypt');

const { color } = require('../ui');

module.exports = {
    name: 'unmount',
    description: 'Unmount a drive from the NAS',
    usage: 'unmount <drive_name>',
    async execute(args) {
 if (args.length < 1) {
            console.log(color('Please provide a drive name to unmount.', 'red'));
            process.exit(1);
        }
        const usernameToDelete = args[0];
        const user = db.get(usernameToDelete);
        const userContent = await user.read();
        if (!user) {
            console.log(color(`Drive ${usernameToDelete} does not exist.`, 'red'));
            process.exit(1);
        }
        if (bcrypt.compareSync('password', userContent.password)) {
            user.delete();
            console.log(color(`Drive ${usernameToDelete} unmounted.`, 'green'));
        } else {
            console.log(color('Incorrect password.', 'red'));
        }
    }
}