(function ($) {
  $.getScript = function (src, func) {
    var script = document.createElement('script');
    script.async = "async";
    script.src = src;
    if (func) {
      script.onload = func;
    }
    document.getElementsByTagName("head")[0].appendChild(script);
  }
})($);

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

var getPath = function () {
  var pathname = window.location.pathname;
  var last = pathname.lastIndexOf('/');
  var path = pathname.substr(0, pathname.lastIndexOf('/') + 1);
  return window.location.origin + path;
};

var play = function (hls, autoplay) {
  hideState();
  var el = $('#video-container').html('<video id="video-player" controls webkit-playsinline="" src="' + hls + '" type="application/x-mpegURL"></video>');
  var player = document.getElementById('video-player');
  if (false !== autoplay) {
    $(player).attr('autoplay', 'autoplay');
    player.play();
    player.pause();
    player.play();
  }
};

var replay = function (camera_uuid, start_from) {
  $.ajax({
    url: api + '/cameras/' + camera_uuid + '/record/hls_url',
    type: 'GET',
    data: {
      start: start_from
    },
    success: function (recordinfo) {
      play(recordinfo.hls);
    },
    error: function () {
      showState(4);
    }
  });
};

var pause = (function () {
  var hls = '';
  return {
    get: function (camera_uuid, start_from) {
      $.ajax({
        url: api + '/cameras/' + camera_uuid + '/record/hls_url',
        type: 'GET',
        data: {
          start: start_from
        },
        success: function (recordinfo) {
          hls = recordinfo.hls;
        },
        error: function () {
          showState(4);
        }
      });
    },
    play: function () {
      play(hls);
    }
  };
})();

var api = '';

$(function () {
  var params = getUrlParams();
  api = 'http://api.opensight.cn/api/ivc/v1/projects/' + params.project;

  // (function () {
  //   var height = $('.live-card').height() + 44;
  //   $('.buttons-tab').fixedTab({ offset: height });
  // })();

  if (undefined === params.live_show) {
    showState(0);
    showCover();
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

  $('.status-switch').on('click', function () {
    $(this).addClass('hidden');
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
      showCover(info.cover_url);

      if (1 === info.state) {
        //启动直播
        new HlsVideo(info.camera_uuid, info.start);

        //获取观众数
        new Session(info.camera_uuid);

        //获取精彩片段列表
        new RecordEvent(info.camera_uuid, info.start);
      } else if (2 === info.state) {
        showState(info.state);
        var re = new RecordEvent(info.camera_uuid, info.start, info.event_record_id);
        re.on();
        pause.get(info.camera_uuid, info.start);
        $('#switch-replay').removeClass('visibility-hidden').on('click', function () {
          $('#switch-back').removeClass('hidden');
          pause.play();
        });
        $('#switch-back').on('click', function () {
          $('#switch-replay').removeClass('hidden');
          showState(info.state);
        });
      } else if (3 === info.state) {
        //直播状态停止直接播放事件录像
        new Record(info.event_record_id);
        //获取精彩片段列表
        new RecordEvent(info.camera_uuid, info.start, info.event_record_id);
        showState(info.state);
      } else {
        showState(info.state);
      }

      sh.onShare('【趣观微直播】' + info.name, info.long_desc + '-正在直播');
    },
    error: function () {
      showState(0);
      showCover();
    }
  });

  //初始化评论框
  new Comment(params.live_show);
});

var showState = function (state) {
  state = state || 0;
  var text = ['活动未开始', '', '活动暂停中', '活动已结束', '录像异常'][state];
  if ('' === text) {
    return this;
  }
  $('#state-container').addClass('state-container-show');
  $('#state-text').text(text);
  $('#video-container').html('');
  return;
};
var hideState = function () {
  $('#state-container').removeClass('state-container-show');
};

var showCover = function (cover_url) {
  // cover_url = 'http://public.opensight.cn/shows/shanderuixi/goutongdeyishu.jpg';
  var opsi = 'http://www.opensight.cn/wx/live/src/img/play-logo.png';
  if (undefined === cover_url || '' === cover_url) {
    cover_url = opsi;
  }
  $('.video-backgroud').css('background-image', 'url("' + cover_url + '")');
  if (opsi !== cover_url) {
    $('.video-backgroud').addClass('background-size');
  }
};

var HlsVideo = function (camera, start_from) {
  this.id = 'video-player';
  this.format = 'hls';
  this.user = 'show';
  this.container = 'video-container';
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
    this.showLiveInfo();
    this.getCamInfo();
    return this;
  },
  showLiveInfo: function () {
    $('.live-tip').removeClass('visibility-hidden');
    // $('#switch-replay').removeClass('visibility-hidden');
    // $('#friends').removeClass('visibility-hidden');
    // $('#session').removeClass('visibility-hidden');
    return this;
  },
  on: function () {
    var _t = this;
    $('#switch-replay').removeClass('visibility-hidden');
    $('#switch-replay').click(function () {
      $('#switch-live').removeClass('hidden');
      _t.stop();

      _t.replay();
    });

    $('#switch-live').click(function () {
      $('#switch-replay').removeClass('hidden');
      _t.create();
    });

    $('#record-event-container').on('click', '.record', function () {
      var el = $(this);
      if (el.hasClass('disabled')) {
        return;
      }
      $('#switch-replay').addClass('hidden');
      $('#switch-live').removeClass('hidden');
      _t.stop();

      var hls = el.attr('data-hls');
      _t.play(hls);
    });

    $(window).bind('unload', function () {
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
          this.tip.hide();
          showState(2);
          return;
        }
        this.quality = qa[qa.length - 1].value;
        this.create();
      },
      error: function () {
        this.tip.hide();
        showState(2);
      },
      context: this
    });
    return this;
  },
  parse: function (bitmap) {
    var camera_ab = [{
      value: 'ld',
      text: 'LD',
      title: '流畅',
      cls: '',
      idx: 0
    }, {
      value: 'sd',
      text: 'SD',
      title: '标清',
      cls: '',
      idx: 1
    }, {
      value: 'hd',
      text: 'HD',
      title: '高清',
      cls: '',
      idx: 2
    }, {
      value: 'fhd',
      text: 'FHD',
      title: '超清',
      cls: '',
      idx: 3
    }];
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
      data: {
        format: this.format,
        quality: this.quality,
        create: true,
        user: this.user
      },
      type: 'POST',
      success: function (info) {
        this.tip.stop();
        this.play(info.url);
        this.keepalive(info.session_id);
      },
      error: function () {
        this.tip.stop();
        showState(2);
        this.tip.hide();
      },
      context: this
    });
  },
  play: function (hls) {
    hideState();
    var el = $('#video-container').html('<video id="video-player" controls autoplay="autoplay" webkit-playsinline="" src="' + hls + '" type="application/x-mpegURL"></video>');
    var player = document.getElementById('video-player');
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
        showState(4)
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
        url: api + '/cameras/' + this.camera + '/sessions/' + this.session_id,
        type: 'DELETE',
        async: false
      });
      this.session_id = undefined;
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
  },
  hide: function () {
    $('#' + this.container).html('');
    return this;
  }
};


var Session = function (camera) {
  this.camera = camera;
  this.interval = 120000;
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
  this.id = 'video-player';
  this.container = 'video-container';

  this.hideLiveInfo();
  this.get(id);
  this.on();
  return this;
};
Record.prototype = {
  get: function (id) {
    $.ajax({
      url: api + '/record/events/' + id,
      type: 'GET',
      success: function (info) {
        this.hls = info.hls;
      },
      context: this
    });
  },
  hideLiveInfo: function () {
    $('.live-tip').addClass('visibility-hidden');
    return this;
  },
  on: function () {
    var _t = this;
    $('#switch-replay').addClass('hidden');
    $('#switch-allreplay').removeClass('hidden').click(function () {
      _t.play(_t.hls);
    });

    $('#record-event-container').on('click', '.record', function () {
      var el = $(this);
      if (el.hasClass('disabled')) {
        return;
      }

      var hls = el.attr('data-hls');
      _t.play(hls);
    });

    $('#state-container').addClass('play').click(function () {
      _t.play(_t.hls);
    });
    return this;
  },
  play: function (hls, autoplay) {
    if (undefined === hls) {
      showState(4);
      return;
    };
    hideState();
    var el = $('#video-container').html('<video id="video-player" controls webkit-playsinline="" src="' + hls + '" type="application/x-mpegURL"></video>');
    var player = document.getElementById('video-player');
    // $(player).attr('poster', 'http://public.opensight.cn/shows/shanderuixi/goutongdeyishu.jpg');
    if (false !== autoplay) {
      $(player).attr('autoplay', 'autoplay');
      player.play();
      player.pause();
      player.play();
    }
    return this;
  }
};

var RecordEvent = function (camera, start_from, event_record_id) {
  this.camera = camera;
  this.start_from = start_from;
  this.event_record_id = event_record_id;
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
  add: function (info) {
    var html = [];
    for (var i = 0, l = info.list.length; i < l; i++) {
      if (this.event_record_id === info.list[i].event_id) {
        continue;
      }
      html.push(this.render(info.list[i]));
    }
    html = html.join('');
    $('#record-event-container').append(html);
    return this;
  },
  remove: function () {
    $('#record-event-container').html('');
    return this;
  },
  render: function (item) {
    var cls = 1 !== item.state ? ' disabled' : '';
    var text = ['备份中', this.duration(item.end - item.start), '异常'];
    var str = '<li class="record' + cls + '" data-hls="' + item.hls + '">' +
      '<a href="#" class="item-link item-content">' +
      '<div class="item-media">' +
      '<img src="img/video-player.png" width="48">' +
      '</div>' +
      '<div class="item-inner">' +
      '<div class="item-title-row">' +
      '<div class="item-title">' + item.desc + '</div>' +
      '<div class="item-after">' + this.duration(item.end - item.start) + '</div>' +
      '</div>' +
      // '<div class="item-subtitle">标题</div>' +
      '<div class="item-text">' + this.format(item.start) + '</div>' +
      '</div>' +
      '</a>' +
      '</li>';
    return str;
  },
  format: function (dt, fmt) {
    if (!(dt instanceof Date)) {
      dt = new Date(dt);
    }
    fmt = fmt || 'MM-dd HH:mm';
    var padding = function (n) {
      if (10 > n) {
        return '0' + n;
      }
      return n.toString();
    };
    return fmt
      .replace('yyyy', dt.getFullYear())
      .replace('MM', padding(dt.getMonth() + 1))
      .replace('dd', padding(dt.getDate()))
      .replace('HH', padding(dt.getHours()))
      .replace('mm', padding(dt.getMinutes()))
      .replace('ss', padding(dt.getSeconds()));
  },
  duration: function (dur) {
    var a = [{
      t: '分',
      v: 60
    }, {
      t: '时',
      v: 60
    }, {
      t: '天',
      v: 24
    }];
    var s = '';
    dur = Math.floor(dur / (1000 * 60));
    for (var i = 0, l = a.length; i < l; i++) {
      s = dur % a[i].v + a[i].t + s;
      dur = Math.floor(dur / a[i].v);
      if (0 === dur) {
        break;
      }
    }
    return s;
  },
  on: function () {
    var _t = this;
    $('#record-event-container').on('click', '.record', function () {
      var el = $(this);
      if (el.hasClass('disabled')) {
        return;
      }
      $('#switch-replay').addClass('hidden');
      $('#switch-back').removeClass('hidden');
      var hls = el.attr('data-hls');
      _t.play(hls);
    });
    return this;
  },
  play: function (hls) {
    if (undefined === hls) {
      showState(4);
      return;
    };
    hideState();
    var el = $('#video-container').html('<video id="video-player" controls autoplay="autoplay" webkit-playsinline="" src="' + hls + '" type="application/x-mpegURL"></video>');
    var player = document.getElementById('video-player');
    player.play();
    player.pause();
    player.play();
    return this;
  }
};

var Comment = function (sid) {

  this.init(sid);

  return this;
};
Comment.prototype = {
  init: function (sid) {
    $('#tab1').html('<div id="SOHUCS" sid="' + sid + '"></div><script id="changyan_mobile_js" charset="utf-8" type="text/javascript" src="http://changyan.sohu.com/upload/mobile/wap-js/changyan_mobile.js?client_id=cysz4Q4lo&conf=prod_4193b6bf7521a984e9ed89e4407582cc"></script>');

    var _this = this;
    setTimeout(function () {
      $.getScript("http://changyan.sohu.com/upload/mobile/wap-js/changyan_mobile.js?client_id=cysz4Q4lo&conf=prod_4193b6bf7521a984e9ed89e4407582cc", function (data, status, jqxhr) {
        _this.on();
      });
    }, 100);
    return this;
  },
  on: function () {
    $('#SOHUCS').on('click', '.comment-textarea, .ctrl-item-ico.reply-ico', function () {
      $('.live-card').css({ 'display': 'none' });
    });

    $('#SOHUCS').on('click', '.cmt-box-title-right', function () {
      $('.live-card').css({ 'display': 'block' });
    });
  }
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
    var imgUrl = getPath() + 'img/play-logo.png';
    wx.onMenuShareAppMessage({
      title: this.title, // 分享标题
      desc: this.desc, // 分享描述
      link: this.url, // 分享链接
      imgUrl: imgUrl, // 分享图标
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
      imgUrl: imgUrl, // 分享图标
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
