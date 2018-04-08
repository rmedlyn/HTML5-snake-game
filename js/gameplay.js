MyGame.screens['game-play'] = (function(game, graphics, input) {
	'use strict';
	
	var //mouseCapture = false,
		myMouse = input.Mouse(),
		myKeyboard = input.Keyboard(),
		// myTexture = null,
		mySnake = null,
		myObstacles = null,
		myFood = null,
		cancelNextRequest = false,
		lastTimeStamp,
		gamestate = null,
		update = null,
		countdownTime,
		countdownDisplay = '3', 
		prevState = '',
		reset = false;
	
	function initialize() {
		console.log('game initializing...');

		let canvas = document.getElementById('canvas-main');
		const numCells = 50;
		let squareWidth = canvas.width / numCells;
		
		myObstacles = graphics.Obstacles({
			color: '#00FF00'
		});
		
		myFood = graphics.Food({
			color: 'rgb(255, 165, 0)'
		}, myObstacles);

		mySnake = graphics.Snake({
			moveRate: 150,
			color: '#FFFFFF'
		}, myObstacles, myFood);
		
		//
		// Create the keyboard input handler and register the keyboard commands
		myKeyboard.registerCommand(KeyEvent.DOM_VK_A, mySnake.setDirLeft);
		myKeyboard.registerCommand(KeyEvent.DOM_VK_D, mySnake.setDirRight);
		myKeyboard.registerCommand(KeyEvent.DOM_VK_W, mySnake.setDirUp);
		myKeyboard.registerCommand(KeyEvent.DOM_VK_S, mySnake.setDirDown);
		myKeyboard.registerCommand(KeyEvent.DOM_VK_E, mySnake.setDirRight); // Needed for Dvorak
		myKeyboard.registerCommand(KeyEvent.DOM_VK_COMMA, mySnake.setDirUp); // Needed for Dvorak
		myKeyboard.registerCommand(KeyEvent.DOM_VK_O, mySnake.setDirDown); // Needed for Dvorak
		myKeyboard.registerCommand(KeyEvent.DOM_VK_LEFT, mySnake.setDirLeft);
		myKeyboard.registerCommand(KeyEvent.DOM_VK_RIGHT, mySnake.setDirRight);
		myKeyboard.registerCommand(KeyEvent.DOM_VK_UP, mySnake.setDirUp);
		myKeyboard.registerCommand(KeyEvent.DOM_VK_DOWN, mySnake.setDirDown);
		myKeyboard.registerCommand(KeyEvent.DOM_VK_ESCAPE, function() {
			//
			// Stop the game loop by canceling the request for the next animation frame
			cancelNextRequest = true;
			//
			// Then, return to the main menu
			game.showScreen('main-menu');	
		});
	}

	function updateGame(elapsedTime) {
		myKeyboard.update(elapsedTime);
		myMouse.update(elapsedTime);

		mySnake.update(elapsedTime);
		
		if (mySnake.gameOver()) {
			gamestate = 'game-over';
			mySnake.saveHighScores();
		}

	}

	function updateCountdown(elapsedTime) {
		countdownTime += elapsedTime;
		if (countdownTime > 3000) {
			gamestate = 'play';
		} else if (countdownTime > 2000) {
			countdownDisplay = '1';
		} else if (countdownTime > 1000) {
			countdownDisplay = '2';
		} else {
			countdownDisplay = '3';
		}
	}

	function updateGameOver(elapsedTime) {
		myKeyboard.update(elapsedTime);
	}
	
	function render() {
		graphics.clear();
		myObstacles.draw();
		myFood.draw();
		mySnake.draw();
		// myFood.draw();
		if (gamestate == 'countdown') {
			graphics.renderCountdown(countdownDisplay);
		}
		if (gamestate == 'game-over') {
			graphics.renderGameOver(mySnake.getLength());
		}
		graphics.stroke();
	}
	
	//------------------------------------------------------------------
	//
	// This is the Game Loop function!
	//
	//------------------------------------------------------------------
	function gameLoop(time) {

		if (gamestate == 'countdown') {
			if (prevState != 'countdown') countdownTime = 0;
			update = updateCountdown;
		}
		else if (gamestate == 'play') {
			update = updateGame;
		} else {
			update = updateGameOver;
		}

		prevState = gamestate;
		
		update(time - lastTimeStamp);
		lastTimeStamp = time;
		
		render();

		if (!cancelNextRequest) {
			requestAnimationFrame(gameLoop);
		}
	}
	
	function run() {
		myFood.reset();
		myObstacles.reset();
		mySnake.reset();

		lastTimeStamp = performance.now();

		gamestate = 'countdown';
		//
		// Start the animation loop
		cancelNextRequest = false;
		// resetMyBall();
		requestAnimationFrame(gameLoop);
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(MyGame.game, MyGame.graphics, MyGame.input));
