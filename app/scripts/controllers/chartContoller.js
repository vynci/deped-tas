'use strict';
/**
* @ngdoc function
* @name sbAdminApp.controller:MainCtrl
* @description
* # MainCtrl
* Controller of the sbAdminApp
*/
angular.module('sbAdminApp')
.controller('ChartCtrl', ['$scope', '$timeout', '$http', 'employeeService', 'socket', '$modalStack', 'settingsService', '$state', function ($scope, $timeout, $http, employeeService, socket, $modalStack, settingsService, $state) {
  var currentUser = Parse.User.current();
  if(!currentUser){
    $state.go('login');
  }

  var settingId = currentUser.get('settingId');
  var fingerPrintIdPool = [];
  var idToBeDeleted = '';

  $scope.totalUsers = null;
  // $scope.uploadFile = {};
  $scope.isScanFinger = true;
  $scope.defaultProfPic = "img/logo/logo_placeholder.png";
  $scope.scanStatus = 'Scan';

  $scope.sortLists=[{id:0, name:"Id"},{id:1,name:"firstName"},{id:2,name:"lastName"},{id:3,name:"gender"},{id:4,name:"age"}]

  $scope.changedValue=function(item){
    if(item.name === 'Id'){
      getAll('fingerPrintId');
    }
    getAll(item.name);
  }


  var currentEmployee = '';
  function getAll(sort){
    employeeService.getEmployees(sort)
    .then(function(results) {
      // Handle the result
      console.log(results);
      $scope.rowCollection = results;
      $scope.totalUsers = results.length;

      return results;
    }, function(err) {
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  };

  getAll();

  getSettings();

  function getSettings(){
    settingsService.getSetting(settingId)
    .then(function(results) {
      // Handle the result
      console.log(results);
      $scope.settings = results[0];
      console.log($scope.settings);

      $scope.userTable = $scope.settings.get('userTable');
      $scope.userInfo = {}
      fingerPrintIdPool = $scope.settings.get('fingerPrintIdPool');

      console.log(fingerPrintIdPool);

    }, function(err) {
      // Error occurred
      console.log(err);
    }, function(percentComplete) {
      console.log(percentComplete);
    });
  };

  $scope.user = {
    'firstName' : '',
    'lastName' : '',
    'gender' : 'Male',
    'age' : ''
  }

  $scope.modal = {
    title : '',
    mode : '',
    isUpdate : false
  }

  $scope.deleteSelected = function(){
    var delay = 0;
    $scope.isDeleteProgress = true;
    (function myLoop (i) {
      if($scope.rowCollection[i-1].get('isSelected')){
        setTimeout(function () {
          currentEmployee = $scope.rowCollection[i-1];
          $scope.deleteUser();
          if (--i){
            myLoop(i);
          }else{
            $scope.isDeleteProgress = false;
            $scope.isDeleteCompleted = true;
          }
          }, 5000)
        }else{
          if (--i) myLoop(i);
        }

      })($scope.rowCollection.length);

  }

    $scope.selectedUser = function(user, status, isAll){
      console.log(user);
      console.log(status);
      if(!isAll){
        user.set('isSelected', status);
      }else{
        angular.forEach($scope.rowCollection, function(value, key) {
          value.set('isSelected', status);
        });
      }

    };

    $scope.openModal = function () {
      $scope.modal.title = 'Add User';
      $scope.modal.mode = 'Create';
      $scope.modal.isUpdate = false;

      $scope.user.employeeId = '';
      $scope.user.firstName = '';
      $scope.user.lastName = '';
      $scope.user.gender = 'Male';
      $scope.user.age = '';
      $scope.user.position = '';
      $scope.previewImage = '';
      $scope.scanStatus = 'Scan';
      $scope.buttonScanStatus = 'btn-info';
      $scope.deleteConfirmation = false;
    };

    $scope.editModal = function (id) {
      console.log(id);
      $scope.modal.title = 'Edit User';
      $scope.modal.mode = 'Update';
      $scope.modal.isUpdate = true;

      currentEmployee = '';
      $scope.previewImage = '';
      $scope.scanStatus = 'Change Fingerprint';
      $scope.buttonScanStatus = 'btn-info';
      $scope.deleteConfirmation = false;
      $scope.isCurrentFingerDeleted = false;
      employeeService.getEmployee(id)
      .then(function(result) {
        // Handle the result
        console.log(result);
        $scope.user.employeeId = result[0].get('employeeId');
        $scope.user.firstName = result[0].get('firstName');
        $scope.user.lastName = result[0].get('lastName');
        $scope.user.gender = result[0].get('gender');
        $scope.user.age = result[0].get('age');
        $scope.user.position = result[0].get('position');
        $scope.user.fingerPrintId = result[0].get('fingerPrintId');
        $scope.previewImage = result[0].get('avatarUrl');

        currentEmployee = result[0];
      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });

    };

    $scope.updateUser = function(){
      console.log($scope.uploadFile);
      currentEmployee.set("employeeId", $scope.user.employeeId);
      currentEmployee.set("firstName", $scope.user.firstName);
      currentEmployee.set("lastName", $scope.user.lastName);
      currentEmployee.set("gender", $scope.user.gender);
      currentEmployee.set("age", $scope.user.age);
      currentEmployee.set("position", $scope.user.position);

      if($scope.isCurrentFingerDeleted){
        var fingerPrintId = fingerPrintIdPool[0];
        removeA(fingerPrintIdPool, fingerPrintId);
        currentEmployee.set("fingerPrintId", fingerPrintId.toString());
      }

      if($scope.uploadFile){
        $http.post("http://172.24.1.1:1337/parse/files/image.jpg", $scope.uploadFile, {
          withCredentials: false,
          headers: {
            'X-Parse-Application-Id': 'myAppId',
            'X-Parse-REST-API-Key': 'myRestAPIKey',
            'Content-Type': 'image/jpeg'
          },
          transformRequest: angular.identity
        }).then(function(data) {

          currentEmployee.set("avatarUrl", data.data.url);

          currentEmployee.save(null, {
            success: function(result) {
              // Execute any logic that should take place after the object is saved.
              getAll();

              var Settings = Parse.Object.extend("Settings");
              var settings = new Settings();

              settings.id = settingId;

              settings.set("fingerPrintIdPool", fingerPrintIdPool);

              settings.save(null, {
                success: function(result) {
                  // Execute any logic that should take place after the object is saved.
                  $scope.userTableResult = [];
                  console.log(result);
                  getSettings();
                },
                error: function(gameScore, error) {
                  // Execute any logic that should take place if the save fails.
                  // error is a Parse.Error with an error code and message.
                }
              });
            },
            error: function(gameScore, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
            }
          });
        },function(err){
          alert('Picture should not exceed 2mb, Please Try again.');
        });

      } else{
        currentEmployee.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            getAll();

            var Settings = Parse.Object.extend("Settings");
            var settings = new Settings();

            settings.id = settingId;

            settings.set("fingerPrintIdPool", fingerPrintIdPool);

            settings.save(null, {
              success: function(result) {
                // Execute any logic that should take place after the object is saved.
                $scope.userTableResult = [];
                console.log(result);
                getSettings();
              },
              error: function(gameScore, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
              }
            });
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      }


    }

    $scope.manualDeleteUserFromSensor = function(){
      console.log($scope.detectedFingerPrintId);

      employeeService.getEmployeeByFingerPrintId($scope.detectedFingerPrintId)
      .then(function(result) {
        // Handle the result

        var detectedEmployee = result[0];

        var Settings = Parse.Object.extend("Settings");
        var settings = new Settings();

        settings.id = settingId;

        fingerPrintIdPool.push(parseInt($scope.detectedFingerPrintId));

        settings.set("fingerPrintIdPool", fingerPrintIdPool);

        console.log(fingerPrintIdPool);

        settings.save(null, {
          success: function(result) {
            getSettings();
            idToBeDeleted = parseInt($scope.detectedFingerPrintId);
            socket.emit('toPublicServer', 'm:delete');

          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });

        if(result.length){
          var detectedEmployee = result[0];
          detectedEmployee.set("fingerPrintId", "");

          detectedEmployee.save(null, {
            success: function(result) {

            },
            error: function(gameScore, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
            }
          });
        }

      }, function(err) {
        // Error occurred
        console.log(err);
      }, function(percentComplete) {
        console.log(percentComplete);
      });


    }

    $scope.deleteUser = function(){

      console.log(parseInt(currentEmployee.get('fingerPrintId')));
      idToBeDeleted = parseInt(currentEmployee.get('fingerPrintId'));

      currentEmployee.destroy({
        success: function(myObject) {
          $scope.modal.title = 'This User no longer exists.';
          $scope.modal.mode = 'Create';
          $scope.modal.isUpdate = false;

          $scope.user.employeeId = '';
          $scope.user.firstName = '';
          $scope.user.lastName = '';
          $scope.user.gender = 'Male';
          $scope.user.age = '';
          $scope.user.position = '';
          $scope.previewImage = '';
          $scope.scanStatus = 'Scan';
          $scope.buttonScanStatus = 'btn-info';

          $modalStack.dismissAll();
          getAll();

          var Settings = Parse.Object.extend("Settings");
          var settings = new Settings();

          settings.id = settingId;

          fingerPrintIdPool.push(parseInt(currentEmployee.get('fingerPrintId')));

          settings.set("fingerPrintIdPool", fingerPrintIdPool);

          settings.save(null, {
            success: function(result) {
              // Execute any logic that should take place after the object is saved.
              $scope.userTableResult = [];
              console.log(result);
              getSettings();
              socket.emit('toPublicServer', 'm:delete');

              var DailyLogObject = Parse.Object.extend("DailyLog");
              var query = new Parse.Query(DailyLogObject);

              query.equalTo("employeeId", currentEmployee.id);
              query.find().then(function (users) {
                users.forEach(function(user) {
                  user.destroy({
                    success: function() {
                      // SUCCESS CODE HERE, IF YOU WANT
                      console.log('daily log deleted');
                    },
                    error: function() {
                      // ERROR CODE HERE, IF YOU WANT
                      console.log('daily log error delete');
                    }
                  });
                });
              }, function (error) {
                response.error(error);
              });

              var PeriodLogObject = Parse.Object.extend("PeriodLog");
              var queryPeriod = new Parse.Query(PeriodLogObject);

              queryPeriod.equalTo("employeeId", currentEmployee.id);
              queryPeriod.find().then(function (users) {
                users.forEach(function(user) {
                  user.destroy({
                    success: function() {
                      // SUCCESS CODE HERE, IF YOU WANT
                      console.log('period log deleted');
                    },
                    error: function() {
                      // ERROR CODE HERE, IF YOU WANT
                      console.log('period log error delete');
                    }
                  });
                });
              }, function (error) {
                response.error(error);
              });

            },
            error: function(gameScore, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
            }
          });
        },
        error: function(myObject, error) {
          // The delete failed.
          // error is a Parse.Error with an error code and message.
        }
      });
    }

    $scope.confirmDelete = function(){
      $scope.deleteConfirmation = true;
    }

    $scope.cancelDelete = function(){
      $scope.deleteConfirmation = false;
    }

    $scope.convertToMB = function(size){
      var value = size/1000000;

      if(value){
        return value.toFixed(2);
      }else{
        return 0;
      }
    }

    $scope.checkFileSize = function(size){
      if(size > 2000000){
        return 'log-bold';
      } else{
        return '';
      }
    }

    $scope.addUser = function(){
      console.log($scope.uploadFile);
      if($scope.uploadFile){
        $http.post("http://172.24.1.1:1337/parse/files/image.jpg", $scope.uploadFile, {
          withCredentials: false,
          headers: {
            'X-Parse-Application-Id': 'myAppId',
            'X-Parse-REST-API-Key': 'myRestAPIKey',
            'Content-Type': 'image/jpeg'
          },
          transformRequest: angular.identity
        }).then(function(data) {
          console.log(data.data.url);
          var Employee = Parse.Object.extend("Employee");
          var employee = new Employee();
          var fingerPrintId = fingerPrintIdPool[0];

          removeA(fingerPrintIdPool, fingerPrintId);

          employee.set("employeeId", $scope.user.employeeId);
          employee.set("firstName", $scope.user.firstName);
          employee.set("lastName", $scope.user.lastName);
          employee.set("gender", $scope.user.gender);
          employee.set("age", $scope.user.age);
          employee.set("position", $scope.user.position);
          employee.set("avatarUrl", data.data.url);
          employee.set("fingerPrintId", fingerPrintId.toString());
          employee.set("currentPeriodLog", {"id":null,"date":null,"sequence":0,"totalTime":0});

          employee.save(null, {
            success: function(result) {
              // Execute any logic that should take place after the object is saved.
              getAll();

              var Settings = Parse.Object.extend("Settings");
              var settings = new Settings();

              settings.id = settingId;

              settings.set("fingerPrintIdPool", fingerPrintIdPool);

              settings.save(null, {
                success: function(result) {
                  // Execute any logic that should take place after the object is saved.
                  $scope.userTableResult = [];
                  console.log(result);
                  getSettings();
                },
                error: function(gameScore, error) {
                  // Execute any logic that should take place if the save fails.
                  // error is a Parse.Error with an error code and message.
                }
              });
            },
            error: function(gameScore, error) {
              // Execute any logic that should take place if the save fails.
              // error is a Parse.Error with an error code and message.
            }
          });
        },function(err){
          alert('Picture should not exceed 2mb, Please Try again.');
        });

      }

      else {
        var Employee = Parse.Object.extend("Employee");
        var employee = new Employee();
        var fingerPrintId = $scope.totalUsers + 1

        var fingerPrintId = fingerPrintIdPool[0];

        removeA(fingerPrintIdPool, fingerPrintId);

        employee.set("employeeId", $scope.user.employeeId);
        employee.set("firstName", $scope.user.firstName);
        employee.set("lastName", $scope.user.lastName);
        employee.set("gender", $scope.user.gender);
        employee.set("age", $scope.user.age);
        employee.set("position", $scope.user.position);
        employee.set("avatarUrl", $scope.defaultProfPic);
        employee.set("fingerPrintId", fingerPrintId.toString());
        employee.set("currentPeriodLog", {"id":null,"date":null,"sequence":0,"totalTime":0});

        employee.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            getAll();

            var Settings = Parse.Object.extend("Settings");
            var settings = new Settings();

            settings.id = settingId;

            settings.set("fingerPrintIdPool", fingerPrintIdPool);

            settings.save(null, {
              success: function(result) {
                // Execute any logic that should take place after the object is saved.
                $scope.userTableResult = [];
                console.log(result);
                getSettings();
              },
              error: function(gameScore, error) {
                // Execute any logic that should take place if the save fails.
                // error is a Parse.Error with an error code and message.
              }
            });
          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      }

    };

    $scope.scanFinger = function(){
      console.log('Scan Finger');
      socket.emit('toPublicServer', 'm:enroll');
      $scope.isScanFinger = false;
    }

    $scope.updateFingerPrintInit = function(){
      console.log('Delete Old FingerPrint');
      $scope.isCurrentFingerDeleted = false;
      idToBeDeleted = $scope.user.fingerPrintId;
      console.log(idToBeDeleted);

      if(idToBeDeleted){
        console.log('not empty');
        var Settings = Parse.Object.extend("Settings");
        var settings = new Settings();

        settings.id = settingId;

        fingerPrintIdPool.push(parseInt(idToBeDeleted));

        settings.set("fingerPrintIdPool", fingerPrintIdPool);

        settings.save(null, {
          success: function(result) {
            // Execute any logic that should take place after the object is saved.
            $scope.userTableResult = [];
            getSettings();
            socket.emit('toPublicServer', 'm:delete');

          },
          error: function(gameScore, error) {
            // Execute any logic that should take place if the save fails.
            // error is a Parse.Error with an error code and message.
          }
        });
      } else {
        $scope.isCurrentFingerDeleted = true;
        $scope.scanStatus = 'Click to Continue';
        $scope.buttonScanStatus = 'btn-success';
      }
    }

    $scope.updateFingerPrintGo = function(){
      console.log('Update Scan Finger');
      socket.emit('toPublicServer', 'm:enroll');
    }

    socket.on('fromPublicServer', function(data){
      console.log(data);

      var tmp = fingerPrintIdPool[0];
      if(stringContains(data, 'm:enroll')){
        console.log(tmp);
        socket.emit('toPublicServer', tmp.toString());
      }

      if(stringContains(data, 'm:delete')){
        console.log(tmp);
        socket.emit('toPublicServer', idToBeDeleted.toString());
      }

      if(stringContains(data, 'Deleted!')){
        $scope.isCurrentFingerDeleted = true;
        socket.emit('toPublicServer', idToBeDeleted.toString());
        $scope.scanStatus = 'Click to Continue';
        $scope.buttonScanStatus = 'btn-success';
      }

      if(stringContains(data, 'command:place.finger.1')){
        $scope.scanStatus = 'Please Place Finger';
        $scope.buttonScanStatus = 'btn-warning';
      }

      if(stringContains(data, 'command:remove.finger')){
        $scope.scanStatus = 'Please Remove Finger';
      }

      if(stringContains(data, 'command:place.finger.2')){
        $scope.scanStatus = 'Place Same Finger Again';
      }

      if(stringContains(data, 'Ok.status:prints.matched.success')){
        $scope.scanStatus = 'Prints Matched';
      }

      if(stringContains(data, 'Ok.status:print')){
        console.log('print stored');
        $scope.buttonScanStatus = 'btn-success';
        $scope.scanStatus = 'Print Successfully Stored!';
      }

      if(stringContains(data, 'status.prints.matched.failed')){
        $scope.buttonScanStatus = 'btn-danger';
        $scope.scanStatus = 'Prints Not Matched.';
        alert('Prints Not Matched. Please Try Again.');
        socket.emit('toPublicServer', tmp.toString());
      }

      if(stringContains(data, 'found:')){
        console.log(tmp);
        var tmpData = data;
        tmpData = tmpData.split(":");
        $scope.isDetectedFingerPrint = true;
        $scope.detectedFingerPrintId = tmpData[1].toString();
      }


    });

    $scope.closeModal = function(){
      console.log('Close Modal');
      socket.emit('toPublicServer', 'x');
    }

    $scope.$on("$destroy", function(){
      socket.removeAllListeners("fromPublicServer");
    });

    function stringContains(data, compare){
      return data.indexOf(compare) > -1;
    }

    function removeA(arr) {
      var what, a = arguments, L = a.length, ax;
      while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
          arr.splice(ax, 1);
        }
      }
      return arr;
    }

  }]);
