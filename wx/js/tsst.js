var app = angular.module('app',[]);

app.controller('MyCamera', ['$scope', function($scope){
    var x = [];
    var i = 0;
    for (;i<5;i++){
        x[i] = {};
        x[i].name = i;
    }
    $scope.x = x;
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
})