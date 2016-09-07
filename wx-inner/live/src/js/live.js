var getUrlParams = function () {
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
  // window.history.replaceState({}, '', url);
  return parseStr(decodeURI(seach), '&');
};
var parseStr = function (str, sp) {
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
};

var params = getUrlParams();

(function () {
  if (undefined === params.live_show) {
    return false;
  }
  $('#SOHUCS').attr('sid', params.live_show);
})();

var api = 'http://api.opensight.cn/api/ivc/v1/projects/' + params.project;

$(function () {
  if (undefined === params.live_show) {
    showState(0)
    return;
  }

  $.ajaxSettings = $.extend(true, {}, $.ajaxSettings, {
    crossDomain: true,
    dataType: 'json',
    accepts: 'json',
    beforeSend: function (request) {
      if (undefined !== params.jwt) {
        request.setRequestHeader('Authorization', "Bearer " + params.jwt);
      }
    }
  });

  //初始化分享功能
  var sh = new Share();

  $.ajax({
    url: api + '/live_shows/' + params.live_show,
    type: 'GET',
    // async: false,
    success: function (info) {
      $('title').html(info.name);
      $('#show-name').html(info.desc);
      $('#show-desc').html(info.long_desc);

      if (1 === info.state) {
        //启动直播
        new HlsVideo(info.camera_uuid, info.start);

        //获取观众数
        new Session(info.camera_uuid);

        //获取精彩片段列表
        new RecordEvent(info.camera_uuid, info.start);
      } else if (3 === info.state) {
        new Record(info.event_record_id);
      } else {
        showState(info.state);
        return;
      }

      sh.onShare(info.name, info.long_desc);
    },
    error: function () {
      showState(0)
    }
  });

  //初始化评论框
  new Comment();
});

var showState = function (state) {
  state = state || 0;
  var text = ['活动未启动。', '', '活动暂停中。', ''][state];
  if ('' === text) {
    return this;
  }
  $('#video-container').html('<p class="text-highlight state">' + text + '</p>');
  return;
};

var HlsVideo = function (camera, start_from) {
  this.id = 'video-player';
  this.format = 'hls';
  this.user = 'show';
  this.container = 'video-container'
  this.camera = camera;
  this.start_from = start_from;

  this.init();
  this.on();
  return this;
};
HlsVideo.prototype = {
  init: function () {
    this.tip = new Tip({
      id: 'play-tip-sec',
      container: this.container
    });
    this.getCamInfo();
    return this;
  },
  on: function () {
    var _t = this;
    $('#switch-replay').click(function () {
      $('#switch-replay').addClass('hidden');
      $('#switch-live').removeClass('hidden');
      _t.stop();

      _t.replay();
    });

    $('#switch-live').click(function () {
      $('#switch-live').addClass('hidden');
      $('#switch-replay').removeClass('hidden');
      _t.create();
    });

    $('#record-event-container').on('click', '.record', function () {
      $('#switch-replay').addClass('hidden');
      $('#switch-live').removeClass('hidden');
      _t.stop();

      var hls = $(this).attr('hls');
      _t.play(hls);
    });

    $(window).bind('beforeunload', function () {
      _t.stop();
    });
    return this;
  },
  getCamInfo: function () {
    $.ajax({
      url: api + '/cameras/' + this.camera,
      type: 'GET',
      success: function (info) {
        var bitmap = this.getBitmap(info.flags, 8);
        var qa = this.parse(bitmap);
        if (0 === qa.length) {
          showState(0)
          return;
        }
        this.quality = qa[qa.length - 1].value;
        this.create();
      },
      error: function () {
        showState(0)
      },
      context: this
    });
    return this;
  },
  parse: function (bitmap) {
    var camera_ab = [
      { value: 'ld', text: 'LD', title: '流畅', cls: '', idx: 0 },
      { value: 'sd', text: 'SD', title: '标清', cls: '', idx: 1 },
      { value: 'hd', text: 'HD', title: '高清', cls: '', idx: 2 },
      { value: 'fhd', text: 'FHD', title: '超清', cls: '', idx: 3 }
    ];
    var t = [];
    for (var i = 0, l = camera_ab.length; i < l; i++) {
      if (1 === bitmap[camera_ab[i].idx]) {
        t.push(camera_ab[i]);
      }
    }
    return t;
  },
  getBitmap: function (f, bits) {
    var t = [];
    var i = 0;
    do {
      t[i] = f % 2;
      f = Math.floor(f / 2);
      i++;
    } while (f > 0);
    while (i < bits) {
      t[i] = 0;
      i++;
    }
    return t;
  },
  create: function () {
    $.ajax({
      url: api + '/cameras/' + this.camera + '/sessions',
      data: { format: this.format, quality: this.quality, create: true, user: this.user },
      type: 'POST',
      success: function (info) {
        this.tip.stop();
        this.play(info.url);
        this.keepalive(info.session_id);
      },
      error: function () {
        showState(0)
      },
      context: this
    });
  },
  play: function (hls) {
    var el = $('#' + this.container).html('<video id="' +
      this.id +
      '" controls autoplay="autoplay" webkit-playsinline="" width="100%" height="100%" src="' +
      hls +
      '" type="application/x-mpegURL"></video>');
    var player = document.getElementById(this.id);
    player.play();
    player.pause();
    player.play();
    return this;
  },
  replay: function () {
    $.ajax({
      url: api + '/cameras/' + this.camera + '/record/hls_url',
      type: 'GET',
      data: {
        start: this.start_from
      },
      success: function (info) {
        this.play(info.hls);
      },
      error: function () {
        showState(0)
      },
      context: this
    });
    return this;
  },
  keepalive: function (session_id) {
    var _t = this;
    this.stop();
    this.session_id = session_id;
    this.interval = setInterval(function () {
      $.ajax({
        url: api + '/cameras/' + _t.camera + '/sessions/' + session_id,
        type: 'POST'
      });
    }, 30000);
    return this;
  },
  stop: function () {
    if (undefined !== this.interval) {
      clearInterval(this.interval);
      this.interval = undefined;
    }
    if (undefined !== this.session_id) {
      $.ajax({
        url: api + '/cameras/' + _t.camera + '/sessions/' + session_id,
        type: 'DELETE',
        async: false
      });
      this.session_id = session_id;
    }
    return this;
  }
};

var Tip = function (opts) {
  this.container = opts.container;
  this.id = opts.id;
  this.interval = 1;
  this.init();
  return this;
};
Tip.prototype = {
  init: function () {
    this.sec = 10;
    this.stop();
    $('#' + this.container).html('<div class="play-tip"><span class="text-highlight" id="' + this.id + '">' + this.sec + '</span>秒之后直播开始</div>');
    this.start();
    return this;
  },
  start: function () {
    var _this = this;
    this.timer = setInterval(function () {
      _this.update();
    }, _this.interval * 1000);
    return this;
  },
  update: function () {
    if (1 >= this.sec) {
      this.stop();
    }
    this.sec = this.sec - this.interval;
    $('#' + this.id).html(this.sec);
    return this;
  },
  stop: function () {
    if (undefined === this.timer) {
      return this;
    }
    clearInterval(this.timer);
    this.timer = undefined;
    return this;
  }
};


var Session = function (camera) {
  this.camera = camera;
  this.interval = 10000;
  this.stop();
  this.get();
  return this;
};
Session.prototype = {
  get: function () {
    var _t = this;
    this.ajax = $.ajax({
      url: api + '/cameras/' + this.camera + '/sessions',
      type: 'GET',
      success: function (info) {
        $('#session').html(info.total);
      },
      complete: function () {
        setTimeout(function () {
          _t.get();
        }, _t.interval);
      }
    });
    return this;
  },
  stop: function () {
    if (undefined !== this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
    if (undefined !== this.ajax) {
      this.ajax.abort();
      this.ajax = undefined;
    }
    return this;
  }
};

var Record = function (id) {
  this.hideLiveInfo();
  this.get(id);
  return this;
};
Record.prototype = {
  get: function (id) {
    $.ajax({
      url: api + '/record/events/' + id,
      type: 'GET',
      success: function (info) {
        this.play(info.hls);
      },
      context: this
    });
  },
  hideLiveInfo: function () { 
    $('.live-tip').addClass('visibility-hidden');
    return this;
  },
  play: function (hls) {
    var el = $('#' + this.container).html('<video id="' +
      this.id +
      '" controls autoplay="autoplay" webkit-playsinline="" width="100%" height="100%" src="' +
      hls +
      '" type="application/x-mpegURL"></video>');
    var player = document.getElementById(this.id);
    player.play();
    player.pause();
    player.play();
    return this;
  }
};

var RecordEvent = function (camera, start_from) {
  this.camera = camera;
  this.start_from = start_from;
  this.id = 'record-event-container';

  this.remove();
  this.get();
  return this;
};
RecordEvent.prototype = {
  get: function () {
    $.ajax({
      url: api + '/record/events',
      type: 'GET',
      data: {
        start_from: this.start_from,
        camera_id: this.camera,
        start: 0,
        limit: 100
      },
      success: function (info) {
        this.add(info);
      },
      context: this
    });
  },
  add: function () { },
  remove: function () {
    $('#' + this.id).html();
    return this;
  }
};

var Comment = function () {
  this.input = '#cy-cbox-wrapper';
  this.bar = '.section-floatbar-wap';
  this.container = $('#SOHUCS');

  this.init();
  return this;
};
Comment.prototype = {
  init: function () {
    var _t = this;
    setTimeout(function () {
      if (0 === $(_t.input).length) {
        _t.init();
      } else {
        _t.on();
      }
    }, 1000);
    return this;
  },
  on: function () {
    // $(this.bar).on('click', '.issue-text-wap', this, function(e){
    //   $(e.data.input).css('display', 'block');
    //   $(e.data.bar).css('display', 'none');
    // });
    // $(this.input).on('click', '.mutual-btn-wap', this, function(e){
    //   $(e.data.bar).css('display', 'block');
    //   $(e.data.input).css('display', 'none');
    // });
    this.container.find('textarea').focus(function () {
      $('.live-card').addClass('hidden');
    }).blur(function () {
      $('.live-card').removeClass('hidden');
    });
    return this;
  },
};

var Share = function () {
  this.url = window.location.href;
  this.inited = undefined;
  this.title = undefined;

  this.init();
  this.on();

  return this;
};
Share.prototype = {
  init: function () {
    var timestamp = Math.round(new Date().getTime() / 1000);
    var noncestr = this.url + new Date().getTime().toString();
    $.ajax({
      url: 'http://api.opensight.cn/api/ivc/v1/wechat/jsapi_signature',
      type: 'POST',
      async: false,
      data: {
        timestamp: timestamp,
        noncestr: noncestr,
        url: this.url
      },
      success: function (info) {
        wx.config({
          debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
          appId: info.appid, // 必填，公众号的唯一标识
          timestamp: timestamp, // 必填，生成签名的时间戳
          nonceStr: noncestr, // 必填，生成签名的随机串
          signature: info.signature, // 必填，签名，见附录1
          jsApiList: ['onMenuShareAppMessage', 'onMenuShareTimeline'] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
        });
        var _t = this;
        wx.ready(function () {
          _t.inited = true;
          if (undefined !== _t.title) {
            _t.onMenuShare();
          }
        });
      },
      context: this
    });
    return this;
  },
  on: function () {
    var _t = this;
    $('#share').click(function () {
      _t.showTip();
    });
    $('#overlay').click(function () {
      _t.hideTip();
    });
    return this;
  },
  onMenuShare: function () {
    var _t = this;
    wx.onMenuShareAppMessage({
      title: this.title, // 分享标题
      desc: this.desc, // 分享描述
      link: this.url, // 分享链接
      imgUrl: 'http://www.opensight.cn/img/play-logo.png', // 分享图标
      success: function () {
        // 用户确认分享后执行的回调函数
        _t.hideTip();
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
        _t.hideTip();
      }
    });
    wx.onMenuShareTimeline({
      title: this.title, // 分享标题
      link: this.url, // 分享链接
      imgUrl: 'http://www.opensight.cn/img/play-logo.png', // 分享图标
      success: function () {
        // 用户确认分享后执行的回调函数
        _t.hideTip();
      },
      cancel: function () {
        // 用户取消分享后执行的回调函数
        _t.hideTip();
      }
    });
    return this;
  },
  onShare: function (title, desc) {
    this.title = title;
    this.desc = desc;
    if (true === this.inited) {
      this.onMenuShare();
    }
    return this;
  },
  showTip: function () {
    $('#overlay').addClass('modal-overlay-visible');
    $('#video-container').hide();
    return this;
  },
  hideTip: function () {
    $('#overlay').removeClass('modal-overlay-visible');
    $('#video-container').show();
    return this;
  }
};