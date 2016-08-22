
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
            preListShow:function(){
                $scope.cameralist.preList = true;
                $scope.cameralist.setList = false;
                $scope.cameralist.editConfig = false;
            },
            setListShow:function(){
                $scope.cameralist.preList = false;
                $scope.cameralist.setList = true;
                $scope.cameralist.editConfig = false;
            },
            editConfigShow:function(item){
                $scope.cameralist.preList = false;
                $scope.cameralist.setList = false;
                $scope.cameralist.editConf = {};
//                $scope.cameralist.editConf.name = item.name;
//                $scope.cameralist.editConf.livePerm = item.livePerm;
//                $scope.cameralist.editConf.uuid = item.uuid;
                $scope.cameralist.editConf = item;
                $scope.cameralist.editConfOld = {};
                $scope.cameralist.editConfOld.livePerm = item.livePerm;
                $scope.cameralist.editConfig = true;
            },
            init:function(){
                var preShow = $.cookie('preShow');
                if (preShow === "" || preShow === undefined || preShow === "true"){
                    $scope.preShow = true;
                }else $scope.preShow = false;
//                initLive*************************************
                $scope.cameralist.preListShow();
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
                            $scope.cameralist.data = [];
                            $scope.cameralist.data = response.list;
                            for (var i in $scope.cameralist.data){
                                $scope.cameralist.data[i].livePerm = (($scope.cameralist.data[i].flags & 0x20) === 0);
                            }

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
//                $state.go('project');
                window.history.back();
            },
            showMore: function (item) {
                $rootScope.pCamera = item;
                $state.go('plive');
            },
            showRec: function (item) {
                $rootScope.pCamera = item;
                $state.go('prec');
            },
            editCancel: function () {
                $scope.cameralist.setListShow();
            },
            editSubmit: function () {
                if ($scope.cameralist.editConf.livePerm !== $scope.cameralist.editConfOld.livePerm){
                    $scope.cameralist.setLive($scope.cameralist.editConf);
                }else $scope.cameralist.setListShow();
            },
            setLive: function (item) {
                var postData =  {
                    enable: item.livePerm
                };

                // $scope.userinfo.data_mod.modUserInfoToken = Math.random();
                $scope.aborter = $q.defer(),
                    $http.post("http://api.opensight.cn/api/ivc/v1/projects/"+G_ProjectName+"/cameras/"+item.uuid+"/stream_toggle", postData, {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
//                            $('#ToastTxt').html("直播状态设置成功");
//                            $('#loadingToast').show();
//                            setTimeout(function () {
//                                $('#loadingToast').hide();
//                            }, 2000);
                            $scope.cameralist.setListShow();
                        }).error(function (response,status) {
                            $('#ToastTxt').html("直播状态设置失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                            $scope.cameralist.editConf.livePerm = $scope.cameralist.editConfOld.livePerm;
                            console.log("edit camera err, err info: "+ response);
                        });
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
    $scope.cameralist.init();
    $scope.cameralist.get();
}]);

