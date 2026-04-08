const { CONFIG_DEFAULTS } = require('../../config');

const SENSITIVE_KEYS = ['JWT_SECRET', 'ID_SECRET'];

const showSecrets = process.argv.includes('--show-secrets');

const os = require('os');

const { color } = require('../ui');

const mask = (value) => {
    if (!value) return color('(not set)', 'gray');
    if (showSecrets) return value;

    // partial mask: abcd...wxyz
    if (value.length <= 8) return '*'.repeat(value.length);

    return `${value.slice(0, 4)}...${value.slice(-4)}`;
};

module.exports = {
    name: 'list',
    description: 'List all config variables and their values',
    usage: 'list [--show-secrets]',
    async execute(args) {

        const keys = Object.keys(CONFIG_DEFAULTS);

        const longestKey = Math.max(...keys.map(k => k.length));

        console.log(color('\nNodeDrive Configuration\n', 'cyan'));

        keys.forEach(key => {
            let value = process.env[key];

            if (SENSITIVE_KEYS.includes(key)) {
                value = mask(value);
            } else if (value === undefined) {
                value = color('(not set)', 'gray');
            }

            const paddedKey = key.padEnd(longestKey);

            console.log(
                `${color(paddedKey, 'yellow')} ${color('│', 'gray')} ${color(value, 'green').replace(os.homedir(), '~')}`
            );
        });

        if (!showSecrets) {
            console.log(
                color('\nUse --show-secrets to reveal sensitive values', 'dim')
            );
        }

        console.log('');
    }
};