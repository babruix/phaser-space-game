SpaceGame.GameOver = function(game){ };
SpaceGame.GameOver.played = false;
SpaceGame.GameOver.prototype = {
  create : function(){
    // place the assets and elements in their initial positions, create the state
    this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };
    SpaceGame._restartText = this.add.text(game.width/2, game.height/2, "GAME OVER!\nclick anywhere to restart", this._fontStyle);
    SpaceGame._restartText.anchor.setTo(0.5,0.5);
    game.audio.gameOverSnd = game.add.audio('gameOver', 1);
    // Init score
    SpaceGame._scoreText = undefined;
    SpaceGame._lifeGraph = undefined;
    SpaceGame._fireGraph = undefined;
  },
  update : function(){
    if (!SpaceGame.GameOver.played) {
      game.audio.gameOverSnd.play();
      SpaceGame.GameOver.played = true;
    }
    // game loop goes here
    if (game.input.activePointer.isDown) {
      lives = 3;
      level = 0;
      score = 0;
      game.state.start('Main');
    }
  }
};