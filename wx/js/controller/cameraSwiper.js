
app.register.controller('CameraSwiper',['$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state',  function($rootScope, $scope, $http, $q, $window, $stateParams, $state){
  

    $scope.cameralist = (function () {
        return {
            initPreShow:function(){
                var preShow = $.cookie('preShow');
                if (preShow === "" || preShow === undefined || preShow === "true"){
                    $scope.preShow = true;
                }else $scope.preShow = false;
            },
            init: function(activeIndex){
                $scope.cameralist.initPreShow();
                $rootScope.PName = $scope.projectlist.data[activeIndex].name;

                var mySwiper = new Swiper ('.swiper-container', {
                    direction: 'horizontal',
                    loop: false,
                    // 如果需要分页器
                    pagination : '.swiper-pagination',
                    paginationHide :true,
                    //后翻获取当前页并向后台获取
                    onSlideChangeStart: function(swiper){
                        //            alert(mySwiper.activeIndex);
                        $rootScope.PName = $scope.projectlist.data[mySwiper.activeIndex].name;
                        $scope.cameralist.get($rootScope.PName);
                    },
                    // 如果需要前进后退按钮
                    //nextButton: '.swiper-button-next',
                    //prevButton: '.swiper-button-prev',
                    observer:'true'
                    // 如果需要滚动条
                    //scrollbar: '.swiper-scrollbar'
                });
                mySwiper.slideTo(activeIndex, 100, false);
            },
            getProject: function () {
                if (flag === true && jwt != undefined && jwt.aud != undefined){

                }else {
                    alert("bad jwt!plz reload your page!");
                    return;
                }
                $('#ToastTxt').html("获取项目列表中");
                $('#loadingToast').show();

                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/users/"+jwt.aud+"/projects", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            var found = 0;
                            $scope.projectlist = {};
                            $scope.projectlist.data = response;
                            if ($rootScope.PName === "" || $rootScope.PName === undefined){

                            }else
                                for (var i in $scope.projectlist.data){
                                    if ($rootScope.PName === $scope.projectlist.data[i].name){
                                        found = i;
                                    }
                                }
                            $scope.cameralist.init(found);
                            $('#loadingToast').hide();
                            $scope.cameralist.get($scope.projectlist.data[found].name);
                        }).error(function (response,status) {
                            $('#ToastTxt').html("获取项目列表失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                            // $window.location.replace(codeLoginUrl);
                        });

            },
            get: function (pName) {
                if (flag === true && jwt != undefined && jwt.aud != undefined && pName !== ""){

                }else {
                    alert("网络有点小卡哦，请尝试刷新！");

                }
                $('#ToastTxt').html("获取摄像头列表中");
                $('#loadingToast').show();

                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/projects/"+pName+"/cameras?limit=100&start=0", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            //$scope.cameraListShown = true;
                            $scope.cameralist.data = [];
                            $scope.cameralist.data = response.list;
                            for (var i in $scope.cameralist.data){
                                if ($scope.preShow === false)
                                    $scope.cameralist.data[i].preview = "";
                                $scope.cameralist.data[i].livePerm = (($scope.cameralist.data[i].flags & 0x20) === 0);
                            }
                            $('#loadingToast').hide();
                        }).error(function (response,status) {
                            $('#ToastTxt').html("获取摄像头列表失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);

                        });

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
    $scope.cameralist.getProject();
}]);

