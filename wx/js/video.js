var HlsVideo = function(opts){
  this.html5 = true;
  this.api = 'http://www.opensight.cn/api/ivc/v1/projects/';
  this.project = opts.project_name;
  this.uuid = opts.uuid;
  this.alivetimer = undefined;
  this.player = undefined;
  this.playStream = opts.playStream;
  this.init();
};

HlsVideo.prototype = {
  init: function(){
      this.on();
    this.createSession();
    this.getCameraInfo();
    this.updateTip();
  },
    on: function(){
        var id = 'videoPlayer';
        var html = '<div id="videoPlayer">' +
            '<p class="play-tip pull-right" >' +
            '<span class="text-highlight" id="playTipSec">10</span>' +
            '秒之后直播开始' +
            '</p>' +
            '</div>';

        var el = $('#' + id).parent().html(html);
        this.destroyed = false;
    },
    /*
  loadFlash: function(info){
    var flashvars = {
      // src: 'http://www.opensight.cn/hls/camera1.m3u8',
      src: info.url,
      plugin_hls: "flashlsOSMF.swf",
      // scaleMode: 'none',
      autoPlay: true
    };

    var params = {
      allowFullScreen: true,
      allowScriptAccess: "always",
      wmode: 'opaque',
      bgcolor: "#000000"
    };
    var attrs = {
      name: "videoPlayer"
    };

    swfobject.embedSWF("GrindPlayer.swf", "videoPlayer", "100%", "100%", "10.2", null, flashvars, params, attrs);
  },
  */
  addVideoTag: function(info){
    var id = 'videoPlayer';
    var html = '<video id="' + id + '" class="video" controls preload autoplay="autoplay" webkit-playsinline="true" playsinline="true" width="100%" height="100%">' +
      '<source src = "' + info.url + '" type = "application/x-mpegURL" />' +
    '</video>';
    var el = $('#' + id).parent().html(html);

      this.player = document.getElementById(id);
      this.player.play();
      this.player.pause();
    var u = window.navigator.userAgent.toLowerCase();
    if (-1 === u.indexOf('windows') && -1 !== u.indexOf('android')) {
        this.player.load();
    }
      this.player.play();

  },
  getCameraInfo: function(){
    var _this = this;
    $.ajax({
      url: this.api +  this.project + '/cameras/' + this.uuid,
      cache: true,
      async: false,
        headers: { // 添加请求头
            "Authorization": "Bearer " + $.cookie('jwt')
        },
      type: 'GET',
      success: function(info){
        // $('#img').attr('src', info.preview);
        _this.showCameraInfo(info);
      },
      error: function(){
        _this.error();
      }
    });
  },
  showCameraInfo: function(info){
    $('#name').text(info.name);
    $('#desc').text(info.desc);
    $('#long_desc').text(info.long_desc);
  },
  createSession: function(){
      /*
      var tempStreamStr = "ld";
      var stream = $.cookie('stream');
      if (stream === "" || stream === undefined){
          stream = "0";
      }

      switch(stream){
          case "0":
              tempStreamStr = "ld";
              break;
          case "1":
              tempStreamStr = "sd";
              break;
          case "2":
              tempStreamStr = "hd";
              break;
          case "3":
              tempStreamStr = "fhd";
              break;
          default:
              tempStreamStr = "ld";
              break;
      }
      */
    var _this = this;
    $.ajax({
//add some code to force quality

      url: this.api +  this.project + '/cameras/' + this.uuid + '/sessions',
      cache: true,
        headers: { // 添加请求头
            "Authorization": "Bearer " + $.cookie('jwt')
        },
      data: {format: 'hls', quality: _this.playStream, create: true},
      type: 'POST',
      success: function(info){
        if (true === _this.html5 && _this.destroyed === false){
          _this.addVideoTag(info);
        }
        /*else {
          _this.loadFlash(info);
        }
        */
          _this.keepalive(info.session_id);

        if (undefined !== _this.tiptimer) {
          clearInterval(_this.tiptimer);
          _this.tiptimer = undefined;
        }
      },
      error: function(){
        _this.error();
      }
    });
  },

    /*
  keepalive: function(sessionid){
    var _this = this;
      this.keeptimer = setInterval(function(){
      $.ajax({
        url: _this.api + _this.project + '/cameras/' + _this.uuid + '/sessions/' + sessionid,
        cache: true,
          headers: { // 添加请求头
              "Authorization": "Bearer " + $.cookie('jwt')
          },
        type: 'POST'
      });
    }, 30000);
  },
    */

    keepalive: function(sessionid){
        this.session_id = sessionid;
        var _this = this;
        if (undefined !== _this.alivetimer){
            clearInterval(_this.alivetimer);
            _this.alivetimer = undefined;
        }
        var count = 40*3;//20*3min
        _this.alivetimer = setInterval(function(){
            if (0 === count){
                $('#ToastTxt').html("查看时间过长，休息一下吧！");
                $('#loadingToast').show();
                setTimeout(function () {
                    $('#loadingToast').hide();
                }, 2000);
                //_this.destroy();
                window.history.back();
                return;
            } else {
                count--;
            }
            $.ajax({
                url: _this.api + _this.project + '/cameras/' + _this.uuid + '/sessions/' + _this.session_id,
                cache: true,
                headers: { // 添加请求头
                    "Authorization": "Bearer " + $.cookie('jwt')
                },
                type: 'POST'
            });
        }, 30000);
    },

  stop: function(){
        var _this = this;
        if (undefined !== _this.alivetimer){
            clearInterval(_this.alivetimer);
            _this.alivetimer = undefined;
        }

        if (this.player!==undefined){
//            this.player.stop();
        }

        if (undefined === _this.session_id){
            return;
        }

        $.ajax({
            url: _this.api + _this.project + '/cameras/' + _this.uuid + '/sessions/' + _this.session_id,
            cache: true,
            headers: { // 添加请求头
                "Authorization": "Bearer " + $.cookie('jwt')
            },
            type: 'DELETE'
        });
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
  },

  error: function(){
    if (undefined !== this.tiptimer){
      clearInterval(this.tiptimer);
      this.tiptimer = undefined;
    }
    alert('启动实况失败，请刷新页面重试。');
  },

    destroy: function(){
        if (this.destroyed === true) return;
        this.stop();
        var id = 'videoPlayer';
        if($("#playTipSec").length>0){
            clearInterval(this.tiptimer);
            this.tiptimer = undefined;
        }else{
            var player = document.getElementById(id);
            if (player!==null && player.currentTime){

                player.currentTime = 0;
                player.pause();
                player.src="movie.ogg";
                player.load();
            }
        }
        clearInterval(this.keeptimer);
        this.keeptimer = undefined;
        var html = '<div id="videoPlayer">' +
            '<p class="play-tip pull-right" >' +
            '<span class="text-highlight" id="playTipSec">10</span>' +
            '秒之后直播开始' +
            '</p>' +
            '</div>';

        var el = $('#' + id).parent().html(html);
        this.destroyed = true;
    }
};
