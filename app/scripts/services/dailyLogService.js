app.service('dailyLogService', function($q) {


	var getDailyLogs = function(today, limit){
		var defer = $q.defer();
		var DailyLogObject = Parse.Object.extend("DailyLog");
		var query = new Parse.Query(DailyLogObject);

		query.descending('createdAt');

		if(today){
			var d = new Date();
			d.setHours(0);
			d.setMinutes(0);
			d.setSeconds(0);

			query.greaterThanOrEqualTo( "createdAt", d );
		}

		if(limit){
			query.limit(limit);
		}

		query.find({
			success: function(results) {
				defer.resolve(results);
			},
			error: function(error) {
				defer.reject(error);
				alert("Error: " + error.code + " " + error.message);
			}
		});
		return defer.promise;
	};


	return {
		getDailyLogs: getDailyLogs
	};

});
