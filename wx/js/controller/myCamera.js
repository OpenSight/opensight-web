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

    $scope.cameralist = (function () {
        return {
            init:function(){

            },
            get: function () {
                if (flag === true && jwt != undefined && jwt.aud != undefined){

                }else {
                    alert("网络有点小卡哦，请尝试刷新！");
                }
                $('#ToastTxt').html("获取摄像头列表中");
                $('#loadingToast').show();

                //$('#loadingToast').show();

                $scope.aborter = $q.defer(),
                    $http.get("http://api.opensight.cn/api/ivc/v1/projects/"+G_ProjectName+"/cameras?limit=100&start=0", {
                        timeout: $scope.aborter.promise
                    }).success(function (response) {
                            $scope.cameraListShown = true;
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
                            //$window.location.replace(codeLoginUrl);
                        });

            },
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

             // $scope.mycamera.data_mod.modMyProjectToken = Math.random();
             $scope.aborter = $q.defer(),
             $http.put("http://api.opensight.cn/api/ivc/v1/cameras/"+ u.name, postData, {
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

            backProject: function () {
                $state.go('project');
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
