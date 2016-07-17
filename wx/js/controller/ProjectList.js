app.register.controller('ProjectList', ['$scope', '$http', '$q', '$window', '$stateParams', '$state', function($scope, $http, $q, $window, $stateParams, $state){
    $scope.projectlist = (function () {
        return {
            init: function(activeIndex){
                G_ProjectName = $scope.projectlist.data[activeIndex].name;

                var mySwiper = new Swiper ('.swiper-container', {
                    direction: 'horizontal',
                    loop: false,
                    // 如果需要分页器
                    pagination : '.swiper-pagination',
                    paginationHide :true,
                    //后翻获取当前页并向后台获取
                    onSlideChangeStart: function(swiper){
                        //            alert(mySwiper.activeIndex);
                        G_ProjectName = $scope.projectlist.data[mySwiper.activeIndex].name;
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
            getCameraNum: function (index) {
                $scope.projectlist.data[index].ipcState = "获取中";
                var online = 0;
                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/projects/"+$scope.projectlist.data[index].name+"/cameras?limit=100&start=0", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            for (var i in response.list){
                                if (response.list[i].is_online === 1 || response.list[i].is_online === 2) online++;
                            }
                            $scope.projectlist.data[index].ipcState = online+"/"+response.total;
                        }).error(function (response,status) {
                            $scope.projectlist.data[index].ipcState = "获取失败";
                        });
            },
            get: function () {
                var index = 0;
                if (flag === true && jwt != undefined && jwt.aud != undefined){

                }else {
                    alert("bad jwt!plz reload your page!");
                    return;
                }

                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/users/"+jwt.aud+"/projects", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            var found = 0;
                            $scope.projectlist.data = response;
                            for (var i in $scope.projectlist.data){
                                $scope.projectlist.getCameraNum(i);
                                if (G_ProjectName === $scope.projectlist.data[i].name){
                                    found = i;
                                }
                            }
                            $scope.projectlist.init(found);


                        }).error(function (response,status) {
                            $('#ToastTxt').html("获取项目列表失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                            $window.location.replace(codeLoginUrl);
                        });

            },

            goIpc: function () {
                $state.go('camera');
            },
            goBill: function () {
                $state.go('bill');
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
    $scope.projectlist.get();

}]);