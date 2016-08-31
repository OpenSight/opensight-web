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
  if (undefined === params.showid) {
    return false;
  }
  $('#SOHUCS').attr('sid', params.showid);
})();

var api = 'http://api.opensight.cn/api/ivc/v1/projects/' + params.project;

$(function () {
  if (undefined === params.live_show) {
    $.alert('活动已结束。');
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

  $.ajax({
    url: api + '/live_shows/' + params.live_show,
    type: 'GET',
    success: function (info) {
      $('title').html(info.name);
      $('#show-name').html(info.name);
      $('#show-desc').html(info.long_desc);

      //启动直播
      new HlsVideo(info.camera_uuid);

      //获取观众数
      new Session(info.camera_uuid);

      //获取精彩片段列表
      new RecordEvent(info.camera_uuid, info.start);
    },
    error: function () {
      $.alert('活动已结束。');
    }
  });

  //初始化分享功能
});

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
      _t.replay();
    });

    $('#switch-live').click(function () {
      $('#switch-live').addClass('hidden');
      $('#switch-replay').removeClass('hidden');
      _t.create();
    });

    $('#record-event-container').on('click', '.record', function(){
      $('#switch-replay').addClass('hidden');
      $('#switch-live').removeClass('hidden');

      var hls = $(this).attr('hls');
      _t.play(hls);
    });
  },
  getCamInfo: function () {
    $.ajax({
      url: api + '/cameras/' + this.camera,
      type: 'GET',
      success: function (info) {
        var bitmap = this.getBitmap(info.quality);
        var qa = this.parse(bitmap);
        if (0 === qa.length) {
          $.alert('活动已结束。');
          return;
        }
        this.quality = qa[qa.length - 1].value;
        this.create();
      },
      error: function () {
        $.alert('活动已结束。');
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
        $.alert('活动已结束。');
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
    var player = document.getElementById('this.id');
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
        $.alert('活动已结束。');
      },
      context: this
    });
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
    this.timer = setTimeout(function () {
      _this.update();
    }, this.interval * 1000);
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
  this.interval = 10;
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
        }, this.interval);
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