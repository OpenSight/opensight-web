var project = 'manbaogongzhuang';
//project = 'demo';
var Square = function(){
  this.api = 'http://121.41.72.231:5001/api/ivc/v1/projects/';

  this.page = {start: 0, limit: 24};
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
      return 'live_breadF_video.html?uuid=' + uuid + '&project=' + project;
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
