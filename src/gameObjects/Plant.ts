/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../typings/phaser/phaser.d.ts" />
/// <reference path="../../typings/phaser/EPSY.d.ts" />
import * as Phaser from "phaser";
import {Ammo} from "../gameObjects/collections/Ammo";
import {Heart} from "../gameObjects/collections/Heart";
import {Fuel} from "../gameObjects/collections/Fuel";
import {Missle} from "../gameObjects/collections/Missle";
import {Shield} from "../gameObjects/collections/Shield";

declare var HealthBar: any;

export class Plant {
  public plant;
  private game;
  private mainState;

  constructor(game) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];

    this.plant = this.game.add.sprite(this.game.width / 2 + 38, this.game.height - 50, "flow");
    this.plant.anchor.setTo(0.5, 1);
    this.plant.angle = -10 * this.game.rnd.integerInRange(0, this.mainState.level);
    this.mainState._flowerPlants.add(this.plant);

    this.plant.update = () => {
      this.game.state.states["Main"]._flowerPlants.forEachAlive((plant) => {
        if (plant.stealing) {
          Plant.removeSpawnBar(plant);
          plant.tween = null;
        }

        // Add shake effect once.
        if (!plant.tween) {
          plant.tween = this.game.add.tween(plant);
          plant.tween.to({
              angle: 10
            }, 3000,
            Phaser.Easing.Linear.None,
            true /*autostart?*/,
            0 /*delay*/, -1, true);
        }
      });
    };

    this.plant.generate_pickup = (plant) => {
      let spawnFunction;
      let nextSpawnTime;
      let maxTimeToSpawn = 30; // Default time to spawn.

      // Remove old bar
      Plant.removeSpawnBar(plant);

      if (plant.alive) {
        if (plant.growingItem) {
          plant.growingItem.kill();
        }
        let defaultItemToGrow = this.game.rnd.integerInRange(0, 5);

        switch (defaultItemToGrow) {
          case 0:
            maxTimeToSpawn = 40;
            plant.growingItem = this.game.add.sprite(plant.x, plant.y + 10, "ammo");
            spawnFunction = () => new Ammo(this.game);
            break;
          case 1:
            plant.growingItem = this.game.add.sprite(plant.x, plant.y + 10, "shield");
            plant.growingItem.animations.add("blim");
            plant.growingItem.animations.play("blim", 2, true);
            spawnFunction = () => new Shield(this.game);
            break;
          case 2:
            maxTimeToSpawn = 100;
            plant.growingItem = this.game.add.sprite(plant.x, plant.y + 10, "heart");
            spawnFunction = () => new Heart(this.game);
            break;
          case 3:
            plant.growingItem = this.game.add.sprite(plant.x, plant.y + 10, "fuel");
            spawnFunction = () => new Fuel(this.game);
            break;
          case 4:
            plant.growingItem = this.game.add.sprite(plant.x, plant.y + 10, "missle");
            spawnFunction = () => new Missle(this.game);
            break;
          case 5:
            maxTimeToSpawn = 40;
            plant.growingItem = this.game.add.sprite(plant.x, plant.y + 10, "ammo");
            spawnFunction = () => new Ammo(this.game);
            break;
        }
        nextSpawnTime = Phaser.Timer.SECOND * this.game.rnd.integerInRange(0, maxTimeToSpawn);
        plant.growingItem.scale.setTo(.4, .4);
        plant.growingItem.blendMode = 4;

        // Add spawn bar.
        let barConfig = Plant.getBarConfig();
        plant.spawnBar = new HealthBar(this.game, barConfig);
        plant.randomSpawnTime = this.game.time.now + nextSpawnTime;
      }
      return {
        spawnFunction: spawnFunction,
        nextSpawnTime: nextSpawnTime
      };
    };

    Plant.removeSpawnBar = (plant) => {
      if (plant.spawnBar) {
        if (plant.spawnBar.barSprite) {
          plant.spawnBar.barSprite.kill();
        }
        plant.spawnBar.bgSprite.kill();
      }
    };

    this.plant.updatePlant = (plant) => {
      let bar = plant.spawnBar;
      if (bar) {
        if (!plant.stealing) {
          bar.barSprite.alpha = 1;
          bar.bgSprite.alpha = 1;
        }
        else {
          bar.barSprite.alpha = 0;
          bar.bgSprite.alpha = 0;
        }
        if (plant.alive) {
          let newValue = (plant.randomSpawnTime - this.game.time.now) * 100 / plant.randomSpawnTime;
          bar.setPercent(newValue);
          bar.setPosition(plant.x, plant.y);
        }
      }
    };

    return this.plant;
  }

  static removeSpawnBar(plant) {
    Plant.removeSpawnBar(plant);
  }

  static updateSpawnBar(nextSpawnTime, sprite, plant) {
    if (plant.growingItem && plant.growingItem.key === sprite) {
      // Remove old bar
      Plant.removeSpawnBar(plant);
      if (plant.alive) {
        // Add spawn bar.
        let barConfig = Plant.getBarConfig();
        plant.spawnBar = new HealthBar(plant.game, barConfig);
        plant.randomSpawnTime = plant.game.time.now + nextSpawnTime;
      }
    }
  }

  static getBarConfig() {
    return {
      x: 100,
      y: -40,
      height: 5,
      width: 100,
      bg: {
        color: "#0509D8"
      },
      bar: {
        color: "#20E331"
      }
    };
  }

}
