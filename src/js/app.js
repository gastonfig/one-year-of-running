// 'use strict';

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

runsApp.controller('mainCtrl', ['$scope', '$http', function($scope, $http) {
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
});

// RADAR CHART
runsApp.directive('linearChart', function($window) {
   return {
      restrict:'EA',
      template:"<svg></svg>",
       link: function(scope, elem, attrs) {
	       	scope.$watch('data', function(newData, oldData) {
	       		if(newData) {
	       			var steps = [4828.03, 9656.06, 14484.1, 19312.1]; // [3, 6, 9, 12] Distance in meters
	            var data = scope[attrs.chartData],
									d3 = $window.d3,
									rawSvg=elem.find('svg'),
									vis = d3.select(rawSvg[0]),
									w = 600,
									h = 600,
									margin = 10,
									TWO_PI = 2 * Math.PI,
							    angle = TWO_PI / (data.length - 1),
							    radius = 1,
									maxDistance = d3.max(data, function(d, i) { return +d.distance;}),
									x = d3.scale.linear().domain([0, maxDistance]).range([0 + margin, (w) - margin]),
									y = d3.scale.linear().domain([0, maxDistance]).range([0 + margin, (h) - margin]);


					    vis
					        // .attr("width", w)
					        // .attr("height", h)
					        .attr('width', '100%')
					        .attr('height', '100%')
					        .attr('viewBox','0 0 '+ w +' '+ h)
					        .attr('preserveAspectRatio','xMinYMin')

					    var g = vis.append('svg:g')
					        .attr("transform", "translate(" + w/2 +", " + h/2 + ")");

					    var line = d3.svg.line()
					        .interpolate("cardinal")
					        .x(function(d,i) { 
					            return radius * x(d.distance) * Math.sin(angle * i) / 2;
					        })
					        .y(function(d, i) {
					            return radius * y(d.distance) * Math.cos(angle * i) /2 * -1;
					        });

						    g.append("svg:path")
						     .attr("d", line(data))
						     .attr('stroke', '#7545E6');

						// Circles
						var circles = vis.append('svg:g').selectAll('.circle')
						    .data(data)
						  .enter().append('svg:circle')
						    .attr("class", "circle")
						    .attr("transform", "translate(" + w/2 +", " + h/2 + ")")
						    .attr('r', 4)
						    .attr('cx', function(d, i) {
						                  return radius * x(d.distance) * Math.sin(angle * i) / 2;
						                })
						    .attr('cy', function(d, i) {
						                  return radius * y(d.distance) * Math.cos(angle * i) / 2 * -1;
						                })
						    .attr('fill', '#09C4E6')
						    // .attr('stroke', '#09C4E6')
						    // .attr('stroke-width', 2.5);

						// Rings
						vis.append('svg:g').selectAll('.step')
							.data(steps)
						.enter().append('svg:circle')
						.attr("class", "step")
						.attr('r', function(d, i) {
							return  x(d) / 2;
						})
						.attr('cx', function(d) {
							return w/2;
						})
						.attr('cy', function(d) {
							return h/2;
						})
						.attr('opacity', .3)
						.attr('stroke', '#09C4E6')
						.attr('fill', 'none');
						// .attr('fill', '#09C4E6');

	       		}
			}, true);
		}
	};
})

;