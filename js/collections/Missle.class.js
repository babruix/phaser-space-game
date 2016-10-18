var Missle = function (x, y, fired) {
  var x2 = x ? x : game.rnd.integerInRange(0, game.width);
  if (!fired) {
    SpaceGame._flowerPlants.forEachAlive(function (plant) {
      if (plant.growingItem.key == 'missle') {
        x2 = plant.x;
        Plant.prototype.removeSpawnBar(plant);
      }
    });
  }
  var y2 = y ? y : game.rnd.integerInRange(0, game.height);
  SpaceGame._missles.createMultiple(1, 'missle', 0, false);
  this.missle = SpaceGame._missles.getFirstExists(false);
  this.missle.body.setCircle(15);
  this.missle.body.mass = 10;
  this.missle.body.damping = 0.01;
  this.missle.towerBullet = true;
  this.missle.enemyBullet = false;
  this.missle.activated = fired || false;
  this.missle.reset(x2, y2);

  this.missle.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

    if (body1.sprite.key != 'spaceship') {
      Missle.prototype.explode(this.missle);
    }
    else {
      if (!this.missle.activated) {
        // pickup
        game.audio.laughSnd.play();
        body1.sprite.missles++;
        SpaceGame.Main.prototype.changeScoreText();
        this.missle.kill();
      }
    }

  }, this);
  this.missle.events.onKilled.add(function (missle) {
    var nextSpawnTime = Phaser.Timer.SECOND * game.rnd.integerInRange(10, 30);
    SpaceGame._missleTimer = game.time.events.add(nextSpawnTime, Missle.prototype.generateMissle);
    Plant.prototype.updateSpawnBar(nextSpawnTime, 'missle');
  });
  var missle = this.missle;
  this.missle.update = function () {
    if (missle.y < 100) {
      Missle.prototype.explode(missle);
    }
  };
  return this. missle;
};

Missle.prototype = {
  generateMissle: function () {
    new Missle();
  },
  explode: function (missle) {
    if (missle.alive) {
      missle.destroy();
      game.audio.explosionSnd.play();
      var explode = game.add.sprite(missle.x - 100, missle.y - 150, 'explode', 19);
      explode.animations.add('explode');
      explode.animations.play('explode', 19, false, true);

      // Kill everybody who is close
      var groupsToCheck = [SpaceGame.enemys, SpaceGame._walls, SpaceGame._bombs, SpaceGame._satelites];
      for (var i = 0, count = groupsToCheck.length; i < count; i++) {
        groupsToCheck[i].forEachAlive(function (enemy) {
          Missle.prototype.killWhenClose(enemy, missle);
        });
      }
    }
  },
  killWhenClose: function (sprite, missle) {
    if (!sprite.ufo_exists && SpaceGame.Main.prototype.caculatetDistance(missle, sprite) < 50) {
      sprite.kill();
    }
  }
};