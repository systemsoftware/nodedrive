const fs = require('fs/promises');
const path = require('path');

const { color } = require('../ui');

module.exports = {
    name: 'help',
    description: 'Display CLI commands and usage',
    usage: 'help [search]',
    async execute() {
        const binDir = path.join(__dirname, '..');

        try {
            const entries = await fs.readdir(binDir, { withFileTypes: true });
            const commandDirs = entries.filter(entry => entry.isDirectory());

            console.log(
                color('\nNodeDrive CLI\n', 'cyan') +
                color('Usage: nodedrive <command> [subcommand]\n', 'dim')
            );

            for (const dir of commandDirs) {
                const dirPath = path.join(binDir, dir.name);
                const files = await fs.readdir(dirPath);

                const topCmd = path.basename(dirPath);
                const subCommands = files.filter(file => file.endsWith('.js'));
                const input = process.argv.slice(3).join(' ').trim().toLowerCase();

                const commands = [];

                for (const subFile of subCommands) {
                    const cmdPath = path.join(dirPath, subFile);
                    const cmd = require(cmdPath);

                    if (cmd.name) {
                        const fullName =
                            cmd.name !== topCmd
                                ? `${topCmd} ${cmd.name}`
                                : topCmd;

                        const matchesInput =
                            !input || fullName.toLowerCase().includes(input);

                        if (matchesInput) {
                            commands.push({
                            name: fullName,
                            description: cmd.description || 'No description',
                            usage: `nodedrive${cmd.name !== topCmd ? ` ${topCmd}`: ''} ${cmd.usage}`.trim()
                            });
                        }
                    }
                }

                if (!commands.length) continue;

                console.log(color(topCmd.toUpperCase(), 'yellow'));
                console.log(color('─'.repeat(topCmd.length), 'gray'));

                const longest = Math.max(...commands.map(c => c.name.length));

                commands.forEach(cmd => {
                    const padded = cmd.name.padEnd(longest);

                    console.log(
                        `  ${color(padded, 'green')} ${color('│', 'gray')} ${cmd.description}`
                    );

                    if (cmd.usage) {
                        console.log(
                            `  ${' '.repeat(longest)}   ${color(cmd.usage, 'dim')}`
                        );
                    }
                });

                console.log('');
            }

        } catch (err) {
            console.error(color('Error reading commands:', 'red'), err.message);
        }
    }
};