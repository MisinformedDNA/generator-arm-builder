'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const yosay = require('yosay');

module.exports = class extends Generator {
  prompting() {
    // Have Yeoman greet the user.
    this.log(yosay(
      'Welcome to the unreal ' + chalk.red('Azure ARM template') + ' generator!'
    ));

    const prompts = [{
      type: 'checkbox',
      name: 'resources',
      message: 'What components should exist in the template?',
      choices: [
        { name: 'Web App', value: 'webapp', checked: true },
        { name: "-- Application Insights", value: 'webapp_applicationinsights', checked: true },
        { name: "-- Auto Scale", value: 'webapp_autoscale' },
        { name: 'SQL Database', value: 'sqldb', checked: true }
      ],
      validate: function (answers) {
        if (answers.length < 1) {
          return "You must select at least one resource";
        }

        for (var i = 0; i < answers.length; i++) {
          var answer = String(answers[i]);

          var split = answer.split("_");
          if (split.length == 1) { continue; }

          var dependency = split[0];
          if (answers.findIndex(a => a == dependency) == -1) {
            return "If you select a child option, you must also select its parent";
          }
        }

        return true;
      }
    }];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  writing() {
    // this.fs.copy(
    //   this.templatePath('webapp.json'),
    //   this.destinationPath('azuredeploy.json')
    // );

    var destinationPath = this.destinationPath('azuredeploy.json');
    var destinationParametersPath = this.destinationPath('azuredeploy.parameters.json');
    var resources = [];

    this.fs.copy(
      this.templatePath('empty.json'),
      destinationPath
    );
    this.fs.copy(
      this.templatePath('empty.parameters.json'),
      destinationParametersPath
    );

    this.props.resources.forEach(function (element) {
      var templatePath = this.templatePath(element + ".json");

      // Merge document objects
      var contents = this.fs.readJSON(this.templatePath(element + ".json"));
      this.fs.extendJSON(destinationPath, contents);

      resources = resources.concat(contents["resources"]);

      contents = this.fs.readJSON(this.templatePath(element + ".parameters.json"));
      this.fs.extendJSON(destinationParametersPath, contents);
    }, this);

    // Set merged resources array
    var all = this.fs.readJSON(destinationPath);
    all.resources = resources;
    this.fs.writeJSON(destinationPath, all);
  }

  install() {
    //this.installDependencies();
  }
};
