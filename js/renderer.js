// ------------------------------------------------------------------
//
//
// ------------------------------------------------------------------

MyGame.graphics = (function() {
	'use strict';
	
	var canvas = document.getElementById('canvas-main'),
		context = canvas.getContext('2d');
	
	let gridSize = 50,
		borderColor = '#000000';

	function deepCopy(obj) {
		return JSON.parse(JSON.stringify(obj));
	}

	//
	// Place a 'clear' function on the Canvas prototype, this makes it a part
	// of the canvas, rather than making a function that calls and does it.
	CanvasRenderingContext2D.prototype.clear = function() {
		this.save();
		this.setTransform(1, 0, 0, 1, 0, 0);
		this.clearRect(0, 0, canvas.width, canvas.height);
		this.restore();
	};
	
	//------------------------------------------------------------------
	//
	// Public method that allows the client code to clear the canvas.
	//
	//------------------------------------------------------------------
	function clear() {
		context.clear();
	}

	function drawSquare(position, color) {
		let width = canvas.width/gridSize;
		context.fillStyle = color;
		context.strokeStyle = borderColor;
		let xStart = position.x * width;
		let xEnd = width;
		let yStart = position.y * width;
		let yEnd = width;
		context.fillRect(xStart + 1, yStart + 1, xEnd - 2, yEnd - 2);
		context.strokeRect(xStart, yStart, xEnd, yEnd);
	}

	function getRandomCell() {
		return Math.floor(Math.random() * gridSize);
	}

	function intersectsWall(position) {
		return position.x < 0 || position.x > gridSize - 1 || position.y < 0 || position.y > gridSize - 1;
	}

	//- 2-----------------------------------------------------------------
	//
	// This is used to create a ball object that can be used by client
	// code for rendering.
	//
	//------------------------------------------------------------------
	function Snake(spec, obstacles, food) {
		let that = {},
			elapsedSinceUpdate = 0,
			addSegments = false,
			segmentsAdded = 0,
			gameOver = false;
		
			
		that.reset = () => {
			spec.direction = '';
			spec.snake = [];
			let position = {
				x: getRandomCell(),
				y: getRandomCell()
			};
			const foodPos = food.getPosition();
			while (obstacles.intersectsObstacle(position) || (foodPos.x == position.x && foodPos.y == position.y)) {
				position = {
					x: getRandomCell(),
					y: getRandomCell()
				};
			}
			spec.snake.push(position);
		};

		that.reset();

		that.setDirLeft = () => {
			if (spec.direction != 'left' && spec.direction != 'right') {
				spec.direction = 'left';
			}
		};

		that.setDirRight = () => {
			if (spec.direction != 'left' && spec.direction != 'right') {
				spec.direction = 'right';
			}
		};

		that.setDirUp = () => {
			if (spec.direction != 'up' && spec.direction != 'down') {
				spec.direction = 'up';
			}
		};

		that.setDirDown = () => {
			if (spec.direction != 'up' && spec.direction != 'down') {
				spec.direction = 'down';
			}
		};

		function snakeCollision(position) {
			for (let i = 0; i < spec.snake.length - 1; i++) {
				const segment = spec.snake[i];
				if (position.x == segment.x && position.y == segment.y) return true;
				
			}
			
			return false;
		}
		
		that.update = function(elapsedTime) {
			elapsedSinceUpdate += elapsedTime;
			if (elapsedSinceUpdate >= spec.moveRate) {
				elapsedSinceUpdate -= spec.moveRate;
				const headPos = spec.snake[spec.snake.length - 1];
				const foodPos = food.getPosition();
				if (snakeCollision(headPos) || obstacles.intersectsObstacle(headPos) || intersectsWall(headPos)) {
					gameOver = true;
					return;
				}
				if (headPos.x == foodPos.x && headPos.y == foodPos.y) {
					food.reset();
					segmentsAdded = 0;
					addSegments = true;
				}
				if (spec.direction == 'left') {
					spec.snake.push({
						x: headPos.x - 1,
						y: headPos.y
					});
				} else if (spec.direction == 'right') {
					spec.snake.push({
						x: headPos.x + 1,
						y: headPos.y
					});
				} else if (spec.direction == 'up') {
					spec.snake.push({
						x: headPos.x,
						y: headPos.y - 1
					});
				} else if (spec.direction == 'down') {
					spec.snake.push({
						x: headPos.x,
						y: headPos.y + 1
					});
				}

				
				if (spec.direction) {
					if (!addSegments) {
						spec.snake.shift();
					} else {
						segmentsAdded++;
						if (segmentsAdded >= 3) {
							addSegments = false;
						}
					}
				}
			}
		};
		
		that.draw = function() {
			for (const segment of spec.snake) {
				drawSquare(segment, spec.color);
			}
		};

		that.getLength = () => {
			return spec.snake.length;
		};
		
		that.gameOver = () => gameOver;

		that.saveHighScores = () => {
			let highScores = localStorage.getItem('snakeHighScores');
			if (highScores) {
				highScores = JSON.parse(highScores);
				let i;
				for (i = 0; i < highScores.length; i++) {
					const curr = highScores[i];
					if (spec.snake.length > curr) {
						highScores.splice(i, 0, spec.snake.length);
						break;
					}
				}
				if (highScores[i] != spec.snake.length) highScores.push(spec.snake.length);
				if (highScores.length > 5)
					highScores.length = 5;
			} else {
				highScores = [];
				highScores.push(spec.snake.length);
			}
			localStorage.setItem('snakeHighScores', JSON.stringify(highScores));
		};

		return that;
	}
	
	function Obstacles(spec) {
		let that = {};
		
		that.intersectsObstacle = (position) => {
			for (let obstacle of spec.obstacles) {
				if (obstacle.position.x == position.x && obstacle.position.y == position.y) return true;
			}
			return false;
		};

		that.reset = () => {
			spec.obstacles = [];
	
			for (let i = 0; i < 15; i++) {
				let position = {
					x: getRandomCell(),
					y: getRandomCell()
				};
				while (that.intersectsObstacle(position)) {
					position = {
						x: getRandomCell(),
						y: getRandomCell()
					};
				}
				spec.obstacles[i] = {
					position: position
				};
			}
		};

		that.reset();

		that.draw = () => {
			for (let obstacle of spec.obstacles) {
				drawSquare(obstacle.position, spec.color);
			}
		};

		return that;
	}

	function Food(spec, obstacles) {
		let that = {};

		that.reset = () => {
			let position = {
				x: getRandomCell(),
				y: getRandomCell()
			};
			while (obstacles.intersectsObstacle(position)) {
				position = {
					x: getRandomCell(),
					y: getRandomCell()
				};
			}
			spec.position = position;
		};

		that.reset();

		that.getPosition = () => spec.position;

		that.draw = () => {
			drawSquare(spec.position, spec.color);
		};

		return that;
	}

	function overlayTranslucentLayer() {
		context.fillStyle = 'rgba(255, 255, 255, 0.75)';
		context.fillRect(0, 0, canvas.width, canvas.height);
	}

	function renderCountdown(num) {
		overlayTranslucentLayer();
		context.fillStyle = '#000000';
		context.font = '60px sans-serif';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText(num, canvas.width/2, canvas.height/2);
	}
	
	function renderGameOver(score) {
		overlayTranslucentLayer();
		context.fillStyle = '#000000';
		context.font = '100px sans-serif';
		context.textAlign = 'center';
		context.textBaseline = 'middle';
		context.fillText('Game Over', canvas.width/2, canvas.height/4);
		context.font = '60px sans-serif';
		context.fillText(`Score: ${score}`, canvas.width/2, canvas.height/2);
	}

	function stroke() {
		context.stroke();
	}

	return {
		clear : clear,
		Snake : Snake,
		Obstacles: Obstacles,
		Food: Food,
		drawSquare: drawSquare,
		renderCountdown: renderCountdown,
		renderGameOver: renderGameOver,
		stroke: stroke
	};
}());
