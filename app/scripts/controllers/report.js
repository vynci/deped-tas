'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('ReportCtrl', function($scope,$position, socket, employeeService, dailyLogService, periodLogService, settingsService, $state, holidayService, lodash, $timeout) {

    var currentUser = Parse.User.current();
    if(!currentUser){
      $state.go('login');
    }

    var settingId = currentUser.get('settingId');

    var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    $scope.mothSelectNames = monthNames;

    $scope.selectedDate = {
      year : 2016
    };

    $scope.Math = window.Math;
    $scope.tmpId = false;
    $scope.displayedCollection = [];
    $scope.sortLists = [];
    $scope.totalTime = 0;
    $scope.totalTimeMins = 0;
    $scope.reportMonth = '';
    $scope.regularDays = 0;

    $scope.batchReportList = [];

    var dateRange = {
      min : '',
      max : ''
    }

    $scope.employeeInfo = {
      'name' : ''
    };

    $scope.calcUnderTimeHours = function(hour){

      var tmp = hour / 60;
      var remainder = hour % 60;


      tmp = Math.floor(tmp);

      if(remainder === 0){
        tmp = 8 - tmp;
      } else {
        tmp = 7 - tmp;
      }

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

    $scope.calcTotalTime = function(data){
      var totalTime = 0;

      angular.forEach(data, function(value, key) {
        if(value.attributes.totalTime){
          $scope.totalTime = $scope.totalTime + (parseInt(value.attributes.totalTime) / 60);
          $scope.totalTimeMins = $scope.totalTimeMins + (parseInt(value.attributes.totalTime) % 60);
        }

      });
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

    function generateReportTemplate(employeeId, date, employeeName){
      var arr = [];
      for(var i=0; i<31; i++ ){
        var blankEntry = {
          attributes : {
            date : {
              day : i + 1,
              month : monthNames[date.getMonth()],
              year : date.getFullYear()
            },
            employeeName : employeeName,
            employeeId : employeeId,
            arrivalAM : '-',
            arrivalPM : '-',
            departureAM : '-',
            departurePM : '-'
          }
        };
        arr.push(blankEntry);
      }

      return arr;
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

    $scope.parseTotalInPrint = function(data){
      var tmp = Math.floor(data.hours) + ' hrs ' + data.mins + ' mins';

      if(!$scope.isShowTotalTime){
        tmp = '';
      }

      return tmp;

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

    $scope.changedValue=function(item){
      console.log(item);
      if(item !== null){
        $scope.tmpId = item.id;
        $scope.employeeInfo.name = item.name;
        $scope.employeeInfo.employeeId = item.employeeId;
      }
      else{
        $scope.tmpId = false;
      }

    }

    $scope.changeDateEvent = function(data){
      console.log(data);
    }

    $scope.changeReportRow = function(data){
      console.log(data.id);
      console.log(data.attributes);

      $scope.secondaryPasswordResponse = '';
      $scope.secondaryPasswordResponseClass = '';
      $scope.secondaryPasswordCredential = '************';

      if($scope.isSecondaryPassword){
        $scope.disableEdit = true;
      }else{
        $scope.disableEdit = false;
      }

      $scope.deleteConfirmation = false;
      $scope.showDeleteButton = true;
      $scope.currentPeriodLog = {
        id : data.id,
        employeeId : data.attributes.employeeId
      };
      if(data.id){
        $scope.editReportRow = data;
        $scope.newReportData = {
          isValid : true,
          arrivalAM : $scope.editReportRow.get('arrivalAM'),
          arrivalPM : $scope.editReportRow.get('arrivalPM'),
          departureAM : $scope.editReportRow.get('departureAM'),
          departurePM : $scope.editReportRow.get('departurePM'),
          totalTime : minutesToHours(parseInt($scope.editReportRow.get('totalTime')) || 0),
          extraLogPool : $scope.editReportRow.get('extraLogPool')
        }

      } else{
        $scope.showDeleteButton = false;
        var createdAt = new Date(data.attributes.date.month + ' ' + data.attributes.date.day + ' ' + data.attributes.date.year);
        var PeriodLog = Parse.Object.extend("PeriodLog");
        var periodLog = new PeriodLog();
        periodLog.set('periodDate', createdAt);
        periodLog.set('employeeId', data.attributes.employeeId);
        periodLog.set('name', data.attributes.employeeName);
        $scope.editReportRow = periodLog;

        $scope.newReportData = {
          isValid : true,
          arrivalAM : '',
          arrivalPM : '',
          departureAM : '',
          departurePM : '',
          totalTime : minutesToHours(0)
        }
      }


    }

    $scope.updateReportRow = function(){
      var periodLog = $scope.editReportRow;
      console.log(periodLog.attributes);

      var hours = $scope.newReportData.totalTime.hours * 60;
      var totalTime = hours + $scope.newReportData.totalTime.minutes;

      periodLog.set("arrivalAM", $scope.newReportData.arrivalAM);
      periodLog.set("arrivalPM", $scope.newReportData.arrivalPM);
      periodLog.set("departureAM", $scope.newReportData.departureAM);
      periodLog.set("departurePM", $scope.newReportData.departurePM);
      periodLog.set("extraLogPool", $scope.newReportData.extraLogPool);
      periodLog.set("totalTime", totalTime.toString());

      periodLog.save(null, {
        success: function(result) {
          // Execute any logic that should take place after the object is saved.
          console.log(result);
          $scope.generateLogs();

        },
        error: function(gameScore, error) {
          // Execute any logic that should take place if the save fails.
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.removeExtraLogs = function(index, data){
      console.log(index);
      console.log($scope.newReportData.extraLogPool);
      $scope.newReportData.extraLogPool.splice(index, 1);
    }

    $scope.authorizeSecondaryPassword = function(){
      if($scope.secondaryPasswordCredential === $scope.secondaryPassword){
        $scope.disableEdit = false;
        $scope.secondaryPasswordResponse = 'Secondary Password Authentication Successful.';
        $scope.secondaryPasswordResponseClass = 'alert-success';
      } else {
        $scope.disableEdit = true;
        $scope.secondaryPasswordResponseClass = 'alert-danger';
        $scope.secondaryPasswordResponse = 'Secondary Password Authentication Failed, Invalid Password.'
      }
    }

    getAllEmployees();

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
            name : value.attributes.firstName + ' ' +value.attributes.lastName,
            employeeId: value.attributes.employeeId
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
        $scope.isShowTotalTime = $scope.settings.get('isShowTotalTime');

        $scope.disableEdit = false;
        $scope.secondaryPassword = $scope.settings.get('secondaryPassword');

        $scope.isSecondaryPassword = $scope.settings.get('isSecondaryPassword');

        if($scope.isSecondaryPassword){
          $scope.disableEdit = true;
        }

        console.log($scope.inCharge);

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });
    };



    function getLogByUser(id, min, max, isPrintAll, employeeName, employeeId){
      periodLogService.getPeriodLogsByUser(id, min, max)
      .then(function(results) {
        // Handle the result
        var data = results;
        var regularDays = generateReportTemplate(id, min, employeeName);

        angular.forEach(data, function(value, key) {
          value.sortDate = value.get('periodDate');

          if(value.get('arrivalAM') && value.get('arrivalPM') && value.get('departureAM') && value.get('departurePM') ){
          } else {
            //alert('There is an erroneous log.');
          }

          var tmpDay = value.get('periodDate');
          tmpDay = tmpDay.getDate();

          regularDays[tmpDay - 1] = value;
        });


        holidayService.getHoliday(min, max)
        .then(function(results) {
          $scope.totalTime = 0;
          $scope.totalTimeMins = 0;

          $scope.regularDays = data.length

          angular.forEach(results, function(value, key) {
            value.set('arrivalAM', 'holiday');
            value.set('arrivalPM', 'holiday');
            value.set('departureAM', 'holiday');
            value.set('departurePM', 'holiday');
            value.set('totalTime', '480');

            value.sortDate = value.get('startTime');

            var tmpDay = value.get('startTime');
            tmpDay = tmpDay.getDate();

            regularDays[tmpDay - 1] = value;
          });

          var totalTimeHours = 0;
          var totalTimeMins = 0;
          var tmpTotalTime = 0;

          angular.forEach(regularDays, function(value, key) {
            if(value.attributes.totalTime){
              tmpTotalTime = tmpTotalTime + parseInt(value.attributes.totalTime);
            }
          });

          totalTimeHours = minutesToHours(tmpTotalTime).hours;
          totalTimeMins = minutesToHours(tmpTotalTime).minutes;
          console.log();

          $scope.batchReportList.push({
            employeeId : employeeId,
            name : employeeName,
            dataLogs : regularDays,
            totalTime : {
              hours : totalTimeHours,
              mins : totalTimeMins
            }
          });

        }, function(err) {
          // Error occurred
          console.log(err);
        }, function(percentComplete) {

        });

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {

      });
    };

    $scope.generateLogs = function(){
      var tmp = lodash.indexOf($scope.mothSelectNames, $scope.selectedDate.month);

      var min = new Date($scope.selectedDate.month + " 1 " + $scope.selectedDate.year);
      var max = new Date($scope.mothSelectNames[tmp + 1] + " 1 " + $scope.selectedDate.year);
      console.log($scope.selectedDate.month);
      console.log(min);
      console.log(max);

      $scope.batchReportList = [];

      if($scope.tmpId === 'all'){
        angular.forEach($scope.sortLists, function(value, key) {
          if(value.id !== 'all'){
            getLogByUser(value.id, min, max, true, value.name, value.employeeId);
          }

        });

      } else {
        getLogByUser($scope.tmpId, min, max, false, $scope.employeeInfo.name, $scope.employeeInfo.employeeId);
      }
    }

    $scope.confirmDelete = function(){
      $scope.deleteConfirmation = true;
    }

    $scope.cancelDelete = function(){
      $scope.deleteConfirmation = false;
    }

    $scope.deletePeriodLog = function(){
      var PeriodLog = Parse.Object.extend("PeriodLog");
      var periodLog = new PeriodLog();

      periodLog.id = $scope.currentPeriodLog.id;

      periodLog.destroy({
        success: function(myObject) {
          employeeService.getEmployee($scope.currentPeriodLog.employeeId)
          .then(function(result) {
            // Handle the result
            result[0].set("currentPeriodLog", {
              id: null,
              date: null,
              sequence: 0,
              totalTime : 0
            });

            result[0].save(null, {
              success: function(gameScore) {
                $scope.generateLogs();

              },
              error: function(gameScore, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
                alert('error deleting log');
              }
            });
          }, function(err) {
            // Error occurred
            alert('error deleting log');
          }, function(percentComplete) {
            console.log(percentComplete);
          });

        },
        error: function(myObject, error) {
          // The delete failed.
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.printDiv = function(divName) {

      var printContents = document.getElementById(divName).innerHTML;
      var popupWin = window.open('', '_blank', 'width=1024,height=768');
      var test = '<div class="container"><div class="row"><div class="col-xs-6" style="padding-left:0px; padding-right:40px;">'+ printContents +'</div><div class="col-xs-6" style="padding-left:40px; padding-right:0px;">' + printContents + '</div></div></div>';
      popupWin.document.open();
      popupWin.document.write('<html><head><link href="bower_components/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet"><link rel="stylesheet" href="styles/main.css"><link rel="stylesheet" href="styles/sb-admin-2.css"></head><body onload="window.print()">'+ test +'</body></html>');

      popupWin.document.close();
    };
  });
