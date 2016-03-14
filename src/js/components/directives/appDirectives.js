// appFilters.js

'use strict';

angular.module('runsApp.appDirectives', [])

// SCROLL
.directive('scrollAnimation', ['$window', '$timeout', function($window, $timeout) {
    return {
		link: function(scope) {

	        var winHeight = $window.innerHeight,
	            yOffset = $window.pageYOffset,
	            totalRuns = document.getElementById('total-runs'),
	            totalMiles = document.getElementById('total-miles'),
	            elevationGain = document.getElementById('elevation-gain'),
	            smallStats = document.getElementById('small-stats');

            scope.scrollState = {
            	"totalRuns": {"elem": totalRuns,state: false},
            	"totalMiles": {"elem": totalMiles,state: false},
            	"elevationGain": {"elem": elevationGain,state: false},
            	"smallStats": {"elem": smallStats,state: false}
            };

	        function loop() {
				requestAnimationFrame(loop);
	            yOffset = $window.pageYOffset;

	            $timeout(function() {
		            for(var elem in scope.scrollState) {
			            if(yOffset > scope.scrollState[elem].elem.offsetTop - (winHeight*0.35) && scope.scrollState[elem].state === false) {
			            	scope.scrollState[elem].state = true;
			            }
		            }
		        });
	        }

	        loop();
	    }
	};
}])

// RADAR CHART
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
						h = 940,
						w = h * 0.69, // graph's ratio is long
						margin = 10,
						TWO_PI = 2 * Math.PI,
					    angle = TWO_PI / data.length,
					    radius = 1,
						maxDistance = d3.max(data, function(d) { return + d.distance;}),
						x = d3.scale.linear().domain([0, maxDistance]).range([0 + margin, (h) - margin]),
						y = d3.scale.linear().domain([0, maxDistance]).range([0 + margin, (h) - margin]),

						vertPlacement = 3,  // hight given chart's shape
						dotPadding = 11;

					    vis
					    	.attr("width", w)
					        .attr("height", h);

						// Lines
						vis.append('svg:g')
							  .attr("transform", "translate(" + w/1.5 +", " + h/vertPlacement + ")")
								.selectAll('.line')
						    .data(data)
						    .enter().append('line')
							    .attr("class", "line")
							    .attr('x1', function(d, i) {
							    	return 30 * Math.sin(angle * i) / 2;
							    })
							    .attr('y1', function(d, i) {
							    	return 30 * Math.cos(angle * i) / 2 * -1;
							    })
							    .attr('x2', 0)
							    .attr('y2', 0)
								.attr('opacity', 0)
							  .transition()
									.duration(1300)
									.attr('opacity', 1)
									.attr('x2', function(d, i) {
										return radius * x(d.distance) * Math.sin(angle * i) / 2;
									})
									.attr('y2', function(d, i) {
										return radius * y(d.distance) * Math.cos(angle * i) / 2 * -1;
									})
									.delay(function(d, i) {
										return 10 * i;
									})
									.ease('elastic', 1, 1.25);

						// DOTS
						vis.append('svg:g')
						    .attr("transform", "translate(" + w/1.5 +", " + h/vertPlacement + ")")
								.selectAll('.circle')
						    .data(data)
						  .enter().append('svg:circle')
						    .attr("class", "circle")
								.attr('cx', 0)
								.attr('cy', 0)
						    .attr('opacity', 0)
						    .transition()
							    .duration(1300)
							    .attr('opacity', 1)
								.attr('cx', function(d, i) {
									return (radius * (x(d.distance) + dotPadding) * Math.sin(angle * i) / 2);
								})
							    .attr('cy', function(d, i) {
							    	return (radius * (y(d.distance) + dotPadding) * Math.cos(angle * i) / 2 * -1);
							    })
							    .delay(function(d, i) {
							    	return 10 * i;
							    })
								.ease('elastic', 1, 1.25);
	       		}
			}, true);
		}
	};
})

// RUN BLOCKS CHART
.directive('runsBlocksChart', function($window, $timeout) {
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
					h = 200,
					w = 730,
					dotRadius = 5,
					margin = dotRadius * 2.75,
					months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'],
		            nest = d3.nest().key(function(d) { return d.start_date_local.substring(5, 7); })
						            .sortKeys(d3.ascending)
						            .entries(data),
					maxRunsNum = d3.max(nest, function(d) { return + d.values.length;}),
					x = d3.scale.linear().domain([1, 12]).range([margin, w - margin]), // Scale to 2 months
					y = d3.scale.linear().domain([0, maxRunsNum + 1]).range([margin, h - margin]), // Adding 1 to maxRunsNum to account for text placement
					color = d3.scale.linear().domain([0, maxRunsNum - 1]).range(['#0984E6', '#EB176F']);

				    vis
				    	.attr('width', '100%')
				        .attr('height', '100%')
				    	.attr('viewBox','0 0 '+ w +' '+ h)
				        .attr('preserveAspectRatio','xMinYMin');

				    var g = vis.selectAll('.circle-container')
				    	.data(nest).enter()
				    	.append('svg:g')
				    	.attr('class', 'circle-container')
				        .attr("transform", function(d) {
				        	return "translate(" + x(d.key) + ", " + (h  - (dotRadius * 2) - (margin * 3)) + ")";
				        });

				    var gBg = vis.selectAll('.runs-circle-bg-container')
				    	.data(months).enter()
				    	.append('svg:g')
				    	.attr('class', 'runs-circle-bg-container')
				        .attr("transform", function(d,i) {
				        	return "translate(" + x(i + 1) + ", " + h + ")";
				        });

				    // TEXT
					gBg.append('text')
						.attr('class', 'runs-label')
						.text(function(d) {
							return d;
						})
						.attr("text-anchor", "middle")
						.attr('fill', '#fff');

					// BG
					for(var j = 0; j < months.length -1; j++) {
						gBg
							.append('rect')
					    	.attr('x', dotRadius * -2.75)
					    	.attr('width', dotRadius * 5.5)
					    	.attr('height', dotRadius * 1.3)
					    	.attr('fill', 'rgba(255,255,255,.1)')
					    	.attr('y', function() {
					    		return y(-j) - (dotRadius * 2) - (margin * 3);
					    	})
					    	.attr('class', 'runs-circle-bg');
					}

					var blocks = g.selectAll('.runs-circle')
					    .data(function(d) {
					    	return d.values;
					    }).enter()
					    	.append('rect')
					    	.attr('x', dotRadius * -2.75)
					    	.attr('width', dotRadius * 5.5)
					    	.attr('height', dotRadius * 1.3)
					    	.attr('fill', function(d, i) {
					    		return color(i);
					    	})
					    	.attr('y', function(d, i) {
					    		return y(-i);
					    	})
					    	.attr('opacity', 0)
					    	.attr('class', 'runs-circle');


				    function animate() {
						blocks.transition()
							    .duration(200)
							    .delay(function(d, i) {
									return i * 80;
								})
							    .attr('opacity', 1);
				    }

			    	attrs.$observe('animated', function(newData) {
			    		if(newData === "true") {
			    			animate();
			    		}
			    	});
	       		}
			}, true);
		}
	};
})

// MILES BAR CHART
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
					h = 200,
					w = 730,
					margin = 10,
					rectWidth = 5,
					months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sept', 'oct', 'nov', 'dec'],

		            nest = d3.nest().key(function(d) { return d.start_date_local.substring(5, 7); }).sortKeys(d3.ascending)
						            .rollup(function(d) { return d3.sum(d, function(g) {return g.distance; }); })
						            .entries(data),
					maxRunsNum = d3.max(nest, function(d) { return + d.values;}),
					x = d3.scale.linear().domain([1, 12]).range([margin, w - margin]), // Scale to 12 months
					y = d3.scale.linear().domain([0, maxRunsNum]).range([0, h - (rectWidth * 4)]),
					color = d3.scale.linear().domain([0, maxRunsNum]).range(['#0984E6', '#EB176F']);

				    vis
				    	.attr("width", w).attr("height", h)
				    	.attr('width', '100%')
				        .attr('height', '100%')
				    	.attr('viewBox','0 0 '+ w +' '+ h)
				        .attr('preserveAspectRatio','xMinYMin');

				    var defs = vis.append("defs");

				    var gBg = vis.selectAll('.miles-circle-bg-container')
				    	.data(months).enter()
				    	.append('svg:g')
				    	.attr('class', 'miles-circle-bg-container')
				        .attr("transform", function(d,i) {
				        	return "translate(" + x(i + 1) + ", " + h + ")";
				        });

					 // TEXT
					gBg.append('text')
						.attr('class', 'runs-label')
						.text(function(d) {
							return d;
						})
						.attr("text-anchor", "middle")
						.attr('fill', '#fff');

					// BG
					gBg
						.append('rect')
				    	.attr('x', -rectWidth/2)
				    	.attr('width', rectWidth)
				    	.attr('height', y(maxRunsNum))
				    	.attr('fill', 'rgba(255,255,255,.1)')
				    	.attr('y', function() {
				    		return y(-maxRunsNum) - (rectWidth * 4);
				    	})
				    	.attr('class', 'miles-circle-bg');

				    var mileLines = vis.selectAll('.miles-line')
				    	.data(nest).enter()
				    	.append('rect')
				    		.attr('width', rectWidth)
					    	.attr("y", -y(0))
					    	.attr("x", -rectWidth/2)
					    	.attr("height", y(0))
					    	.attr('class', 'miles-line')
					        .attr("transform", function(d) {
					        	return "translate(" + x(d.key) + ", " + (h  - (rectWidth * 4)) + ")";
					        })
					        .style("fill", function(d, i) {
					        	return "url(#the-gradient" + i + ")";
					        })
						    .attr('opacity', 0);

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
					}

					function animate() {
						mileLines.transition()
							    .duration(1200)
								.attr("y", function(d) {
									return -y(d.values);
								})
								.attr("height", function(d) {
									return y(d.values);
								})
							    .attr('opacity', 1);
					}

					attrs.$observe('animated', function(newData) {
			       		if(newData === "true") {
			       			animate();
			       		}
			       	});
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
						w = 300,
						h = w/6,
						margin = 10,
					    chartAttribute = attrs.chartItem,
						maxAttribute = d3.max(data, function(d) { return + d[chartAttribute];}),
						minAttribute = d3.min(data, function(d) { return + d[chartAttribute];}),

						x = d3.scale.linear().domain([0, data.length]).range([0, w]),
						y = d3.scale.linear().domain([minAttribute, maxAttribute]).range([h - margin, 0 + margin]);

					    vis
					    	// .attr("width", w)
					        // .attr("height", h)
					        .attr('width', '100%')
					        .attr('height', '100%')
					        .attr('viewBox','0 0 '+ w +' '+ h)
					        .attr('preserveAspectRatio','xMidYMid meet');

					    // Line before animation
					    var line = d3.svg.line()
					        .interpolate("cardinal")
					        .x(function(d, i) {
					            return x(i);
					        })
					        .y(function(d) {
					            return y(d[chartAttribute]);
					        });

					    // Line after animation
					    var lineLoad = d3.svg.line()
					        .interpolate("cardinal")
					        .x(function(d, i) {
					            return x(i);
					        })
					        .y(h);

						// BARS
				        var bars = vis
					        .append('g')
							.selectAll('.small-stats_bars')
					    	.data(data)
					    	.enter()
					    	.append('svg:line')
				    		.attr('class', 'small-stats_bars')
				    		.attr('x1', function(d, i) {
				    			return x(i);
				    		})
				    		.attr("y1", h)
				    		.attr('x2', function(d, i) {
				    			return x(i);
				    		})
				    		.attr("y2", h);

						// CLIP PATH
						var clip = vis.append('svg:g').append("svg:path")
								.attr("d", lineLoad(data))
								.attr("d", line(data))
								.attr('stroke', '#01051c')
								.attr('stroke-width', 5)
								.attr('fill', 'transparent')
								.attr('opacity', 0);

					    // MAIN PATH
					    var mainPath = vis.append('svg:g').append("svg:path")
								.attr("d", lineLoad(data))
								.attr('class', 'small-stats_path')
								.attr('opacity', 0);

						// DOT
						var dotMarker = vis.append('svg:g')
							.selectAll('.small-stats_dot')
					    .data(data)
					  .enter().append('svg:circle')
					  // Using .select() instead of .filter() to preserve indecis
					  .select(function(d) { return d[chartAttribute] === maxAttribute ? this: null; })
					    .attr("class", "small-stats_dot")
							.attr('cx', function(d, i) {
								return x(i);
							})
						    .attr('cy', function(d) {
						    	return y(d[chartAttribute]);
						    })
					    .attr('opacity', 0);

						function animate() {
							clip.transition()
							    .duration(1000)
							    .attr('opacity', 1);

							// Animate dot marker
							dotMarker.transition()
							    .duration(1000)
							    .attr('opacity', 1);

							// Animate main path
							mainPath.transition()
									.attr('opacity', 1)
									.attr("d", line(data))
									.duration(1300)
									.ease('elastic', 1, 0.7);

							// Animate bars
							bars.transition()
					        	.attr("y2", function(d) {
						    		return y(d[chartAttribute]);
						    	})
								.duration(1500)
								.delay(250)
								.ease('elastic', 1, 0.7);
						}

						attrs.$observe('animated', function(newData) {
				       		if(newData === "true") {
				       			animate();
				       		}
				       	});
	       		}
			}, true);
		}
	};
})

// ELEVATION CHART
.directive('elevationChart', function($window) {
   return {
      restrict:'A',
      template:"<svg></svg>",
      transclude: true,
       link: function(scope, elem, attrs) {

	       	attrs.$observe('chartData', function(newData) {
	       		if(newData) {
	            var data = scope[attrs.chartData],
						d3 = $window.d3,
						rawSvg = elem.find('svg'),
						vis = d3.select(rawSvg[0]),
						h = 240,
						w = 300,
						totalElevation = 1330, // meters
						mountainElevation = 3429, // Mount Hood (meters)
						x = d3.scale.linear().domain([0, 6]).range([0, w]),
						y = d3.scale.linear().domain([0, 6]).range([h, 0]),
						yMtnEleveation = d3.scale.linear().domain([0, mountainElevation]).range([h, 0]);

					    vis
					    	// .attr("width", w)
					        // .attr("height", h)
					        .attr('width', '100%')
					        .attr('height', '100%')
					        .attr('viewBox','0 0 '+ w +' '+ h)
					        .attr('preserveAspectRatio','xMidYMid meet');

						var bigMountain = x(0) + ' ' + y(0) + ', ' +
										  x(6) + ' ' + y(0) + ', ' +
										  x(3) + ' ' + y(6) + ', ' +
										  x(3) + ' ' + y(6) + ', ' +
										  x(0) + ' ' + y(0);

				    	var smallMountain = x(1) + ' ' + y(0) + ', ' +
				        				   	x(3) + ' ' + y(0) + ', ' +
				        				   	x(2) + ' ' + y(3) + ', ' +
				        				   	x(1) + ' ' + y(0);

				  		// Small Mountain
				        vis
				        	.append('g')
				        	.append('polyline')
					        .attr('points', smallMountain)
					        .attr("class", "mountain small");

					    // Cover/mask
					    vis
				        	.append('g')
				        	.append('polyline')
					        .attr('points', bigMountain)
					        .attr("class", "mountain cover");

					    // Big Mountain
					    vis
				        	.append('g')
				        	.append('polyline')
					        .attr('points', bigMountain)
					        .attr("class", "mountain big");

					    // Marker line
					    var markerLine = vis
					    	.append('svg:line')
					    	.attr('class', 'mountain_marker')
					    	.attr('x1', 0)
					    	.attr('x2', w)
					    	.attr('y1', h)
					    	.attr('y2', h);

						// TEXT
						vis.append('text')
							.attr('class', 'mountain_marker-label')
							.html('Mount Hood')
							.attr('dx', 0)
							.attr('dy', 15)

						vis.append('text')
							.attr('class', 'mountain_marker-label')
							.html(parseInt(mountainElevation * 3.28) + ' ft')
							.attr('dx', 0)
							.attr('dy', 35);

						var mountLabel = vis.append('text')
							.attr('class', 'elevation_marker-label')
							.html(parseInt(totalElevation * 3.28) + ' ft')
							.attr('dx', 0)
							// .attr('dy', yMtnEleveation(totalElevation) - 13)
							.attr('dy', h - 13)
							.attr('opacity', 0);

					    // Gradient
				        var gradient = vis
					        .append("linearGradient")
					        .attr("y1", 0)
					        .attr("y2", h)
					        .attr("x1", 0)
					        .attr("x2", 0)
					        .attr("id", "linear-gradient")
					        .attr("gradientUnits", "userSpaceOnUse");

				        gradient
					        .append("stop")
					        .attr("offset", "0")
					        .attr("stop-opacity", 0.25)
					        .attr("stop-color", "#EB176F");

				        gradient
					        .append("stop")
					        .attr("offset", "100%")
					        .attr("stop-opacity", 0)
					        .attr("stop-color", "#0984E6");

						scope.animate = function() {
							// Animate the marker line
							markerLine.transition()
								    .duration(1600)
								    .ease('elastic', 1, 1.1)
								    .attr('y1', yMtnEleveation(totalElevation))
							    	.attr('y2', yMtnEleveation(totalElevation));

							// Animate the label
							mountLabel.transition()
								    .duration(1600)
								    .ease('elastic', 1, 1.1)
								    .attr('dy', yMtnEleveation(totalElevation) - 13)
									.attr('opacity', 1);
						};

						attrs.$observe('animated', function(newData) {
				       		if(newData === "true") {
				       			scope.animate();
				       		}
				       	});
	       		}
			}, true);
		}
	};
});