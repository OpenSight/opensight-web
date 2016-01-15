var app = angular.module('app', ['ui.router', 'oc.lazyLoad','angular-loading-bar', 'ngAnimate','ui.bootstrap']);

app.config(function($controllerProvider, $compileProvider, $filterProvider, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $provide) {
    app.register = {
        controller: $controllerProvider.register,
        directive: $compileProvider.directive,
        filter: $filterProvider.register,
        factory: $provide.factory,
        service: $provide.service
    };

    app.asyncjs = function (js) {
        return ['$ocLazyLoad', function($ocLazyLoad) {
            return $ocLazyLoad.load(js);
        }];
    };

    $urlRouterProvider
        .otherwise('/stats');

    $stateProvider.
        state('stats', {
            url: '/stats',
            templateUrl: './views/stats.html',
            resolve: {
                load: app.asyncjs("./js/controller/stats.js")
            }
        })
        .state('userInfo', {
            url: '/user',
            templateUrl: './views/userInfo.html',
            resolve: {
                load: app.asyncjs("./js/controller/user.js")
            }
        })
        .state('customers', {
            url: '/customers',
            templateUrl: './views/customers.html',
            resolve: {
                load: app.asyncjs("./js/controller/customers.js")
            }
        })
        .state('projects', {
            url: '/projects',
            templateUrl: './views/projectList.html',
            resolve: {
                load: app.asyncjs("./js/controller/project.js")
            }
        }).state('camera', {
            url: '/ipc',
            templateUrl: './views/cameraList.html',
            resolve: {
                load: app.asyncjs("./js/controller/ipc.js")
            }
        }).state('apiKey', {
            url: '/key',
            templateUrl: './views/apiKeys.html',
            resolve: {
                load: app.asyncjs("./js/controller/key.js")
            }
        }).state('help', {
            url: '/help',
            templateUrl: './views/help.html',
            resolve: {
                load: app.asyncjs("./js/controller/project.js")
            }
        }).state('logOut', {
            url: '/logOut',
            templateUrl: './views/logOut.html',
            resolve: {
                load: app.asyncjs("./js/controller/logout.js")
            }
        }).state('aboutUs', {
            url: '/about',
            templateUrl: './views/aboutUs.html',
            resolve: {
                load: app.asyncjs("./js/controller/project.js")
            }
        }).state('law', {
            url: '/law',
            templateUrl: './views/laws.html',
            resolve: {
                load: app.asyncjs("./js/controller/project.js")
            }
        }).state('contract', {
            url: '/contract',
            templateUrl: './views/contractUs.html',
            resolve: {
                load: app.asyncjs("./js/controller/project.js")
            }
        });

});