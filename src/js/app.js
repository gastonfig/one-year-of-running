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


/* FILTERS
----------------------------------------------- */

runsApp
.filter('getMaxVal', function() {
	return function(input, key) {
		var maxVal = Math.max.apply(Math, input.map(function(val) {
			return val[key]; 
		}));

		return maxVal;
	};
})

.filter('getSum', function() {
	return function(input, key) {
		var sum = 0;

		for (var i = input.length - 1; i >= 0; i--) {
			sum += parseInt(input[i][key]);
		}

		return sum;

	};
})

.filter('metersToMiles', function() {
	return function(input) {
		return Math.round(input * 0.000621371 * 100) / 100;
	};
})

.filter('secondsToHMS', function() {
	return function(input, showSecs) {
		var totSeconds = input,
			hours = parseInt(totSeconds/3600),
			minutes = parseInt(totSeconds/60) % 60,
			seconds = totSeconds % 60;

		var formattedTime = hours + ':' + (minutes < 10 ? '0' + minutes : minutes) + ( showSecs === true ? ":" + (seconds  < 10 ? '0' + seconds : seconds) : '');

		return formattedTime;
	};
})

.filter('formatDate', function() {
	return function(input) {
		var date = new Date(input),
			day = date.getDate(),
			month = date.getMonth() + 1,
			year = date.getFullYear();

		return month + '/' + day + '/' + year;
	};
})

.filter('milesPerHour', function() {
	return function(input) {
		var totSeconds = parseInt(60 * 60 / (input * 2.237)),
			minutes = parseInt(totSeconds/60) % 60,
			seconds = totSeconds % 60;

		return minutes + ':' + (seconds  < 10 ? '0' + seconds : seconds);
	};
});


/* CONTROLLERS
----------------------------------------------- */

runsApp.controller('mainCtrl', ['$scope', '$http', 'getMaxValFilter', 'getSumFilter', function($scope, $http, getMaxValFilter, getSumFilter) {
	$http.get('data.json').success(function(data) {
		$scope.data = data;

		$scope.distanceSum = getSumFilter(data, 'distance');
		$scope.timeSum = getSumFilter(data, 'moving_time');
		$scope.runsSum = data.length;
		$scope.maxDistance = getMaxValFilter(data, 'distance');
		$scope.minPace = getMaxValFilter(data, 'average_speed');
	});
}]);


/* DIRECTIVES
----------------------------------------------- */

// RADAR CHART
runsApp

.directive('linearChart', function($window) {
   return {
      restrict:'EA',
      template:"<svg></svg>",
       link: function(scope, elem, attrs) {
	       	scope.$watch('data', function(newData) {
	       		if(newData) {
	            var data = scope[attrs.chartData],
						d3 = $window.d3,
						rawSvg = elem.find('svg'),
						vis = d3.select(rawSvg[0]),
						h = 900,
						w = h * 0.69, // graph's ratio is long
						margin = 10,
						TWO_PI = 2 * Math.PI,
					    angle = TWO_PI / data.length,
					    radius = 1,
						maxDistance = d3.max(data, function(d) { return + d.distance;}),
						x = d3.scale.linear().domain([0, maxDistance]).range([0 + margin, (h) - margin]),
						y = d3.scale.linear().domain([0, maxDistance]).range([0 + margin, (h) - margin]),

						interpolation = "cardinal", // "basis" / "cardinal"
						//
						ringNum = 9,
						vertPlacement = 2.8;  // hight given chart's shape						

						// RINGS
						// var rings = vis.append('svg:g');
						// for(var i = ringNum + 1; i > 2; i--) {
						// 	rings.append('svg:circle')
						// 	.attr("class", "step")
						// 	.attr('r', function() {
						// 		return 0;
						// 	})
						// 	.attr('cx', function() {
						// 		return w/2;
						// 	})
						// 	.attr('cy', function() {
						// 		return h/vertPlacement;
						// 	})
						// 	.attr('opacity', 0)
						//   .transition()
						// 		.attr('opacity', .1)
						// 		.attr('r', function() {
						// 			return Math.round(radius * x(1609.34 * (i-1)) / 2); // In meters
						// 		})
						// 		.duration(1000);
						// }

					    vis.attr("width", w)
					        .attr("height", h);
					        // .attr('width', '100%')
					        // .attr('height', '100%')
					        // .attr('viewBox','0 0 '+ w +' '+ h)
					        // .attr('preserveAspectRatio','xMinYMin')

					    var g = vis.append('svg:g')
					        .attr("transform", "translate(" + w/1.5 +", " + h/vertPlacement + ")");

					    var line = d3.svg.line()
					        .interpolate(interpolation)
					        .x(function(d,i) {
					            return radius * x(d.distance) * Math.sin(angle * i) / 2;
					        })
					        .y(function(d, i) {
					            return radius * y(d.distance) * Math.cos(angle * i) /2 * -1;
					        });

					    var lineLoad = d3.svg.line()
					        .interpolate(interpolation)
					        .x(0)
					        .y(0);

					    // MAIN PATH
					    g.append("svg:path")
								.attr("d", lineLoad(data))
								// .attr('stroke', '#0984E6')
								// .attr('stroke-width', 1)
								// .attr('fill', 'transparent')
								.attr('class', 'path')
								.transition()
									.attr("d", line(data))
									.duration(1000)
									.delay(400)
									.ease('elastic', 1, 1.25);

						// Lines
						vis.append('svg:g')
							  .attr("transform", "translate(" + w/1.5 +", " + h/vertPlacement + ")")
								.selectAll('.line')
						    .data(data)
						    .enter().append('line')
							    .attr("class", "line")
							    .attr('x1', function(d, i) { 
							    	return 10 * Math.sin(angle * i) / 2;
							    })
							    .attr('y1', function(d, i) { 
							    	return 10 * Math.cos(angle * i) / 2 * -1;
							    })
							    .attr('x2', 0)
							    .attr('y2', 0)
								.attr('opacity', 0)
							  .transition()
									.duration(1300)
									.attr('opacity', 1)
									.attr('x2', function(d, i) {
										// return radius * y(1609.34 * ringNum) * Math.sin(angle * i) / 2;
										return radius * x(d.distance) * Math.sin(angle * i) / 2;
									})
									.attr('y2', function(d, i) { 
										// return radius * y(1609.34 * ringNum) * Math.cos(angle * i) / 2 * -1;
										return radius * y(d.distance) * Math.cos(angle * i) / 2 * -1;
									})
									.delay(function(d, i) {
										return 10 * i;
									})
									.ease('elastic', 1, 1.25);

						// DOTS
						vis
								.append('svg:g')
						    .attr("transform", "translate(" + w/1.5 +", " + h/vertPlacement + ")")
								.selectAll('.circle')
						    .data(data)
						  .enter().append('svg:circle')
						    .attr("class", "circle")
						    .attr('r', 2)
								.attr('cx', 0)
								.attr('cy', 0)
						    .attr('opacity', 0)
						    .transition()
							    .duration(1300)
							    .attr('opacity', 1)
								.attr('cx', function(d, i) {
									return radius * x(d.distance) * Math.sin(angle * i) / 2;
								})
							    .attr('cy', function(d, i) {
							    	return radius * y(d.distance) * Math.cos(angle * i) / 2 * -1;
							    })
							    .delay(function(d, i) {
							    	return 10 * i;
							    })
								.ease('elastic', 1, 1.25);

						// ANIMATION

						// setInterval(function() {
						// 	var i = Math.floor(Math.random() * (52-1+1) + 1);
						// 	d3.selectAll('.circle:nth-child('+i+')')
						// 		.transition()
						// 			.duration(550)
						// 			.attr('r', 8)
						// 		// .ease('elastic', 1, 1.35)
						// 		.transition()
						// 			.duration(600)
						// 			.attr('r', 3)
						// 		.ease('elastic', 1, 0.6);

						// 	d3.selectAll('.line:nth-child('+i+')')
						// 		.transition()
						// 			.duration(550)
						// 			.style('opacity', 1)
						// 			.style('stroke-dasharray', 'none')
						// 		// .ease('elastic', 1, 1.35)
						// 		.transition()
						// 			.duration(600)
						// 			.style('opacity', 0.3)
						// 			.style('stroke-dasharray', ('1, 1'))
						// 		.ease('elastic', 1, 0.6);

						// }, 400);

						
	       		}
			}, true);
		}
	};
})

// RUN DOTS CHART
.directive('runsDotsChart', function($window) {
   return {
      restrict:'EA',
      template:"<svg></svg>",
       link: function(scope, elem, attrs) {
	       	scope.$watch('data', function(newData) {
	       		if(newData) {
	            var data = scope[attrs.chartData],
					d3 = $window.d3,
					rawSvg = elem.find('svg'),
					vis = d3.select(rawSvg[0]),
					h = 280,
					w = 730,
					margin = 10,
					dotRadius = 5,
					months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'],

		            nest = d3.nest().key(function(d) { return d.start_date_local.substring(5, 7); })
						            .sortKeys(d3.ascending)
						            .entries(data),
		            nestMiles = d3.nest().key(function(d) { return d.start_date_local.substring(5, 7); })
					              .sortKeys(d3.ascending)
					              .rollup(function(d) { return d3.sum(d, function(g) {return g.distance; });}).entries(data),
					maxMiles = d3.max(nestMiles, function(d) { return + d.values;}),
					maxRunsNum = d3.max(nest, function(d) { return + d.values.length;}),
					x = d3.scale.linear().domain([1, 12]).range([margin, w - margin]), // Scale to 2 months
					y = d3.scale.linear().domain([0, maxRunsNum + 1]).range([margin, h - margin]), // Adding 1 to maxRunsNum to account for text placement
					color = d3.scale.linear().domain([0, maxMiles]).range(['#09A3E6', '#AF09E6']);

				    vis
				    	.attr('width', '100%')
				        .attr('height', '100%')
				    	.attr('viewBox','0 0 '+ w +' '+ h)
				        .attr('preserveAspectRatio','xMinYMin');


				    var g = vis.selectAll('g')
				    	.data(nest).enter()
				    	.append('svg:g')
				    	.attr('class', 'circle-container')
				        .attr("transform", function(d) {
				        	return "translate(" + x(d.key) + ", " + (h  - (dotRadius * 2) - (margin * 3)) + ")";
				        });

					g.selectAll('circle')
					    .data(function(d) {
					    	return d.values;
					    }).enter()
					    	.append('circle')
					    	.attr('r', dotRadius)
					    	.attr('fill', function(d, i) {
					    		return color(nestMiles[i].values);
					    	})
					    	// .attr('r', function(d) {
						    // 	console.log(d.distance)
					    	// 	return d.distance / 1000;
					    	// })
					    	.attr('cy', function(d, i) {
					    		return y(-i);
					    	})
					    	.attr('class', 'runs-circle');

					// TEXT
					for(var i = 0; i < 12; i++) {
						vis.append('text')
						.attr('class', 'runs-label')
						.text(function() {
							return months[i];
						})
						.attr("text-anchor", "middle")
						.attr('x', function() {
							return x(i+1);
						})
						.attr('y', function() {
							return h;
						})
						.attr('fill', '#fff');
					}
	       		}
			}, true);
		}
	};
})

// RUN DOTS CHART
.directive('milesBarChart', function($window) {
   return {
      restrict:'EA',
      template:"<svg></svg>",
       link: function(scope, elem, attrs) {
	       	scope.$watch('data', function(newData) {
	       		if(newData) {
	            var data = scope[attrs.chartData],
					d3 = $window.d3,
					rawSvg = elem.find('svg'),
					vis = d3.select(rawSvg[0]),
					h = 280,
					w = 730,
					margin = 10,					
					rectWidth = 4,
					months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'],

		            nest = d3.nest().key(function(d) { return d.start_date_local.substring(5, 7); }).sortKeys(d3.ascending)
						            .rollup(function(d) { return d3.sum(d, function(g) {return g.distance; }); })
						            .entries(data),
					maxRunsNum = d3.max(nest, function(d) { return + d.values;}),
					x = d3.scale.linear().domain([1, 12]).range([margin, w - margin]), // Scale to 12 months
					y = d3.scale.linear().domain([0, maxRunsNum]).range([margin, h - margin - rectWidth]),
					color = d3.scale.linear().domain([0, maxRunsNum]).range(['#0984E6', '#E6098A']);

				    vis
				    	.attr("width", w).attr("height", h)
				    	.attr('width', '100%')
				        .attr('height', '100%')
				    	.attr('viewBox','0 0 '+ w +' '+ h)
				        .attr('preserveAspectRatio','xMinYMin');

				    var defs = vis.append("defs");

				    vis.selectAll('g')
				    	.data(nest).enter()
				    	.append('rect')
				    		.attr('width', rectWidth)
					    	.attr("y", function(d) {
					    		return -y(d.values);
					    	})
					    	.attr("x", -rectWidth/2)
					    	.attr("height", function(d) {
					    		return y(d.values);
					    	})
					    	.attr('class', 'miles-line')
					        .attr("transform", function(d) {
					        	return "translate(" + x(d.key) + ", " + (h  - rectWidth - (margin)) + ")";
					        })
					        .style("fill", function(d, i) {
					        	return "url(#the-gradient" + i + ")";
					        });

					for(var i = 0; i < 12; i++) {
						// GRADIENT
						if(nest[i]) {
						    var gradient = defs
							    .append("linearGradient")
							    .attr("id", "the-gradient" + i)
							    .attr("x1", "0%")
							    .attr("y1", "0%")
							    .attr("x2", "0%")
							    .attr("y2", "100%")
							    .attr("spreadMethod", "pad");

							    gradient.append("stop")
								    .attr("offset", "0%")
								    .attr("stop-color", color(nest[i].values))
								    .attr("stop-opacity", 1);

							    gradient.append("stop")
								    .attr("offset", "100%")
								    .attr("stop-color", "#0984E6")
								    .attr("stop-opacity", 1);
						}

						// TEXT
						vis.append('text')
						.attr('class', 'runs-label')
						.text(function() {
							return months[i];
						})
						.attr("text-anchor", "middle")
						.attr('x', function() {
							return x(i+1);
						})
						.attr('y', function() {
							return h;
						})
						.attr('fill', '#fff');
					}
	       		}
			}, true);
		}
	};
})

// LINE CHART
.directive('lineChart', function($window) {
   return {
      restrict:'EA',
      template:"<svg></svg>",
       link: function(scope, elem, attrs) {
	       	scope.$watch('data', function(newData) {
	       		if(newData) {
	            var data = scope[attrs.chartData],
						d3 = $window.d3,
						rawSvg = elem.find('svg'),
						vis = d3.select(rawSvg[0]),
						h = 45,
						w = 300,
						margin = 10,
					    chartAttribute = attrs.chartItem,
					    parseDate = d3.time.format("%Y-%m-%dT%H:%M:%SZ").parse,
						maxAttribute = d3.max(data, function(d) { return + d[chartAttribute];}),
						minAttribute = d3.min(data, function(d) { return + d[chartAttribute];}),

						x = d3.scale.ordinal().rangeRoundBands([0 + margin, w - margin], 0.05).domain(data.map(function(d) { return parseDate(d.start_date_local); })),
						y = d3.scale.linear().domain([minAttribute, maxAttribute]).range([h - margin, 0 + margin]);

					    vis
					    	// .attr("width", w)
					        .attr("height", h)
					        .attr('width', '80%')
					        .attr('height', 20 + '%')
					        .attr('viewBox','0 0 '+ w +' '+ h)
					        .attr('preserveAspectRatio','xMinYMin');

					    // Line before animation
					    var line = d3.svg.line()					    	
					        .interpolate("cardinal")
					        .x(function(d) {
					            return x(parseDate(d.start_date_local));
					        })
					        .y(function(d) {
					            return y(d[chartAttribute]);
					        });

					    // Line after animation
					    var lineLoad = d3.svg.line()
					        .interpolate("cardinal")
					        .x(function(d) {
					            return x(parseDate(d.start_date_local));
					        })
					        .y(h);

						// BARS
				        vis.append('svg:g')
							.selectAll('.small-stats_bars')
					    	.data(data)
					    	.enter()
					    	.append('svg:line')
				    		.attr('class', 'small-stats_bars')
				    		.attr('x1', function(d) {
				    			return x(parseDate(d.start_date_local));
				    		})
				    		.attr("y1", h)
				    		.attr('x2', function(d) {
				    			return x(parseDate(d.start_date_local));
				    		})
				    		.attr("y2", h)
					        .transition()
					        	.attr("y2", function(d) {
						    		return y(d[chartAttribute]);
						    	})
								.duration(1500)
								.delay(250)
								.ease('elastic', 1, 0.7);

						// CLIP PATH
						vis.append('svg:g').append("svg:path")
								.attr("d", lineLoad(data))
								.attr("d", line(data))
								.attr('stroke', '#01051c')
								.attr('stroke-width', 5)
								.attr('fill', 'transparent');

					    // MAIN PATH
					    vis.append('svg:g').append("svg:path")
								.attr("d", lineLoad(data))
								.attr('stroke', '#0984E6')
								.attr('stroke-width', 1)
								.attr('fill', 'transparent')
								.attr('class', 'small-stats_path')
								.attr('opacity', 0)
								.transition()
									.attr('opacity', 1)
									.attr("d", line(data))
									.duration(1300)
									.ease('elastic', 1, 0.7);

						// DOT
						vis.append('svg:g')
							.selectAll('.small-stats_dot')
					    .data(data)
					  .enter().append('svg:circle')
					  .filter(function(d) { return d[chartAttribute] === maxAttribute; })
					    .attr("class", "small-stats_dot")
					    .style("fill", "#E6098A")
					    .attr('r', 3)
							.attr('cx', function(d) {
								return x(parseDate(d.start_date_local));
							})
						    .attr('cy', function(d) {
						    	return y(d[chartAttribute]);
						    })
					    .attr('opacity', 0)
					    .transition()
						    .duration(1000)
						    .attr('opacity', 1);
						
	       		}
			}, true);
		}
	};
})
;