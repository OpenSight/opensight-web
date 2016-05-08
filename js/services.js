'use strict';

angular.module('app.services', [])
.factory('flagFactory', function() {
  var camera_ab = [
    {text: 'LD', title: '流畅', cls: '', idx: 0}, 
    {text: 'SD', title: '标清', cls: '', idx: 1}, 
    {text: 'HD', title: '高清', cls: '', idx: 2}, 
    {text: 'FHD', title: '超清', cls: '', idx: 3}
  ];
  return {
    getBitmap: function(f, bits) {
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
    parseCamera: function(bitmap) {
      var t = [];
      for (var i = 0, l = camera_ab.length; i < l; i++) {
        if (1 === bitmap[camera_ab[i].idx]) {
          t.push(camera_ab[i]);
        }
      }
      return {
        ptz: 1 === bitmap[6],
        live: 0 === bitmap[5],
        preview: 1 === bitmap[4],
        ability: t
      };
    },
    quality: function(bitmap){
      var t = [];
      for (var i = 0, l = camera_ab.length; i < l; i++) {
        var item = angular.copy(camera_ab[i]);
        item.enabled = (1 === bitmap[camera_ab[i].idx]);
        t.push(item);
      }
      return t;
    },
    encodeCamera: function(quality){
      var f = 0;
      for(var i = 0, l = quality.length; i < l; i++){
        if (true !== quality[i].enabled){
          continue;
        }
        f += Math.pow(2, quality[i].idx);
      }
      for (var j = 1, l = arguments.length; j < l; j++){
        if (true !== arguments[j]){
          continue;
        }
        f += Math.pow(2, i + j - 1);
      }
      return f;
    }
  };
})
.factory('dateFactory', function() {
  var padding = function(n){
    if (10 > n) {
      return '0' + n;
    }
    return n.toString();
  };
  var getDate = function(dt){
    return [
      dt.getFullYear(), 
      padding(dt.getMonth() + 1), 
      padding(dt.getDate())
    ].join('-');
  };
  return {
    getStart: function(dt) {
      return getDate(dt) + 'T00:00:00';
    },
    getEnd: function(dt) {
      return getDate(dt) + 'T23:59:59';
    }
  };
})

.factory('pageFactory', function() {
  var page, lastParams;
  var defaults = {
    curr: 1,
    total: 0,
    limit: 10,
    max: 5,
    prev: '上一页',
    next: '下一页',
    query: function(){},
    jumpto: '',
    jump: function(){
      var jumpto = page.jumpto;
      page.jumpto = '';
      if (null === jumpto.match(/^[1-9][\d]*$/)) {
        page.jumperror();
        return true;
      }
      var p = parseInt(jumpto, 10);
      var last = Math.ceil(page.total / page.limit);
      if (p === page.curr || p > last) {
        page.jumperror();
        return true;
      }
      page.curr = p;
      page.pageChanged();
      return true;
    },
    jumperror: function(){},
    pageChanged: function(){
      lastParams.start = (page.curr - 1) * page.limit;
      page.query(lastParams);
    }
  };
  var pageChanged = function(){};
  return {
    init: function(opt) {
      page = angular.extend({}, defaults, opt);
      lastParams = undefined;
      return page;
    },
    get: function(){
      return page;
    },
    set: function(list, params) {
      page.curr = Math.ceil((list.start + 1)/ page.limit);
      page.total = list.total;

      lastParams = angular.copy(params);
      return page;
    }
  };
})
;