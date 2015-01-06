/**
 * @author Alexey Romanov https://github.com/babruix
 * @type {Phaser.Game}
 */
var game = new Phaser.Game(800, 700, Phaser.CANVAS, 'gameContainer');
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
var lives = 3;
var level = 0;
var score = 0;
var debug = window.location.hash == "#deb";
var towers, background, cursors, fireButton, brickButton, missleButton,
  hearts, shields, protectRect, score_text, lifeGraph, fireGraph, walls,
  bullets, enemy_bullets, missles, ufos, shipTrail;

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
  addWalls();
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

function addWalls() {
  for (i = 1; i < game.width; i = i + 50) {
    new Wall(i, parseInt(game.height / 2 + 250));
  }
}

function addEnemys() {
  var i = 0;
  var enemysBcl = game.time.events.loop(level * Phaser.Timer.SECOND, function () {
    // Generate i=level number of enemys
    //&& enemys.countLiving() < 4
    if (i < level ) {
      var animEnemy = enemysSprites[parseInt(Math.random() * enemysSprites.length)];
      var enemy = new Enemy(0, 0, animEnemy.name, animEnemy.length);
      var param = {
        x: parseInt(Math.random() * game.height),
        y: parseInt(Math.random() * game.width)
      };
      param.countBricks = 1;
      Tower.prototype.addWall(param);
    } else {
      enemysBcl = null;
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
  if (score_text == undefined) {
    score_text = game.add.text(10, game.height - 30, str, style);
  }
  else {
    score_text.setText(str);
  }


  // Take life
  if (health <= 2) {
    towers.children[0].health = 10;
    updateScore(true);
    updateScoreText();
  }

  // Draw a life rectangle
  if (lifeGraph == undefined) {
    //lifeGraph.destroy();
    lifeGraph = game.add.graphics(0, 0);
    lifeGraph.beginFill(0x03660D);
  }
  lifeGraph.clear();
  lifeGraph.drawRect(10, game.height - 60, health * 15, 10);
  lifeGraph.update();

  // Draw a fireTime rectangle
  if (fireGraph == undefined) {
    fireGraph = game.add.graphics(0, 0);
    fireGraph.beginFill(0xFFFFFF);
  }
  if (towers && towers.children && towers.children[0] != undefined && towers.children[0].fireTime > 0) {
    fireGraph.clear();
    fireGraph.drawRect(10, game.height - 90, 300 - towers.children[0].fireTime, 10);
    fireGraph.update();
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