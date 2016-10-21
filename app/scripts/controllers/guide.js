'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('GuideCtrl', ['$scope', '$timeout', '$http', '$modalStack', 'settingsService', '$state', 'PDFViewerService', function ($scope, $timeout, $http, $modalStack, settingsService, $state, pdf) {
    getSettings();

    $scope.pdfURL = "img/test.pdf";

    $scope.instance = pdf.Instance("viewer");

    $scope.totalPage = '';

    $scope.nextPage = function() {
      $scope.instance.nextPage();
    };

    $scope.prevPage = function() {
      $scope.instance.prevPage();
    };

    $scope.zoomIn = function() {
      $scope.instance.zoomIn();
    };

    $scope.zoomOut = function() {
      $scope.instance.zoomOut();
    };

    $scope.gotoPage = function(page) {
      $scope.instance.gotoPage(page);
    };

    $scope.pageLoaded = function(curPage, totalPages) {
      console.log(curPage);
      $scope.currentPage = curPage;
      $scope.totalPages = totalPages;
    };

    $scope.loadProgress = function(loaded, total, state) {

      // console.log('loaded =', loaded, 'total =', total, 'state =', state);

      $scope.totalPage = total;
    };

    $scope.currentPage = function(num){
      console.log(num);
      if(num === 30){
        $scope.isShowConfirm = true;
      }
    };

    $scope.agree = function(){

      $scope.settings.set("firstBoot", false);

      $scope.settings.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          console.log(result);
          $state.go('public');
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    function getSettings(){
      settingsService.getSetting()
      .then(function(results) {
        // Handle the result
        $scope.settings = results[0];

        $scope.isFirstBoot = $scope.settings.get('firstBoot');
        console.log($scope.isFirstBoot);

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

}]);
