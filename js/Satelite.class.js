var Satelite = function (worldX, worldY, freeze) {
  var texture = freeze ? 'satelite_freeze' : 'satelite';
  this.satelite = game.add.sprite(worldX, worldY, texture);
  this.satelite.worldX = worldX;
  this.satelite.worldY = worldY;
  this.satelite.health = 10;
  game.physics.p2.enable(this.satelite, debug);
  this.satelite.fireLastTime = game.time.now;
  this.satelite.fireTime = 300;
  this.satelite.freezing = freeze || false;

  this.satelite.body.mass = 50;
  this.satelite.body.damping = 1;

  this.satelite.scale.setTo(0.5, 0.5);

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
    if (body1 && body1.sprite != null && body1.sprite.key == 'bullet' && body1.sprite.alive) {

      if (typeof(body1.sprite.enemyBullet) != "undefined" && body1.sprite.enemyBullet == true) {
        game.audio.smackSnd.play();
        this.satelite.damage(1);
        if (this.satelite.health <= 1) {
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
  addToPoint: function (worldX, worldY, freezing) {
    new Satelite(worldX, worldY, freezing);
  },
  getClosestEnemy: function (satelite, minimalReactDistance) {
    // Satellite fire only when enemy distance less 700.
    minimalReactDistance = minimalReactDistance || 700;

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
    Satelite.prototype.drawAimRect(satelite, closestEnemy);
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

      game.audio.enemySndFire.play();
      var enemyBullet = false;
      var isFreezing = satelite.freezing;
      var bullet = new Bullet(satelite.x, satelite.y, enemyBullet, isFreezing);
      bullet.rotation = parseFloat(game.physics.arcade.angleToXY(bullet, closestEnemy.x, closestEnemy.y)) * 180 / Math.PI;
      game.physics.arcade.moveToObject(bullet, closestEnemy, level * 300);
      bullet = null;
      satelite.fireLastTime = game.time.now + satelite.fireTime;
      if (isFreezing) {
        satelite.fireLastTime += 200;
      }
    }
  },
  drawAimRect: function (satelite, enemy) {
    if (satelite._aimRect != undefined) {
      satelite._aimRect.destroy();
    }
    satelite._aimRect = game.add.graphics(0, 0);
    satelite._aimRect.lineWidth =  2;
    satelite._aimRect.lineColor = 0xD81E00;
    satelite._aimRect.alpha = 0.7;
    satelite._aimRect.drawCircle(enemy.x, enemy.y, enemy.width + 10);

    // dot
    if (satelite._dot != undefined) {
      satelite._dot.destroy();
    }
    satelite._dot = game.add.graphics(0, 0);
    satelite._dot.lineWidth =  2;
    satelite._dot.lineColor = 0xD81E00;
    satelite._dot.alpha = 0.7;
    satelite._dot.drawCircle(enemy.x, enemy.y, 5);
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

