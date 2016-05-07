

$(document).ready(function () {
    var mySwiper = new Swiper ('.swiper-container', {
        direction: 'horizontal',
        loop: false,

        // 如果需要分页器
        //pagination: '.swiper-pagination',
//后翻获取当前页并向后台获取
        onSlideNextStart: function(swiper){
            alert(mySwiper.activeIndex);
        },
        // 如果需要前进后退按钮
        nextButton: '.swiper-button-next',
        prevButton: '.swiper-button-prev',
        observer:'true'
        // 如果需要滚动条
        //scrollbar: '.swiper-scrollbar'
    })
});


