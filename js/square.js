var project = 'weizhong';
var Square = function(){
  this.api = 'http://121.41.72.231:10080/api-demo/dist';

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

    juicer.register('getLink', function(uuid){
      return 'video.html?uuid=' + uuid + '&project=' + project; 
    });
  },
  get: function(){
    if (true === this.loading || true === this.finished){
      return;
    }
    this.loading = true;
    console.log('get');
    _this = this;
    // $.get(this.api + '/' + project + '/cameras', this.page, function(list){

    // }, 'json');
    
    var loading = $('#loading').removeClass('hidden');
    setTimeout(function(){
      var list = {
        total: 1,
        start: 0,
        list: [{
          "project_name": "string",
          "uuid": "string",
          "device_uuid": "uuid",
          "src": "http://www.opensight.cn/img/fxdq.jpeg",
          "channel_index": 0,
          "flags": 0,
          "is_online": 0,
          "name": "string",
          "desc": "杭州复兴大桥",
          "long_desc": "string",
          "longitude": 0,
          "latitude": 0,
          "altitude": 0,
          "ctime": "string",
          "utime": "string"
        }]
      };
      _this.loading = false;
      if (0 === list.list.length){
        _this.finished = true;
      }
      _this.page.start += list.list.length;
      _this.render(list);
      loading.addClass('hidden');
    }, 1000);
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