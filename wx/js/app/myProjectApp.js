//var wx_api = "http://api.opensight.cn/api/ivc/v1/wechat/";
//var bindUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
//    "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" +
//    "bind.html&response_type=code&scope=snsapi_userinfo&state=myProject" +
//    "#wechat_redirect";
//var codeLoginUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
//    "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" +
//    "myProject.html&response_type=code&scope=snsapi_userinfo&state=myProject" +
//    "#wechat_redirect";
var G_ProjectName = "";

var app = angular.module('app', ['ui.router', 'oc.lazyLoad','angular-loading-bar', 'ngAnimate', 'ui.bootstrap']);

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
            .when('/', '/project')
            .otherwise('/project');

        $stateProvider
            .state('project', {
                url: '/project',
                templateUrl: './views/projectList.html',
                params:      {projectName: null,info: null},
                resolve: {
                     load: app.asyncjs("./js/controller/ProjectList.js")
                }
            })

            .state('camera', {
                url: '/camera',
                templateUrl: './views/cameraList.html',
                params:      {projectName: null,info: null},
                resolve: {
                     load: app.asyncjs(["./js/controller/cameraList.js", "./js/video.js", "./css/square.css"])
                }
            })

            .state('plive', {
                url: '/plive',
                templateUrl: './views/pLive.html',
                resolve: {
                    load: app.asyncjs(["./js/controller/PLive.js"])
                }
            })

            .state('prec', {
                url: '/prec',
                templateUrl: './views/pRec.html',
                resolve: {
                    load: app.asyncjs(["./js/controller/PRec.js"])
                }
            })

            .state('precplay', {
                url: '/precplay',
                templateUrl: './views/pRecPlay.html',
                resolve: {
                    load: app.asyncjs(["./js/controller/PRecPlay.js"])
                }
            })

            .state('bill', {
                url: '/bill',
                templateUrl: './views/billList.html',
                params:      {projectName: null,info: null},
                resolve: {
                    load: app.asyncjs("./js/controller/billList.js")
                }
            })
            /*
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
            })*/
        ;

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

app.controller('MyProject', ['$rootScope','$scope', '$http', '$q','$window', '$state', function($rootScope, $scope, $http, $q, $window, $state){

    $scope.destroy = function () {
        if (undefined !== $scope.aborter) {
            $scope.aborter.resolve();
            delete $scope.aborter;
        }
    };

    $scope.$on('$destroy', $scope.destroy);

    $rootScope.$on('$stateChangeStart',function(event, toState, toParams, fromState, fromParams){
        if(fromState.name === 'plive' || fromState.name === 'prec' ||  fromState.name === 'precplay')
        {
            if ($rootScope.Player !== undefined) $rootScope.Player.destroy();
            var player = $rootScope.RecPlayer;
            if (player!==null && player!==undefined && player.currentTime){
                player.currentTime = 0;
                player.pause();
                player.src="movie.ogg";
                player.load();
            }
        }
    });
}]);

app.filter('online', [function() {
        return function(is_online) {
            if (1 === is_online){
                return '在线';
            } else if (2 === is_online){
                return '工作中';
            } else {
                return '离线';
            }
        };
    }]).filter('publicattribute', [function() {
        return function(bBublic) {
            if (true === bBublic){
                return '公开';
            } else {
                return '私有';
            }
        };
    }]).filter('key_type', [function() {
        return function(type) {
            if (1 === type){
                return '管理员';
            } else {
                return '操作员';
            }
        };
    }]).filter('key_enabled', [function() {
        return function(enabled) {
            if (true === enabled){
                return '启用';
            } else {
                return '停用';
            }
        };
    }]).filter('getLink', [function() {
        return function(item) {
            if (0 === item.status){
                return '#';
            }
            return '../video.html?uuid=' + item.uuid + '&project=' + G_ProjectName;
        };
    }]).filter('duration', function() {
        return function(dur, ms) {
            var s = '';
            var tmpTime;
            if (true === ms){
                dur = dur / 1000;
            }
            tmpTime = parseInt(dur/60, 10);
            if (tmpTime === 0){
                s = parseInt(dur, 10) + "秒";
            }else
                s = tmpTime + "分";
            return s;
        };
    });

app.factory('dateFactory', function() {
    var padding = function(n) {
        if (10 > n) {
            return '0' + n;
        }
        return n.toString();
    };
    var getDate = function(dt) {
        return [
            dt.getFullYear(),
            padding(dt.getMonth() + 1),
            padding(dt.getDate())
        ].join('-');
    };
    return {
        getStart: function(dt) {
            return getDate(dt) + 'T00:00:00';
        },
        getEnd: function(dt) {
            return getDate(dt) + 'T23:59:59';
        },
        time2str: function(dt){
            return padding(dt.getHours()) + ':' + padding(dt.getMinutes()) + ':' + padding(dt.getSeconds());
        },
        str2time: function(str, bstart){
            var a = str.split(':');
            var dt = new Date();
            dt.setHours(a[0]);
            dt.setMinutes(a[1]);
            dt.setSeconds(a[2]);
            if (bstart){
                dt.setMilliseconds(0);
            } else{
                dt.setMilliseconds(999);
            }
            return dt;
        },
        getms: function(dt, tm){
            var tmp = tm;
            tmp.setFullYear(dt.getFullYear(), dt.getMonth(), dt.getDate());
            return tmp.getTime();
        }
    };
});
