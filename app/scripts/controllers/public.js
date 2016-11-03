'use strict';
/**
 * @ngdoc function
 * @name sbAdminApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the sbAdminApp
 */
angular.module('sbAdminApp')
  .controller('PublicCtrl', function($scope, socket, dailyLogService, settingsService, $state) {

    var monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
    ];

    var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    $scope.displayedCollection = [{'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'gender':'Male'}, 'time':'7:43 AM'},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'gender':'Male'}, 'time':'7:43 AM'},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'gender':'Male'}, 'time':'7:43 AM'},
      {'attributes':{'firstName':'Vince', 'lastName': 'Elizaga', 'gender':'Male'}, 'time':'7:43 AM'}
    ];

    $scope.detectedEmployee = {
      'firstName' : '',
      'lastName' : '',
      'position' : '',
      'age' : '',
      'avatar' : '"img/logo/logo_placeholder.png";'
    }

    $scope.isFingerPrintDetected = false;
    $scope.isPublicTable = true;


    startTime();

    getSettings();

    $scope.redirectToLogin = function(){
      $state.go('login');
    }

    $scope.extraLogCheck = function(time){
      if(stringContains(time, 'Extra')){
        return 'log-bold';
      }else{
        return '';
      }
    }
    

    function getSettings(){
      settingsService.getSetting()
      .then(function(results) {
        // Handle the result

        if(results[0].get('firstBoot')){
          $state.go('guide');
        }

        else{
          $scope.settings = results[0];
          $scope.primaryPhoto = $scope.settings.get('primaryPhoto');
          $scope.secondaryPhoto = $scope.settings.get('secondaryPhoto');
          $scope.cutoffTime = $scope.settings.get('cutoffTime');
          $scope.coverImage = {
            "background-image": "url(" + $scope.settings.get('coverImage') + ")"
          };
        }

        getAll();


      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
      });
    };

    function getAll(){
      dailyLogService.getDailyLogs(true)
      .then(function(results) {
        // Handle the result
        var morning = [];
        var afternoon = [];

        angular.forEach(results, function(value, key) {
          var tmp = value.get('time');
          tmp = tmp.split(' ');

          var isPm = stringContains(tmp[1], 'PM');

          tmp = tmp[0];

          tmp = tmp.split(':');

          var h = parseInt(tmp[0]);
          var m = parseInt(tmp[1]);

          if(isPm){
            h = h + 12;
          } else {
            if(h === 12){
              h = 0;
            }
          }

          var timeInDecimals = h + m/100;

          if(timeInDecimals >= $scope.cutoffTime){
            afternoon.push(value);
          }
          else{
            morning.push(value);
          }
        });

        $scope.displayedCollectionAM = morning;
        $scope.displayedCollectionPM = afternoon;

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
      });
    };

    function startTime() {
      var today = new Date();
      var day = today.getDay();
      var dateDay = today.getDate();
      var month = today.getMonth();
      var year = today.getFullYear();

      var h = today.getHours();

      var period = 'PM';

      if(h < 12){
        period = 'AM';
      }

      var m = today.getMinutes();
      var s = today.getSeconds();
      h = checkAMPM(h);
      m = checkTime(m);
      s = checkTime(s);



      $scope.time = h + ":" + m + ":" + s + ' ' + period;
      $scope.currentDate = dayNames[day] + ', ' + monthNames[month] + ' ' + dateDay + ', ' + year;
      $scope.$apply();

      var t = setTimeout(startTime, 1000);

    }

    function checkTime(i) {
      if (i < 10) {i = "0" + i};  // add zero in front of numbers < 10
        return i;
    }

    function checkAMPM(h) {
      var tmp;
      if(h > 12){
        h = h - 12;
      }

      if(h === 0){
        h = 12;
      }
      return h;
    }

    function stringContains(data, compare){
      return data.indexOf(compare) > -1;
    }

    socket.on('fromPublicServer', function(data){
      if(typeof data === 'object'){

        $scope.detectedEmployee = {
          'firstName' : data.firstName,
          'lastName' : data.lastName,
          'position' : data.position,
          'avatar' : data.avatarUrl,
          'time' : $scope.time,
          'arrivalAM' : data.departArrive.arrivalAM,
          'departureAM' : data.departArrive.departureAM,
          'arrivalPM' : data.departArrive.arrivalPM,
          'departurePM' : data.departArrive.departurePM
        }
        $scope.isFingerPrintDetected = true;
        getAll();
        setTimeout(function(){
          $scope.isFingerPrintDetected = false;
        },3500);
      }
    });

    $scope.$on("$destroy", function(){
      socket.removeAllListeners("fromPublicServer");
    });
  });
