var Heart = function() {
  var x2 = game.rnd.integerInRange(0, game.width);
  SpaceGame._flowerPlants.forEachAlive(function (plant) {
    if (plant.growingItem.key == 'heart') {
      x2 = plant.x;
    }
  });
  var y2 = game.rnd.integerInRange(0, game.height);
  this.heart = game.add.sprite(x2, y2, 'heart');
  this.heart.anchor.setTo(0.5, 0.5);

  game.physics.p2.enable(this.heart, debug);
  //this.heart.body.data.gravityScale = 0.05;
  //this.heart.body.static = true;
  this.heart.scale.setTo(.3,.3);

  SpaceGame._hearts.add(this.heart);

  this.heart.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 && body1.sprite != null && body1.sprite.key=='spaceship') {

      if (!this.heart.hitCooldown) {
        this.heart.hitCooldown = true;
        game.time.events.add(1000, function () {
          this.heart.hitCooldown = false;
        }, this);
      }
      else {
        return;
      }

      // do not kill pickable items, only tower can pickup.
      // @todo: enemy can pickup?
      this.heart.kill();
      game.audio.kissSnd.play();
      lives++;
      updateScoreText();
    }
  }, this);
  this.heart.events.onKilled.add(function (heart) {
    var nextSpawnTime = Phaser.Timer.SECOND * game.rnd.integerInRange(70, 100);
    SpaceGame._heartTimer = game.time.events.add(nextSpawnTime, Heart.prototype.generateHeart, this);
    Plant.prototype.updateSpawnBar(nextSpawnTime, 'heart');
  });
};

Heart.prototype = {
  generateHeart: function () {
    new Heart();
  }
};