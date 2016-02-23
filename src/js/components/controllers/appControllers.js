// appControllers.js

'use strict';

angular.module('runsApp.appControllers', [])

.controller('mainCtrl', ['$scope', '$http', 'getMaxValFilter', 'getSumFilter', function($scope, $http, getMaxValFilter, getSumFilter) {
	$scope.distanceSum = 0;
	$scope.timeSum = 0;
	$scope.runsSum = 0;
	$scope.maxDistance = 0;
	$scope.minPace = 0;
	$scope.elevationGain = 0;

	$http.get('data.json').success(function(data) {
		$scope.data = data;

		$scope.distanceSum = getSumFilter(data, 'distance');
		$scope.timeSum = getSumFilter(data, 'moving_time');
		$scope.runsSum = data.length;
		$scope.maxDistance = getMaxValFilter(data, 'distance');
		$scope.minPace = getMaxValFilter(data, 'average_speed');
		$scope.elevationGain = getSumFilter(data, 'total_elevation_gain') * 3.28;
	});
}]);