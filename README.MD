# Davos - Your trusty WebDav companion.

> Davos is a WebDav client which is well suited to upload and sync your Cloud Commerce Digital projects. It fully mimics the usage of Eclipse Demandware server configurations featuring profiles and synchronization on file change.

[![NPM Version][npm-image]][npm-url]

## Install

```bash
npm i -g davos-cli
```

## Usage

In order to use davos you must first provide a `davos.json` file which essentially contains a JSON array with profiles.   
You can use `davos-cli` to interactively create this file and manage profiles.

### Profiles

To create the configuration file you can run 'davos-cli create'.

You could easily insert profiles (dev01, dev02, development etc.) by running the 'davos-cli insert'.

Running the 'davos-cli list' command will display a list of your profiles and will show which profile is active now.

To switch your active profile you can run 'davos-cli switch [name of profile]'.

### Upload and watch cartridges
Now that you have a configuration you could upload your cartridges or watch for changes:
* Run the 'davos-cli upload:cartridges' command to upload all your cartridges.
* Run the 'davos-cli upload:cartridges --cartridge [name of cartridge]' command to upload a single cartridge of your wish.
* Run the 'davos-cli watch' command to watch all your cartridges for changes.
* Run the 'davos-cli watch --cartridge [name of cartridge]' command to watch a single cartridge of your wish for changes.

### Upload and import meta

Davos can upload and import your entire sites meta or separate metadata files of your choice.

* Run `davos-cli upload:sites` to upload and import your entire sites directory.
* Run `davos-cli upload:meta --pattern *.xml` to upload and import only the files mattching your pattern from your `sites/meta` directory.

### Utility

Davos can create bundles from multiple xml files or split bundles into separate files. At this point you can merge any type of xml files sharing the same root element but can only split meta and library files. This functionality will be expanded in the future.

* Run `davos-cli merge [pattern] --out bundle.xml` to merge all files matching `pattern` from within the `sites` directory into `bundle.xml` in your cwd.
* Run `davos-cli split:meta [path/to/bundle.xml] --out dir/for/chunks` to split all custom and system type extensions and definitions into separate xml files.
* Run `davos-cli split:lib [path/to/bundle.xml] --out dir/for/chunks` to split all `content` elements of a library bundle.

### Configuration file specification

*table 1. Profile*

| key     | type    | description                                                                                  |
|---------|---------|----------------------------------------------------------------------------------------------|
| active  | Boolean | The active profile will be used by davos. There should only be one active profile at a time. |
| profile | String  | The name of the profile.                                                                     |
| config  | Object  | The profile configuration object, see table 2.                                               |

*table 2. Profile configuration*

| key             | type   | description                                                                                           |
|-----------------|--------|-------------------------------------------------------------------------------------------------------|
| hostname        | String | The sandbox' hostname                                                                                 |
| username        | String | Your username                                                                                         |
| password        | String | Your password                                                                                         |
| codeVersion     | String | The code version to which to deploy your cartridges                                                   |
| cartridge       | Array  |                                                                                                       |
| exclude         | Array  |                                                                                                       |
| templateReplace | Object |                                                                                                       |
| tmpDir          | String | A directory where temporary files and archives will be stored. This is optional and defaults to "tmp" |
| projectID       | String | The project name/ID                                                                                   |
| metaDir         | String | The base directory for the sites files. This is optional, defaults to "sites".                        |

#### Sample configuration

```json

[
	{
		"active": true,
		"profile": "dev01",
		"config": {
			"hostname": "dev01-web-proj.demandware.net",
			"username": "user1",
			"password": "password1",
			"cartridge": [
				"foo\\cartridges\\app_foo",
				"foo\\cartridges\\int_foo"
			],
			"codeVersion": "version1",
			"exclude": ["**/node_modules/**",
				"**/.sass-cache/**"]
		}
	},
	{
		"active": false,
		"profile": "dev02",
		"config": {
			"hostname": "dev02-web-proj.demandware.net",
			"username": "user2",
			"password": "password2",
			"cartridge": [
				"foo\\cartridges\\app_foo",
				"foo\\cartridges\\int_foo"
			],
			"codeVersion": "version1",
			"exclude": ["**/node_modules/**",
				"**/.sass-cache/**"]
		}
	}
]

```

## License

[MIT](http://vjpr.mit-license.org)

[npm-image]: https://img.shields.io/npm/v/davos-cli.svg
[npm-url]: https://npmjs.org/package/davos-cli
