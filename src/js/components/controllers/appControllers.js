// appControllers.js

'use strict';

angular.module('runsApp.appControllers', [])

.controller('mainCtrl', ['$scope', '$http', 'getMaxValFilter', 'getSumFilter', 'metersToMilesFilter', '$filter', '$sce', 'secondsToHMSFilter' ,'metersToMilesFilter', 'milesPerHourFilter', function($scope, $http, getMaxValFilter, getSumFilter, metersToMilesFilter, $filter, $sce, secondsToHMSFilter ,metersToMilesFilter, milesPerHourFilter) {
	$http.get('data.json').success(function(data) {
		$scope.data = data;

		$scope.distanceSum = getSumFilter(data, 'distance');
		$scope.distanceSum = metersToMilesFilter($scope.distanceSum);

		$scope.runsSum = data.length;

		$scope.elevationGain = getSumFilter(data, 'total_elevation_gain') * 3.28;
		$scope.elevationGain = $filter('number')($scope.elevationGain, 0);
		$scope.elevationGain = $sce.trustAsHtml($scope.elevationGain + '<span>ft</span>');

		$scope.timeSum = getSumFilter(data, 'moving_time');
		$scope.timeSum = secondsToHMSFilter($scope.timeSum);
		$scope.timeSum = $sce.trustAsHtml($scope.timeSum + '<span>hrs</span>');

		$scope.maxDistance = getMaxValFilter(data, 'distance');
		$scope.maxDistance = metersToMilesFilter($scope.maxDistance);
		$scope.maxDistance = $sce.trustAsHtml($scope.maxDistance + '<span>mi</span>');

		$scope.minPace = getMaxValFilter(data, 'average_speed');
		$scope.minPace = milesPerHourFilter($scope.minPace);
		$scope.minPace = $sce.trustAsHtml($scope.minPace + '<span>m/mi</span>');
	});
}]);