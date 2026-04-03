const readline = require('readline');
const os = require('os');

const { drives:db } = require('../../db');

const exists = require('../../utils/exists');

module.exports = {
    name: 'mount',
    description: 'Mount a drive to the NAS',
    usage: 'mount <drive_name>',
    async execute(args) {
  console.log('Mounting drive...');
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        const question = (query) => new Promise(resolve => rl.question(query, resolve));
        const username = await question('Drive nickname: ');
        let rawPath = await question('Drive path: ');
        rawPath = rawPath.replace(/^~/, os.homedir());
        const path = require('path').resolve(rawPath);
        if(!(await exists(path))) {
            console.log('Invalid drive path:', path);
            process.exit(1);
        }
        rl.close();
        await db.create(username, {
            path: path
        });
        console.log(`Drive ${username} mounted.`);
    }
}