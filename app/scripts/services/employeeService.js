app.service('employeeService', function($q) {

	var getEmployee = function(id) {
		var defer = $q.defer();
		var EmployeeObject = Parse.Object.extend("Employee");
		var query = new Parse.Query(EmployeeObject);
		query.equalTo("objectId", id);
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

	var getEmployees = function(sort, limit){
		var defer = $q.defer();
		var EmployeeObject = Parse.Object.extend("Employee");
		var query = new Parse.Query(EmployeeObject);

		if(sort){
			query.ascending(sort);
		}

		if(limit){
			query.limit(limit);
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

	var getEmployeeByFingerPrintId = function(id) {
		var defer = $q.defer();
		var EmployeeObject = Parse.Object.extend("Employee");
		var query = new Parse.Query(EmployeeObject);
		query.equalTo("fingerPrintId", id);
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

	return {
		getEmployee: getEmployee,
		getEmployees: getEmployees,
		getEmployeeByFingerPrintId : getEmployeeByFingerPrintId
	};

});
