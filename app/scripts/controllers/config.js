'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('ConfigCtrl', function($scope,$position,$state,$rootScope, settingsService) {

    var currentUser = Parse.User.current();
    $scope.secondaryPassword = {};
    console.log('COnfigh!');
    getSettings();

    function getSettings(){
      settingsService.getSetting()
      .then(function(results) {
        // Handle the result
        $scope.settings = results[0];
        $scope.applicationVersion = $scope.settings.get('version');
        $scope.settingsProductId = $scope.settings.get('productId');
        $scope.settingsFirstBoot = $scope.settings.get('firstBoot');
        $scope.settingsConfigPassword = $scope.settings.get('configPassword');

        $scope.isSecondaryPassword = $scope.settings.get('isSecondaryPassword');
        $scope.secondaryPasswordFromDatabase = $scope.settings.get('secondaryPassword');

        if($scope.isSecondaryPassword){
          $scope.isSecondaryPassword = "true";
        } else {
          $scope.isSecondaryPassword = "false";
        }

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

    $scope.synchronizeTime = function(){
      // Sat May 28 00:16:11 PHT 2016

      var data = new Date();
      data = data.toString();
      data = data.split(' ');
      data = data[0] + ' ' + data[1] + ' ' + data[2] + ' ' + data[4] + ' UTC ' + data[3];

      settingsService.updateSystemTime(data)
      .then(function(results) {
        alert('successfully synch!');
        getSettings();
        // Handle the result
      }, function(err) {
        // Error occurred
        alert('update error!');
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    }

    $scope.setToFirstBoot = function(){

      $scope.settings.set("firstBoot", true);

      $scope.settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          alert('successfully updated!');
          getSettings();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          alert('update error!');
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.updateSecondaryPassword = function(){

      if($scope.isSecondaryPassword === "true"){
        $scope.settings.set("isSecondaryPassword", true);
        if($scope.secondaryPassword.oldPassword === $scope.secondaryPasswordFromDatabase){
          if($scope.secondaryPassword.newPassword === $scope.secondaryPassword.confirmPassword){
            $scope.settings.set("secondaryPassword", $scope.secondaryPassword.confirmPassword);
          }else{
            alert('New Password and Confirmation does not match.');
          }
        } else {
          alert('Old Secondary Password Invalid.');
        }
      } else{
        $scope.settings.set("isSecondaryPassword", false);
      }

      $scope.settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          alert('successfully updated!');
          getSettings();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          alert('update error!');
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.resetSecondaryPassword = function(){

      if($scope.productIdCredentials === $scope.settingsProductId){
        $scope.settings.set("secondaryPassword", 'admin1');

        $scope.settings.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            $scope.passwordResetStatus = 'Successfully Reset to admin1';
            alert('Successfully Reset to admin1');
            console.log(result);
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      }else{
        $scope.passwordResetStatus = 'Invalid Product Id.';
      }

    }

    $scope.saveSettings = function(){
      if($scope.settingsConfigPassword === $scope.configPassword){
        $scope.settings.set("productId", $scope.settingsProductId);

        $scope.settings.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            alert('successfully updated!');
            getSettings();
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
            alert('update error!');
          }
        });
      }
      else{
        alert('Invalid Password');
      }

    }
});
