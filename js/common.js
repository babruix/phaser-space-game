/**
 * @author Alexey Romanov
 * https://github.com/babruix
 */

var game = new Phaser.Game(getWidth(), 800, Phaser.CANVAS);
var debug = window.location.hash == "#deb";

game.audio = {};
game.state.add('Boot', SpaceGame.Boot);
game.state.add('Preloader', SpaceGame.Preloader);
game.state.add('Menu', SpaceGame.Menu);
game.state.add('Main', SpaceGame.Main);
game.state.add('GameOver', SpaceGame.GameOver);
game.state.start('Boot');

/**
 * Common functions
 */

function showLevelTitle() {
  var style = {
    font: "60px Tahoma",
    fill: "#FFFFFF",
    align: "center"
  };
  var levelText = game.add.text(0, 0, 'Level ' + level, style);
  levelText.x = game.width / 2 - levelText.width / 2;
  levelText.y = -levelText.height;
  levelText.alpha = 0;

  // Animate
  game.add.tween(levelText)
    .to({alpha: 1, y: game.height / 2 - levelText.height / 2},
      1000 /*duration (in ms)*/,
      Phaser.Easing.Bounce.Out /*easing type*/,
      true /*autostart?*/)
    .onComplete.add(function () {
    game.add.tween(levelText)
      .to({y: -levelText.height, alpha: 0},
        1000 /*duration (in ms)*/,
        Phaser.Easing.Bounce.In /*easing type*/,
        true /*autostart?*/,
        2000 /*delay*/)
      .onComplete.add(function () {
      levelText.destroy();
    })
  }, this);
}

function levelCompleted() {
  lives++;
  game.audio.completedSnd.play();

  var style = {
    font: "60px Tahoma",
    fill: "#FFFFFF",
    stroke: "#CCCCCC",
    align: "center",
    strokeThickness: 1
  };
  var levelText = game.add.text(0, 0, 'Level Completed!', style);
  levelText.x = game.width / 2 - levelText.width / 2;
  levelText.y = -levelText.height / 2;
  levelText.alpha = 0;

  // Animate
  game.add.tween(levelText)
    .to({alpha: 1, y: game.height / 2 - levelText.height / 2},
      1000 /*duration (in ms)*/,
      Phaser.Easing.Bounce.Out /*easing type*/,
      true /*autostart?*/)
    .onComplete.add(function () {
    SpaceGame.Main.prototype.animateScore(true);
    game.add.tween(levelText)
      .to({y: -levelText.height / 2, alpha: 0},
        1000 /*duration (in ms)*/,
        Phaser.Easing.Bounce.In /*easing type*/,
        true /*autostart?*/,
        1000 /*delay*/)
      .onComplete.add(function () {
      levelText.destroy();
      if (towers && towers.children && typeof towers.children[0] != 'undefined') {
        SpaceGame._playerShield = towers.children[0].shieldPower;
        SpaceGame._playerBricks = towers.children[0].countBricks;
        SpaceGame._playerMissles = towers.children[0].missles;
      }
      SpaceGame.transitionPlugin.to('Main');
      // Init score
      SpaceGame._scoreText = undefined;
      SpaceGame._fireGraph = undefined;
    }, this);
  }, this);
}

function addWalls() {
  for (var i = 1; i < game.width; i = i + 50) {
    new Wall(i, parseInt(game.height / 2 + 250));
  }
}

function addRndBricks() {
  for (var i = 1; i < level * 3; i++) {
    new Wall(game.rnd.integerInRange(0, game.width), game.rnd.integerInRange(0, game.height));
  }
}

function updateScoreText() {
  var style = {font: '17px Arial', fill: '#0048D8', align: 'left'};
  var str = "  Lives: " + lives
    + " \n  Flowers: " + SpaceGame._flowerPlants.countLiving()
    + " \n  Level: " + level
    + " \n  $: " + score;
  if (towers && towers.children && typeof towers.children[0] != "undefined") {
    str += "\n  Bricks: " + towers.children[0].countBricks;
    str += "\n  Missles: " + towers.children[0].missles + "";
    str += "\n  Bullets: " + towers.children[0].bullets + "";
    str += "\n  Fuel: " + towers.children[0].fuel + "";
  }
  if (SpaceGame._scoreText == undefined) {
    SpaceGame._scoreText = game.add.text(game.width-150, game.height - 220, str, style);
    SpaceGame._UiGroup.add(SpaceGame._scoreText);
  }
  else {
    SpaceGame._scoreText.setText(str);
  }

  // Respawn dead player
  if (towers && towers.children && !towers.children[0].alive) {
    towers.children[0].destroy();
    Tower.prototype.addToPoint(400, 400);
  }
}

function updateScore(losingLife) {
  if (losingLife == true) {
    lives--;
    score -= 10;
  }
  else {
    score += 10;
  }
  updateScoreText();
  if (lives < 0) {
    // save game screenshot.
    SpaceGame.canvasDataURI = game.canvas.toDataURL();
    game.time.events.add(Phaser.Timer.SECOND * 2, SpaceGame.GameOverTransition, this).autoDestroy = true;
  }
}

function getWidth() {
  if (self.innerHeight) {
    return self.innerWidth;
  }

  if (document.documentElement && document.documentElement.clientHeight) {
    return document.documentElement.clientWidth;
  }

  if (document.body) {
    return document.body.clientWidth;
  }
}

function getHeight() {
  if (self.innerHeight) {
    return self.innerHeight;
  }

  if (document.documentElement && document.documentElement.clientHeight) {
    return document.documentElement.clientHeight;
  }

  if (document.body) {
    return document.body.clientHeight;
  }
}

function caculatetDistance(sprite1, sprite2) {
  var a = sprite1.x - sprite2.x;
  var b = sprite1.y - sprite2.y;
  return Math.sqrt(a * a + b * b);
}