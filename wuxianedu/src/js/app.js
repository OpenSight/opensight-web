'use strict';
var api = api || 'http://api.opensight.cn/api/ivc/v1/';

var config = (function () {
  var def = {
    classroom: '1',
    desktop: '1'
  };
  var c = {
    get: function (key) {
      if (undefined === def[key]){
        console.log("字段名(" + key +")不合法");
        return -1;
      }
      var value = $.cookie(key);
      value = value || def[key], 10;
      return value;
    },
    set: function (key, value) {
      if (undefined === def[key]){
        console.log("字段名(" + key +")不合法");
        return false;
      }
      $.cookie(key, value, { expires: 365 });
      return true;
    }
  };
  return c;
})();

var project = (function () {
  var data = {};
  var p = {
    init: function () {
      $.ajax({
        url: 'json/project.json',
        type: 'GET',
        async: false,
        success: function(json) {
          data = json;
        },
        error: function() {
          /* Act on the event */
          console.log('配置文件不存在。');
        }
      });
    },
    get: function () {
      return $.extend(true, {}, data);
    }
  };
  return p;
})();

// Declare app level module which depends on views, and components
var app = angular.module('wuxianedu', [
  // 'ngAnimate',
  'ui.router',
  'ui.bootstrap',
  'app.controller',
  'app.filter',
  'app.services',
  // 'angular-loading-bar',
  'angularAwesomeSlider'
])

.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
  // It's very handy to add references to $state and $stateParams to the $rootScope
  // so that you can access them from any scope within your applications.For example,
  // <li ng-class="{ active: $state.includes('contacts.list') }"> will set the <li>
  // to active whenever 'contacts.list' or one of its decendents is active.
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
  project.init();
  $rootScope.$project = api + 'projects/' + project.get().project_name;
}])

.config([
  '$stateProvider', '$urlRouterProvider', '$sceDelegateProvider',
  function ($stateProvider, $urlRouterProvider, $sceDelegateProvider) {
    /////////////////////////////
    // Redirects and Otherwise //
    /////////////////////////////
    // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
    $urlRouterProvider.otherwise('/square');

    $sceDelegateProvider.resourceUrlWhitelist(['**']);
    $stateProvider.state("square", {
      url: "/square",
      templateUrl: 'view/square.html'
    })

    .state('config', {
      url: '/config',
      templateUrl: 'view/config.html'
    })

    .state('live', {
      url: '/live/:camera_uuid',
      templateUrl: 'view/live.html'
    });
  }
])

// .config(['$httpProvider', function ($httpProvider) {
//   $httpProvider.interceptors.push(function ($q, $rootScope) {
//     return {
//       request: function (config) {
//         if (-1 === config.url.indexOf('http://api.opensight.cn/')) {
//           return config;
//         }
//         config.headers.Authorization = "Bearer " + jwt.jwt;
//         config.headers['Content-Type'] = 'application/json';
//         return config;
//       },
//       responseError: function (rejection, response, status) {
//         $rootScope.$emit('responseErrorStart', rejection);
//         return $q.reject(rejection);
//       }
//     };
//   });
// }])

;
