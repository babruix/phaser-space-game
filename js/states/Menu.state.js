SpaceGame.Menu = function (game) {
};
SpaceGame.Menu.prototype = {

  create: function () {
    SpaceGame._anim_elem = document.getElementById('anim_elem');

    this._background = game.add.tileSprite(0, 0, getWidth() * 4, 800, 'background');
    this._background.alpha = 1;
    this._fontStyle = {
      font: "70px eater",
      fill: "#FFCC00",
      stroke: "#333",
      strokeThickness: 5,
      align: "center"
    };

    this.addGameTitleText();
    this._fontStyle.font = '50px eater';
    this.addButtonStart();
    this.addButtonTutorial();

    // uncomment to start immediately...
    // level=15;
    // game.state.start('Main');

    var particleSystem1 = SpaceGame.epsyPlugin.loadSystem(SpaceGame.epsyPluginConfig.circles, game.width / 2, 50);
    // Add the particle system to _circlesGroup group
    this._circlesGroup = game.add.group();
    this._circlesGroup.add(particleSystem1);
  },

  addGameTitleText: function () {
    this._startText = this.add.text(game.width / 2, game.height, "-[ FARTING ALIENS ]-", this._fontStyle);
    this._startText.anchor.setTo(0.5, 0.5);
    this.add.tween(this._startText).to({
      y: (game.height - 250) / 2
    }, 1000, Phaser.Easing.Circular.Out, true, 50, 0);
  },

  addButtonStart: function () {
    this._buttonStart = game.add.text(game.width / 2, -143, "Play game", this._fontStyle);
    this._buttonStart.anchor.setTo(0.5, 0.5);
    this._buttonStart.inputEnabled = true;
    this._buttonStart.input.useHandCursor = true;
    this.add.tween(this._buttonStart).to({
      y: game.height / 2 + 70
    }, 1000, Phaser.Easing.Bounce.Out, true, 500, 0);
    this._buttonStart.events.onInputOver.add(function (item) {
      item.fill = "#ffff44";
    }, this);
    this._buttonStart.events.onInputOut.add(function (item) {
      item.fill = this._fontStyle.fill;
    }, this);

    this._buttonStart.events.onInputDown.add(this.startGame, this);
  },

  addButtonTutorial: function () {
    this._textStartTutorial = this.add.text(game.width / 2, -100, "Tutorial", this._fontStyle);
    this._textStartTutorial.anchor.setTo(0.5, 0.5);
    this.add.tween(this._textStartTutorial).to({
      y: ((game.height - 250) / 2) + 300
    }, 1000, Phaser.Easing.Bounce.Out, true, 1000, 0);
    this._textStartTutorial.inputEnabled = true;
    this._textStartTutorial.input.useHandCursor = true;
    this._textStartTutorial.events.onInputOver.add(function (item) {
      item.fill = "#ffff44";
    }, this);
    this._textStartTutorial.events.onInputOut.add(function (item) {
      item.fill = this._fontStyle.fill;
    }, this);

    this._textStartTutorial.events.onInputDown.add(function (item) {
      game.state.start('Tutorial');
    }, this);
  },

  startGame: function () {

    // Start game
    SpaceGame.transitionPlugin.to('Main');
  }
};