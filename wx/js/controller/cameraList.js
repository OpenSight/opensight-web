
app.register.controller('CameraList',['$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state',  function($rootScope, $scope, $http, $q, $window, $stateParams, $state){
    $('#projectTab').hide();

    if (G_ProjectName === "") {
        $('#ToastTxt').html("项目为空，请返回！");
        $('#loadingToast').show();
        setTimeout(function () {
            $('#loadingToast').hide();
        }, 2000);
    }

    $scope.cameralist = (function () {
        return {
            init:function(){

            },
            get: function () {
                if (flag === true && jwt != undefined && jwt.aud != undefined){

                }else {
                    alert("bad jwt!plz reload your page!");
                    return;
                }
                $('#ToastTxt').html("获取摄像头列表中");
                $('#loadingToast').show();

                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/projects/"+G_ProjectName+"/cameras?limit=100&start=0", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.cameraListShown = true;
                            $scope.oneCameraShown = false;
                            $scope.recListShown = false;
                            $scope.cameralist.data = [];
                            $scope.cameralist.data = response.list;
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 100);
                        }).error(function (response,status) {
                            $('#ToastTxt').html("获取摄像头列表失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                        });

            },
            backProject: function () {
                if ($scope.Player !== undefined)
                    $scope.Player.destroy();
                $state.go('project');
            },
            showMore: function (item) {
                $rootScope.pCamera = item;
                $state.go('plive');
            },
            showRec: function (item) {
                $rootScope.pCamera = item;
                $state.go('prec');
            }
        };
    })();


    $scope.destroy = function () {
        if (undefined !== $scope.aborter) {
            $scope.aborter.resolve();
            delete $scope.aborter;
        }
    };

    $scope.$on('$destroy', $scope.destroy);
    $scope.cameralist.get();
}]);

