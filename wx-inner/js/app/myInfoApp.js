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