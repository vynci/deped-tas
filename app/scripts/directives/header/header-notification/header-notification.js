'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('sbAdminApp')
	.directive('headerNotification',function(){
		return {
        templateUrl:'scripts/directives/header/header-notification/header-notification.html',
        restrict: 'E',
        replace: true,
				controller : function($scope, settingsService, $timeout, $window, $state){
					var currentUser = Parse.User.current();
					var settingId = currentUser.get('settingId');

					getSettings();

					function getSettings(){
						settingsService.getSetting(settingId)
						.then(function(results) {
							// Handle the result
							$scope.settings = results[0];

							$scope.companyName = $scope.settings.get('companyName');
							$scope.headerColor = {
								background: {'background-color': $scope.settings.get('colorThemes').headerBackground},
								text: {color: $scope.settings.get('colorThemes').headerText}
							}

						}, function(err) {
							// Error occurred
							console.log(err);
						}, function(percentComplete) {
							console.log(percentComplete);
						});
					};

					$scope.reboot = function(){
						console.log('reboot!');
						$timeout(function() {
							$state.go('login');
						}, 3000);
						settingsService.reboot()
						.then(function(results) {
							// Handle the result
						}, function(err) {
							// Error occurred
							console.log(err);
							$window.location.reload();
						}, function(percentComplete) {
							console.log(percentComplete);
						});
					}

					$scope.powerOff = function(){
						console.log('powerOff!');
						$timeout(function() {
							$state.go('login');
						}, 3000);
						settingsService.powerOff()
						.then(function(results) {
							// Handle the result
						}, function(err) {
							// Error occurred
							console.log(err);
							$window.location.reload();
						}, function(percentComplete) {
							console.log(percentComplete);
						});
					}
				}
    	}
	});
