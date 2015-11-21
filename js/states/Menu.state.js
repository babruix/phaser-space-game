SpaceGame.Menu = function(game){ };
SpaceGame.Menu.prototype = {
 create: function() {
    SpaceGame._anim_elem = document.getElementById('anim_elem');

    this._background = game.add.tileSprite(0, 0, getWidth()*4, 800, 'background');
    this._background.alpha = 1;
      
    this._buttonStart = game.add.button((game.width-401)/2, -143,
      'button-start', this.startGame, this, 1, 0, 2);
    this._buttonStart.input.useHandCursor = true;
    this.add.tween(this._buttonStart).to({
      y: (game.height-143)/2
    }, 1000, Phaser.Easing.Bounce.Out, true, 1000, 0);

    // place the assets and elements in their initial positions, create the state
    this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };
    this._startText = this.add.text(game.width/2, game.height, "-[ SPACE ANIMALS ]-", this._fontStyle);
    this._startText.anchor.setTo(0.5,0.5);
    this.add.tween(this._startText).to({
      y: (game.height-250)/2
    }, 1000, Phaser.Easing.Circular.Out, true, 50, 0);

    // to start immediately...
    //level=5;
    //game.state.start('Main');

   var particleSystem1 = SpaceGame.epsyPlugin.loadSystem(SpaceGame.epsyPluginConfig.galaxy, game.width / 2, 50);
   // let Phaser add the particle system to world group or choose to add it to a specific group
   this.myGroup = game.add.group();
   this.myGroup.add(particleSystem1);

  },
  startGame: function() {

    // Start game
    SpaceGame.transitionPlugin.to('Main');
  }
};