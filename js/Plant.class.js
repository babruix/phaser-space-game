var Plant = function() {
  var x2 = game.rnd.integerInRange(0, game.width);
  var y2 = game.rnd.integerInRange(0, game.height);
  this.plant = game.add.sprite(76, 174, 'flow');
  this.plant.x = game.rnd.integerInRange(0, game.width);
  this.plant.y = game.rnd.integerInRange(game.height-50, game.height - 100);
  this.plant.anchor.setTo(0.5, 1);
  this.plant.angle = -10 * game.rnd.integerInRange(0, level);
  SpaceGame._flowerPlants.add(this.plant);

  return this.plant;
};

Plant.prototype = {
  generatePlant: function () {
    return new Plant();
  },
  generate_pickup: function (plant) {
    if (plant._spawnTimer) {
      game.time.events.remove(plant._spawnTimer);
    }
    if (plant.alive) {
      if (plant.growingItem) {
        plant.growingItem.kill();
      }
      var spawnFunction;
      var maxTimeToSpawn = 30; // Default time to spawn.
      var defaultItemToGrow = game.rnd.integerInRange(0, 5);
      switch (defaultItemToGrow) {
        case 0:
          maxTimeToSpawn = 40;
          plant.growingItem = game.add.sprite(plant.x, plant.y + 10, 'ammo');
          spawnFunction = Ammo.prototype.generateAmmo;
          break;
        case 1:
          plant.growingItem = game.add.sprite(plant.x, plant.y + 10, 'shield');
          plant.growingItem.animations.add('blim');
          plant.growingItem.animations.play('blim', 2, true);
          spawnFunction = Shield.prototype.generateShield;
          break;
        case 2:
          maxTimeToSpawn = 100;
          plant.growingItem = game.add.sprite(plant.x, plant.y + 10, 'heart');
          spawnFunction = Heart.prototype.generateHeart;
          break;
        case 3:
          plant.growingItem = game.add.sprite(plant.x, plant.y + 10, 'fuel');
          spawnFunction = Fuel.prototype.generateFuel;
          break;
        case 4:
          plant.growingItem = game.add.sprite(plant.x, plant.y + 10, 'missle');
          spawnFunction = Missle.prototype.generateMissle;
          break;
        case 5:
          maxTimeToSpawn = 40;
          plant.growingItem = game.add.sprite(plant.x, plant.y + 10, 'ammo');
          spawnFunction = Ammo.prototype.generateAmmo;
          break;
      }
      var nextSpawnTime = Phaser.Timer.SECOND * game.rnd.integerInRange(0, maxTimeToSpawn);
      plant.growingItem.scale.setTo(.4, .4);
      plant.growingItem.blendMode = 4;

      // Add spawn bar.
      var barConfig = SpaceGame.Main.prototype.getBarConfig(nextSpawnTime, plant);
      plant.spawnBar = new HealthBar(game, barConfig);
      plant.randomSpawnTime = game.time.now + nextSpawnTime;
    }
    return {
      spawnFunction: spawnFunction,
      nextSpawnTime: nextSpawnTime
    };
  },
  updateSpawnBar: function (nextSpawnTime, sprite) {
    SpaceGame._flowerPlants.forEachAlive(function (plant) {
      if (plant.growingItem.key == sprite) {
        // Add spawn bar.
        var barConfig = SpaceGame.Main.prototype.getBarConfig(nextSpawnTime, plant);
        plant.spawnBar = new HealthBar(game, barConfig);
        plant.randomSpawnTime = game.time.now + nextSpawnTime;
      }
    });
  }
};