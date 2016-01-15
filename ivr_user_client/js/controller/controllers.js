app.controller('ModalCtrl', ['$scope', function ($scope) {
    $scope.$on("Ctr1ModalShow",
        function (event, errMsg) {
            $scope.gModal = {};

            $scope.gModal.Label = errMsg.Label;
            $scope.gModal.ErrorContent = errMsg.ErrorContent;
            $scope.gModal.ErrorContentDetail = JSON.stringify(errMsg.ErrorContentDetail, null, "\t");
            $scope.gModal.DetailShown = false;
            $scope.gModal.SingleButtonShown = errMsg.SingleButtonShown;
            $scope.gModal.MutiButtonShown = errMsg.MutiButtonShown;
            $scope.gModal.Token = errMsg.Token;
            $scope.gModal.Callback = errMsg.Callback;

            $scope.gModal.goOn = function () {
                var tmpMsg = {};
                tmpMsg.Token = $scope.gModal.Token;
                tmpMsg.Stop = false;
                $scope.$broadcast($scope.gModal.Callback, tmpMsg);
                $('#myErrorModal').modal('hide');
            };
            $scope.gModal.stop = function () {
                var tmpMsg = {};
                tmpMsg.Token = $scope.gModal.Token;
                tmpMsg.Stop = true;
                $scope.$broadcast($scope.gModal.Callback, tmpMsg);
                $('#myErrorModal').modal('hide');
            };

            $('#myErrorModal').modal();
        }
    );



    $scope.$on("Logout",function (event, errMsg) {
            $('#LoginModal').modal();
        }
    );

    $scope.$on("Login",function (event, errMsg) {
            $('#LoginModal').modal('hide');
        }
    );

}]);


