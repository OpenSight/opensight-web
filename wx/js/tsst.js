var app = angular.module('app',['ui.bootstrap']);

app.controller('MyCamera', ['$scope', function($scope){
    var x = [];
    var i = 0;
    for (;i<5;i++){
        x[i] = {};
        x[i].name = i;
    }
    $scope.x = x;

    $scope.dt = new Date();
    $scope.actionShow = function(){
        var mask = $('#mask');
        var weuiActionsheet = $('#weui_actionsheet');
        weuiActionsheet.addClass('weui_actionsheet_toggle');
        mask.show()
            .focus()//加focus是为了触发一次页面的重排(reflow or layout thrashing),使mask的transition动画得以正常触发
            .addClass('weui_fade_toggle').one('click', function () {
                hideActionSheet(weuiActionsheet, mask);
            });

        mask.unbind('transitionend').unbind('webkitTransitionEnd');

        function hideActionSheet(weuiActionsheet, mask) {
            weuiActionsheet.removeClass('weui_actionsheet_toggle');
            mask.removeClass('weui_fade_toggle');
            mask.on('transitionend', function () {
                mask.hide();
            }).on('webkitTransitionEnd', function () {
                    mask.hide();
                })
        }
    };
    /*
    $scope.xxx = new Swiper ('.swiper-container', {
        direction: 'horizontal',
        loop: true,
    //    slidesPerView: 'auto',
        // 如果需要分页器
        pagination : '.swiper-pagination',
        paginationHide :true,
        //后翻获取当前页并向后台获取

        // 如果需要前进后退按钮
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        observer:'true'
        // 如果需要滚动条
        //scrollbar: '.swiper-scrollbar'
    });
    $scope.checkLast = function(){
        if ($scope.$last === true){
            $scope.xxx.reInit();
        }else{
            setTimeout(function () {
                $scope.checkLast();
            }, 1000);
        }
    };

    setTimeout(function () {
        $scope.checkLast();
    }, 1000);
    */

}]);

app.directive('swpierwait', function ($timeout){
    return {
        link: function($scope, $element, $attrs) {
            if ($scope.$last === true) {
                $timeout(function() {
                    new Swiper ('.swiper-container', {
                        direction: 'horizontal',
                        loop: true,
                        //    slidesPerView: 'auto',
                        // 如果需要分页器
                        pagination : '.swiper-pagination',
                        paginationHide :true,
                        //后翻获取当前页并向后台获取

                        // 如果需要前进后退按钮
                        nextButton: '.swiper-button-next',
                        prevButton: '.swiper-button-prev',
                        observer:'true'
                        // 如果需要滚动条
                        //scrollbar: '.swiper-scrollbar'
                    });
                    console.log($scope.x);
                });
            }
        }
    }
});

// actionsheet
var actionsheet = {
    url: '/actionsheet',
    className: 'actionsheet',
    render: function () {
        return $('#tpl_actionsheet').html();
    },
    bind: function () {
        $('#container').on('click', '#showActionSheet', function () {
            var mask = $('#mask');
            var weuiActionsheet = $('#weui_actionsheet');
            weuiActionsheet.addClass('weui_actionsheet_toggle');
            mask.show()
                .focus()//加focus是为了触发一次页面的重排(reflow or layout thrashing),使mask的transition动画得以正常触发
                .addClass('weui_fade_toggle').one('click', function () {
                    hideActionSheet(weuiActionsheet, mask);
                });

            mask.unbind('transitionend').unbind('webkitTransitionEnd');

            function hideActionSheet(weuiActionsheet, mask) {
                weuiActionsheet.removeClass('weui_actionsheet_toggle');
                mask.removeClass('weui_fade_toggle');
                mask.on('transitionend', function () {
                    mask.hide();
                }).on('webkitTransitionEnd', function () {
                        mask.hide();
                    })
            }
        });
    }
};