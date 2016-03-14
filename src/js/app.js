'use strict';

// Defining Angular app model with all other dependent modules
var runsApp = angular.module('runsApp',[ 'runsApp.appDirectives', 'runsApp.appControllers', 'runsApp.appFilters']);

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