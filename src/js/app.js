'use strict';

// Defining Angular app model with all other dependent modules
var runsApp = angular.module('runsApp',[]);

// runsApp.config(function($routeProvider, $locationProvider, $httpProvider) {
	
// 	// Declaration of the default route if neither of the controllers
// 	// is supporting the request path
// 	$routeProvider.otherwise({ redirectTo: '/'});

// 	// Settings for http communications
// 	$httpProvider.defaults.useXDomain = true;
// 	delete $httpProvider.defaults.headers.common['X-Requested-With'];

// 	// disabling # in Angular urls
// 	// $locationProvider.html5Mode({
// 	// 		enabled: true,
// 	//      requireBase: false
// 	// });
// })
// .run(['$rootScope', function ($rootScope) {
	
// }]);

runsApp.controller('mainCtrl', ['$scope', '$http',
	function($scope, $http) {
		$http.get('data.json').success(function(data) {
			$scope.data = data;
		});
}]);

runsApp.filter('metersToMiles', function() {
	return function(input) {
		return Math.round(input * 0.000621371 * 100) / 100;
	};
});

runsApp.filter('secondsToHMS', function() {
	return function(input) {
		var totSeconds = input,
			hours = parseInt(totSeconds/3600) % 24,
			minutes = parseInt(totSeconds/60) % 60,
			seconds = totSeconds % 60;

		var formattedTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ":" + (seconds  < 10 ? '0' + seconds : seconds);

		return formattedTime;
	};
});

runsApp.filter('formatDate', function() {
	return function(input) {
		var date = new Date(input),
			day = date.getDate(),
			month = date.getMonth() + 1,
			year = date.getFullYear();

		return month + '/' + day + '/' + year;
	};
});

runsApp.filter('milesPerHour', function() {
	return function(input) {
		var totSeconds = parseInt(60 * 60 / (input * 2.237)),
			minutes = parseInt(totSeconds/60) % 60,
			seconds = totSeconds % 60;

		return minutes + ':' + (seconds  < 10 ? '0' + seconds : seconds);
	};
})

;