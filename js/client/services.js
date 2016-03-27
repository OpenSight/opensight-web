'use strict';

angular.module('app.services', []).factory('flagFactory', function() {
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
});