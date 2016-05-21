var app = angular.module('app', ['angular-loading-bar', 'ngAnimate']);

app
.config(function($controllerProvider, $compileProvider, $filterProvider, $provide) {
    app.register = {
        controller: $controllerProvider.register,
        directive: $compileProvider.directive,
        filter: $filterProvider.register,
        factory: $provide.factory,
        service: $provide.service
    };



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