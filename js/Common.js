/**
 * @author Alexey Romanov
 * https://github.com/babruix
 */

var game = new Phaser.Game(800, 700, Phaser.CANVAS, 'gameContainer');
var debug = window.location.hash == "#deb";
var enemysSprites = [
  {'name': 'duck', 'length': 8},
  {'name': 'panda', 'length': 3},
  {'name': 'dog', 'length': 6},
  {'name': 'penguin', 'length': 4},
  {'name': 'alian', 'length': 9},
  {'name': 'bazyaka', 'length': 80},
  {'name': 'cat', 'length': 1}
];
game.audio = {};
game.state.add('Main',SpaceGame.Main);
game.state.add('Menu',SpaceGame.Menu);
game.state.add('GameOver',SpaceGame.GameOver);
game.state.start('Menu');

/**
 * Common functions
 */

function nextLevel() {
  level++;
  Tower.prototype.addToPoint(400, 400);
  showLevelTitle.call(this);
  updateScoreText();
  //addWalls();
  addRndBricks();
  addEnemys();
}

function showLevelTitle() {
  var style = {
    font: "60px Tahoma",
    fill: "#FFFFFF",
    align: "center"
  };
  var levelText = game.add.text(game.width / 2, game.height / 2, 'Level ' + level, style);
  levelText.x = game.width / 2 - levelText.width / 2;
  levelText.y = game.height / 2 - levelText.height / 2;
  var level_tween = game.add.tween(levelText)
    .to({
      y: 0, alpha: 0
    }, 1000 /*duration of the tween (in ms)*/,
    Phaser.Easing.Circular.In /*easing type*/,
    true /*autostart?*/,
    1000 /*delay*/);

  level_tween.onComplete.add(function () {
    levelText.destroy();
    levelText = null;
    level_tween = null;
  }, this);
}

function levelCompleted() {
  game.audio.completedSnd.play();

  var style = {
    font: "60px Tahoma",
    fill: "#FFFFFF",
    align: "center"
  };
  var levelText = game.add.text(game.width / 2, game.height / 2, 'Level Completed!', style);
  levelText.x = game.width / 2 - levelText.width / 2;
  levelText.y = game.height / 2 - levelText.height / 2;
  var level_tween = game.add.tween(levelText)
    .to({alpha: 0
    }, 1000 /*duration of the tween (in ms)*/,
    Phaser.Easing.Circular.In /*easing type*/,
    true /*autostart?*/,
    1000 /*delay*/);

  level_tween.onComplete.add(function () {
    levelText.destroy();
    levelText = null;
    level_tween = null;
    game.state.start('Main');
    // Init score
    SpaceGame._scoreText = undefined;
    SpaceGame._lifeGraph = undefined;
    SpaceGame._fireGraph = undefined;
  }, this);
}

function addWalls() {
  for (var i = 1; i < game.width; i = i + 50) {
    new Wall(i, parseInt(game.height / 2 + 250));
  }
}

function addRndBricks() {
  for (var i = 1; i < level*5; i++) {
    new Wall(game.rnd.integerInRange(0,game.width), game.rnd.integerInRange(0,game.height));
  }
}

function addEnemys() {
  var i = 0;
  SpaceGame._allEnemysAdded = false;
  var enemysBcl = game.time.events.loop(level * Phaser.Timer.SECOND, function () {
    // Generate i=level number of enemys
    //&& enemys.countLiving() < 4
    if (i < level ) {
      var animEnemy = enemysSprites[game.rnd.integerInRange(0, enemysSprites.length-1)];
      var enemy = new Enemy(0, 0, animEnemy.name, animEnemy.length);
      var param = {
        x: parseInt(game.rnd.integerInRange(0, game.width)),
        y: parseInt(game.rnd.integerInRange(0, game.height))
      };
      param.countBricks = 1;
      Tower.prototype.addWall(param);
    } else {
      enemysBcl = null;
      SpaceGame._allEnemysAdded = true;
    }
    i++;
  });
}

function generateHeart() {
  new Heart();
}
function generateShield() {
  new Shield();
}
function generateBrick() {
  new Brick();
}
function generateMissle() {
  new Missle();
}

function updateScoreText() {
  var style = {font: "17px Arial", fill: "#FFFFFF", align: "center"};
  var str = " Lives: " + lives + "  Level: " + level + "  $: " + score;
  var health = 10;
  if (towers && towers.children && typeof towers.children[0] != "undefined") {
    str += "  Bricks: " + towers.children[0].countBricks;
    //str+= "  Shield: " + towers.children[0].shieldPower + "%";
    str+= "  Missles: " + towers.children[0].missles + "";
    health = towers.children[0].health;
  }
  if (SpaceGame._scoreText == undefined) {
    SpaceGame._scoreText = game.add.text(10, game.height - 30, str, style);
  }
  else {
    SpaceGame._scoreText.setText(str);
  }


  // Take life
  if (health <= 2) {
    towers.children[0].health = 10;
    updateScore(true);
    updateScoreText();
  }

  // Draw a life rectangle
  if (SpaceGame._lifeGraph == undefined) {
    //SpaceGame._lifeGraph.destroy();
    SpaceGame._lifeGraph = game.add.graphics(0, 0);
    SpaceGame._lifeGraph.beginFill(0x03660D);
  }
  SpaceGame._lifeGraph.clear();
  SpaceGame._lifeGraph.drawRect(10, game.height - 40, health * 15, 10);
  SpaceGame._lifeGraph.update();

  // Draw a fireTime rectangle
  if (SpaceGame._fireGraph == undefined) {
    SpaceGame._fireGraph = game.add.graphics(0, 0);
    SpaceGame._fireGraph.beginFill(0xFFFFFF);
  }
  if (towers && towers.children && towers.children[0] != undefined && towers.children[0].fireTime > 0) {
    SpaceGame._fireGraph.clear();
    SpaceGame._fireGraph.drawRect(10, game.height - 60, 300 - towers.children[0].fireTime, 10);
    SpaceGame._fireGraph.update();
  }

  // Respawn dead player
  if (towers && towers.children && !towers.children[0].alive) {
    towers.children[0].destroy();
    Tower.prototype.addToPoint(400, 400);
  }
}

function updateScore($lifeLost) {
  if ($lifeLost == true) {
    lives--;
    score -= 10;
  }
  else {
    score += 10;
    if (towers && towers.children[0] && towers.children[0].fireTime > 100) {
      towers.children[0].fireTime -= 20;
    }
  }
  updateScoreText();
  if (lives < 0) {
    game.state.start('GameOver');
  }
}