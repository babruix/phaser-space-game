var Satelite = function (worldX, worldY, freeze, rocket, laser) {
  var texture = freeze ? 'satelite_freeze' : 'satelite';
  if (rocket) {
    texture = 'tower';
  }
  if (laser) {
    texture = 'laser_tower';
  }

  this.satelite = game.add.sprite(worldX, worldY, texture);
  this.satelite.worldX = worldX;
  this.satelite.worldY = worldY;
  this.satelite.health = 10;
  game.physics.p2.enable(this.satelite, debug);
  this.satelite.fireLastTime = game.time.now;
  this.satelite.fireTime = laser ? 600 : 300;
  this.satelite.freezing = freeze || false;
  this.satelite.rocket = rocket || false;
  this.satelite.laser = laser || false;

  this.satelite.body.mass = 50;
  this.satelite.body.damping = 1;

  this.satelite.scale.setTo(0.5, 0.5);

  SpaceGame._satelites.add(this.satelite);

  // Add health bar.
  var barConfig = {
    x: this.satelite.health,
    y: -40,
    height: 5,
    width: this.satelite.width,
    bg: {
      color: this.satelite.freezing ? '#56807D': '#56807D'
    },
    bar: {
      color: this.satelite.freezing ? '#20E331': '#56807D'
    }
  };
  this.satelite.HealthBar = new HealthBar(game, barConfig);

  this.satelite.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

    if (body1.sprite.key.indexOf('bullet') >= 0) {
      if (typeof(body1.sprite.enemyBullet) != "undefined" && body1.sprite.enemyBullet == true) {
        game.audio.smackSnd.play();
        this.satelite.damage(2);
        if (this.satelite.health <= 2) {
          this.satelite.kill();
        }
      }
    }
  }, this);

  var _this = this;
  this.satelite.update = function () {
    Satelite.prototype.fire(_this.satelite);

    // Update health bar.
    var bar = _this.satelite.HealthBar;
    bar.setPercent(_this.satelite.health * 10);
    var y = _this.satelite.y > game.height - _this.satelite.height
      ? _this.satelite.y + 20
      : _this.satelite.y + 30;
    bar.setPosition(_this.satelite.x, y);
  };

  this.satelite.events.onKilled.add(function (satelite) {
    satelite.HealthBar.barSprite.kill();
    satelite.HealthBar.bgSprite.kill();
  });
};

Satelite.prototype = {
  getClosestEnemy: function (satelite, minimalReactDistance) {
    // Satellite fire only when enemy distance less 700.
    minimalReactDistance = minimalReactDistance || 700;
    if (satelite.laser) {
      minimalReactDistance = 300;
    }

    var closestEnemy = SpaceGame.enemys.getFirstAlive();

    SpaceGame.enemys.forEachAlive(function (enemy) {
      if (enemy.body) {
        // Distance to previous closest enemy
        var prevClosestDistance = caculatetDistance(satelite, closestEnemy);
        var newClosestDistance = caculatetDistance(satelite, enemy);

        if (newClosestDistance < prevClosestDistance) {
          closestEnemy = enemy;
        }
      }
    });
    // Not react if enemy was not initialized.
    if (!closestEnemy || !closestEnemy.alive || closestEnemy.ufo_exists) {
      return false;
    }
    var closestDistance = caculatetDistance(satelite, closestEnemy);

    // Highlight closest enemy.
    this.drawAimRect(satelite, closestEnemy);
    this._aimRect = satelite._aimRect;
    this._dot = satelite._dot;
    game.time.events.add(Phaser.Timer.SECOND * 1, Satelite.prototype.removeAimRect, this);

    return closestDistance < minimalReactDistance ? closestEnemy : false;
  },
  fire: function (satelite) {
    if (satelite.alive && game.time.now > satelite.fireLastTime) {

      // Find closest enemy.
      var closestEnemy = this.getClosestEnemy(satelite);
      if (!closestEnemy) {
        return;
      }
      
      if (satelite.rocket) {
        // Missile fire
        var x = closestEnemy.x > satelite.x
          ? satelite.x + satelite.width * 2
          : satelite.x - satelite.width * 2;
        var y = closestEnemy.y > satelite.y
          ? satelite.y + satelite.height * 2
          : satelite.y - satelite.height * 2;
        var missle = new Missle(x, y, true);
        missle.anchor.setTo(0.5, 0.5);
        satelite.fireLastTime = game.time.now + satelite.fireTime + 1000;
        game.physics.arcade.moveToObject(missle, closestEnemy, 800);
        missle.body.rotation = game.physics.arcade.angleToPointer(closestEnemy) - Math.PI/2;
        return;
      }

      var enemyBullet, bullet, speed;

      if (satelite.laser) {
        game.audio.laserSnd.play();
        if (satelite.laserLine) {
          satelite.laserLine.kill();
        }
        // @todo: collision detection? speed?
        satelite.laserLine = game.add.graphics(0, 0);
        satelite.laserLine.lineStyle(20, 0xffffff, 0.6);
        // draw a shape
        satelite.laserLine.moveTo(satelite.x, satelite.y);
        satelite.laserLine.lineTo(closestEnemy.x, closestEnemy.y);
        satelite.laserLine.endFill();
        game.time.events.add(Phaser.Timer.SECOND/10, function() {
          satelite.laserLine.kill();
          closestEnemy.kill();
        }, this);

        satelite.fireLastTime = game.time.now + satelite.fireTime;
        return;
      }
      
      // Normal or frezing fire
      game.audio.enemySndFire.play();
      enemyBullet = false;
      var isFreezing = satelite.freezing;
      bullet = new Bullet(satelite.x, satelite.y, enemyBullet, isFreezing);
      bullet.rotation = parseFloat(game.physics.arcade.angleToXY(bullet, closestEnemy.x, closestEnemy.y)) * 180 / Math.PI;
      speed = isFreezing ? level * 10 : level * 30;
      game.physics.arcade.moveToObject(bullet, closestEnemy, speed);
      if (isFreezing) {
        satelite.fireLastTime += 200;
      }
      satelite.fireLastTime = game.time.now + satelite.fireTime;
    }
  },
  drawAimRect: function (satelite, enemy, minimalReactDistance) {
    // Satellite aim only when enemy distance less 700.
    minimalReactDistance = minimalReactDistance || 700;

    if (satelite._aimRect != undefined) {
      satelite._aimRect.destroy();
    }
    if (satelite._dot != undefined) {
      satelite._dot.destroy();
    }
    if (caculatetDistance(satelite, enemy) > minimalReactDistance) {
      return;
    }

    var lineColor = satelite.freezing ? 0x13D7D8 : 0xD81E00;

    satelite._aimRect = game.add.graphics(0, 0);
    satelite._aimRect.lineWidth =  2;
    satelite._aimRect.lineColor = lineColor;
    satelite._aimRect.alpha = 0.7;
    satelite._aimRect.drawCircle(enemy.x, enemy.y, enemy.width + 10);

    satelite._dot = game.add.graphics(0, 0);
    satelite._dot.lineWidth =  2;
    satelite._dot.lineColor = lineColor;
    satelite._dot.alpha = 0.7;
    satelite._dot.drawCircle(enemy.x, enemy.y, 5);

    game.time.events.add(2000, function () {
      this.removeAimRect();
    }, this);
  },
  removeAimRect: function () {
    // Hilight remove from enemy.
    if (this._aimRect != undefined) {
      this._aimRect.destroy();
    }
    if (this._dot != undefined) {
      this._dot.destroy();
    }
  }
};

