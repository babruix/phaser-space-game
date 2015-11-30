var Ammo = function() {
  var x2 = game.rnd.integerInRange(0, game.width);
  SpaceGame._flowerPlants.forEachAlive(function (plant) {
    if (plant.growingItem.key == 'ammo') {
      x2 = plant.x;
    }
  });
  var y2 = game.rnd.integerInRange(0, game.height);
  this.ammo = game.add.sprite(x2, y2, 'ammo');
  this.ammo.anchor.setTo(0.5, 0.5);
  game.physics.p2.enable(this.ammo, debug);
  //this.ammo.scale.setTo(.3,.3);

  SpaceGame._ammos.add(this.ammo);

  this.ammo.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 && body1.sprite != null && body1.sprite.key=='spaceship') {

      if (!this.ammo.hitCooldown) {
        this.ammo.hitCooldown = true;
        game.time.events.add(1000, function () {
          this.ammo.hitCooldown = false;
        }, this);
      }
      else {
        return;
      }

      // do not kill pickable items, only tower can pickup.
      // @todo: enemy can pickup?
      this.ammo.kill();
      game.audio.reloadSnd.play();
      towers.children[0].bullets += level * 10;
      updateScoreText();
    }
  }, this);
  this.ammo.events.onKilled.add(function (ammo) {
    var nextSpawnTime = Phaser.Timer.SECOND * game.rnd.integerInRange(20, 40);
    SpaceGame._ammoTimer = game.time.events.add(nextSpawnTime, Ammo.prototype.generateAmmo, this);
    Plant.prototype.updateSpawnBar(nextSpawnTime, 'ammo');
  });
};

Ammo.prototype = {
  generateAmmo: function () {
    new Ammo();
  }
};