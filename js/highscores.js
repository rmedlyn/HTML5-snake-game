MyGame.screens['high-scores'] = (function(game) {
	'use strict';
	
	function initialize() {
		document.getElementById('id-high-scores-back').addEventListener(
			'click',
			function() { game.showScreen('main-menu'); });
	}
	
	function run() {
		//
		// I know this is empty, there isn't anything to do.
		let highScores = localStorage.getItem('snakeHighScores');
		let scoresHTML = '';
		if (highScores) {
			highScores = JSON.parse(highScores);
			for (const score of highScores) {
				scoresHTML += `<li>${score}</li>`;
			}
		} else {
			scoresHTML = 'No Scores to display. <br>Play a game!';
		}
		let scoreList = document.getElementById('high-score-list');
		scoreList.innerHTML = scoresHTML;
	}
	
	return {
		initialize : initialize,
		run : run
	};
}(MyGame.game));
