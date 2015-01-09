SpaceGame.GameOver = function(game){ };
SpaceGame.GameOver.prototype = {
  create : function(){
    game.audio.gameOverSnd = game.add.audio('gameOver', 1);
    game.audio.gameOverSnd.play();
    // place the assets and elements in their initial positions, create the state
    this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };
    SpaceGame._restartText = this.add.text(game.width/2, -100, "GAME OVER! \n try again?", this._fontStyle);
    SpaceGame._restartText.anchor.setTo(0.5,0.5);
    this.add.tween(SpaceGame._restartText).to({
      y: game.height/2
    }, 1000, Phaser.Easing.Bounce.Out, true, 0, 0);

    // Init score
    SpaceGame._scoreText = undefined;
    SpaceGame._lifeGraph = undefined;
    SpaceGame._fireGraph = undefined;
  },
  update : function(){
    // game loop goes here
    if (game.input.activePointer.isDown) {
      lives = 3;
      level = 0;
      score = 0;
      game.state.start('Main');
    }
  }
};