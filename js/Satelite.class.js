var Satelite = function (worldX, worldY, freeze) {
  this.satelite = game.add.sprite(worldX, worldY, 'satelite');
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
      color: '#56807D'
    },
    bar: {
      color: '#20E331'
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

    // Fire of freeze
    if (_this.satelite.freezing) {
      Satelite.prototype.freeze_fire(_this.satelite);
    } else {
      Satelite.prototype.fire(_this.satelite);
    }

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
    new Satelite(worldX, worldY, 'satelite', freezing);
  },
  getClosestEnemy: function (satelite, minimalReactDistance) {
    // Satellite fire only when enemy distance less 700.
    minimalReactDistance = minimalReactDistance || 700;
    var closestEnemy = SpaceGame.enemys.getFirstAlive();
    SpaceGame.enemys.forEachAlive(function (enemy) {

      // Distance to previous closest enemy
      var prevClosestDistance = caculatetDistance(satelite, closestEnemy);
      var newClosestDistance = caculatetDistance(satelite, enemy);

      if (newClosestDistance < prevClosestDistance) {
        closestEnemy = enemy;
      }
    });
    if (closestEnemy) {
      var closestDistance = caculatetDistance(satelite, closestEnemy);
    }

    return closestDistance < minimalReactDistance ? closestEnemy : false;
  },
  fire: function (satelite) {
    if (satelite.alive && game.time.now > satelite.fireLastTime) {
      game.audio.enemySndFire.play();
      var bullet = new Bullet(satelite.x, satelite.y, false);

      // Find closest enemy.
      var closestEnemy = this.getClosestEnemy(satelite);
      if (!closestEnemy || !closestEnemy.alive) {
        return;
      }

      bullet.rotation = parseFloat(game.physics.arcade.angleToXY(bullet, closestEnemy.x, closestEnemy.y)) * 180 / Math.PI;
      game.physics.arcade.moveToObject(bullet, closestEnemy, level * 300);
      bullet = null;
      satelite.fireLastTime = game.time.now + satelite.fireTime;
    }
  },
  freeze_fire: function (satelite) {
    if (satelite.alive && game.time.now > satelite.fireLastTime) {
      //game.audio.enemySndFire.play();

      // Find closest enemy.
      var closestEnemy = this.getClosestEnemy(satelite, 500);
      if (!closestEnemy || !closestEnemy.alive) {
        return;
      }

      // Highlight closest enemy.
      Satelite.prototype.drawProtectRect(closestEnemy);
      this._protectRect = closestEnemy._protectRect;
      this._dot = closestEnemy._dot;
      game.time.events.add(Phaser.Timer.SECOND * 2, Satelite.prototype.removeProtectRect, this);

      var freezingBullet = true;
      var bullet = new Bullet(satelite.x, satelite.y, false, freezingBullet);
      bullet.rotation = parseFloat(game.physics.arcade.angleToXY(bullet, closestEnemy.x, closestEnemy.y)) * 180 / Math.PI;
      game.physics.arcade.moveToObject(bullet, closestEnemy, level * 200);
      bullet = null;

      satelite.fireLastTime = game.time.now + satelite.fireTime + level * 200;
    }
  },
  drawProtectRect: function (enemy) {
    if (enemy._protectRect != undefined) {
      enemy._protectRect.destroy();
    }
    enemy._protectRect = game.add.graphics(0, 0);
    enemy._protectRect.lineWidth =  5;
    enemy._protectRect.lineColor = 0xD81E00;
    enemy._protectRect.alpha = 0.7;
    enemy._protectRect.drawCircle(enemy.x, enemy.y, enemy.width + 10);

    // dot
    if (enemy._dot != undefined) {
      enemy._dot.destroy();
    }
    enemy._dot = game.add.graphics(0, 0);
    enemy._dot.lineWidth =  5;
    enemy._dot.lineColor = 0xD81E00;
    enemy._dot.alpha = 0.7;
    enemy._dot.drawCircle(enemy.x, enemy.y, 5);

  },
  removeProtectRect: function () {
    // Hilight remove from enemy.
    if (this._protectRect != undefined) {
      this._protectRect.destroy();
    }
    if (this._dot != undefined) {
      this._dot.destroy();
    }
  }
};

