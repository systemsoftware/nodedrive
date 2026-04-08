#! /usr/bin/env node

const subcmd = process.argv[2];
const subsubcmd = process.argv[3];
const path = require('path');

require('../config')

const exists = require('../utils/exists');

const { color } = require('./ui');

const main = async () => {
    if (!subcmd) {
        console.log(color('No command provided. Use "help" for a list of commands.', 'yellow'));
        return;
    }

    const baseDir = __dirname; 
    let commandPath = subsubcmd 
        ? path.join(baseDir, subcmd, `${subsubcmd}.js`) 
        : path.join(baseDir, subcmd, 'index.js');


    if (!(await exists(commandPath))) {
        commandPath = path.join(baseDir, subcmd, 'index.js');
    }

    if (await exists(commandPath)) {
        require(commandPath).execute(process.argv.slice(subsubcmd ? 4 : 3));
    } else {
        console.error(`Command not found: ${subcmd} ${subsubcmd || ''}`);
    }
}

main();