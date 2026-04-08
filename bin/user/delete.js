const readline = require('readline');
const bcrypt = require('bcrypt');

const { users:db } = require('../../db');

const color = require('../ui')

module.exports = {
    name: "delete",
    description: "Delete a user",
    usage: "delete <username>",
    async execute(args) {
        if (args.length < 1) {
            console.log(color(`Usage: ${this.usage}`, 'red'));
            process.exit(1);
        }
        const usernameToDelete = args[0];
        const user = db.get(usernameToDelete)
        const userContent = await user.read();
        if (!user) {
            console.log(color(`User ${usernameToDelete} does not exist.`, 'red'));
            process.exit(1);
        }
        if (bcrypt.compareSync('password', userContent.password)) {
            user.delete();
            console.log(color(`User ${usernameToDelete} deleted.`, 'green'));
        } else {
            console.log(color('Incorrect password.', 'red'));
        }
    }
}