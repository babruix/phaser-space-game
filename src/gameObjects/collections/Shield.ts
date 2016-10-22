/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../../typings/phaser/phaser.d.ts" />
/// <reference path="../../../typings/phaser/EPSY.d.ts" />
import * as Phaser from "phaser";
import {Plant} from "../Plant";

export class Shield {
  private game;
  private mainState;
  private shield;

  constructor(game) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];

    let x2 = game.rnd.integerInRange(0, game.width);
    this.mainState._flowerPlants.forEachAlive((plant) => {
      if (plant.growingItem.key === "shield") {
        x2 = plant.x;
        Plant.removeSpawnBar(plant);
      }
    });
    let y2 = game.rnd.integerInRange(0, game.height);
    this.shield = game.add.sprite(x2, y2, "shield");
    this.shield.animations.add("blim");
    this.shield.animations.play("blim", 2, true);
    this.shield.anchor.setTo(0.5, 0.5);

    game.physics.p2.enable(this.shield, this.game.debugOn);
    this.shield.scale.setTo(.5, .5);

    this.mainState._shields.add(this.shield);

    this.shield.body.onBeginContact.add((body1, shapeA, shapeB) => {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {
        return
      }

      if (body1.sprite.key === "spaceship") {

        if (!this.shield.hitCooldown) {
          this.shield.hitCooldown = true;
          game.time.events.add(1000, () => this.shield.hitCooldown = false);
        }
        else {
          return;
        }

        // do not kill pickable items, only tower can pickup.
        // @todo: enemy can pickup?
        this.shield.kill();
        body1.sprite.shieldPower += 10;
        this.mainState.changeScoreText();
      }
    });

    this.shield.events.onKilled.add((shield) => {
      let nextSpawnTime = Phaser.Timer.SECOND * 4;
      this.mainState._shieldTimer = game.time.events.add(nextSpawnTime, () => new Shield(this.game), this);
      this.mainState._flowerPlants.forEach(plant => Plant.updateSpawnBar(nextSpawnTime, "shield", plant));
    });
  }
}
