const { drives:db } = require('../../db');

module.exports = {
    name: 'unmount',
    description: 'Unmount a drive from the NAS',
    usage: 'unmount <drive_name>',
    async execute(args) {
 if (args.length < 1) {
            console.log('Please provide a drive name to unmount.');
            process.exit(1);
        }
        const usernameToDelete = args[0];
        const user = db.get(usernameToDelete);
        const userContent = await user.read();
        if (!user) {
            console.log(`Drive ${usernameToDelete} does not exist.`);
            process.exit(1);
        }
        if (bcrypt.compareSync('password', userContent.password)) {
            user.delete();
            console.log(`Drive ${usernameToDelete} unmounted.`);
        } else {
            console.log('Incorrect password.');
        }
    }
}