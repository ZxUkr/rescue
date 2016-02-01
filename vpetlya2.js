/**
 * Created by vpetlya on 01/26/16.
 * vp_inbox@ukr.net
 */

function buildOutputData(inputData) {
	var peoples = [];
	for (i in inputData.people) {
		peoples[i] = {index: +i, x: inputData.people[i].x, y: inputData.people[i].y};
	}
	var seats = inputData.seats;
	var helicopters = Math.ceil(peoples.length / seats);

	var centerImage = draw.defs().rect(rectSize, rectSize).attr({ fill: 'red' });
	var peopleImage1 = draw.defs().rect(rectSize, rectSize).attr({ fill: 'green' });
	var peopleImage2 = draw.defs().rect(rectSize, rectSize).attr({ fill: 'blue' });
	this.calcPolarCoordinates = function (coords) {
		var c = this.getCenter(coords);
		draw.use(centerImage).move(c.x, c.y);
		for (var i in coords) {
			var x = coords[i].x - c.x;
			var y = coords[i].y - c.y;
			coords[i].r = Math.sqrt(x * x + y * y);
			coords[i].fi = Math.atan2(y, x);
			if (coords[i].fi < 0) coords[i].fi += 2 * Math.PI;
		}
	}

	this.getCenterMass = function (coords) {
		var c = {x: 0, y: 0};
		for (var i in coords) {
			c.x += coords[i].x;
			c.y += coords[i].y;
		}
		c.x /= coords.length;
		c.y /= coords.length;
		return c;
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
		/*var array1 = coords.sort(compareByFi);
		 var array2 = array1.slice(desirable);
		 var array1 = array1.slice(0, desirable);
		 return [array1, array2];*/

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
/*		array1 = min.result[0];
		array2 = min.result[1];
		for (var i in array1) {
			draw.use(peopleImage1).move(array1[i].x, array1[i].y);
		}
		for (var i in array2) {
			draw.use(peopleImage2).move(array2[i].x, array2[i].y);
		}

		draw = SVG('drawing').size(500, 500);
		draw.viewbox(0, 0, 10000 + rectSize, 10000 + rectSize);*/

		return min.result;
	}

	//debugger;
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

function buildOutputData2(inputData) {
	var peoples = [];
	for (i in inputData.people) {
		peoples[i] = {index: +i, x: inputData.people[i].x, y: inputData.people[i].y};
	}
	peoples.sort(compareByX);

	var seats = inputData.seats;
	var helicopters = Math.ceil(peoples.length / seats);

	function compareByX(a, b) {
		if (a.x < b.x) return -1;
		if (a.x > b.x) return 1;
		return 0;
	}

	//var centerImage = draw.defs().rect(rectSize, rectSize).attr({ fill: 'red' });
	//draw.use(centerImage).move(c.x, c.y);

	this.getCenterMass = function (coords) {
		var c = {x: 0, y: 0};
		for (var i in coords) {
			c.x += coords[i].x;
			c.y += coords[i].y;
		}
		c.x /= coords.length;
		c.y /= coords.length;
		return c;
	}

	this.getCenter = function (coords) {
		//return this.getCenterMass(coords);
		var c = {x: 0, y: 0};
		var count = 0;
		for (var i = 0; i < coords.length - 1; i++)
			for (var j = i + 1; j < coords.length; j++) {
				var len = Math.sqrt(Math.pow(coords[i].x - coords[j].x, 2) + Math.pow(coords[i].y - coords[j].y, 2));
				var mass = Math.pow(len, 3);
				c.x += (coords[i].x + coords[j].x) / 2 * mass;
				c.y += (coords[i].y + coords[j].y) / 2 * mass;
				count += mass;
			}

		c.x /= count;
		c.y /= count;
		return c;
	}

	this.calcDistance = function (p1, p2) {
		return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
	}

	this.calcMaxDistance = function (coords, c) {
		var max = 0;
		for (var i in coords) {
			var len = this.calcDistance(coords[i], c);
			if (len > max) max = len;
		}
		return max;
	}

	this.findNearest = function (peoples, index, n) {
		var result = [];
		var left = index - 1;
		var right = index + 1;
		var i = 0;
		do {
			var distance = [];
			if (left > 0 || (left == 0 && left != index)) {
				var ld = this.calcDistance(peoples[left], peoples[index]);
				distance.push(peoples[index].x - peoples[left].x);
			} else ld = null;
			if (right < peoples.length || (right == peoples.length - 1 && right != index)) {
				var rd = this.calcDistance(peoples[right], peoples[index]);
				distance.push(peoples[right].x - peoples[index].x);
			} else rd = null;
			if (ld == null && rd == null) break;

			i = 0;
			if (ld != null && (rd == null || ld < rd)) {
				while (i < result.length && result[i].distance < ld) i++;
				result.splice(i, 0, {index: left, distance: ld, people: peoples[left]});
				left--;
			} else {
				while (i < result.length && result[i].distance < rd) i++;
				result.splice(i, 0, {index: right, distance: rd, people: peoples[right]});
				right++;
			}
		} while (result.length < n || result[n - 1].distance >= Math.min(distance));

		var result2 = [];
		for (i in result) {
			if (+i >= n) break;
			result2.push(result[i].people);
		}
		return result2;
	}

	result = [];
	var saved = [];
	for (var count = 0; count < helicopters; count++) {
		var info = [];
		for (var i in peoples) {
			var nearest = this.findNearest(peoples, +i, seats - 1);
			nearest.push(peoples[i]);
			var c = this.getCenter(nearest);
			info.push({index: +i, group: nearest, center: c, maxDist: this.calcMaxDistance(nearest, c)});
		}

		info.sort(function (a, b) {
			if (a.maxDist < b.maxDist) return -1;
			if (a.maxDist > b.maxDist) return 1;
			return 0;
		});

		var c = info[0].center;
		var group = [];
		for (j in info[0].group) {
			group.push(+info[0].group[j].index);
			saved.push(+info[0].group[j].index);
		}
		result.push({x: Math.round(c.x), y: Math.round(c.y), people: group});

		peoples = [];
		for (i in inputData.people) {
			if (saved.indexOf(+i) != -1) continue;
			peoples.push({index: +i, x: inputData.people[i].x, y: inputData.people[i].y});
		}
		peoples.sort(compareByX);
	}

	return result;
}