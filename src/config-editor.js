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
    Davos = require('davos'),
    ConfigManager = new Davos.ConfigManager(),
    Log = Davos.Logger;

  class ConfigEditor {
    constructor (config) {
      this.config = config;
      return this;
    }

    createConfig () {
      const self = this;

      let workingDirectory = self.config.basePath || process.cwd(),
        cartridges = ConfigManager.getCartridges(workingDirectory);

      if (ConfigManager.config.isConfigExisting()) {
        Log.info(chalk.yellow('\nConfiguration already exists.'));
        return;
      } else if (cartridges.length < 1) {
        Log.info(chalk.yellow(`No cartridges found in ${workingDirectory} and it's subdirectories.`));
        return;
      }

      prompt.start();
      prompt.get(createInsertEdit, function (err, result) {
        if (err) {
          return ConfigManager.promptError(err);
        }

        ConfigManager.saveConfiguration([
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
          return ConfigManager.promptError(err);
        }

        let workingDirectory = self.config.basePath || process.cwd(),
          cartridges = ConfigManager.getCartridges(workingDirectory),
          profiles = ConfigManager.loadConfiguration().getProfiles(),
          len = profiles.length,
          newProfile = result.hostname.split('-')[0];

        for (let i = 0; i < len; i++) {
          if (profiles[i].profile === newProfile) {
            Log.info(chalk.yellow(`\nProfile ${newProfile} exists in your current configuration.`));
            return;
          }
        }

        profiles.push({
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

        ConfigManager.saveConfiguration(profiles);

        Log.info(chalk.cyan(`\n${newProfile} inserted successfuly.`));
      });
    }

    editProfile () {
      const self = this;

      let profile = self.config.profile || self.config.P,
        profiles = ConfigManager.loadConfiguration().getProfiles(),
        foundProfile = profiles.find(x => x.profile === profile),
        len = profiles.length;

      if (!profile || profile === true) {
        let message = (profile === undefined) ? '\nUse edit --profile or -P [profile name].' : '\nPlease specify a profile.';
        Log.info(chalk.yellow(message));
        return;
      } else if (foundProfile === undefined) {
        Log.info(chalk.red(`\nCannot find ${profile} profile`));
        return;
      }

      prompt.start();
      prompt.get(createInsertEdit, function (err, result) {
        if (err) {
          return ConfigManager.promptError(err);
        }

        let workingDirectory = self.config.basePath || process.cwd(),
          cartridges = ConfigManager.getCartridges(workingDirectory),
          newList = [];

        for (let i = 0; i < len; i++) {
          let currentProfile = profiles[i];

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

        ConfigManager.saveConfiguration(newList);

        Log.info(chalk.cyan(`\nSuccessfuly updated profile ${profile}`));
      });
    }

    listProfiles() {
      let profiles = ConfigManager.loadConfiguration().getProfiles(),
        activeProfile = profiles.find(x => x.active === true),
        len = profiles.length,
        result;

      for (let i = 0; i < len; i++) {
        let currentProfile = profiles[i];

        result = chalk.bgWhite(chalk.black(currentProfile.profile));
        if (currentProfile === activeProfile) {
          result += chalk.cyan(' <--- active');
        }

        Log.info(`\n${result}`);
      }
    }

    switchProfile() {
      const self = this;

      let profile = self.config.profile || self.config.P,
        profiles = ConfigManager.loadConfiguration().getProfiles(),
        foundProfile = profiles.find(x => x.profile === profile),
        len = profiles.length,
        newList = [];

      if (!profile || profile === true) {
        let message = (profile === undefined) ? '\nUse switch --profile or -P [profile name].' : '\nPlease specify a profile.';
        Log.info(chalk.yellow(message));
        return;
      } else if (foundProfile === undefined) {
        Log.info(chalk.red(`\nCannot find ${profile} profile.`));
        return;
      }

      for (let i = 0; i < len; i++) {
        let currentProfile = profiles[i];
        currentProfile.active = (currentProfile === foundProfile) ? true : false;
        newList.push(currentProfile);
      }

      ConfigManager.saveConfiguration(newList);

      Log.info(chalk.cyan(`\nSwitched to ${foundProfile.profile}. It is now your active profile.`));
    }
  }

  module.exports = ConfigEditor;
}());
