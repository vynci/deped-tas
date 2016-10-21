app.service('periodLogService', function($q) {


	var getPeriodLogsByUser = function(id, min, max) {
		var defer = $q.defer();
		var EmployeeObject = Parse.Object.extend("PeriodLog");
		var query = new Parse.Query(EmployeeObject);

		if(id){
			query.equalTo("employeeId", id);
		}

		if(min && max){
			query.greaterThanOrEqualTo('periodDate', min);
			query.lessThan('periodDate', max);
			query.ascending('periodDate');
		}
		else{
			query.descending('periodDate');
		}

		query.limit(1000);

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
		getPeriodLogsByUser : getPeriodLogsByUser
	};

});
