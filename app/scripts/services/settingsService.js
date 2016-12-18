app.service('settingsService', function($q, $http, $timeout, $window) {


	var getSetting = function(id){
		var defer = $q.defer();
		var Settings = Parse.Object.extend("Settings");
		var query = new Parse.Query(Settings);

		if(id){
			query.equalTo("objectId", id);
		}

		query.find({
			success: function(results) {
				console.log(results);
				defer.resolve(results);
			},
			error: function(error) {
				defer.reject(error);
				alert("Error: " + error.code + " " + error.message);
			}
		});
		return defer.promise;
	};

	var reboot = function(userId) {
		console.log('rebooting');
		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/device/reboot")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Reboot");
		});

		$timeout(function() {
			$window.location.reload();
		}, 3500);

		return def.promise;
	}

	var powerOff = function(userId) {
		console.log('powering off');
		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/device/power-off")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Power Off");
		});

		$timeout(function() {
			$window.location.reload();
		}, 3500);

		return def.promise;
	}

	var adminPasswordReset = function(userId) {
		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/admin/reset-password")
		.success(function(data) {
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to reset password");
		});
		return def.promise;
	}

	var updateWifiCredentials = function(data){

		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/wifi-settings/" + data.oldSSID + "/" + data.newSSID + "/" + data.oldPassword + "/" + data.newPassword)
		.success(function(data) {
			console.log(data);
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Reboot");
		});
		return def.promise;
	}

	var updateSystemTime = function(data){

		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/system-time/" + data)
		.success(function(data) {
			console.log(data);
			def.resolve(data);
		})
		.error(function() {
			def.reject("Failed to Set Time");
		});
		return def.promise;
	}

	var backup = function(process){

		var def = $q.defer();

		$http.get("http://172.24.1.1:1337/backup/" + process)
		.success(function(data) {
			console.log(data);
			def.resolve(data);
		})
		.error(function() {
			def.reject("backup process failed");
		});
		return def.promise;
	}

	return {
		getSetting: getSetting,
		reboot : reboot,
		updateWifiCredentials : updateWifiCredentials,
		updateSystemTime : updateSystemTime,
		backup : backup,
		adminPasswordReset : adminPasswordReset,
		powerOff : powerOff
	};

});
