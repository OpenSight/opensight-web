
// var flashvars = {
//   src: 'http://www.opensight.cn/hls/camera1.m3u8',
//   plugin_hls: "flashlsOSMF.swf",
//   autoPlay: true
// };
// var params = {
//   allowFullScreen: true,
//   allowScriptAccess: "always",
//   bgcolor: "#000000"
// };
// var attrs = {
//   name: "videoPlayer"
// };

// swfobject.embedSWF("GrindPlayer.swf", "videoPlayer", "100%", "100%", "10.2", null, flashvars, params, attrs);
function parseUrl(){
  var seach = window.location.href.substring(window.location.href.indexOf('?') + 1);
  var arr = seach.split('&');
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
  if (0 === idx){
    return null;
  }
  return data;
};

var HlsVideo = function(opts){
  this.api = 'http://121.41.72.231:5001/api/ivc/v1/projects/';
  this.project = opts.project;
  this.uuid = opts.uuid;

  this.init();
};

HlsVideo.prototype = {
  init: function(){
    this.createSession();
    this.getCamareInfo();
    this.on();
    this.updateTip();
  },
  on: function(){},
  loadFlash: function(info){
    var flashvars = {
      // src: 'http://www.opensight.cn/hls/camera1.m3u8',
      src: info.url,
      plugin_hls: "flashlsOSMF.swf",
      autoPlay: true
    };

    var params = {
      allowFullScreen: true,
      allowScriptAccess: "always",
      bgcolor: "#000000"
    };
    var attrs = {
      name: "videoPlayer"
    };

    swfobject.embedSWF("GrindPlayer.swf", "videoPlayer", "100%", "100%", "10.2", null, flashvars, params, attrs);
  },
  getCamareInfo: function(){
    var _this = this;
    $.ajax({
      url: this.api +  this.project + '/cameras/' + this.uuid,
      cache: true,
      async: false,
      type: 'GET',
      success: function(info){
        info.src = "http://www.opensight.cn/img/fxdq.jpeg";
        $('#img').attr('src', info.src);
        _this.showCamareInfo(info);
      }
    });
  },
  showCamareInfo: function(info){
    $('#name').text(info.name);
    $('#desc').text(info.desc);
    $('#long_desc').text(info.long_desc);
  },
  createSession: function(){
    var _this = this;
    $.ajax({
      url: this.api +  this.project + '/cameras/' + this.uuid + '/sessions',
      cache: true,
      data: {format: 'hls', quality: 'ld', create: true},
      type: 'POST',
      success: function(info){
        _this.loadFlash(info);
        _this.keepalive(info.session_id);

        if (undefined !== _this.tiptimer) {
          clearInterval(_this.tiptimer);
          _this.tiptimer = undefined;
        }
      }
    });
  },
  keepalive: function(sessionid){
    var _this = this;
    setInterval(function(){
      $.ajax({
        url: _this.api + _this.project + '/cameras/' + _this.uuid + '/sessions/' + sessionid,
        cache: true,
        type: 'POST'
      });
    }, 30000);
  },
  updateTip: function(){
    var _this = this;
    var sec = 10;
    this.tiptimer = setInterval(function(){
      if (1 === sec && undefined !== _this.tiptimer){
        clearInterval(_this.tiptimer);
        _this.tiptimer = undefined;
        return;
      }
      sec--;
      $('#playTipSec').text(sec);
    }, 1000);
  }
};

$(function(){
  var params = parseUrl();
  new HlsVideo(params);
});