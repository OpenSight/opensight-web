
app.register.controller('BillList', ['$scope', '$http', '$q', '$window', '$stateParams', '$state', function($scope, $http, $q, $window, $stateParams, $state){
    $('#projectTab').hide();
    var PName = "";
/*
    if ($stateParams.projectName === null || $stateParams.projectName === undefined){
        alert("params error!  projectName === null");
    }
    else{
        PName = $stateParams.projectName;
        //alert(PName);
    }
*/
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
                    setTimeout(function () {
                        $scope.billlist.get_acc();
                    }, 2000);
                    return;
                }
                //            http://api.opensight.cn/api/ivc/v1/projects/demo/account
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
                            //$window.location.replace(codeLoginUrl);
                        });

            },
            get: function () {
                if (flag === true && jwt != undefined && jwt.aud != undefined){

                }else {
                    setTimeout(function () {
                        $scope.billlist.get();
                    }, 2000);
                    return;
                }
   //             http://api.opensight.cn/api/ivc/v1/projects/demo/bills?end_to=2016-05-16T23:59:59&limit=10&start=0&start_from=2016-05-16T00:00:00
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
                            //$window.location.replace(codeLoginUrl);
                        });

            },
            backProject: function () {
                $state.go('project', { projectName: PName });
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

                // $scope.mybill.data_mod.modMyProjectToken = Math.random();
                $scope.aborter = $q.defer(),
                    $http.put("http://api.opensight.cn/api/ivc/v1/bills/"+ u.name, postData, {
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
    if (PName !== "")
        $scope.billlist.get_acc();



}]);
/*
$(document).ready(function () {
    var mySwiper = new Swiper ('.swiper-container', {
        direction: 'horizontal',
        loop: false,

        // 如果需要分页器
        //pagination: '.swiper-pagination',
//后翻获取当前页并向后台获取
        onSlideNextStart: function(swiper){
//            alert(mySwiper.activeIndex);
        },
        // 如果需要前进后退按钮
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        observer:'true'
        // 如果需要滚动条
        //scrollbar: '.swiper-scrollbar'
    })
});
*/