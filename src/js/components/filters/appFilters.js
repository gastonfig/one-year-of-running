// appFilters.js

'use strict';

angular.module('runsApp.appFilters', [])

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