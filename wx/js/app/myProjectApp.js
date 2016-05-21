var wx_api = "http://api.opensight.cn/api/ivc/v1/wechat/";
var bindUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
    "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" +
    "bind.html&response_type=code&scope=snsapi_userinfo&state=myProject" +
    "#wechat_redirect";
var codeLoginUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
    "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" +
    "myProject.html&response_type=code&scope=snsapi_userinfo&state=myProject" +
    "#wechat_redirect";
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
                templateUrl: './views/empty.html',
                params:      {projectName: null,info: null},
                resolve: {
                     load: app.asyncjs("./js/controller/empty.js")
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

app.controller('MyProject', ['$scope', '$http', '$q','$window', '$state', function($scope, $http, $q, $window, $state){
    $scope.projectlist = (function () {
        return {
            init:function(){
                G_ProjectName = $scope.projectlist.data[0].name;
                var mySwiper = new Swiper ('.swiper-container', {
                    direction: 'horizontal',
                    loop: false,

                    // 如果需要分页器
                    //pagination: '.swiper-pagination',
                    //后翻获取当前页并向后台获取
                    onSlideChangeStart: function(swiper){
                        //            alert(mySwiper.activeIndex);
                        G_ProjectName = $scope.projectlist.data[mySwiper.activeIndex].name;
                    },
                    // 如果需要前进后退按钮
                    nextButton: '.swiper-button-next',
                    prevButton: '.swiper-button-prev',
                    observer:'true'
                    // 如果需要滚动条
                    //scrollbar: '.swiper-scrollbar'
                })
            },
            get: function () {
                if (flag === true && jwt != undefined && jwt.aud != undefined){

                }else {
                    setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                    return;
                }

                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/users/"+jwt.aud+"/projects", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.projectlist.data = response;
                            $scope.projectlist.init();
                        }).error(function (response,status) {
                            $('#ToastTxt').html("获取项目列表失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                            $window.location.replace(codeLoginUrl);
                        });

            },

            goIpc: function () {
                $state.go('camera');
            },
            goBill: function () {
                $state.go('bill');
            }
            /*
             submitForm: function (u) {
             var postData =  {
             title: u.title,
             max_media_sessions: u.max_media_sessions,
             media_server: u.media_server,
             desc: u.desc,
             long_desc: u.long_desc,
             is_public: u.is_public
             };

             // $scope.myproject.data_mod.modMyProjectToken = Math.random();
             $scope.aborter = $q.defer(),
             $http.put("http://api.opensight.cn/api/ivc/v1/projects/"+ u.name, postData, {
             timeout: $scope.aborter.promise
             }).success(function (response) {
             $scope.ToastTxt = "更新项目信息成功";
             $('#loadingToast').show();
             setTimeout(function () {
             $('#loadingToast').hide();
             }, 2000);
             }).error(function (response,status) {
             $scope.ToastTxt = "更新项目信息失败";
             $('#loadingToast').show();
             setTimeout(function () {
             $('#loadingToast').hide();
             }, 2000);
             $window.location.replace(codeLoginUrl);

             });
             }
             */
        };
    })();

    $scope.destroy = function () {
        if (undefined !== $scope.aborter) {
            $scope.aborter.resolve();
            delete $scope.aborter;
        }
    };

    $scope.$on('$destroy', $scope.destroy);
    $scope.projectlist.get();
}]);

app.filter('online', [function() {
        return function(is_online) {
            if (1 === is_online){
                return '在线';
            } else if (2 === is_online){
                return '直播中';
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
    }]);
