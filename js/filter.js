'use strict';

angular.module('app.filter', []).filter('online', [function() {
  return function(is_online) {
    if (1 === is_online){
      return '在线';
    } else if (2 === is_online){
      return '直播中';
    } else {
      return '离线';
    }
  };
}]).filter('publicattribute', [function() {
  return function(bBublic) {
    if (true === bBublic){
      return '公开';
    } else {
      return '私有';
    }
  };
}]).filter('key_type', [function() {
  return function(type) {
    if (1 === type){
      return '管理员';
    } else {
      return '操作员';
    }
  };
}])

.filter('key_enabled', [function() {
  return function(enabled) {
    if (true === enabled){
      return '启用';
    } else {
      return '禁用';
    }
  };
}])

.filter('manual_enabled', [function() {
  return function(enabled) {
    if (true === enabled){
      return '启动';
    } else {
      return '停止';
    }
  };
}])

.filter('stream_quality', [function() {
  return function(quality) {
    if (undefined === quality){
      return '';
    }
    var em = {
      ld:  '流畅',
      sd: '标清',
      hd: '高清',
      fhd: '超清'
    };
    quality = quality.toLowerCase();
    return em[quality] ? em[quality] : '';
  };
}])

.filter('user_type', [function() {
  return function(type) {
    if (1 === type){
      return '管理员';
    } else {
      return '操作员';
    }
  };
}])

.filter('bill_type', [function() {
  return function(type) {
    if (0 === type){
      return '充值';
    } else {
      return '消费';
    }
  };
}])

.filter('range', function() {
  return function(input, start, end) {    
    start = parseInt(start);
    end = parseInt(end);
    var direction = (start <= end) ? 1 : -1;
    while (start != end) {
        input.push(start);
        start += direction;
    }
    return input;
  };
})

.filter('record_state', function() {
  return function(state) {
    var list = [
      '未启动',
      '预录中',
      '录像中',
      '异常'
    ];
    return list[state];
  };
})

.filter('duration', function() {
  var a = [{t: '秒', v: 60}, {t: '分', v: 60}, {t: '时', v: 60}, {t: '天', v: 24}];
  return function(dur, ms) {
    var s = '';
    if (true === ms){
      dur = Math.floor(dur / 1000);
    }
    for (var i = 0, l = a.length; i < l; i++){
      s = dur % a[i].v + a[i].t + s;
      dur = Math.floor(dur / a[i].v);
      if (0 === dur){
        break;
      }
    }
    return s;
  };
})

.filter('listlength', function() {
  return function(length) {
    return 0 === length ? '无' : '有';
  };
})

.filter('event_state', function() {
  return function(state) {
    var states = ['备份中', '正常', '异常'];
    return states[state];
  };
})


.filter('show_state', [function() {
    return function(state) {
        if (0 === state){
            return '未启动';
        }else if (1 === state){
            return '进行中';
        }else if (2 === state){
            return '暂停';
        }else if (3 === state){
            return '已结束';
        } else {
            return '未知';
        }
    };
}])

;