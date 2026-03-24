const readline = require('readline');
const bcrypt = require('bcrypt');

const { users:db } = require('../../db');

module.exports = {
    name: "delete",
    description: "Delete a user",
    usage: "delete <username>",
    async execute(args) {
        if (args.length < 1) {
            console.log('Please provide a username to delete.');
            process.exit(1);
        }
        const usernameToDelete = args[0];
        const user = db.get(usernameToDelete)
        const userContent = await user.read();
        if (!user) {
            console.log(`User ${usernameToDelete} does not exist.`);
            process.exit(1);
        }
        if (bcrypt.compareSync('password', userContent.password)) {
            user.delete();
            console.log(`User ${usernameToDelete} deleted.`);
        } else {
            console.log('Incorrect password.');
        }
    }
}