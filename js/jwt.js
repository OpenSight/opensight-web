var Jwt = function(opts){
  this.opts = $.extend({
    url: 'url',
    jwt: 'jwt',
    pwd: 'pwd',
    login: 'http://121.41.72.231/login.html'
  }, opts);
  var params = this.getUrlParams();
  this.init(params.jwt, params.ui, params.url);
  
  this.keepalive();
};

Jwt.prototype = {
  init: function(jwt, ui, url){
    // if (undefined !== url){
    //   $.cookie(this.opts.url, url, {expires: 30});
    //   this.url = url;
    // } else {
    //   url = $.cookie(this.opts.url);
    //   this.url = undefined === url ? this.opts.login : url;
    // }

    if (undefined !== jwt){
      $.cookie(this.opts.jwt, jwt);
      this.jwt = jwt;
    } else {
      this.jwt = $.cookie(this.opts.jwt);
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

    if (undefined !== ui){
      ui = JSON.parse(Base64.decode(ui));
      if (undefined !== ui.password){
        $.cookie(this.opts.pwd, ui.password);
        this.pwd = ui.password;
      } else {
        this.pwd = $.cookie(this.opts.pwd);
      }
    } else {
      this.pwd = $.cookie(this.opts.pwd);
    }
  },
  getUrlParams: function(){
    var href = window.location.href;
    var start = href.indexOf('?') + 1;
    if (0 === start){
      return {};
    }
    var stop = href.indexOf('#');
    if (-1 === stop){
      stop = href.length;
    }
    var seach = href.substring(start, stop);
    var url = window.location.protocol + '//' + window.location.host + window.location.pathname + window.location.hash;
    window.history.replaceState({} , '', url);
    return this.parseStr(seach, '&');
  },
  parseStr: function(str, sp){
    var arr = str.split(sp);
    var data = {};
    var idx = 0;
    for (var i = 0, l = arr.length; i < l; i++){
      var tmp = arr[i].split('=');
      if (2 > tmp.length){
        continue;
      }
      data[tmp[0]] = tmp[1];
      idx++;
    }
    return data;
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

    var data = {username: this.aud, password: this.pwd, expired: e};
    var _this = this;
    $.ajax({
      url: 'http://121.41.72.231:5001/api/ivc/v1/plaintext_login',
      data: data,
      type: 'POST',
      success: function(json){
        _this.jwt = json.jwt;
        $.cookie(_this.opts.jwt, json.jwt);
        _this.updateing = false;
      }, 
      error: function() {
        /* Act on the event */
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
  get: function(){
    return {aud: this.aud, jwt: this.jwt};
  },
  jump: function(url){
    url = undefined === url ? this.opts.login : url;
    var href = window.location.href;
    var idx = href.indexOf('?');
    var page = href;
    if (-1 !== idx){
      page = href.substring(0, idx);
    }
    window.location.replace(url + '?page=' + page);
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
    $.removeCookie(this.opts.jwt);
    this.jump();
  }
};
// var jwt = new Jwt();
