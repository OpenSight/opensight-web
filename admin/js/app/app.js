var app = angular.module('app', ['ui.router', 'oc.lazyLoad','angular-loading-bar', 'ngAnimate','ui.bootstrap','ngCookies','ngFileSaver']);

app
.config(function($controllerProvider, $compileProvider, $filterProvider, $stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $provide) {
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
        .when('/home/jump', '/home/projects')
        .when('/home', '/home/stats')
        .otherwise('/home/stats');

    $stateProvider
       .state('home', {
            url: '/home',
            views: {
                '':{
                    templateUrl: './views/home.html',
                    resolve: {
                        load: app.asyncjs("./js/controller/home.js")
                    }
                }
            }
        })
        .state('home.stats', {
            url: '/stats',
            views: {
                '': {
                    templateUrl: './views/stats.html',
                    resolve: {
                        load: app.asyncjs("./js/controller/stats.js")
                    }
                }
            }
        })
        .state('home.jump', {
            url: '/jump'
        })
        .state('home.keyManage', {
            url: '/key_manage',
            views: {
                '': {
                    templateUrl: './views/keyManage.html',
                    resolve: {
                        load: app.asyncjs("./js/controller/keyManage.js")
                    }
                }
            }

        })
        .state('home.customers', {
            url: '/customers',
            views: {
                '': {
                    templateUrl: './views/customers.html',
                    resolve: {
                        load: app.asyncjs(["./js/controller/customers.js", "./js/sjcl.js"])
                    }
                }
            }
        })
        .state('home.projects', {
            url: '/projects',
            views: {
                '': {
                    templateUrl: './views/projectList.html',
                    resolve: {
                        load: app.asyncjs("./js/controller/project.js")
                    }
                }
            }
        })
        .state('home.firmWare', {
            url: '/firmWare',
            templateUrl: './views/firmWareList.html',
            resolve: {
                load: app.asyncjs("./js/controller/firmWare.js")
            }
        })
        .state('home.projectDetail', {
            url: '/projectsDetail'

        })
        .state('home.session', {
            url: '/session',
            templateUrl: './views/session.html',
            resolve: {
                load: app.asyncjs("./js/controller/session.js")
            }
        })
        .state('userInfo', {
            url: '/user',
            templateUrl: './views/userInfo.html',
            resolve: {
                load: app.asyncjs(["./js/controller/user.js", "./js/sjcl.js"])
            }
        })
        .state('camera', {
            url: '/ipc',
            templateUrl: './views/cameraList.html',
            resolve: {
                load: app.asyncjs("./js/controller/ipc.js")
            }
        }).state('keys', {
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
            params: {info: null,traceback:null},
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

})
.config(['$httpProvider', function($httpProvider) {
        $httpProvider.interceptors.push(function($q, $rootScope) {
            return {
                request: function(config) {
                    config.headers.Authorization  = "Bearer " + jwt.jwt;
                    config.headers['Content-Type']  = 'application/json';
                    return config;
                },
                responseError: function(rejection, response, status) {
                    $rootScope.$emit('responseErrorStart', rejection);
                    return $q.reject(rejection);
                }
            };
        });
}]);