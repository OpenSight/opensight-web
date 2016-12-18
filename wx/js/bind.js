var Bind = function(){
  this.api = 'http://api.opensight.cn/api/ivc/v1/wechat/';

  this.init();

  return this;
};

Bind.prototype = {
  init: function(){
    var params = this.getUrlParams();

    var state = params.state;
    if (true === this.isEmpty(state)){
      state = 'myInfo.html';
    } else {
      state = decodeURIComponent(state);
    }
    this.uri = this.getUriByState(state);

    if (true === this.isEmpty(params.code)){
      var redirect_uri = window.location.origin + window.location.pathname;
      redirect_uri = encodeURIComponent(redirect_uri);
      this.jump2Authorize(redirect_uri, state);
    } else {
      this.code = params.code;
    }

    return this;
  },
  jump2Authorize: function(redirect_uri, state){
    var uri = "https://open.weixin.qq.com/connect/oauth2/authorize?appid=wxd5bc8eb5c47795d6" + 
      "&redirect_uri=" + redirect_uri + 
      "&response_type=code&scope=snsapi_userinfo" +
      "&state=" + state + "#wechat_redirect";

    window.location.replace(uri);
    return this;
  },
  getUriByState: function(state){
    var path = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/') + 1);
    var href = window.location.origin + path + state;
    return href;
  },
  getDefaultState: function(){
    var path = window.location.pathname.substr(0, window.location.pathname.lastIndexOf('/') + 1);
    var href = window.location.origin + path + 'myInfo.html';
    return encodeURIComponent(href);
  },
  isEmpty: function(value){
    return undefined === value || '' === value;
  },
  getUrlParams: function(){
    var href = window.location.href;
    var start = href.indexOf('?') + 1;
    if (0 === start) {
      return {};
    }
    var stop = href.indexOf('#');
    if (-1 === stop) {
      stop = href.length;
    }
    var seach = href.substring(start, stop);
    var url = window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', url);
    return this.parseStr(seach, '&');
  },
  parseStr: function (str, sp) {
    var arr = str.split(sp);
    var data = {};
    var idx = 0;
    for (var i = 0, l = arr.length; i < l; i++) {
      var tmp = arr[i].split('=');
      if (2 > tmp.length) {
        continue;
      }
      data[tmp[0]] = tmp[1];
      idx++;
    }
    return data;
  },
  getExpired: function(timeeffect){
    timeeffect = timeeffect || '3600000';
    timeeffect = parseInt(timeeffect, 10);

    var d = new Date();
    var e = Math.ceil((d.getTime() + timeeffect) / 1000);
    return e;
  },
  bind: function(u, p){
    $('#loadingTxt').html("正在绑定");
    $('#loadingToast').show();

    $.ajax({
      url: this.api + 'bindings',
      data: {
        username: u,
        password: sjcl.codec.hex.fromBits(sjcl.misc.pbkdf2(p, "opensight.cn", 10000)),
        expired: this.getExpired(3600000 * 24 * 365),
        code: this.code
      },
      type: 'POST',
      async: false,
      success: function (json) {
        this.jump2Authorize(this.uri, 'bind');
      },
      error: function (xhr) {
        if (xhr && xhr.status){
          if (453 === xhr.status || 454 === xhr.status){
            $('#loadingTxt').html("用户名或密码错误");
          } else if (455 === xhr.status){
            this.jump2Authorize(this.uri, 'bind');
          } else {
            $('#loadingTxt').html('绑定失败');
          }
        } else {
          $('#loadingTxt').html('网络异常');
        }

        setTimeout(function(){
          $('#loadingToast').hide();
        }, 2000);
      },
      context: this
    });

    return this;
  }
};

$(function () {
  var b = new Bind();

  $('#form').submit(function (event) {
    /* Act on the event */
    var u = $('#username').val();
    var p = $('#password').val();
    b.bind(u, p);
    return false;
  });
});
