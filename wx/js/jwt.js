var Jwt = function(urlname){
      this.url = urlname;
      this.init();
      this.keepalive();
};

Jwt.prototype = {
  init: function(){
      if (Base64 === undefined) alert("Base64 not load well!");
      this.jwt = $.cookie('jwt');
      this.binding_id = $.cookie('binding_id');
      this.api = "http://api.opensight.cn/api/ivc/v1/wechat/";
      this.bindUrl = "https://open.weixin.qq.com/connect/oauth2/authorize?" +
          "appid=wxd5bc8eb5c47795d6&redirect_uri=http%3A%2F%2Fwww.opensight.cn%2Fwx%2F" +
          "bind.html&response_type=code&scope=snsapi_userinfo&state=" + this.url +
          "#wechat_redirect";

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

  check: function(){
      if (undefined === this.jwt || this.binding_id === undefined){//must have two cookies
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
    if (true === this.updateing){
      return false;
    }
    this.updateing = true;
    var d = new Date ();
    d.setHours(d.getHours() + 1);
    var e = Math.ceil(d.getTime() / 1000);

    var _this = this;
      $.ajax({
          url: _this.api + 'binding_login',
          data: {binding_id: this.binding_id, expired: e},
          type: 'POST',
          success: function(json){
              _this.jwt = json.jwt;
              $.cookie('jwt', json.jwt);
              _this.updateing = false;
          },
          error: function() {
              window.location.replace(this.bindUrl);
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
      if (this.binding_id !== undefined && this.binding_id !== null && this.binding_id !== ""){
          this.update();
      }else
        window.location.replace(this.bindUrl);
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


