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
    .usage('Usage: davos [command] [parameters] [options]')
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
    }).command("split", "Split xml bundle", function (yargs) {
      return yargs.config(activeConfig);
    })
    .command("merge", "Merge multiple xml files into a bundle")
    .example('davos create', 'create the config file')
    .example('davos insert', 'insert new profile in the config file')
    .example('davos list', 'list profiles in the config file')
    .example('davos edit [name of profile]', 'edit the specified profile in the config file')
    .example('davos switch [name of profile]', 'switch to specified profile in the config file')
    .example('davos sync --delete [boolean]', 'sync the cartridges on the server with your local cartridges. If delete option is passed, the cartridges on the server that does not exist in your local cartridges will be deleted.')
    .example('davos upload:cartridges <optional>--cartridge [path to cartridge]</optional>', 'upload all cartridges from your configuration or a specific single cartridge from your local cartridges')
    .example('davos upload:sites <optional>--meta [path to meta]</optional>', 'import sites meta')
    .example("davos upload:meta <optional>--pattern *.xml</optional>", "Upload and import all meta files matching the pattern. Default pattern is *")
    .example('davos watch <optional>--cartridge [path to cartridge]</optional>', 'watch all cartridges from your configuration for changes or a specific single cartridge from your local cartridges')
    .example("davos split:meta [path/to/bundle.xml] <optional>--out dir/for/chunks</optional>", "split a meta bundle into chunks by attribute group. Path must be relative starting from site_template directory.")
    .example("davos split:lib [path/to/bundle.xml] <optional>--out dir/for/chunks</optional>", "split a library bundle into chunks by content. Path must be relative starting from site_template directory.")
    .example("davos merge [pattern] <optional>--out bundle.xml</optional>", "merge all files matching the pattern into a bundle.xml in your CWD")
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

  let command = argv._[0];
  switch (command) {
    case 'upload:cartridges':
      argv.cartridge = [argv.cartridge];
      new Davos.Core(argv, ConfigManager).uploadCartridges();
      break;
    case 'upload:sites':
      new Davos.Core(argv, ConfigManager).uploadSitesMeta();
      break;
    case "upload:meta":
      new Davos.Core(argv, ConfigManager).uploadMeta();
      break;
    case 'watch':
      new Davos.Core(argv, ConfigManager).watch();
      break;
    case "split:meta":
      new Davos.Core(argv, ConfigManager).splitMetaBundle();
      break;
    case "split:lib":
      new Davos.Core(argv, ConfigManager).splitLibraryBundle();
      break;
    case "merge":
      new Davos.Core(argv, ConfigManager).merge();
      break;
    case 'sync':
      new Davos.Core(argv, ConfigManager).sync();
      break;
    case 'create':
      new ConfigEditor(argv, ConfigManager).createConfig();
      break;
    case 'insert':
      new ConfigEditor(argv, ConfigManager).insertProfile();
      break;
    case 'edit':
      new ConfigEditor(argv, ConfigManager).editProfile();
      break;
    case 'list':
      new ConfigEditor(argv, ConfigManager).listProfiles();
      break;
    case 'switch':
      new ConfigEditor(argv, ConfigManager).switchProfile();
      break;
    case undefined:
      Log.info(require('yargs').getUsageInstance().help());
      break;
    default:
      Log.info(chalk.red(`\nCommand ${command} doesn't exist`));
  }
}());
