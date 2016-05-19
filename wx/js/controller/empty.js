app.register.controller('Empty', ['$scope', '$http', '$q', '$state', function($scope, $http, $q, $state){

    if($('#emptyPage').is(':visible')){
        $('#emptyPage').hide();
    }

    if($('#projectTab').is(':hidden')){
        $('#projectTab').show();
    }
}]);
