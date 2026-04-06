const { parse } = require('dotenv');
const { CONFIG_DEFAULTS, set } = require('../../config');

const normalize = (str) => str.replace(/[^a-z0-9]/gi, '').toLowerCase();

const keyMap = Object.keys(CONFIG_DEFAULTS).reduce((acc, key) => {
  acc[normalize(key)] = key;
  return acc;
}, {});

const parseValue = (key, value) => {
  const defaultValue = CONFIG_DEFAULTS[key];

  if (typeof defaultValue === 'number') {
    const num = Number(value);
    if (Number.isNaN(num)) {
      throw new Error(`Invalid number for ${key}`);
    }
    return num;
  }

  if (typeof defaultValue === 'boolean') {
    return value.toLowerCase() === 'true';
  }

  return value; // string fallback
};

module.exports = {
    name: 'set',
    description: 'Set a config variable',
    usage: 'set <key> <value>',
    async execute(args) {
      const inputKey = args[0];

      if(args.length < 2) {
        console.error('Usage: set <key> <value>');
        return;
      }
    
const value = args.slice(1).join(' ');

const normalizedKey = normalize(inputKey);
const realKey = keyMap[normalizedKey];

if (!realKey) {
  console.error(`Invalid config variable: ${inputKey}`);
  return;
}

process.env[realKey] = value;

try {
  const parsed = parseValue(realKey, value);
  await set(realKey, parsed);
} catch (err) {
  console.error(`Failed to set config variable: ${err.message}`);
  return;
}

console.log(`Config variable ${realKey} set to ${value}`);
    }
}