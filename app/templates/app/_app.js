'use strict';

angular.module('<%= appName %>', [ 'ngRoute','<%= appName %>-main','templates' ])
  .config(function ($routeProvider) {
    $routeProvider
      .otherwise({
        redirectTo: '/'
      });
  });

angular.module('<%= appName %>-main',['ngRoute'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      });
  })
  .controller('MainCtrl', function ($scope) {
    $scope.awesomeThings = [
      'NPM',
      'Yeoman',
      'bower',
      'gulp',
      'Proxly'
    ];
  });
