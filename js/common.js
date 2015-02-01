/**
 * @author Alexey Romanov
 * https://github.com/babruix
 */

var game = new Phaser.Game(800, 900, Phaser.CANVAS);
var debug = window.location.hash == "#deb";
var enemySprites = [
  {'name': 'duck', 'length': 8},
  {'name': 'panda', 'length': 3},
  {'name': 'dog', 'length': 6},
  {'name': 'penguin', 'length': 4},
  {'name': 'alian', 'length': 9},
  {'name': 'bazyaka', 'length': 80},
  {'name': 'cat', 'length': 1}
];
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

function nextLevel() {
  level++;
  Tower.prototype.addToPoint(400, 400);
  showLevelTitle();
  updateScoreText();
  addRndBricks();
  //addWalls();
  animateScore();
  addEnemys();

  Brick.prototype.generateBrick();
  game.time.events.add(Phaser.Timer.SECOND * game.rnd.integerInRange(0, 100), Heart.prototype.generateHeart, this);
  game.time.events.add(Phaser.Timer.SECOND * game.rnd.integerInRange(0, 30), Shield.prototype.generateShield, this);
  game.time.events.add(Phaser.Timer.SECOND * game.rnd.integerInRange(0, 30), Missle.prototype.generateMissle, this);
  for (var i = 0; i < level; i++) {
    Bomb.prototype.generateBomb();
  }
}


function animateScore(moveOut) {
  moveOut = moveOut || false;

  // Animate walls
  SpaceGame._walls.forEachAlive(function (brick){
    game.add.tween(brick)
      .to({alpha: moveOut ? 0 : 1},
      1000 /*duration (in ms)*/,
      Phaser.Easing.Linear.None /*easing type*/,
      true /*autostart?*/,
      0 /*delay*/);
  });

  // Animate score
  SpaceGame._fireGraph.x = moveOut ? 10 : -SpaceGame._fireGraph.width;
  SpaceGame._fireGraph.alpha = moveOut ? 1 : 0;
  game.add.tween(SpaceGame._fireGraph)
    .to({alpha: moveOut ? 0 : 1, x: moveOut ? -SpaceGame._fireGraph.width : 10},
    500 /*duration (in ms)*/,
    Phaser.Easing.Linear.None /*easing type*/,
    true /*autostart?*/,
    moveOut ? 500 : 300 /*delay*/);
  SpaceGame._lifeGraph.x = moveOut ? 10 : -SpaceGame._lifeGraph.width;
  SpaceGame._lifeGraph.alpha = moveOut ? 1 : 0;
  game.add.tween(SpaceGame._lifeGraph)
    .to({alpha: moveOut ? 0 : 1, x: moveOut ? -SpaceGame._lifeGraph.width : 10},
    500 /*duration (in ms)*/,
    Phaser.Easing.Linear.None /*easing type*/,
    true /*autostart?*/,
    moveOut ? 600 : 400 /*delay*/);

  try {
    if (SpaceGame._scoreText != null && SpaceGame._scoreText._font != "") {
      SpaceGame._scoreText.x = moveOut ? 10 : -SpaceGame._scoreText.width;
      SpaceGame._scoreText.alpha = moveOut ? 1 : 0;
      game.add.tween(SpaceGame._scoreText)
        .to({alpha: moveOut ? 0 : 1, x: moveOut ?  -SpaceGame._scoreText.width : 10},
        500 /*duration (in ms)*/,
        Phaser.Easing.Linear.None /*easing type*/,
        true /*autostart?*/,
        moveOut ? 700 : 500 /*delay*/);
    }
}
  catch (e) {
    debugger;
  }
}

function showLevelTitle() {
  var style = {
    font: "60px Tahoma",
    fill: "#FFFFFF",
    align: "center"
  };
  var levelText = game.add.text(0, 0, 'Level ' + level, style);
  levelText.x = game.width / 2 - levelText.width / 2;
  levelText.y =  -levelText.height;
  levelText.alpha = 0;

  // Animate
  game.add.tween(levelText)
    .to({alpha:1, y: game.height / 2 - levelText.height / 2},
    1000 /*duration (in ms)*/,
    Phaser.Easing.Bounce.Out /*easing type*/,
    true /*autostart?*/,
    0 /*delay*/)
    .onComplete.add(function () {
      game.add.tween(levelText)
        .to({y: -levelText.height, alpha:0 },
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
  levelText.y =  -levelText.height / 2;
  levelText.alpha = 0;

  // Animate
  game.add.tween(levelText)
    .to({alpha:1, y: game.height / 2 - levelText.height / 2},
    1000 /*duration (in ms)*/,
    Phaser.Easing.Bounce.Out /*easing type*/,
    true /*autostart?*/,
    0 /*delay*/)
    .onComplete.add(function () {
      animateScore(true);
      game.add.tween(levelText)
        .to({y: -levelText.height / 2, alpha:0},
        1000 /*duration (in ms)*/,
        Phaser.Easing.Bounce.In /*easing type*/,
        true /*autostart?*/,
        1000 /*delay*/)
        .onComplete.add(function () {
          levelText.destroy();
          if (towers && towers.children && typeof towers.children[0] != "undefined") {
            SpaceGame._playerShield = towers.children[0].shieldPower;
            SpaceGame._playerBricks = towers.children[0].countBricks;
            SpaceGame._playerMissles = towers.children[0].missles;
            SpaceGame._playerFireSpeed = towers.children[0].fireTime;
          }
          game.state.start('Main');
          // Init score
          SpaceGame._scoreText = undefined;
          SpaceGame._lifeGraph = undefined;
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
  for (var i = 1; i < level*10; i++) {
    new Wall(game.rnd.integerInRange(0,game.width), game.rnd.integerInRange(0,game.height));
  }
  SpaceGame._walls.setAll('alpha', 0);
}

function addEnemys() {
  var i = 0;
  SpaceGame._allEnemysAdded = false;
  var enemysBcl = game.time.events.loop(level/2 * Phaser.Timer.SECOND, function () {
    // Generate i=level number of enemys
    if (i < level ) {
      var animEnemy = enemySprites[game.rnd.integerInRange(0, enemySprites.length-1)];
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
  }
  updateScoreText();
  if (lives < 0) {
    game.state.start('GameOver');
  }
}