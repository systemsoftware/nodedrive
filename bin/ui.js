const colors = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    cyan: '\x1b[36m',
    yellow: '\x1b[33m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    gray: '\x1b[90m'
};

const color = (text, c) => `${colors[c]}${text}${colors.reset}`;

const section = (title) =>
    `\n${color(title, 'cyan')}\n${color('─'.repeat(title.length), 'gray')}`;

const formatKey = (key) =>
    key.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase());

module.exports = { color, section, formatKey };