'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('client', [
  // 'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'app.controller',
  'app.filter',
  'app.services',
  'angular-loading-bar',
  'angularAwesomeSlider'
])

.run(['$rootScope', '$state', '$stateParams', function($rootScope, $state, $stateParams) {
  // It's very handy to add references to $state and $stateParams to the $rootScope
  // so that you can access them from any scope within your applications.For example,
  // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
  // to active whenever 'contacts.list' or one of its decendents is active.
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  $rootScope.$jwt = jwt;
}])

.config([
  '$stateProvider', '$urlRouterProvider', '$sceDelegateProvider',
  function($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
    $sceDelegateProvider.resourceUrlWhitelist(['**']);
    /////////////////////////////
    // Redirects and Otherwise //
    /////////////////////////////
    // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
    $urlRouterProvider
      .when('/project/:name', '/project/:name/project')
      .when('/user', '/user/info')
      .otherwise('/default');
    $stateProvider
      .state("default", {
        url: "/default",
        templateUrl: 'http://www.opensight.cn/views/default.html'
      })
      .state('user', {
        url: '/user',
        templateUrl: 'http://www.opensight.cn/views/user-menu.html'
      })
      .state('user.info', {
        url: '/info',
        templateUrl: 'http://www.opensight.cn/views/user-info.html'
      })
      .state('user.passwd', {
        url: '/passwd',
        templateUrl: 'http://www.opensight.cn/views/user-passwd.html'
      })
      .state('key', {
        url: '/key',
        templateUrl: 'http://www.opensight.cn/views/key.html'
      })
      .state('add-key', {
        url: '/add-key',
        templateUrl: 'http://www.opensight.cn/views/add-key.html'
      })
      .state('key-detail', {
        url: '/key/:key',
        templateUrl: 'http://www.opensight.cn/views/key-detail.html'
      })
      .state('project', {
        url: '/project/:project',
        templateUrl: 'http://www.opensight.cn/views/menu.html'
      })
      .state('project.project', {
        url: '/project',
        templateUrl: 'http://www.opensight.cn/views/project.html'
      })
      .state('project.camera', {
        url: '/camera',
        templateUrl: 'http://www.opensight.cn/views/camera.html'
      })
      .state('project.camera-detail', {
        url: '/camera/:camera',
        templateUrl: 'http://www.opensight.cn/views/camera-detail.html'
      })
      .state('project.log', {
        url: '/log',
        templateUrl: 'http://www.opensight.cn/views/log.html'
      })
      .state('project.user', {
        url: '/user',
        templateUrl: 'http://www.opensight.cn/views/user.html'
      });
  }
])

.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push(function($q, $rootScope) {
    return {
      request: function(config) {
        config.headers.Authorization = "Bearer " + jwt.jwt;
        config.headers['Content-Type'] = 'application/json';
        return config;
      },
      responseError: function(rejection, response, status) {
        $rootScope.$emit('responseErrorStart', rejection);
        return $q.reject(rejection);
      }
    };
  });
}]);