var Satelite = function (worldX, worldY) {
  this.satelite = game.add.sprite(worldX, worldY, 'satelite');
  this.satelite.worldX = worldX;
  this.satelite.worldY = worldY;
  this.satelite.health = 10;
  game.physics.p2.enable(this.satelite, debug);
  this.satelite.fireLastTime = game.time.now;
  this.satelite.fireTime = 300;

  this.satelite.body.mass = 100;
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
    if (body1 && body1.sprite != null && body1.sprite.key == 'bullet') {
      game.audio.smackSnd.play();
      if (typeof(body1.sprite.enemyBullet) != "undefined"
        && body1.sprite.alive && body1.sprite.enemyBullet == true) {

        this.satelite.damage(1);
        if (this.satelite.health <= 1) {
          this.satelite.kill();
        }
      }

    }
  }, this);

  var _this = this;
  this.satelite.update = function () {
    // Fire
    Satelite.prototype.fire(_this.satelite);

    // Update health bar.
    var bar = _this.satelite.HealthBar;
    bar.setPercent(_this.satelite.health * 10);
    var y = _this.satelite.y > game.height - _this.satelite.height
      ? _this.satelite.y + 20
      : _this.satelite.y + 30;
    bar.setPosition(_this.satelite.x, y);
  }
};

Satelite.prototype = {
  addToPoint: function (worldX, worldY) {
    new Satelite(worldX, worldY, 'satelite');
  },
  getClosestEnemy: function (satelite) {
    var closestEnemy = SpaceGame.enemys.getFirstAlive();
    SpaceGame.enemys.forEachAlive(function (enemy) {

      // Distance
      var a = satelite.x - closestEnemy.x;
      var b = satelite.y - closestEnemy.y;
      var c = Math.sqrt( a*a + b*b );

      var a = satelite.x - enemy.x;
      var b = satelite.y - enemy.y;
      var newC = Math.sqrt( a*a + b*b );

      if (newC < c) {
        closestEnemy = enemy;
      }
    });
    return closestEnemy;
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
      game.physics.arcade.moveToObject(bullet, closestEnemy, level*100);
      bullet = null;
      satelite.fireLastTime = game.time.now + satelite.fireTime;
    }
  }
};
