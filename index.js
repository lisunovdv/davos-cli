#!/usr/bin/env node

process.env.UV_THREADPOOL_SIZE = 128;

(function () {
  'use strict';

  // Imports
  const chalk = require('chalk'),
    path = require('path'),
    Davos = require('davos'),
    ConfigManager = new Davos.ConfigManager(),
    Log = Davos.Logger;

  // Local dependencies
  const ConfigEditor = require('./src/config-editor');

  let configuration,
    activeConfig,
    argv,
    isNewConfigOrHelp = process.argv[2] === 'create' || process.argv[2] === undefined || process.argv[2] === '-h' || process.argv[2] === '--help';

  if (!isNewConfigOrHelp && !ConfigManager.isConfigExisting()) {
    Log.error(chalk.red(`\nCannot find configuration in [${process.cwd()}].`));
    return;
  }

  var configPath = path.join(process.cwd(), ConfigManager.getConfigName());

  if (!isNewConfigOrHelp) {
    activeConfig = ConfigManager.loadConfiguration().getActiveProfile();
  }

  argv = require('yargs')
    .usage('Usage: davos [command] [options]')
    .command('create', 'Creates a config file')
    .command('insert', 'Adds a new profile to the config file')
    .command('list', 'Lists all profiles')
    .command('edit', 'Edit profile in the config file')
    .command('switch', 'Switch to a specified profile')
    .command('sync', 'Sync the cartridges on the server with your local cartridges', function (yargs) {
      return yargs.config(activeConfig);
    }).command('upload', 'Upload cartredges', function (yargs) {
      return yargs.config(activeConfig);
    }).command('watch', 'Watch cartredges for changes', function (yargs) {
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

  let configEditor = new ConfigEditor(argv),
    command = argv._[0];
  switch (command) {
    case 'upload':
      new Davos.Core(argv).upload();
      break;
    case 'watch':
      new Davos.Core(argv).watch();
      break;
    case 'sync':
      new Davos.Core(argv).sync();
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
      Log.info(require('yargs').getUsageInstance().help());
      break;
    default:
      Log.info(chalk.red(`\nCommand ${command} doesn't exist`));
  }
}());
