function buildInputData(seats, peopleCount) {
	var i, people = [];
	for (i = 0; i < peopleCount; i++) {
		people.push({x: getRandomCoordinate(), y: getRandomCoordinate()});
	}
	return {seats: seats, people: people};
}

function getRandomCoordinate() {
	return Math.floor(Math.random() * 10000) + 1;
}

function checkResult(inputData, outputData) {
	var i, j, index, item, optimalCount, people = [];
	function assert(condition, msg) {
		if ( !condition ) {
			throw msg;
		}
	}
	try {
		// check number of helicopters
		optimalCount = Math.ceil(inputData.people.length / inputData.seats);
		assert(optimalCount === outputData.length, "Not optimal number of helicopters " + outputData.length);

		// check helicopter one by one
		for (i = 0; i < outputData.length; i++) {
			item = outputData[i];
			// check coordinates
			assert(item.x === Math.floor(item.x), "Not integer X coordinate " + item.x);
			assert(item.y === Math.floor(item.y), "Not integer Y coordinate " + item.y);
			assert(item.x >= 0, "Negative X coordinate " + item.x);
			assert(item.y >= 0, "Negative Y coordinate " + item.y);

			// check unique of people
			for (j = 0; j < item.people.length; j++) {
				index = item.people[j];
				assert((index >= 0 && index < inputData.people.length), "Wrong index: " + index);
				assert(!people[index], "The same index twice: " + index);
				people[index] = true;
			}
		}
		// check people count
		assert(inputData.people.length == people.length, "Mismatch in the number of people: " + people.length);
		for (i = 0; i < people.length; i++) {
			assert(people[i], "Person with index " + i + " not found");
		}

		return true;
	} catch(ex) {
		console.log('Error: ' + ex);
		return false;
	}
}

function calculateResult(inputData, outputData, cb) {
	var i, j, max, item, dd, xOffset, yOffset;
	for (i = 0; i < outputData.length; i++) {
		item = outputData[i];
		//console.log("item " + item);
		for (j = 0; j < item.people.length; j++) {
			xOffset = item.x - inputData.people[item.people[j]].x;
			yOffset = item.y - inputData.people[item.people[j]].y;
			dd = xOffset * xOffset + yOffset * yOffset;
			if ( cb ) {
				cb({
					x1:item.x, y1:item.y,
					x2:inputData.people[item.people[j]].x,
					y2:inputData.people[item.people[j]].y,
					distance: Math.sqrt(dd).toFixed(3)
				});
			}
			//console.log(dd);
			if ( max === undefined || dd > max ) {
				max = dd;
			}
		}
	}
	return Math.sqrt(max).toFixed(3);
}

function drawRoutes(inputData, outputData) {
	var res = calculateResult(inputData, outputData);
	// show fishermen
	var fishmanImage = draw.defs().rect(rectSize, rectSize).attr({ fill: 'black' });
	var people = inputData.people;
	for (var i = 0; i < people.length; i++) {
		var fishman = people[i];
		draw.use(fishmanImage).move(fishman.x, fishman.y);
	}
	// show helicopters
	var helicopterImage = draw.defs()
		.circle(rectSize * 5)
		.fill('none')
		.stroke({
			width: rectSize / 5,
			color: 'green'
		});
	for (i = 0; i < outputData.length; i++) {
		var helicopter = outputData[i];
		draw.use(helicopterImage).move(helicopter.x, helicopter.y);
	}
	// show routes
	calculateResult(inputData, outputData, function(result) {
		var w = 3, color = 'black';
		if ( result.distance == res ) {
			w = 10;
			color = 'red';
		}
		draw.line(result.x1 + rectSize * 2.5, result.y1 + rectSize * 2.5, result.x2 + rectSize/2, result.y2 + rectSize/2)
			.stroke({ width: w, color: color });
	});
}

// TEST YOUR DATA HERE
var rectSize = 50;
draw = SVG('drawing').size(500, 500);
draw.viewbox(0, 0, 10000 + rectSize, 10000 + rectSize);

var input = buildInputData(500, 1000);
//input = {"seats":2,"people":[{"x":1771,"y":5700},{"x":3054,"y":1083},{"x":5351,"y":1776},{"x":6493,"y":1023},{"x":3743,"y":7664},{"x":5803,"y":5174},{"x":9348,"y":1499},{"x":9397,"y":4887},{"x":7912,"y":4689}]};
console.log('Input: ' + JSON.stringify(input));
var output = calcCoordinates(input);
console.log('Output: ' + JSON.stringify(output));
console.log('Check: ' + checkResult(input, output));
var res = calculateResult(input, output);
console.log('Result: ' + res);
drawRoutes(input, output);
