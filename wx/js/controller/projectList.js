
app.register.controller('ProjectList', ['$scope', '$http', '$q','$window', '$state', '$stateParams', function($scope, $http, $q, $window, $state, $stateParams){
    var PName = "";

    if ($stateParams.projectName === null){
        //alert("params error!  projectName === null");
    }
    else{
        PName = $stateParams.projectName;
        //alert(PName);
    }

    if (flag === true && jwt != undefined && jwt.aud != undefined){

    }else {
        alert("网络有点小卡哦，请尝试刷新！");
    }

    $scope.projectlist = (function () {
        return {
            init:function(){
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
            },
            get: function () {

                $scope.aborter = $q.defer(),
                $http.get("http://api.opensight.cn/api/ivc/v1/users/"+jwt.aud+"/projects", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.projectlist.data = response;
                            $scope.projectlist.init();
                        }).error(function (response,status) {
                            $scope.ToastTxt = "获取项目列表失败";
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                            $window.location.replace(codeLoginUrl);
                        });

            },
            goIpc: function (u) {
                $state.go('camera', {projectName: u.name });
            },
            goBill: function (u) {
                $state.go('bill', { projectName: u.name });
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