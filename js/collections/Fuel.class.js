var Fuel = function () {
  var x2 = game.rnd.integerInRange(0, game.width);
  SpaceGame._flowerPlants.forEachAlive(function (plant) {
    if (plant.growingItem.key == 'fuel') {
      x2 = plant.x;
      Plant.prototype.removeSpawnBar(plant);
    }
  });
  var y2 = game.rnd.integerInRange(0, game.height);
  this.fuel = game.add.sprite(x2, y2, 'fuel');
  this.fuel.anchor.setTo(0.5, 0.5);
  game.physics.p2.enable(this.fuel, debug);

  SpaceGame._fuels.add(this.fuel);

  this.fuel.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

    if (body1.sprite.key == 'spaceship') {

      if (!this.fuel.hitCooldown) {
        this.fuel.hitCooldown = true;
        game.time.events.add(1000, function () {
          this.fuel.hitCooldown = false;
        }, this);
      }
      else {
        return;
      }

      // do not kill pickable items, only tower can pickup.
      // @todo: enemy can pickup?
      this.fuel.kill();
      game.audio.reloadSnd.play();
      towers.children[0].fuel += level * 20;
      updateScoreText();
    }
  }, this);
  this.fuel.events.onKilled.add(function (fuel) {
    var nextSpawnTime = Phaser.Timer.SECOND * game.rnd.integerInRange(20, 40);
    SpaceGame._fuelTimer = game.time.events.add(nextSpawnTime, Fuel.prototype.generateFuel, this);
    Plant.prototype.updateSpawnBar(nextSpawnTime, 'fuel');
  });
};

Fuel.prototype = {
  generateFuel: function () {
    new Fuel();
  }
};