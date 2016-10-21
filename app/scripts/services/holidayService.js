app.service('holidayService', function($q) {


	var getHoliday = function(min, max){
		var defer = $q.defer();
		var Holiday = Parse.Object.extend("Holiday");
		var query = new Parse.Query(Holiday);

		if(min && max){
			query.greaterThanOrEqualTo('startTime', min);
			query.lessThan('startTime', max);
		}

		query.ascending('startTime');

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
		getHoliday: getHoliday
	};

});
