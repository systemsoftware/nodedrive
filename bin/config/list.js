const { CONFIG_DEFAULTS } = require('../../config');

const SENSITIVE_KEYS = ['JWT_SECRET', 'ID_SECRET'];

const showSecrets = process.argv.includes('--show-secrets');

const os = require('os');

// ANSI colors (no deps)
const colors = {
    reset: '\x1b[0m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    gray: '\x1b[90m'
};

const color = (text, c) => `${colors[c]}${text}${colors.reset}`;

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