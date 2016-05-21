var wx_api = "http://api.opensight.cn/api/ivc/v1/wechat/";
var bindUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
    "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" +
    "bind.html&response_type=code&scope=snsapi_userinfo&state=myProject" +
    "#wechat_redirect";
var codeLoginUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
    "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" +
    "myProject.html&response_type=code&scope=snsapi_userinfo&state=myProject" +
    "#wechat_redirect";

app.controller('MyCamera', ['$scope', '$http', '$q', '$window',  function($scope, $http, $q, $window){
    var videoPic = "../img/video.jpg";
    $scope.cameraListShown = true;
    $scope.cameralist = (function () {
        return {
            init:function(){
                $scope.cameraListShown = true;
                var mySwiper = new Swiper ('.swiper-container', {
                    direction: 'horizontal',
                    loop: false,

                    // 如果需要分页器
                    //pagination: '.swiper-pagination',
                    //后翻获取当前页并向后台获取
                    onSlideChangeStart: function(swiper){
                        $scope.cameralist.get($scope.projectlist.data[mySwiper.activeIndex].name);
                        //G_ProjectName = $scope.projectlist.data[mySwiper.activeIndex].name;
                    },
                    // 如果需要前进后退按钮
                    nextButton: '.swiper-button-next',
                    prevButton: '.swiper-button-prev',
                    observer:'true'
                    // 如果需要滚动条
                    //scrollbar: '.swiper-scrollbar'
                })
            },
            getProject: function () {
                if (flag === true && jwt != undefined && jwt.aud != undefined){

                }else {
                    setTimeout(function () {
                        window.location.reload();
                    }, 2000);
                    return;
                }
                $('#ToastTxt').html("获取项目列表中");
                $('#loadingToast').show();

                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/users/"+jwt.aud+"/projects", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.projectlist = {};
                            $scope.projectlist.data = response;
                            $scope.cameralist.init();
                            $('#loadingToast').hide();
                            $scope.cameralist.get($scope.projectlist.data[0].name);
                        }).error(function (response,status) {
                            $('#ToastTxt').html("获取项目列表失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                            $window.location.replace(codeLoginUrl);
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
                            $('#loadingToast').hide();
                        }).error(function (response,status) {
                            $('#ToastTxt').html("获取摄像头列表失败");
                            $('#loadingToast').show();
                            setTimeout(function () {
                                $('#loadingToast').hide();
                            }, 2000);
                            //$window.location.replace(codeLoginUrl);
                        });

            },

            showPlayer: function (item) {
                $scope.c.img = videoPic;
                $scope.c.tip = true;
                new HlsVideo(item);
            },
            showMore: function (item) {
                $scope.c = item;
                $scope.c.tip = false;
                $scope.c.img = item.preview;
                $scope.c.stearmOptions = [{
                    text: 'LD',
                    title: '流畅',
                    on: !((item.flags & 0x01) === 0)
                }, {
                    text: 'SD',
                    title: '标清',
                    on: !((item.flags & 0x02) === 0)
                }, {
                    text: 'HD',
                    title: '高清',
                    on: !((item.flags & 0x04) === 0)
                }, {
                    text: 'FHD',
                    title: '超清',
                    on: !((item.flags & 0x08) === 0)
                }];
                $scope.cameraListShown = false;
                $scope.cameralist.showPlayer(item);
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
