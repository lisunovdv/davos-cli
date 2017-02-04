#!/usr/bin/env node
/*jshint esversion: 6 */
process.env.UV_THREADPOOL_SIZE = 128;
(function(){
    'use strict';

    const Davos = require('davos'),
        ConfigEditor = require('./src/config-editor'),
        config = require('./src/config'),
        fs = require('fs'),
        chalk = require('chalk'),
        log = require('./src/logger'),
        path = require('path');

    var configuration,
        activeConfig,
        argv,
        isNewConfigOrHelp = process.argv[2] === 'create' || process.argv[2] === undefined || process.argv[2] === '-h' || process.argv[2] === '--help';
    if (config.isConfigExisting() || isNewConfigOrHelp) {
    	var configPath = path.join(process.cwd(), config.getConfigName());
        if (!isNewConfigOrHelp) {
            configuration = config.loadConfiguration();

            //there was a problem retrieving the config file
            if(!!!configuration) {
            	log.error(chalk.red(`\nConfiguration ${configPath} cannot be read.`));
                return;
            }
            var activeProfile = configuration.find(x => x.active === true);
            if(!!!activeProfile) {
				log.error(chalk.red(`\nThere is no active profile in your configuration ${configPath}`));
				return;
            }
            activeConfig = activeProfile.config;
        }
        argv = require('yargs')
            .usage('Usage: davos [command] [options]')
            .command('create', 'Creates a config file')
            .command('insert', 'Adds a new profile to the config file')
            .command('list', 'Lists all profiles')
            .command('edit', 'Edit profile in the config file')
            .command('switch', 'Switch to a specified profile')
            .command('sync', 'Sync the cartridges on the server with your local cartridges', function(yargs) {
                return yargs.config(activeConfig);
            }).command('upload', 'Upload cartredges', function(yargs) {
                return yargs.config(activeConfig);
            }).command('watch', 'Watch cartredges for changes', function(yargs) {
                return yargs.config(activeConfig);
            })
            .example('davos create', 'create the config file')
            .example('davos insert', 'insert new profile in the config file')
            .example('davos list', 'list profiles in the config file')
            .example('davos edit --profile [name of profile]', 'edit the specified profile in the config file')
            .example('davos switch --profile [name of profile]', 'switch to specified profile in the config file')
            .example('davos sync --delete [boolean]', 'sync the cartridges on the server with your local cartridges. If delete option is passed, the cartridges on the server that does not exist in your local cartridges will be deleted.')
            .example('davos upload <optional>--cartridge [path to cartridge]</optional>', 'upload all cartridges from your configuration or a specific single cartridge from your local cartridges')
            .example('davos watch <optional>--cartridge [path to cartridge]</optional>', 'watch all cartridges from your configuration for changes or a specific single cartridge from your local cartridges')
            .config(activeConfig)
            .options({
                'profile': {
                    alias: 'P',
                    describe: 'Profile to activate'
                },
                'cartridge': {
                    alias: 'c',
                    describe: 'Cartridge to upload/watch.'
                },
                'username': {
                    alias: 'u',
                    describe: 'Username of your Sandbox'
                },
                'password': {
                    alias: 'p',
                    describe: 'Password of your Sandbox'
                },
                'hostname': {
                    alias: 'H',
                    describe: 'Sandbox URL'
                },
                'verbose': {
                    describe: 'verbose'
                },
            })
            .help('h')
            .alias('h', 'help')
            .argv;
        var davos = new Davos(argv);
        var configEditor = new ConfigEditor(argv);
        var command = argv._[0];
        switch (command) {
            case 'upload':
                davos.upload();
                break;
            case 'watch':
                davos.watch();
                break;
            case 'sync':
                davos.sync();
                break;
            case 'create':
                configEditor.createConfig();
                break;
            case 'insert':
                configEditor.insertProfile();
                break;
            case 'edit':
                configEditor.editProfile();
                break;
            case 'list':
                configEditor.listProfiles();
                break;
            case 'switch':
                configEditor.switchProfile();
                break;
            case undefined:
                log.info(require('yargs').getUsageInstance().help());
                break;
            default:
                log.info(chalk.red(`\nCommand ${command} doesn't exist`));
        }
    } else {
        log.error(chalk.red(`\nCannot find configuration in ${process.cwd()}`));
    }
}());
