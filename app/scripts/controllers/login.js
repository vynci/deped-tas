'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('LoginCtrl', function($scope,$position,$state,$rootScope, settingsService) {

    var currentUser = Parse.User.current();
    console.log(currentUser);
    getSettings();
    if (currentUser) {
        // do stuff with the user
      Parse.User.logOut().then(
        function() {

        }, function(error) {
          alert('error : ' + error.message);
        }
      );
    }

    $scope.currentUser = {

    };
    $scope.login = function(){

        Parse.User.logIn($scope.currentUser.username, $scope.currentUser.password, {
        success: function(user) {
            // Do stuff after successful login.
            $rootScope.isLogged = true;
            $state.go('dashboard.home');
        },
        error: function(user, error) {
            // The login failed. Check error to see why.
            console.log(error);
            alert('error : ' + error.message);

        }
        });
    }

    $scope.submitProductId = function(){
      console.log($scope.productId);
      console.log(Parse);



      if($scope.productId !== $scope.settingsProductId){
        $scope.passwordResetStatus = 'Product Id mismatch';
      }
      else{
        $scope.passwordResetStatus = 'Product Id matched';
        settingsService.adminPasswordReset()
        .then(function(results) {
          $scope.passwordResetStatus = 'Password reset to "admin": Success!';
          // Handle the result
        }, function(err) {
          // Error occurred
          $scope.passwordResetStatus = 'Password reset to "admin": Fail!';
          console.log(err);
        }, function(percentComplete) {
          console.log(percentComplete);
        });
      }
    }



    function getSettings(){
      settingsService.getSetting()
      .then(function(results) {
        // Handle the result
        $scope.settings = results[0];

        $scope.primaryPhoto = $scope.settings.get('primaryPhoto');
        $scope.secondaryPhoto = $scope.settings.get('secondaryPhoto');
        $scope.applicationVersion = $scope.settings.get('version');
        $scope.settingsProductId = $scope.settings.get('productId');

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };
  });
