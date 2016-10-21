'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */

angular.module('sbAdminApp')
  .directive('sidebar',['$location',function() {
    return {
      templateUrl:'scripts/directives/sidebar/sidebar.html',
      restrict: 'E',
      replace: true,
      scope: {
      },
      controller:function($scope, settingsService){
        $scope.selectedMenu = 'dashboard';
        $scope.collapseVar = 0;
        $scope.multiCollapseVar = 0;

        $scope.check = function(x){

          if(x==$scope.collapseVar)
            $scope.collapseVar = 0;
          else
            $scope.collapseVar = x;
        };

        $scope.multiCheck = function(y){

          if(y==$scope.multiCollapseVar)
            $scope.multiCollapseVar = 0;
          else
            $scope.multiCollapseVar = y;
        };

        var currentUser = Parse.User.current();
        var settingId = currentUser.get('settingId');

        getSettings();



        function getSettings(){
          settingsService.getSetting(settingId)
          .then(function(results) {
            // Handle the result
            $scope.settings = results[0];

            $scope.companyName = $scope.settings.get('companyName');
            $scope.sideBarColor = {
              background: {'background-color': $scope.settings.get('colorThemes').sideBarBackground},
              text: {color: $scope.settings.get('colorThemes').sideBarText}
            }

          }, function(err) {
            // Error occurred
            console.log(err);
          }, function(percentComplete) {
            console.log(percentComplete);
          });
        };
      }
    }
  }]);
