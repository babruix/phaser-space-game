SpaceGame.Menu = function(game){ };
SpaceGame.Menu.prototype = {
  preload : function(){
    // load basic assets for this state
  },
  create : function(){
    // place the assets and elements in their initial positions, create the state
    this._fontStyle = { font: "40px Arial", fill: "#FFCC00", stroke: "#333", strokeThickness: 5, align: "center" };
    SpaceGame._startText = this.add.text(game.width/2-120, game.height/2-50, "Click to start", this._fontStyle);

  },
  update : function(){
    // game loop goes here
    if (game.input.activePointer.isDown) {
      game.state.start('Main');
    }
  }
}