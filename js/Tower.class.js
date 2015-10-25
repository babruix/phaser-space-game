var Tower = function (worldX, worldY, tile) {
  this.tower = game.add.sprite(worldX, worldY, tile);
  this.tower.worldX = worldX;
  this.tower.worldY = worldY;
  this.tower.health = 10;
  this.tower.wallTime = 100;
  this.tower.fireTime = SpaceGame._playerFireSpeed || 200;
  this.tower.missles = SpaceGame._playerMissles  || 0;
  this.tower.countBricks = SpaceGame._playerBricks || 0;
  this.tower.shieldPower = SpaceGame._playerShield || 0;
  this.tower.fireLastTime = game.time.now + this.tower.fireTime;
  this.tower.wallLastTime = game.time.now + this.tower.wallTime;
  game.physics.p2.enable(this.tower, debug);

  this.tower.width = 100;
  this.tower.height = 42;
  this.tower.body.setRectangle(100,50);

  this.tower.body.data.gravityScale = 70;
  this.tower.body.mass = 50;
  this.tower.body.damping = 0.9;
  this.tower.body.fixedRotation = true;
  this.tower.body.collideWorldBounds = true;
  towers.add(this.tower);
  game.camera.follow(this.tower);


  this.tower.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 && body1.sprite != null && body1.sprite.key == 'bullet') {
      game.audio.smackSnd.play();
      if (typeof(body1.sprite.enemyBullet) != "undefined"
        && body1.sprite.alive
        && body1.sprite.enemyBullet == true) {
        if (body1.sprite.y > 690) {
          return;
        }
        if (this.tower.shieldPower > 0) {
          this.tower.shieldPower -= 10;
        }
        else {
          body1.sprite.destroy();
          towers.children[0].fireTime += 1;
          this.tower.damage(1);
        }

        if (this.tower.health <= 1) {
          this.tower.health = 10;
          updateScore(true);
        }
        updateScoreText();
      }

    }
  }, this);

  var that = this;
  this.tower.events.onKilled.add(function() {
    if (SpaceGame._shipTrail != null) {
      SpaceGame._shipTrail.destroy();
    }
    SpaceGame._playerShield = that.tower.shieldPower;
    SpaceGame._playerBricks = that.tower.countBricks;
    SpaceGame._playerMissles = that.tower.missles;
    SpaceGame._playerFireSpeed = that.tower.fireTime;
  });

  var _this = this;
  this.tower.update = function () {
    // Fire
    //Tower.prototype.fire(_this.tower);
    SpaceGame._fireButton.onDown.add(function () {
      Tower.prototype.fire(_this.tower);
    }, _this);
    if (SpaceGame._fireButton.isDown) {
      Tower.prototype.fire(_this.tower);
    }

    // Wall
    SpaceGame._brickButton.onDown.add(function () {
      Tower.prototype.addWall(_this.tower);
    }, _this);

    // Missle
    SpaceGame._missleButton.onDown.add(function () {
      Tower.prototype.fireMissle(_this.tower);
    }, _this);

    // Shield
    Tower.prototype.redrawProtectRect(_this.tower);

    // Keep the SpaceGame._shipTrail lined up with the ship
    SpaceGame._shipTrail.x = _this.tower.x;
    SpaceGame._shipTrail.y = _this.tower.y+10;

    var bar = _this.tower.towerHealthBar;
    bar.setPercent(_this.tower.health * 10);
    var y = _this.tower.y > game.height - _this.tower.height
      ? _this.tower.y + 20
      : _this.tower.y + 30;
    bar.setPosition(_this.tower.x, y);
  }
};

Tower.prototype = {
  addToPoint: function (worldX, worldY) {
    new Tower(worldX, worldY, 'spaceship');

    var barConfig = {x: towers.children[0].health, y: -40,height:10,width:towers.children[0].width};
    towers.children[0].towerHealthBar = new HealthBar(game, barConfig);
    // Add  PhysicsEditor bounding shape
    towers.children[0].body.clearShapes();
    towers.children[0].body.loadPolygon('spaceship_pshysics', 'spaceship');

    towers.children[0].alpha = 0;
    towers.children[0].fireTime = 200;
    towers.children[0].anchor.setTo(0.5,0.5);
    game.add.tween(towers.children[0])
      .to({alpha: 1}, 500, Phaser.Easing.Linear.In,
      true, 1000, true, false)
      .onComplete.add(function() {
        SpaceGame._shipTrail.alpha = 1;
      });

    // Add an emitter for the ship's trail
    SpaceGame._shipTrail = game.add.emitter(game, towers.children[0].x, towers.children[0].y + 10, 400);
    SpaceGame._shipTrail.width = 10;
    SpaceGame._shipTrail.makeParticles('emit');
    SpaceGame._shipTrail.setXSpeed(30, -30);
    SpaceGame._shipTrail.setYSpeed(200, 180);
    SpaceGame._shipTrail.setRotation(50, -50);
    SpaceGame._shipTrail.setAlpha(1, 0.01, 800);
    SpaceGame._shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    SpaceGame._shipTrail.start(false, 5000, 10);
    SpaceGame._shipTrail.alpha = 0;
  },
  fire: function (tower) {
    //SpaceGame.enemys.stealing &&
    if (tower.alive && game.time.now > tower.fireLastTime) {
      game.audio.playerSndFire.play();
      var bullet = new Bullet(tower.x, tower.y - tower.height, false);
      if (bullet != undefined && bullet.body != undefined) {
        bullet.body.moveUp(150*level);
        bullet = null;
      }
      tower.fireLastTime = game.time.now + tower.fireTime;
    }
  },
  fireMissle: function (tower) {
    if (tower.alive && tower.missles > 0 && game.time.now > tower.fireLastTime) {
      game.audio.missleSnd.play();
      tower.missles--;
      updateScoreText();
      var missle = new Missle(tower.x + tower.width / 2, tower.y - tower.height * 2, false);
      if (missle != undefined && missle.body != undefined) {
        missle.body.moveUp(1800);
        missle = null;
        tower.fireLastTime = game.time.now + tower.fireTime;
      }
    }
  },
  addWall: function (tower) {
    if (tower.countBricks > 0 && game.time.now > tower.wallLastTime) {
      game.audio.laughSnd.play();
      tower.countBricks--;
      updateScoreText();
      new Wall(tower.x, tower.y);
      tower.wallLastTime = game.time.now + tower.wallTime;
    }
  },
  redrawProtectRect: function (tower) {
    if (tower.shieldPower > 0) {
      if (tower._protectRect != undefined) {
        tower._protectRect.destroy();
      }
      tower._protectRect = game.add.graphics(0, 0);
      tower._protectRect.lineWidth = towers.children[0].shieldPower / 10;
      tower._protectRect.lineColor = 0xFFFFFF;
      tower._protectRect.alpha = 0.7;
      tower._protectRect.drawCircle(towers.children[0].x, towers.children[0].y, towers.children[0].width + towers.children[0].shieldPower / 10);
    }
  }
};
