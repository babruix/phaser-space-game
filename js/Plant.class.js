var Plant = function() {
  this.plant = game.add.sprite(game.width/2+38, game.height-50, 'flow');
  this.plant.anchor.setTo(0.5, 1);
  this.plant.angle = -10 * game.rnd.integerInRange(0, level);
  SpaceGame._flowerPlants.add(this.plant);

  this.plant.update = function () {
    SpaceGame._flowerPlants.forEachAlive(function (plant) {

      if (plant.stealing) {
        Plant.prototype.removeSpawnBar(plant);
        plant.tween = null;
      }

      // Add shake effect once.
      if (!plant.tween) {
        plant.tween = game.add.tween(plant);
        plant.tween.to({
            angle: 10
          }, 3000,
          Phaser.Easing.Linear.NONE,
          true /*autostart?*/,
          0 /*delay*/, -1, true);
      }
    });
  };

  return this.plant;
};

Plant.prototype = {
  generate_pickup: function (plant) {
    // Remove old bar
    this.removeSpawnBar(plant);
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
      var barConfig = this.getBarConfig();
      plant.spawnBar = new HealthBar(game, barConfig);
      plant.randomSpawnTime = game.time.now + nextSpawnTime;
    }
    return {
      spawnFunction: spawnFunction,
      nextSpawnTime: nextSpawnTime
    };
  },
  removeSpawnBar: function (plant) {
    if (plant.spawnBar) {
      if (plant.spawnBar.barSprite) {
        plant.spawnBar.barSprite.kill();
      }
      plant.spawnBar.bgSprite.kill();
    }
  },
  updateSpawnBar: function (nextSpawnTime, sprite) {
    SpaceGame._flowerPlants.forEach(function (plant) {
      if (plant.growingItem.key == sprite) {
        // Remove old bar
        Plant.prototype.removeSpawnBar(plant);
        if (plant.alive) {
          // Add spawn bar.
          var barConfig = this.getBarConfig();
          plant.spawnBar = new HealthBar(game, barConfig);
          plant.randomSpawnTime = game.time.now + nextSpawnTime;
        }
      }
    });
  },
  getBarConfig: function () {
    return {
      x: 100,
      y: -40,
      height: 5,
      width: 100,
      bg: {
        color: '#0509D8'
      },
      bar: {
        color: '#20E331'
      }
    };
  }
};
