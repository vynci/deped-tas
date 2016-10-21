'use strict';

/**
 * @ngdoc directive
 * @name izzyposWebApp.directive:adminPosHeader
 * @description
 * # adminPosHeader
 */
angular.module('sbAdminApp')
	.directive('header',function(){
		return {
        templateUrl:'scripts/directives/header/header.html',
        restrict: 'E',
        replace: true,
				controller : function($scope, settingsService){
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
				}
    	}
	});
