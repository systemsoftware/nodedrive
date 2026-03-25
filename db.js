const dubnium = require('dubnium');
const os = require('os');

const { success, error, info } = require('./logs');

const path = process.env.DB_PATH || `${os.homedir()}/.nasdb`;

const usersDb = new dubnium(`${path}/users`, {
    metadata:false,
    versioning:{ enabled: true, limit:process.env.USERS_DB_VERSION_LIMIT || process.env.DB_VERSION_LIMIT || 5 },
    trash:false
});

const fileDb = new dubnium(`${path}/files`, {
    metadata:false,
    versioning:{ enabled: true, limit:process.env.FILES_DB_VERSION_LIMIT || process.env.DB_VERSION_LIMIT || 5 },
    trash:false
});

const permDb = new dubnium(`${path}/permissions`, {
    metadata:false,
    versioning:{ enabled: true, limit:process.env.PERMS_DB_VERSION_LIMIT || process.env.DB_VERSION_LIMIT || 5 },
    trash:false
});

const drivesDb = new dubnium(`${path}/drives`, {
    metadata:false,
    versioning:{ enabled: true, limit:process.env.DRIVES_DB_VERSION_LIMIT || process.env.DB_VERSION_LIMIT || 5 },
    trash:false
});

const systemHealthDb = new dubnium(`${path}/system_health`, {
    metadata:false,
    versioning:{ enabled: false },
    trash:false
});

const trashDb = new dubnium(`${path}/trash`, {
    metadata:false,
    versioning:{ enabled: false },
    trash:false
});

const indexesDb = new dubnium(`${path}/indexes`, {
    metadata:false,
    versioning:{ enabled: true, limit:process.env.INDEXES_DB_VERSION_LIMIT || process.env.DB_VERSION_LIMIT || 5 },
    trash:false
});

if(process.env.STARTED) success('Database initialized successfully.');

module.exports = {
    users: usersDb,
    files: fileDb,
    permissions: permDb,
    drives: drivesDb,
    systemHealth: systemHealthDb,
    trash: trashDb,
    indexes: indexesDb,
    path: path
};