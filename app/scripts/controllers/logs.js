'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('LogsCtrl', function($scope,$position, socket, employeeService, dailyLogService, periodLogService, settingsService, $state, holidayService, lodash, $timeout) {

    var currentUser = Parse.User.current();
    if(!currentUser){
      $state.go('login');
    }

    var settingId = currentUser.get('settingId');

    var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    $scope.Math = window.Math;
    $scope.tmpId = false;
    $scope.displayedCollection = [];
    $scope.sortLists = [];
    $scope.totalTime = 0;
    $scope.totalTimeMins = 0;
    $scope.reportMonth = '';
    $scope.regularDays = 0;

    var dateRange = {
      min : '',
      max : ''
    }

    $scope.employeeInfo = {
      'name' : ''
    };

    $scope.calcUnderTimeHours = function(hour){

      var tmp = hour / 60;
      tmp = Math.floor(tmp);

      tmp = 7 - tmp;

      if(tmp < 0){
        tmp = 0;
      }

      if(hour === undefined){
          tmp = '-';
      }

      return tmp;
    }

    $scope.calcUnderTimeMins = function(min){
      var tmp = min % 60;

      if(tmp !== 0){
        tmp = 60 - tmp;
      }

      if(min === undefined){
        tmp = '-';
      }

      return tmp;
    }

    $scope.calcRowTotalHours = function(minutes){
      var sign ='';
      if(minutes < 0){
        sign = '-';
      }

      var hours = Math.floor(Math.abs(minutes) / 60);

      if(minutes === undefined || minutes === null){
        hours = '-'
      }

      if($scope.isShowTotalTime === false){
        if(minutes === undefined || minutes === null){
          hours = '-';
        }else{
          hours = '';
        }
      }

      return hours;
    }

    $scope.calcRowTotalMins = function(minutes){
      var sign = '';
      if(minutes < 0){
        sign = '-';
      }

      var minute = Math.abs(minutes) % 60;

      if(minutes === undefined || minutes === null){
        minute = '-';
      }

      if($scope.isShowTotalTime === false){
        if(minutes === undefined || minutes === null){
          minute = '-';
        }else{
          minute = '';
        }

      }

      return minute;
    }

    $scope.calcTotalTime = function(data){
      var totalTime = 0;

      angular.forEach(data, function(value, key) {
        if(value.attributes.totalTime){
          $scope.totalTime = $scope.totalTime + (parseInt(value.attributes.totalTime) / 60);
          $scope.totalTimeMins = $scope.totalTimeMins + (parseInt(value.attributes.totalTime) % 60);
        }

      });
    }

    function minutesToHours(minutes) {
      var sign ='';
      if(minutes < 0){
        sign = '-';
      }

      var hours = Math.floor(Math.abs(minutes) / 60);
      var minutes = Math.abs(minutes) % 60;

      return {
        hours : parseInt(hours),
        minutes: parseInt(minutes)
      };
    }


    $scope.changeDate = function(data){
      dateRange.min = $scope.dates.minDate.toDate();
      dateRange.max = $scope.dates.maxDate.toDate();

      $scope.reportMonth = monthNames[dateRange.min.getMonth()];

    }

    $scope.dates = {
      today: moment.tz('UTC').hour(12).startOf('h'), //12:00 UTC, today.
      minDate: moment.tz('UTC').add(0, 'd').hour(12).startOf('h'), //12:00 UTC, four days ago.
      maxDate: moment.tz('UTC').add(15, 'd').hour(12).startOf('h'), //12:00 UTC, in four days.
    };
    dateRange.min = $scope.dates.minDate.toDate();
    dateRange.max = $scope.dates.maxDate.toDate();

    $scope.selectedDate = '';

    $scope.changedValue=function(item){
      if(item !== null){
        $scope.tmpId = item.id;
        $scope.employeeInfo.name = item.name;

      }
      else{
        $scope.tmpId = false;
      }

    }

    $scope.changeReportRow = function(data){
      console.log(data);
      if(data.id){
        $scope.editReportRow = data;
        $scope.newReportData = {
          arrivalAM : $scope.editReportRow.get('arrivalAM'),
          arrivalPM : $scope.editReportRow.get('arrivalPM'),
          departureAM : $scope.editReportRow.get('departureAM'),
          departurePM : $scope.editReportRow.get('departurePM'),
          totalTime : minutesToHours(parseInt($scope.editReportRow.get('totalTime')))
        }
      } else{
        $scope.newReportData = {
          arrivalAM : 'N/A',
          arrivalPM : 'N/A',
          departureAM : 'N/A',
          departurePM : 'N/A',
          totalTime : 'N/A'
        }
      }


    }

    $scope.updateReportRow = function(){
      var periodLog = $scope.editReportRow;

      var hours = $scope.newReportData.totalTime.hours * 60;
      var totalTime = hours + $scope.newReportData.totalTime.minutes;

      periodLog.set("arrivalAM", $scope.newReportData.arrivalAM);
      periodLog.set("arrivalPM", $scope.newReportData.arrivalPM);
      periodLog.set("departureAM", $scope.newReportData.departureAM);
      periodLog.set("departurePM", $scope.newReportData.departurePM);
      periodLog.set("totalTime", totalTime.toString());

      periodLog.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          console.log(result);
          getLogByUser($scope.tmpId, dateRange.min, dateRange.max);

        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    //getAllEmployees();
    getLogByUser();
    function getAllEmployees(sort){
      employeeService.getEmployees(sort)
      .then(function(results) {
        // Handle the result
        $scope.sortLists.push({
          id : 'all',
          name : 'All Employees'
        });
        angular.forEach(results, function(value, key) {
          var tmp = {
            id : value.id,
            name : value.attributes.firstName + ' ' +value.attributes.lastName
          };
          $scope.sortLists.push(tmp);
        });

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

    getSettings();

    function getSettings(){
      settingsService.getSetting(settingId)
      .then(function(results) {
        // Handle the result
        $scope.settings = results[0];

        $scope.inCharge = $scope.settings.get('inCharge');
        console.log($scope.inCharge);

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };



    function getLogByUser(id, min, max, isPrintAll){
      periodLogService.getPeriodLogsByUser(id, min, max)
      .then(function(results) {
        // Handle the result
        $scope.displayedCollection = results;

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };

    $scope.convertDate = function(date){
      //
      date = new Date(date);
      date.setMinutes(date.getMinutes() + date.getTimezoneOffset());

      var tmp = date.toString();
      tmp = tmp.split(' ');

      return tmp[0] + ' ' + tmp[1] + ' ' + tmp[2] + ' ' + tmp[3];
    }

  });
