'use strict';

angular.module('app.services', [])
.factory('flagFactory', function() {
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
      var ab = [
        {text: 'LD', title: '流畅', cls: '', idx: 0}, 
        {text: 'SD', title: '标清', cls: '', idx: 1}, 
        {text: 'HD', title: '高清', cls: '', idx: 2}, 
        {text: 'FHD', title: '超清', cls: '', idx: 3}
      ];
      var t = [];
      for (var i = 0, l = ab.length; i < l; i++) {
        if (1 === bitmap[ab[i].idx]) {
          t.push(ab[i]);
        }
      }
      return {
        ptz: 1 === bitmap[6],
        live: 0 === bitmap[5],
        preview: 1 === bitmap[4],
        ability: t
      };
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
  var page = {
    curr: 1,
    total: 0,
    limit: 10,
    max: 5,
    prev: '上一页',
    next: '下一页'
  };
  return {
    init: function() {
      page.curr = 1;
      page.total = 0;
      return page;
    },
    get: function(){
      return page;
    },
    set: function(list) {
      page.curr = Math.ceil((list.start + 1)/ page.limit);
      page.total = list.total;
      return page;
    },
    getStart: function(){
      return (page.curr - 1) * page.limit;
    },
    jump: function(jumpto){
      if (null === jumpto.match(/^[1-9][\d]*$/)) {
        return false;
      }
      var p = parseInt(jumpto, 10);
      var last = Math.ceil(page.total / page.limit);
      if (p === page.curr || p > last) {
        return false;
      }
      page.curr = p;
      return true;
    }
  };
})
;