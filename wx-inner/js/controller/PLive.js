app.register.controller('PLive', ['$rootScope', '$scope', '$http', '$q', '$window', '$stateParams', '$state', function($rootScope, $scope, $http, $q, $window, $stateParams, $state){
    $scope.plive = (function () {
        return {
            showPlayer: function (item) {
                $scope.c.img = "img/video4x4.jpg";
                $scope.c.tip = true;
                $scope.Player = new HlsVideo(item);
                $rootScope.Player = $scope.Player;
            },
            init: function () {
                var item = $rootScope.pCamera;
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

                $scope.plive.showPlayer(item);
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
            },
            backToCameraList: function () {
                if ($scope.Player !== undefined)
                    $scope.Player.destroy();
//                $state.go('camera');
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
    $scope.plive.init();

}]);