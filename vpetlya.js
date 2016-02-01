/**
 * Created by vpetlya on 01/26/16.
 * vp_inbox@ukr.net
 */

function calcCoordinates(inputData) {
	var peoples = [];
	for (i in inputData.people) {
		peoples[i] = {index: +i, x: inputData.people[i].x, y: inputData.people[i].y};
	}
	var seats = inputData.seats;
	var helicopters = Math.ceil(peoples.length / seats);

	this.calcPolarCoordinates = function (coords) {
		var c = this.getCenter(coords);
		for (var i in coords) {
			var x = coords[i].x - c.x;
			var y = coords[i].y - c.y;
			coords[i].r = Math.sqrt(x * x + y * y);
			coords[i].fi = Math.atan2(y, x);
			if (coords[i].fi < 0) coords[i].fi += 2 * Math.PI;
		}
	}

	this.getCenter = function (coords) {
		var c = {x: coords[0].x, y: coords[0].y};
		var count = 1;
		for (var i = 0; i < coords.length - 1; i++)
			for (var j = i + 1; j < coords.length; j++) {
				var len = Math.sqrt(Math.pow(coords[i].x - coords[j].x, 2) + Math.pow(coords[i].y - coords[j].y, 2));
				var mass = Math.pow(len, 4);
				c.x += (coords[i].x + coords[j].x) / 2 * mass;
				c.y += (coords[i].y + coords[j].y) / 2 * mass;
				count += mass;
			}

		c.x /= count;
		c.y /= count;
		return c;
	}

	this.calcMaxDistance = function (coords, c) {
		var max = 0;
		for (var i in coords) {
			var len = Math.sqrt(Math.pow(coords[i].x - c.x, 2) + Math.pow(coords[i].y - c.y, 2));
			if (len > max) max = len;
		}
		return max;
	}

	this.splitArray = function (coords, k) {
		var N = coords.length;
		if (k == undefined) k = 0.5;
		if (N % seats == 0 || seats*2 < N) {//делить кратно полным вертолётам
			var fullHalf = Math.floor(N * k / seats);
			var desirable = fullHalf * seats;
		} else {//делить пропорционально
			desirable = Math.floor(N * k);
		}

		this.calcPolarCoordinates(coords);
		var allCoords = coords.sort(function (a, b) {
			if (a.fi < b.fi) return -1;
			if (a.fi > b.fi) return 1;
			return 0;
		});
		allCoords = allCoords.concat(allCoords.slice(0));

		var min = {pos: null, value: null, result: []};
		for (var i = 0; i < N; i++) {
			var array1 = allCoords.slice(i, i + desirable);
			var array2 = allCoords.slice(i + desirable, N + i);
			var len1 = this.calcMaxDistance(array1, this.getCenter(array1));
			var len2 = this.calcMaxDistance(array2, this.getCenter(array2));
			if (min.value == null || min.value > Math.max(len1, len2)) {
				min.pos = i;
				min.value = Math.max(len1, len2);
				min.result = [];
				min.result.push(array1);
				min.result.push(array2);
			}
		}

		return min.result;
	}

	var i = 0, groups = [peoples];
	while (groups.length < helicopters * seats) {
		while (i < groups.length && groups[i].length <= seats) i++;
		if (i >= groups.length || groups[i].length <= seats) break;
		var newTwo = this.splitArray(groups[i]);
		groups.splice(i, 1, newTwo[0], newTwo[1]);
	}

	result = [];
	for (i in groups) {
		var c = this.getCenter(groups[i]);
		var group = [];
		for (j in groups[i]) {
			group.push(+groups[i][j].index);
		}
		result.push({x: Math.round(c.x), y: Math.round(c.y), people: group});
	}

	return result;
}