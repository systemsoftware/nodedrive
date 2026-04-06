const dubnium = require('dubnium');
const os = require('os');
const fs = require('fs');
const path = require('path');
const CONFIG_DIR = path.join(os.homedir(), '.nodedrive');
const crypto = require('crypto');

const cdb = new dubnium(`${os.homedir()}/.nodedrive`);
const CONFIG_PATH = path.join(CONFIG_DIR, 'config.json');


const CONFIG_DEFAULTS = {
    PORT: 80,
    JWT_SECRET: crypto.randomBytes(32).toString('hex'),
    ID_SECRET: crypto.randomBytes(32).toString('hex'),
    DB_PATH:`${os.homedir()}/.nodedrive/db`,
    ADVANCED_LOGGING: false,
    ADVANCED_ADVANCED_LOGGING: false,
    DB_VERSION_LIMIT: 10,
}

if(!fs.existsSync(CONFIG_PATH)) {
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(CONFIG_DEFAULTS, null, 2));
}

module.exports = {
    get: async (key) => {
        return (await cdb.get('config').read())[key];
    },
    set: async (key, value) => {
        await cdb.get('config').kv(key, value);
    },
    has: () => {
        return cdb.has('config')
    },
    make() {
        if(!cdb.has('config')) {
            cdb.create('config', CONFIG_DEFAULTS);
        }
    },
    CONFIG_DEFAULTS
}

if (!fs.existsSync(CONFIG_DIR)) {
  fs.mkdirSync(CONFIG_DIR, { recursive: true });
}

// load config
let config = {};
if (fs.existsSync(CONFIG_PATH)) {
  try {
    config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
  } catch {
    console.warn('Invalid config.json, using defaults');
  }
}


for (const key of Object.keys(CONFIG_DEFAULTS)) {
  if (!process.env[key]) {
    process.env[key] =
      config[key] !== undefined
        ? String(config[key])
        : CONFIG_DEFAULTS[key];
  }
}

process.env.fromConfig = true;

if (!process.env.JWT_SECRET) {
  if (!config.JWT_SECRET) {
    const crypto = require('crypto');
    config.JWT_SECRET = crypto.randomBytes(32).toString('hex');

    fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
    console.log('Generated JWT secret');
  }

  process.env.JWT_SECRET = config.JWT_SECRET;
}