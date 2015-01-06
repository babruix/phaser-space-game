var Missle = function(worldX, worldY) {
  var x2 = worldX ? worldX : parseInt(Math.random() * game.width);
  var y2 = worldY ? worldY : parseInt(Math.random() * game.height);
  missles.createMultiple(1, 'missle', 0, false);
  this.missle = missles.getFirstExists(false);
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
            body1.sprite.destroy();
            this.explode(this.missle);
            if (enemys.countLiving() == 0) {
              game.state.start('Main');
            }
            break;
          }
        }
      }
      else {
        game.audio.laughSnd.play();
        updateScoreText();
        body1.sprite.missles++;
        this.missle.destroy();
        game.time.events.add(Phaser.Timer.SECOND * 30 * Math.random(), generateMissle, this);
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