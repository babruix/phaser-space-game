SpaceGame.GameOver = function(game){ };
SpaceGame.GameOver.played = false;
SpaceGame.GameOver.prototype = {
  preload : function(){
    // load basic assets for this state
    game.load.audio('gameOver', ['assets/audio/game-over.wav']);
  },
  create : function(){
    // place the assets and elements in their initial positions, create the state
    this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };
    SpaceGame._restartText = this.add.text(game.width/2-250, game.height/2-50, "Game Over! Click to restart", this._fontStyle);
    game.audio.gameOverSnd = game.add.audio('gameOver', 1);
    // Init score
    score_text = undefined;
    lifeGraph = undefined;
    fireGraph = undefined;
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
}