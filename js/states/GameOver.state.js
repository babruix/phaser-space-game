SpaceGame.GameOver = function(game){ };
SpaceGame.GameOver.prototype = {
  init: function () {
    this.score = score || 0;
    this.highestScore = localStorage.getItem('highestScore') || 0;
    this.highestScore = Math.max(this.score, this.highestScore);
    localStorage.setItem('highestScore', this.highestScore);
  },
  create : function() {
    game.audio.gameOverSnd = game.add.audio('gameOver', 1);
    game.audio.gameOverSnd.play();

    // place game screenshot.
    var data = new Image();
    data.src = SpaceGame.canvasDataURI;
    game.cache.addImage('image-data', SpaceGame.canvasDataURI, data);
    var image = game.add.image(0, 0, 'image-data');

    var message  = "GAME OVER! "
      + "\n Your score is " + this.score
      + "\n Highest score is " + this.highestScore
      + "\n press any key to restart";
    if (!SpaceGame._flowerPlants.countLiving() && lives > 0) {
      message = "\n all flowers have been stolen \n" + message;
    }
    // place the assets and elements in their initial positions, create the state
    this._fontStyle = { font: "40px eater", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };

    SpaceGame._restartText = this.add.text(game.width/2, -100, message, this._fontStyle);
    SpaceGame._restartText.anchor.setTo(0.5, 0.5);
    this.add.tween(SpaceGame._restartText).to({
      y: game.height/2
    }, 1000, Phaser.Easing.Bounce.Out, true, 0, 0);

    // Init score
    SpaceGame._scoreText = undefined;
    game.time.events.add(2000, function () {
      game.input.keyboard.onDownCallback = function(e) {
        SpaceGame.GameOver.prototype.startNewGame();
        game.input.keyboard.onDownCallback = null;
      };
    }, this);
  },
  startNewGame: function () {
    // After state change sprites have wrong positions,
    // so just refresh page instead as workaround.
    window.location.reload();

    lives = 3;
    level = 0;
    score = 0;
    SpaceGame.transitionPlugin.to('Main');
  },
  update : function() {
    if (game.input.activePointer.isDown) {
      this.startNewGame();
    }
  }
};