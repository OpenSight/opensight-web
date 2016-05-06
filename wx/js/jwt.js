var state = "1";
var api = "http://api.opensight.cn/api/ivc/v1/wechat/";
var Jwt = function(urlname){
  state = urlname;
  var params;
  this.init(params.jwt, params.ui, params.url);
  
  this.keepalive();
};

var bindUrl =  "https://open.weixin.qq.com/connect/oauth2/authorize?" +
    "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" +
    "bind.html&response_type=code&scope=snsapi_userinfo&state=" + state +
    "#wechat_redirect";

Jwt.prototype = {
  init: function(jwt, ui, url){
    if (undefined !== jwt){
      $.cookie('jwt', jwt);
      this.jwt = jwt;
    } else {
      this.jwt = $.cookie('jwt');
    }
    if (0 >= this.check()){
      this.jump();
    }

    var claim = this.parse();
    if (undefined !== claim.aud){
      this.aud = claim.aud;
    } else {
      this.jump();
    }
  },

  check: function(jwt){
    if (undefined === this.jwt){
      return -1;
    }
    var claim = this.parse();
    if (undefined === claim.exp){
      return -1;
    }
    var t = Math.ceil((new Date().getTime()) / 1000)
    return (claim.exp - t);
  },

  update: function(){
    if (undefined === this.pwd){
      this.jump();
    }
    if (true === this.updateing){
      return false;
    }
    this.updateing = true;
    var d = new Date ();
    d.setHours(d.getHours() + 1);
    var e = Math.ceil(d.getTime() / 1000);

    var _this = this;
      $.ajax({
          url: this.api + 'binding_login',
          data: {binding_id: $.cookie('binding_id'), expired: e},
          type: 'POST',
          success: function(json){
              _this.jwt = json.jwt;
              $.cookie('jwt', json.jwt);
              _this.updateing = false;
          },
          error: function() {
              _this.updateing = false;
          }
      });

  },
  parse: function(){
    var list = Base64.decode(this.jwt).match(/\{[^\{\}]*\}/g);
    for (var i = 0, l = list.length; i < l; i++){
      var obj = JSON.parse(list[i]);
      if (undefined === obj.aud || undefined === obj.exp){
        continue;
      }
      return obj;
    }
    return {};
  },

  jump: function(){
    window.location.replace(bindUrl);
  },
  keepalive: function(){
    var _this = this;
    var interval = 10 * 60 * 1000;
    setInterval(function(){
      if (interval > _this.check()){
        _this.update();
      }
    }, interval);
  },
  logout: function(){
    $.removeCookie('jwt');
    this.jump();
  }
};


