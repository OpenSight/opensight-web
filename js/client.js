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
    /////////////////////////////
    // Redirects and Otherwise //
    /////////////////////////////
    // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
    $urlRouterProvider
      .when('/project/:name', '/project/:name/project')
      .when('/user', '/user/info')
      .otherwise('/default');

    $sceDelegateProvider.resourceUrlWhitelist(['**']);
    $stateProvider
      .state("default", {
        url: "/default",
        templateUrl: path + 'views/default.html'
      })
      .state('user', {
        url: '/user',
        templateUrl: path + 'views/user-menu.html'
      })
      .state('user.info', {
        url: '/info',
        templateUrl: path + 'views/user-info.html'
      })
      .state('user.passwd', {
        url: '/passwd',
        templateUrl: path + 'views/user-passwd.html'
      })
      .state('key', {
        url: '/key',
        templateUrl: path + 'views/key.html'
      })
      .state('add-key', {
        url: '/add-key',
        templateUrl: path + 'views/add-key.html'
      })
      .state('key-detail', {
        url: '/key/:key',
        templateUrl: path + 'views/key-detail.html'
      })
      .state('project', {
        url: '/project/:project',
        templateUrl: path + 'views/menu.html'
      })
      .state('project.project', {
        url: '/project',
        templateUrl: path + 'views/project.html'
      })
      .state('project.camera', {
        url: '/camera',
        templateUrl: path + 'views/camera.html'
      })
      .state('project.camera-detail', {
        url: '/camera/:camera?isOnline',
        templateUrl: path + 'views/camera-detail.html'
      })
      .state('project.camera-replay', {
        url: '/camera-replay/:camera?camname',
        templateUrl: path + 'views/camera-replay.html'
      })
      .state('project.schedule', {
        url: '/schedule',
        templateUrl: path + 'views/schedule.html'
      })
      .state('project.add-schedule', {
        url: '/add-schedule',
        templateUrl: path + 'views/add-schedule.html'
      })
      .state('project.schedule-detail', {
        url: '/schedule/:schedule',
        templateUrl: path + 'views/schedule-detail.html'
      })
      .state('project.log', {
        url: '/log',
        templateUrl: path + 'views/log.html'
      })
      .state('project.session-status', {
        url: '/session-status',
        templateUrl: path + 'views/session-status.html'
      })
      .state('project.user', {
        url: '/user',
        templateUrl: path + 'views/user.html'
      })
      .state('project.bill', {
        url: '/bill',
        templateUrl: path + 'views/bill.html'
      })
      .state('project.bill-detail', {
        url: '/bill-detail/:bill',
        templateUrl: path + 'views/bill-detail.html'
      })
      .state('project.record-event', {
        url: '/record-event',
        templateUrl: path + 'views/record-event.html'
      })
      .state('project.record-event-detail', {
        url: '/record-event-detail/:event',
        templateUrl: path + 'views/record-event-detail.html'
      })
      .state('project.live', {
          url: '/live',
          templateUrl: path + 'views/live.html'
      })
      .state('project.add-live', {
          url: '/add-live',
          templateUrl: path + 'views/add-live.html'
      })
      .state('project.live-detail', {
          url: '/live-detail/:showid',
          templateUrl: path + 'views/live-detail.html'
      })

    ;
  }
])

.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push(function($q, $rootScope) {
    return {
      request: function(config) {
        if (-1 === config.url.indexOf('http://api.opensight.cn/')){
          return config;
        }
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