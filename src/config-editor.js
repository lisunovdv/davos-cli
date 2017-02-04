/*jshint esversion: 6 */
(function() {
    'use strict';
    const config = require('./config'),
        log = require('./logger');

    const prompt = require('prompt'),
        chalk = require('chalk');

    let createInsertEdit = [{
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

    class ConfigEditor {
        constructor(conf) {
            this.conf = conf;
            return this;
        }

        createConfig() {
            var self = this;
            let workingDirectory = self.conf.basePath || process.cwd(),
                cartridges = config.getCartridges(workingDirectory, []);
            if (cartridges.length > 0) {
                if (config.isConfigExisting()) {
                    log.info(chalk.yellow('\nConfiguration already exists'));
                } else {
                    prompt.start();

                    prompt.get(createInsertEdit, function(err, result) {
                        if (err) {
                            return config.promptError(err);
                        }


                        let excludes = result.exclude.split(' '),
                            configJSON = [{
                                active: true,
                                profile: result.hostname.split('-')[0],
                                config: {
                                    hostname: result.hostname,
                                    username: result.username,
                                    password: result.password,
                                    cartridge: cartridges,
                                    codeVersion: result.codeversion,
                                    exclude: excludes
                                }
                            }];
                        config.saveConfiguration(configJSON);
                        process.exit();
                    });
                }
            } else {
                log.info(chalk.yellow(`No cartridges found in ${workingDirectory} and it's subdirectories`));
            }
        }

        insertProfile() {
            var self = this;
            prompt.start();
            prompt.get(createInsertEdit, function(err, result) {
                if (err) {
                    return config.promptError(err);
                }
                let workingDirectory = self.conf.basePath || process.cwd(),
                    cartridges = config.getCartridges(workingDirectory, []),
                    i,
                    currentProfile,
                    excludes = result.exclude.split(' '),
                    profileJSON = {
                        active: false,
                        profile: result.hostname.split('-')[0],
                        config: {
                            hostname: result.hostname,
                            username: result.username,
                            password: result.password,
                            cartridge: cartridges,
                            codeVersion: result.codeversion,
                            exclude: excludes
                        }
                    },
                    configJSON = config.loadConfiguration(),
                    newProfile = result.hostname.split('-')[0],
                    isProfileExisting = false,
                    len = configJSON.length;

                for (i = 0; i < len; i += 1) {
                    currentProfile = configJSON[i];
                    if (currentProfile.profile === newProfile) {
                        isProfileExisting = true;
                    }
                }
                if (isProfileExisting) {
                    log.info(chalk.yellow(`\n${newProfile} exists in your current configuration`));
                } else {
                    configJSON.push(profileJSON);
                    config.saveConfiguration(configJSON);
                    log.info(chalk.cyan(`\n${newProfile} inserted successfuly.`));
                }

            });
        }

        editProfile() {
            var self = this;
            let profile = (!self.conf.profile) ? self.conf.P : self.conf.profile;
            if (!profile || profile === true) {
                let message = (profile === undefined) ? '\nUse edit --profile or -P [profile name]' : '\nPlease specify a profile';
                log.info(chalk.yellow(message));
                return;
            }

            let list = config.loadConfiguration();

            let i,
                currentProfile,
                newList = [],
                len = list.length,
                foundProfile = list.find(x => x.profile === profile);
            if (foundProfile) {
                prompt.start();
                prompt.get(createInsertEdit, function(err, result) {
                    if (err) {
                        return config.promptError(err);
                    }
                    let workingDirectory = self.conf.basePath || process.cwd(),
                        cartridges = config.getCartridges(workingDirectory, []);
                    let excludes = result.exclude.split(' '),
                        newConfig = {
                            hostname: result.hostname,
                            username: result.username,
                            password: result.password,
                            cartridge: cartridges,
                            codeVersion: result.codeversion,
                            exclude: excludes
                        };
                    for (i = 0; i < len; i += 1) {
                        currentProfile = list[i];
                        currentProfile.active = currentProfile.active;
                        currentProfile.profile = (currentProfile === foundProfile) ? result.hostname.split('-')[0] : currentProfile.profile;
                        currentProfile.config = (currentProfile === foundProfile) ? newConfig : currentProfile.config;
                        newList.push(currentProfile);
                    }
                    config.saveConfiguration(newList);
                    log.info(chalk.cyan(`\nSuccessfuly updated profile ${profile}`));
                });
            } else {
                log.info(chalk.red(`\nCannot find ${profile} profile`));
                return;
            }
        }

        listProfiles() {
            let list = config.loadConfiguration(),
                i,
                currentProfile,
                result,
                activeProfile = list.find(x => x.active === true),
                len = list.length;
            for (i = 0; i < len; i += 1) {
                currentProfile = list[i];
                result = chalk.bgWhite(chalk.black(currentProfile.profile));
                if (currentProfile === activeProfile) {
                    result += chalk.cyan(' <--- active');
                }
                log.info(`\n${result}`);
            }
        }

        switchProfile() {
            var self = this;
            let profile = (!self.conf.profile) ? self.conf.P : self.conf.profile;
            if (!profile || profile === true) {
                let message = (profile === undefined) ? '\nUse switch --profile or -P [profile name]' : '\nPlease specify a profile';
                log.info(chalk.yellow(message));
                return;
            }

            let list = config.loadConfiguration(),
                i,
                currentProfile,
                newList = [],
                len = list.length,
                foundProfile = list.find(x => x.profile === profile);
            if (foundProfile) {
                for (i = 0; i < len; i += 1) {
                    currentProfile = list[i];
                    currentProfile.active = (currentProfile === foundProfile) ? true : false;
                    newList.push(currentProfile);
                }
                config.saveConfiguration(newList);
                log.info(chalk.cyan(`\nSwitched to ${foundProfile.profile}. It is now your active profile`));
            } else {
                log.info(chalk.red(`\nCannot find ${profile} profile`));
                return;
            }
        }
    }
    module.exports = ConfigEditor;
}());
