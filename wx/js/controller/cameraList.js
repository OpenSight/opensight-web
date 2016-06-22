
app.register.controller('CameraList',['$scope', '$http', '$q', '$window', '$stateParams', '$state', function($scope, $http, $q, $window, $stateParams, $state){
    $('#projectTab').hide();
    /*
     if ($stateParams.projectName === null || $stateParams.projectName === undefined){
     alert("params error!  projectName === null");
     }
     else{
     PName = $stateParams.projectName;
     //alert(PName);
     }
     */

    if (G_ProjectName === "") {
        $('#ToastTxt').html("项目为空，请返回！");
        $('#loadingToast').show();
        setTimeout(function () {
            $('#loadingToast').hide();
        }, 2000);
    }

    var videoPic = "../img/video.jpg";

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
                if ($scope.Player !== undefined)
                    $scope.Player.destroy();
                $state.go('project');
            },
            showPlayer: function (item) {
                $scope.c.img = videoPic;
                $scope.c.tip = true;
                $scope.Player = new HlsVideo(item);
            },
            showMore: function (item) {
                $scope.c = item;
                $scope.c.tip = false;
                $scope.c.img = item.preview;
                $scope.c.stearmOptions = [{
                    text: 'LD',
                    title: '流畅',
                    on: ((item.flags & 0x01) === 0)?0:1
                }, {
                    text: 'SD',
                    title: '标清',
                    on: ((item.flags & 0x02) === 0)?0:1
                }, {
                    text: 'HD',
                    title: '高清',
                    on: ((item.flags & 0x04) === 0)?0:1
                }, {
                    text: 'FHD',
                    title: '超清',
                    on: ((item.flags & 0x08) === 0)?0:1
                }];

                var stream = $.cookie('stream');
                if (stream === "" || stream === undefined){
                    stream = 0;
                }
                if ($scope.c.stearmOptions[stream].on !== 0){
                    $scope.c.stearmOptions[stream].on = 2;
                    item.playStream = $scope.c.stearmOptions[stream].text.toLowerCase();
                }
                else{
                    for (var i in $scope.c.stearmOptions){
                        if ($scope.c.stearmOptions[i].on !== 0){
                            $scope.c.stearmOptions[i].on = 2;
                            item.playStream = $scope.c.stearmOptions[i].text.toLowerCase();
                            break;
                        }
                    }
                }

                $scope.cameraListShown = false;
                $scope.cameralist.showPlayer(item);
            },
            checkBtn: function (it) {
               if (it.on === 1){
                   for (var i in $scope.c.stearmOptions){//reset all checked
                       if ($scope.c.stearmOptions[i].on === 2){
                           $scope.c.stearmOptions[i].on = 1;
                       }
                       if (it.text === $scope.c.stearmOptions[i].text)
                           $.cookie('stream',i,{expires: 1440*360});
                   }

                   it.on = 2;
                   $scope.Player.destroy();
                   $scope.c.playStream = it.text.toLowerCase();
                   $scope.Player = new HlsVideo($scope.c);
               }else it.on = 1;
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

/*
var project = G_ProjectName;;
var Square = function(){
    this.api = 'http://api.opensight.cn/api/ivc/v1/projects/';

    this.page = {start: 0, limit: 100};
    this.loading = false;
    this.finished = false;
    this.init();
};

Square.prototype = {
    init: function(){
        console.log('init');
        this.get();
        this.on();

        juicer.register('getLink', function(uuid, status){
            if (0 === status){
                return '#';
            }
            return '../video.html?uuid=' + uuid + '&project=' + project;
        });
        juicer.register('getCls', function(status){
            if (1 === status){
                return 'text-highlight';
            } else if (2 === status){
                return 'text-highlight';
            } else {
                return 'text-danger';
            }
        });
        juicer.register('renderStatus', function(status){
            if (1 === status){
                return '在线';
            } else if (2 === status){
                return '直播中';
            } else {
                return '离线';
            }
        });

    },
    get: function(){
        if (true === this.loading || true === this.finished){
            return;
        }
        this.loading = true;
        console.log('get');
        _this = this;
        var loading = $('#loading').removeClass('hidden');
        $.ajax({
            url: this.api +  project + '/cameras',
            cache: true,
            data: _this.page,
            type: 'GET',
            success: function(data){
                _this.loading = false;
                if (0 === data.list.length) {
                    _this.finished = true;
                }
                _this.page.start += data.list.length;
                // for (var i = 0, l = data.list.length; i < l; i++){
                //   data.list[i].preview = "http://www.opensight.cn/img/fxdq.jpeg";
                // }
                _this.render(data);
                loading.addClass('hidden');
            },
            error: function(){
                loading.addClass('hidden');
            }
        });
    },
    on: function(){
        console.log('on');
        _this = this;
        $(window).scroll(function() {
            if ($(document).height() <= $(window).scrollTop() + $(window).height()) {
                console.log('scroll');
                _this.get();
            }
        });
    },
    render: function(list){
        if (list.list.length === 0){
            console.log('提示已经到达底部。');
            return;
        }
        var tmpl = $('#tmpl').text();
        var html = juicer(tmpl, list);
        $('#container').append(html);
        this.finished = true;
    }
};

$(function(){
    new Square();
});

    */