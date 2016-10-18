var Tower = function (worldX, worldY, tile) {
  this.tower = game.add.sprite(worldX, worldY, tile);
  this.tower.worldX = worldX;
  this.tower.worldY = worldY;
  this.tower.health = 10;
  this.tower.actionTime = 100;
  this.tower.fireTime = 200;
  this.tower.missles = SpaceGame._playerMissles || 10;
  this.tower.countBricks = SpaceGame._playerBricks || 0;
  this.tower.shieldPower = SpaceGame._playerShield || 0;
  this.tower.fireLastTime = game.time.now + this.tower.fireTime;
  this.tower.actionLastTime = game.time.now + this.tower.actionTime;
  game.physics.p2.enable(this.tower, debug);
  this.tower.bullets = 50 * level;
  this.tower.fuel = 100 * level;

  this.tower.width = 100;
  this.tower.height = 42;
  this.tower.body.setRectangle(100, 50);

  this.tower.body.data.gravityScale = 70;
  this.tower.body.mass = 50;
  this.tower.body.damping = 0.9;
  this.tower.body.fixedRotation = true;
  this.tower.body.collideWorldBounds = true;
  towers.add(this.tower);
  game.camera.follow(this.tower);

  this.tower.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

    if (body1 && body1.sprite.key.indexOf('bullet') >= 0) {
      game.audio.smackSnd.play();
      if (typeof(body1.sprite.enemyBullet) != "undefined"
        && body1.sprite.alive
        && body1.sprite.enemyBullet == true) {
        if (this.tower.shieldPower > 0) {
          this.tower.shieldPower -= 10;
        }
        else {
          this.tower.damage(1);
          // flash in red
          this.tower.tint = 0xFF0010;
          game.time.events.add(100, function() {
            this.tower.tint = 0xFFFFFF;
          }, this);
        }
        body1.sprite.destroy();

        if (this.tower.health <= 1) {
          this.tower.health = 10;
          SpaceGame.Main.prototype.updateScore(true);
        }
        else {
          SpaceGame.Main.prototype.changeScoreText();
        }
      }

    }
  }, this);

  var that = this;
  this.tower.events.onKilled.add(function () {
    if (SpaceGame._shipTrail != null) {
      SpaceGame._shipTrail.destroy();
    }
    SpaceGame._playerShield = that.tower.shieldPower;
    SpaceGame._playerBricks = that.tower.countBricks;
    SpaceGame._playerMissles = that.tower.missles;
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

    // Add basic Satelite
    SpaceGame._numberButtons[0].onDown.add(function () {
      Tower.prototype.addSatelite(_this.tower);
    }, _this);

    // Add Freeze Satelite
    SpaceGame._numberButtons[1].onDown.add(function () {
      Tower.prototype.addSatelite(_this.tower, 'freeze');
    }, _this);

    // Add Rocket Satelite
    SpaceGame._numberButtons[2].onDown.add(function () {
      Tower.prototype.addSatelite(_this.tower, 'rocket');
    }, _this);

    // Add Laser Satelite
    SpaceGame._numberButtons[3].onDown.add(function () {
      Tower.prototype.addSatelite(_this.tower, 'laser');
    }, _this);

    // Add Wall
    SpaceGame._numberButtons[4].onDown.add(function () {
      Tower.prototype.addWall(_this.tower);
    }, _this);

    // Add bomb
    SpaceGame._numberButtons[5].onDown.add(function () {
      Tower.prototype.addBomb(_this.tower);
    }, _this);

    // Fire missle
    SpaceGame._numberButtons[6].onDown.add(function () {
      Tower.prototype.fireMissle(_this.tower);
    }, _this);

    // Add Wall
    SpaceGame._brickButton.onDown.add(function () {
      Tower.prototype.addWall(_this.tower);
    }, _this);

    // Add Missle
    SpaceGame._missleButton.onDown.add(function () {
      Tower.prototype.fireMissle(_this.tower);
    }, _this);

    // Shield
    Tower.prototype.redrawProtectRect(_this.tower);

    // Keep the SpaceGame._shipTrail lined up with the ship
    SpaceGame._shipTrail.x = _this.tower.x;
    SpaceGame._shipTrail.y = _this.tower.y + 10;

    // Update health bar.
    var bar = _this.tower.HealthBar;
    bar.setPercent(_this.tower.health * 10);
    var y = _this.tower.y > game.height - _this.tower.height
      ? _this.tower.y + 20
      : _this.tower.y + 30;
    bar.setPosition(_this.tower.x, y);

    if (SpaceGame._sateliteButton) {
      SpaceGame._sateliteButton.onDown.add(function () {
        Tower.prototype.addSatelite(_this.tower);
      }, _this);
    }

    // Take life when health is too small.
    if (_this.tower.health < 3) {
      _this.tower.health = 10;
      SpaceGame.Main.prototype.updateScore(true);
    }
  }
};

Tower.prototype = {
  addToPoint: function (worldX, worldY) {
    new Tower(worldX, worldY, 'spaceship');

    // Add health bar.
    var barConfig = {
      x: towers.children[0].health,
      y: -40,
      height: 5,
      width: towers.children[0].width,
      bg: {
        color: '#56807D'
      },
      bar: {
        color: '#20E331'
      }
    };
    towers.children[0].HealthBar = new HealthBar(game, barConfig);

    // Add  PhysicsEditor bounding shape
    towers.children[0].body.clearShapes();
    towers.children[0].body.loadPolygon('spaceship_pshysics', 'spaceship');

    towers.children[0].alpha = 0;
    towers.children[0].fireTime = 200;
    towers.children[0].anchor.setTo(0.5, 0.5);

    game.time.events.add(500, function() {
      // let Phaser add the particle system to world group or choose to add it to a specific group
      var particleSystem1 = SpaceGame.epsyPlugin.loadSystem(SpaceGame.epsyPluginConfig.circles, towers.children[0].x, towers.children[0].y);
      this._circlesGroup = game.add.group();
      this._circlesGroup.add(particleSystem1);
      game.time.events.add(1000, Tower.prototype.destroyCirclesGroup, this).autoDestroy = true;

      game.add.tween(towers.children[0])
        .to({alpha: 1}, 1000, Phaser.Easing.Linear.In,
          true, 500)
        .onComplete.add(function () {
        SpaceGame._shipTrail.alpha = 1;
      }, this);
    }, this);

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
  destroyCirclesGroup: function () {
    this._circlesGroup.destroy();
  },
  fire: function (tower) {
    //SpaceGame.enemys.stealing &&
    if (tower.alive && game.time.now > tower.fireLastTime) {
      if (tower.bullets > 0) {
        tower.bullets--;
        SpaceGame.Main.prototype.changeScoreText();
        game.audio.playerSndFire.play();
        var bullet = new Bullet(tower.x, tower.y - tower.height, false);
        if (bullet != undefined && bullet.body != undefined) {
          bullet.body.moveUp(1500);
          bullet = null;
        }
        tower.fireLastTime = game.time.now + tower.fireTime;
      }
      else {
       // Fire missles when there are no bullets
        this.fireMissle(tower);
      }
    }
  },
  fireMissle: function (tower) {
    if (!tower.alive || game.time.now <= tower.fireLastTime) {
      return;
    }
    if (tower.missles <= 0 && score < SpaceGame.priceList.rocket) {
      return;
    }
    
    game.audio.missleSnd.play();
    if (tower.missles > 0){
      tower.missles--;
    }
    else {
      score -= SpaceGame.priceList.rocket;
    }
    SpaceGame.Main.prototype.changeScoreText();
    
    var missle = new Missle(tower.x + tower.width / 2, tower.y - tower.height * 2, true);
    if (missle != undefined && missle.body != undefined) {
      missle.body.moveUp(800);
      tower.fireLastTime = game.time.now + tower.fireTime;
    }
  },
  addWall: function (tower) {
    if (!tower.alive || game.time.now <= tower.actionLastTime || tower.y > 500) {
      return;
    }
    if (tower.countBricks <= 0 && score < SpaceGame.priceList.wall) {
      return;
    }
    
    game.audio.laughSnd.play();
    if (tower.countBricks > 0) {
      tower.countBricks--;
    }
    else {
      score -= SpaceGame.priceList.wall;
    }
    SpaceGame.Main.prototype.changeScoreText();
    
    new Wall(tower.x, tower.y);
    tower.actionLastTime = game.time.now + tower.actionTime;
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
  },
  addSatelite: function (tower, type) {
    var freeze = type == 'freeze';
    var rocket = type == 'rocket';
    var laser = type == 'laser';
    var key = 'satelite';
    if (freeze) {
      key = 'satelite_freeze';
    }
    if (rocket) {
      key = 'tower';
    }
    if (laser) {
      key = 'laser_tower';
    }
    var price = SpaceGame.priceList[key];
    if (score >= price && game.time.now > tower.actionLastTime) {
      score -= price;
      SpaceGame.Main.prototype.changeScoreText();
      // use last wall time variable
      tower.actionLastTime = game.time.now + tower.actionTime;
      new Satelite(tower.x, tower.y - tower.height, freeze, rocket, laser);
    }
  },
  addBomb: function (tower) {
    if (score < SpaceGame.priceList.bomb || game.time.now < tower.actionLastTime) {
      return;
    }
    
    new Bomb(tower.x, 100);
    score -= SpaceGame.priceList.bomb;
    tower.actionLastTime = game.time.now + tower.actionTime;
  },
  updateTower: function (tower) {
    if (tower.alpha < 1) {
      return;
    }

    // Move tower
    tower.body.setZeroVelocity();
    var speed = game.height / 1.3 + game.height - tower.body.y / 1.3;

    // Slow down under the rain
    if (SpaceGame.Main.prototype.checkIntersectsWithRain(tower)) {
      speed -= tower.body.y;
    }

    if (SpaceGame._cursors.left.isDown) {
      tower.angle = -30;
      if (SpaceGame._cursors.up.isDown) {
        tower.angle = -60;
      }
      tower.body.velocity.x = -speed;
    }
    else if (SpaceGame._cursors.right.isDown) {
      tower.angle = 30;
      if (SpaceGame._cursors.up.isDown) {
        tower.angle = 60;
      }
      tower.body.velocity.x = speed;
    }
    else {
      tower.rotation = 0;
    }
    speed *= 2;
    if (SpaceGame._cursors.up.isDown) {
      if (tower.fuel > 0) {
        tower.body.velocity.y = -speed;
        tower.fuel--;
        SpaceGame.Main.prototype.changeScoreText();
      }
    }
    else if (SpaceGame._cursors.down.isDown) {
      tower.body.velocity.y = speed;
    }
    if (game.input.activePointer.isDown) {
      if (game.input.activePointer.isMouse) {
        // @todo: In the case of a mouse, check mouse button status?
        if (game.input.activePointer.button == Phaser.Mouse.RIGHT_BUTTON) {

        }
      }
      else {
//        if (Math.floor(game.input.x/(game.width/2)) === 0) {
        if (game.input.x < tower.x) {
          tower.angle = -30;
          tower.body.velocity.x = -speed;
        }
//        if (Math.floor(game.input.x/(game.width/2)) === 1) {
        if (game.input.x > tower.x) {
          tower.angle = 30;
          tower.body.velocity.x = speed;
        }
//        if(Math.floor(game.input.y/(game.height/2)) === 0){
        if (game.input.y < tower.y) {
          tower.body.velocity.y = -speed;
        }
//        if(Math.floor(game.input.y/(game.height/2)) === 1){
        if (game.input.y > tower.y) {
          tower.body.velocity.y = speed;
        }
        /*          if (game.input.y > 600) {
         Tower.prototype.fire(tower);
         }*/

        // Multiple touches/pointers
        /*if (game.input.pointer1.isDown && game.input.pointer2.isDown)
         alert(game.input.pointer2.isDown);*/
      }
    }
  }
};
