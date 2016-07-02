app.register.controller('Schedule', ['$scope', '$http', '$q', 'dateFactory', function ($scope, $http, $q, dateFactory) {
  var api = 'http://api.opensight.cn/api/ivc/v1/record/schedules';

  $scope.boolFalse = false;
  $scope.boolTrue = true;
  $scope.info = {
    name: '',
    desc: '',
    long_desc: '',
    entries: []
  };
  $scope.typechange = function (info, type) {
    info.type = type;
    info.entries = [];
    var l = 'weekday' === type ? 7 : 31;
    for (var i = 1; i <= l; i++) {
      $scope.addItem(info, i);
    }
  };

  $scope.weekdays = [
    { name: '请选择星期', value: 0 },
    { name: '星期一', value: 1 },
    { name: '星期二', value: 2 },
    { name: '星期三', value: 3 },
    { name: '星期四', value: 4 },
    { name: '星期五', value: 5 },
    { name: '星期六', value: 6 },
    { name: '星期天', value: 7 }
  ];
  $scope.monthdays = [
    { name: '请选择日期', value: 0 }
  ];
  for (var i = 1; i < 32; i++) {
    $scope.monthdays.push({ name: i + '日', value: i });
  }

  $scope.addItem = function (info, idx) {
    idx = idx || 1;
    var it = {
      date: '',
      weekday: idx,
      monthday: idx,
      start: '00:00:00',
      end: '23:59:59',
      prerecord: false,
      datepicker: false
    };
    if ('weekday' !== info.type) {
      it.weekday = 0;
    } else {
      it.monthday = 0;
    }
    var s = new Date();

    var t = {
      start: dateFactory.str2time(it.start, true),
      end: dateFactory.str2time(it.end, false)
    };
    it.timepicker = t;

    info.entries.push(it);
  };

  $scope.removeItem = function (info, index) {
    // if (false ==== confirm('确定要删除此条记录？')){
    //   return;
    // }
    info.entries.splice(index, 1);
  };

  $scope.timechange = function (info, index, key) {
    var d = info.entries[index].timepicker[key];
    info.entries[index][key] = dateFactory.time2str(d);
  };

  var copy = function (src) {
    var dst = {
      name: src.name,
      desc: src.desc,
      long_desc: src.long_desc,
      entries: []
    };
    for (var i = src.entries.length - 1; i >= 0; i--) {
      dst.entries.unshift({
        date: src.entries[i].date,
        weekday: src.entries[i].weekday,
        monthday: src.entries[i].monthday,
        start: src.entries[i].start,
        end: src.entries[i].end,
        prerecord: src.entries[i].prerecord
      });
    }
    return dst;
  };
  (function () {
    $scope.addShown = false;

    var initAddInfo = function () {
      $scope.addinfo = {
        name: '',
        desc: '',
        long_desc: '',
        type: 'weekday',
        entries: []
      };
      $scope.typechange($scope.addinfo, 'weekday');
    };

    $scope.add = function () {
      $http.post(api, copy($scope.addinfo)).success(function (response) {
        initAddInfo();
        $scope.addShown = false;
        $scope.query();
      }).error(function (response, status) {
        var tmpMsg = {};
        tmpMsg.Label = "错误";
        tmpMsg.ErrorContent = "添加录像计划模板失败。";
        tmpMsg.ErrorContentDetail = response;
        tmpMsg.SingleButtonShown = true;
        tmpMsg.MutiButtonShown = false;
        if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
          //$scope.$emit("Logout", tmpMsg);
          $state.go('logOut', { info: response.info, traceback: response.traceback });
        } else {
          $scope.$emit("Ctr1ModalShow", tmpMsg);
        }
        console.log('error');
      });
    };
    initAddInfo();
  })();

  (function () {
    $scope.query = function () {
      $scope.aborter = $q.defer();
      $http.get(api, {
        timeout: $scope.aborter.promise
      }).success(function (response) {
        $scope.schedules = response;
      }).error(function (response, status) {
        var tmpMsg = {};
        tmpMsg.Label = "错误";
        tmpMsg.ErrorContent = "获取录像计划模板失败。";
        tmpMsg.ErrorContentDetail = response;
        tmpMsg.SingleButtonShown = true;
        tmpMsg.MutiButtonShown = false;
        if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
          //$scope.$emit("Logout", tmpMsg);
          $state.go('logOut', { info: response.info, traceback: response.traceback });
        } else {
          $scope.$emit("Ctr1ModalShow", tmpMsg);
        }
      });
    };

    $scope.remove = function (item, index) {
      if (false === confirm('确认删除录像计划模板 "' + item.name + '" 吗？')) {
        return;
      }
      $scope.aborter = $q.defer();
      $http.delete(url + '/' + item.id, {
        timeout: $scope.aborter.promise
      }).success(function (response) {
        $scope.schedules.list.splice(index, 1);
      }).error(function (response, status) {
        var tmpMsg = {};
        tmpMsg.Label = "错误";
        tmpMsg.ErrorContent = "删除录像模板失败。";
        tmpMsg.ErrorContentDetail = response;
        tmpMsg.SingleButtonShown = true;
        tmpMsg.MutiButtonShown = false;
        if (status === 403 || (response !== undefined && response !== null && response.info !== undefined && response.info.indexOf("Token ") >= 0)) {
          //$scope.$emit("Logout", tmpMsg);
          $state.go('logOut', { info: response.info, traceback: response.traceback });
        } else {
          $scope.$emit("Ctr1ModalShow", tmpMsg);
        }
        console.log('error');
      });
    };

    $scope.query();
  })();


  $scope.detail = [];
  $scope.showDetail = function (item, index) {
    if (true === item.bDetailShown) {
      item.bDetailShown = false;
    } else {
      item.bDetailShown = true;
      $scope.detail[index] = angular.copy(item);
      if ($scope.detail[index].entries.length !== 0 &&
        (0 === $scope.detail[index].entries[0].weekday || null === $scope.detail[index].entries[0].weekday)) {
        $scope.detail[index].type = 'monthday';
      } else{
        $scope.detail[index].type = 'weekday';
      }
      for (var i = 0, l = $scope.detail[index].entries.length; i < l; i++) {
        var t = {
          start: dateFactory.str2time($scope.detail[index].entries[i].start, true),
          end: dateFactory.str2time($scope.detail[index].entries[i].end, false)
        };
        $scope.detail[index].timepicker = t;
      }
    }
  };

  $scope.destroy = function () {
    if (undefined !== $scope.aborter) {
      $scope.aborter.resolve();
      delete $scope.aborter;
    }
  };

  $scope.$on('$destroy', $scope.destroy);
}]);
