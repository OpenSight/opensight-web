'use strict';

/* Directives */
app.directive('flags', [function() {
  function link(scope, element, attrs) {
    var getBitmap = function(f, bits){
      var t = [];
      var i = 0;
      do{
        t[i] = f % 2;
        f = Math.floor(f / 2);
        i++;
      } while(f > 0);
      while(i < bits){
        t[i] = 0;
        i++;
      }
      return t;
    };
    var f = attrs.flag;
    var m = getBitmap(f, 8);
    var ab = [{
      text: 'LD',
      cls: '',
      idx: '0'
    }, {
      text: 'SD',
      cls: '',
      idx: '1'
    }, {
      text: 'HD',
      cls: '',
      idx: '2'
    }, {
      text: 'FHD',
      cls: '',
      idx: '3'
    }];
    var arr = ['LD', 'SD', 'HD', 'FHD'];
    var t = '';
    for (var i = 0, l = ta.length; i < l; i++){
      if (0 === m[i]){
        continue;
      }
      t += ta[i] + '&nbsp;';
    }
    element.html(t);
  };

  return {
    link: link
  };
}]);