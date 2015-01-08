var Missle = function(x, y) {
  var x2 = x ? x : game.rnd.integerInRange(0, game.width);
  var y2 = y ? y : game.rnd.integerInRange(0, game.height);
  SpaceGame._missles.createMultiple(1, 'missle', 0, false);
  this.missle = SpaceGame._missles.getFirstExists(false);
  this.missle.body.setCircle(15);
  this.missle.body.mass = 10;
  this.missle.body.damping = 0.01;
  this.missle.towerBullet = true;
  this.missle.enemyBullet = false;
  this.missle.blendMode=0;
  this.missle.reset(x2, y2);

  this.missle.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 != null && body1.sprite != null) {
      if (body1.sprite.key != 'tower') {
        for (var i = 0, x = enemysSprites.length; i < x; i++) {
          if (enemysSprites[i].name == body1.sprite.key) {
            body1.sprite.kill();
            this.explode(this.missle);
            break;
          }
        }
      }
      else {
        game.audio.laughSnd.play();
        body1.sprite.missles++;
        updateScoreText();
        this.missle.destroy();
        game.time.events.add(Phaser.Timer.SECOND * game.rnd.integerInRange(0, 30), generateMissle, this);
      }
    }

  }, this);
  return this.missle;
};

Missle.prototype.explode = function(missle) {
  if (missle.alive) {
    missle.destroy();
    game.audio.explosionSnd.play();
    var explode = game.add.sprite(missle.x-100, missle.y-150, 'explode', 19);
    explode.animations.add('explode');
    explode.animations.play('explode', 19, false, true);
  }
};