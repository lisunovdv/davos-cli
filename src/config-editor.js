(function () {
  'use strict';

  // Constants
  const createInsertEdit = [{
    name: 'hostname',
    description: 'Hostname of your Sandbox (without https:// prefix)',
    required: true
  }, {
    name: 'username',
    description: 'Username of your Sandbox',
    required: true
  }, {
    name: 'password',
    hidden: true,
    description: 'Password of your Sandbox (the input won\'t be visible)',
    required: true
  }, {
    name: 'codeversion',
    description: 'Code Version (default is version1)',
    default: 'version1'
  }, {
    name: 'exclude',
    description: 'Exclude uploading folders and files. Separate all excludes by space',
    default: '**/node_modules/**'
  }];

  // Imports
  const prompt = require('prompt'),
    chalk = require('chalk'),
    davos = require('davos'),
    config = davos.config,
    log = davos.logger;

  class ConfigEditor {
    constructor (conf) {
      this.conf = conf;
      return this;
    }

    createConfig () {
      const self = this;

      let workingDirectory = self.conf.basePath || process.cwd(),
        cartridges = config.getCartridges(workingDirectory, []);

      if (config.isConfigExisting()) {
        log.info(chalk.yellow('\nConfiguration already exists.'));
        return;
      } else if (cartridges.length < 1) {
        log.info(chalk.yellow(`No cartridges found in ${workingDirectory} and it's subdirectories.`));
        return;
      }

      prompt.start();
      prompt.get(createInsertEdit, function (err, result) {
        if (err) {
          return config.promptError(err);
        }

        config.saveConfiguration([
          {
            active: true,
            profile: result.hostname.split('-')[0],
            config: {
              hostname: result.hostname,
              username: result.username,
              password: result.password,
              cartridge: cartridges,
              codeVersion: result.codeversion,
              exclude: result.exclude.split(' ')
            }
          }
        ]);
      });
    }

    insertProfile () {
      const self = this;

      prompt.start();
      prompt.get(createInsertEdit, function (err, result) {
        if (err) {
          return config.promptError(err);
        }

        let workingDirectory = self.conf.basePath || process.cwd(),
          cartridges = config.getCartridges(workingDirectory, []),
          configJSON = config.loadConfiguration(),
          len = configJSON.length,
          newProfile = result.hostname.split('-')[0];

        for (let i = 0; i < len; i++) {
          if (configJSON[i].profile === newProfile) {
            log.info(chalk.yellow(`\nProfile ${newProfile} exists in your current configuration.`));
            return;
          }
        }

        configJSON.push({
          active: false,
          profile: result.hostname.split('-')[0],
          config: {
            hostname: result.hostname,
            username: result.username,
            password: result.password,
            cartridge: cartridges,
            codeVersion: result.codeversion,
            exclude: result.exclude.split(' ')
          }
        });

        config.saveConfiguration(configJSON);

        log.info(chalk.cyan(`\n${newProfile} inserted successfuly.`));
      });
    }

    editProfile () {
      const self = this;

      let list = config.loadConfiguration(),
        profile = (!self.conf.profile) ? self.conf.P : self.conf.profile,
        foundProfile = list.find(x => x.profile === profile),
        len = list.length;

      if (!profile || profile === true) {
        let message = (profile === undefined) ? '\nUse edit --profile or -P [profile name].' : '\nPlease specify a profile.';
        log.info(chalk.yellow(message));
        return;
      } else if (foundProfile === undefined) {
        log.info(chalk.red(`\nCannot find ${profile} profile`));
        return;
      }

      prompt.start();
      prompt.get(createInsertEdit, function (err, result) {
        if (err) {
          return config.promptError(err);
        }

        let workingDirectory = self.conf.basePath || process.cwd(),
          cartridges = config.getCartridges(workingDirectory, []),
          newList = [];

        for (let i = 0; i < len; i++) {
          let currentProfile = list[i];

          if (currentProfile === foundProfile) {
            currentProfile.profile = result.hostname.split('-')[0];
            currentProfile.config = {
              hostname: result.hostname,
              username: result.username,
              password: result.password,
              cartridge: cartridges,
              codeVersion: result.codeversion,
              exclude: result.exclude.split(' ')
            };
          }

          newList.push(currentProfile);
        }

        config.saveConfiguration(newList);

        log.info(chalk.cyan(`\nSuccessfuly updated profile ${profile}`));
      });
    }

    listProfiles() {
      let list = config.loadConfiguration(),
        activeProfile = list.find(x => x.active === true),
        len = list.length,
        result;

      for (let i = 0; i < len; i++) {
        let currentProfile = list[i];

        result = chalk.bgWhite(chalk.black(currentProfile.profile));
        if (currentProfile === activeProfile) {
          result += chalk.cyan(' <--- active');
        }

        log.info(`\n${result}`);
      }
    }

    switchProfile() {
      const self = this;

      let list = config.loadConfiguration(),
        profile = (!self.conf.profile) ? self.conf.P : self.conf.profile,
        foundProfile = list.find(x => x.profile === profile),
        newList = [],
        len = list.length;

      if (!profile || profile === true) {
        let message = (profile === undefined) ? '\nUse switch --profile or -P [profile name].' : '\nPlease specify a profile.';
        log.info(chalk.yellow(message));
        return;
      } else if (foundProfile === undefined) {
        log.info(chalk.red(`\nCannot find ${profile} profile.`));
        return;
      }

      for (let i = 0; i < len; i++) {
        let currentProfile = list[i];
        currentProfile.active = (currentProfile === foundProfile) ? true : false;
        newList.push(currentProfile);
      }

      config.saveConfiguration(newList);

      log.info(chalk.cyan(`\nSwitched to ${foundProfile.profile}. It is now your active profile.`));
    }
  }

  module.exports = ConfigEditor;
}());
