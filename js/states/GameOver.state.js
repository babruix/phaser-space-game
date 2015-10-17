SpaceGame.GameOver = function(game){ };
SpaceGame.GameOver.prototype = {
  create : function(){
    game.audio.gameOverSnd = game.add.audio('gameOver', 1);
    game.audio.gameOverSnd.play();

    // place game screenshot.
    var data = new Image();
    data.src = SpaceGame.canvasDataURI;
    game.cache.addImage('image-data', SpaceGame.canvasDataURI, data);
    var image = game.add.image(0, 0, 'image-data');

    var message  = "GAME OVER! \n try again?";
    if (!SpaceGame._flowerPlants.countLiving()) {
      message = "all flowers are stolen \n" + message;
    }
    // place the assets and elements in their initial positions, create the state
    this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };

    SpaceGame._restartText = this.add.text(game.width/2, -100, message, this._fontStyle);
    SpaceGame._restartText.anchor.setTo(0.5,0.5);
    this.add.tween(SpaceGame._restartText).to({
      y: game.height/2
    }, 1000, Phaser.Easing.Bounce.Out, true, 0, 0);

    // Init score
    SpaceGame._scoreText = undefined;
    SpaceGame._lifeGraph = undefined;
    SpaceGame._fireGraph = undefined;
  },
  update : function() {
    // game loop goes here
    if (game.input.activePointer.isDown) {
      lives = 3;
      level = 0;
      score = 0;
      game.state.start('Main');
    }
  }
};