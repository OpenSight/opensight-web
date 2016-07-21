
app.register.controller('BillList', ['$scope', '$http', '$q', '$window', '$stateParams', '$state', function($scope, $http, $q, $window, $stateParams, $state){
    $('#projectTab').hide();
    var PName = "";
    PName = G_ProjectName;

    if (PName === "") {
        $('#ToastTxt').val("项目为空，请返回！");
        $('#loadingToast').show();
        setTimeout(function () {
            $('#loadingToast').hide();
        }, 2000);
    }

    $scope.billlist = (function () {
        return {
            init:function(){

            },
            get_acc: function () {
                if (flag === true && jwt != undefined && jwt.aud != undefined){

                }else {
                    alert("bad jwt!plz reload your page!");
                    return;
                }

                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/projects/"+PName+"/account", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.acc = response;
                            $scope.billlist.get();
                        }).error(function (response,status) {
                            $('#ToastTxt').val("获取账户信息失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                        });
            },
            get: function () {
                if (flag === true && jwt != undefined && jwt.aud != undefined){

                }else {
                    alert("bad jwt!plz reload your page!");
                    return;
                }

                $scope.aborter = $q.defer(),
                $http.get("http://api.opensight.cn/api/ivc/v1/projects/"+PName+"/bills?end_to=2016-05-20T23:59:59&limit=100&start=0&start_from=2016-01-16T00:00:00", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.billlist.data = response.list;
                        }).error(function (response,status) {
                            $('#ToastTxt').val("获取账单列表失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                        });
            },
            backProject: function () {
//                $state.go('project', { projectName: PName });
                window.history.back();
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
    if (PName !== "")
        $scope.billlist.get_acc();



}]);
