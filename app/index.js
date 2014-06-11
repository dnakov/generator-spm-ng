'use strict';
var util = require('util');
var path = require('path');
var yeoman = require('yeoman-generator');
var chalk = require('chalk');
var process = require('child_process');
var path     = require('path');
var rmdir = require('rimraf');
var localTmp = path.resolve(__dirname, '../tmp');
var localAnt = path.resolve(__dirname, '../ant');
var localLib = path.resolve(__dirname, '../deps');


var GulpNgGenerator = yeoman.generators.Base.extend({
  init: function () {
    this.pkg = require('../package.json');

    this.on('end', function () {
      if (!this.options['skip-install']) {
        this.installDependencies();
      }
    });
    this.log(localTmp);
  },

  askFor: function () {
    var done = this.async();

    // have Yeoman greet the user
    this.log(this.yeoman);

    // replace it with a short and sweet description of your generator
    this.log(chalk.magenta('This generator will generate a web app project using gulp, bower and angularjs.'));
    this.options = {};
    var prompts = [{
        type: 'input',
        name: 'appName',
        message: 'Name of your app? ',
        default: this.appname.replace(/\s/g,'_')
      },{
        type: 'confirm',
        name: 'ngForce',
        message: 'ngForce is required to be installed in your org. Would you like to do that?',
        default: true
      },{
        when: function(props) { return props.ngForce; },
        type: 'list',
        name: 'deployUrl',
        message: 'Org Type',
        choices: [{name:'Production/Developer', value:"https://login.salesforce.com"},
                  {name:'Sandbox', value:"https://test.salesforce.com"}
        ]
      },{
        when: function(props) { return props.ngForce; },
        type: 'input',
        name: 'deployUser',
        message: 'SF Username: '
      },{
        when: function(props) { return props.ngForce; },
        type: 'input',
        name: 'deployPass',
        message: 'SF Password: '
      }
    ];

    this.prompt(prompts, function (props) {
      // if(props.deploy) ngForce(done);
      this.appName = props.appName;
      this.options.deploy = {};
      this.options.shouldDeploy = props.ngForce
      this.options.deploy.username = props.deployUser;
      this.options.deploy.password = props.deployPass;
      this.options.deploy.serverurl = props.deployUrl;
      if(props.ngForce) {
        process.spawn('ant',['-buildfile', ''])
      }
      done();
    }.bind(this));
  },

  app: function () {
    this.mkdir('app');
    this.copy('app/_app.css', 'app/styles/main.css');
    this.copy('app/_app.js','app/scripts/main.js');
    // this.copy('app/_app_controller.js','app/app_controller.js');
    // this.copy('app/_app_controller_test.js','app/app_controller_test.js');
    this.copy('app/_index.html','app/index.html');
    this.copy('_gitignore','.gitignore');

    // this.mkdir('app/components');
    // this.copy('app/components/_app_service.js', 'app/components/app_service.js');
    // this.copy('app/components/_app_service_test.js', 'app/components/app_service_test.js');

    // this.mkdir('app/main');
    this.copy('app/main/_main.html', 'app/views/main.html');
    // this.copy('app/main/_main_controller.js', 'app/views/main_controller.js');
    // this.copy('app/main/_main_controller_test.js', 'app/views/main_controller_test.js');
  },

  projectfiles: function () {
    this.copy('_bowerrc', '.bowerrc');
    this.copy('_bower.json', 'bower.json');
    this.copy('_gulpfile.js', 'gulpfile.js');
    this.copy('_package.json', 'package.json');
  },

  sfdc:function() {
    // this.mkdir('tmp');
    // this.mkdir('tmp/classes');
    // this.mkdir('tmp/components');
    // this.mkdir('tmp/staticresources');
    var self = this;
    rmdir.sync(localTmp);
    self.directory('src', localTmp + '/src');
    self.copy('src/pages/_vf.page', localTmp + '/src/pages/' + self.appName + '.page');
    self.copy('src/pages/_vf.page-meta.xml', localTmp + '/src/pages/' + self.appName + '.page-meta.xml');
    self.copy('package.xml', localTmp + '/package.xml');
  },
  sfdcDeploy:function() {
    if(!this.options.shouldDeploy) return;

    var self = this;
    var args =  [
      '-buildfile',
      path.join(localTmp,'/src/antdeploy.xml'),
      '-lib',
      localLib,
      '-Dbasedir='     + localTmp
    ];

    var ant = process.spawn('ant', args, {
      cwd: localTmp
    });
    ant.stdout.on('data', function(data) {
      self.log(data.toString());
    });
    ant.stderr.on('data', function (data) {
      self.log('stderr: ' + data.toString());
    });
  }

});

module.exports = GulpNgGenerator;
