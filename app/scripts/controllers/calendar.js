'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('CalendarCtrl', function($scope, $http, $state, holidayService) {
    var currentUser = Parse.User.current();
    if(!currentUser){
      $state.go('login');
    }

    $scope.eventSource = [];

    getAll();

    function getAll(){
      holidayService.getHoliday()
      .then(function(results) {
        // Handle the result
        console.log(results);


        $scope.eventSource = fetchFromServer(results);

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };


    $scope.rangeChanged = function (startTime, endTime) {
      console.log('reload resource!');
    };

    $scope.changeMode = function (mode) {
      $scope.mode = mode;
    };

    $scope.today = function () {
      $scope.currentDate = new Date();
    };

    $scope.isToday = function () {
      var today = new Date(),
      currentCalendarDate = new Date($scope.currentDate);

      today.setHours(0, 0, 0, 0);
      currentCalendarDate.setHours(0, 0, 0, 0);
      return today.getTime() === currentCalendarDate.getTime();
    };


    $scope.onEventSelected = function (event) {
      $scope.event = event;
      console.log(event);
    };

    $scope.onTimeSelected = function (selectedTime) {
      console.log('Selected time: ' + selectedTime);
      $scope.selectedDate = selectedTime;
    };

    $scope.addNewHoliday = function(){
      $scope.eventSource = createRandom2();
    }

    $scope.formatDate = function(dateString){
      var tmp = new Date(dateString);
      return tmp.toString();
    }

    $scope.deleteHoliday = function(holiday){
      console.log(holiday);
      $scope.deleteHolidayId = holiday.id;
    }

    $scope.confirmDeleteHoliday = function(){

      var Holiday = Parse.Object.extend("Holiday");
      var query = new Holiday();

      query.id = $scope.deleteHolidayId

      query.destroy({
        success: function(myObject) {
          getAll();
        },
        error: function(myObject, error) {
          // The delete failed.
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    function fetchFromServer(data){
      var events = [];

      angular.forEach(data, function(value, key) {

        var date = value.get('startTime');

        var startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
        var endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));

        var tmp = {
          id : value.id,
          title : value.get('name'),
          startTime: startTime,
          endTime: endTime,
          allDay: true
        }
        events.push(tmp);
      });

      return events;
    }

    function createRandom2() {
      var tmp = $scope.selectedDate;
      // tmp = tmp.split(' ');

      var date = new Date($scope.selectedDate);

      var startTime;
      var endTime;

      startTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));


      endTime = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1));
      var holiday = {
        title: $scope.newHolidayTitle,
        startTime: startTime,
        endTime: endTime,
        allDay: true
      };


      var events = [];

      angular.forEach($scope.eventSource, function(value, key) {
        events.push(value);
      });

      events.push(holiday);

      var Holiday = Parse.Object.extend("Holiday");
      var holiday = new Holiday();

      holiday.set("name", $scope.newHolidayTitle);
      holiday.set("startTime", startTime);
      holiday.set("endTime", endTime);
      holiday.set("allDay", true);

      holiday.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          getAll();
        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });


    }

    $scope.$on('eventSourceChanged', function(){
      console.log('eventSourceChanged');
    });
});
