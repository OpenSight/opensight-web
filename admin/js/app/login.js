var login = angular.module('login', []);
var G_salt = "opensight.cn";

login.config(function($controllerProvider, $compileProvider, $filterProvider, $provide) {
    login.register = {
        controller: $controllerProvider.register,
        directive: $compileProvider.directive,
        filter: $filterProvider.register,
        factory: $provide.factory,
        service: $provide.service
    };
});