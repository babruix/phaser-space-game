
import * as Phaser from "phaser";
import {Plant} from "../Plant";

export class Fuel {
  private game;
  private mainState;
  private fuel;

  constructor(game) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];

    let x2 = game.rnd.integerInRange(0, game.width);
    this.mainState._flowerPlants.forEachAlive((plant) => {
      if (plant.growingItem.key === "fuel") {
        x2 = plant.x;
        Plant.removeSpawnBar(plant);
      }
    });
    let y2 = game.rnd.integerInRange(0, game.height);
    this.fuel = game.add.sprite(x2, y2, "fuel");
    this.fuel.anchor.setTo(0.5, 0.5);
    game.physics.p2.enable(this.fuel, this.game.debugOn);

    this.mainState._fuels.add(this.fuel);

    this.fuel.body.onBeginContact.add((body1, shapeA, shapeB) => {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {
        return
      }

      if (body1.sprite.key === "spaceship") {

        if (!this.fuel.hitCooldown) {
          this.fuel.hitCooldown = true;
          game.time.events.add(1000, () => this.fuel.hitCooldown = false);
        }
        else {
          return;
        }

        // do not kill pickable items, only tower can pickup.
        // @todo: enemy can pickup?
        this.fuel.kill();
        game.audio.reloadSnd.play();
        this.mainState.towers.children[0].fuel += this.mainState.level * 20;
        this.mainState.changeScoreText();
      }
    });
    this.fuel.events.onKilled.add((fuel) => {
      let nextSpawnTime = Phaser.Timer.SECOND * game.rnd.integerInRange(20, 40);
      this.mainState._fuelTimer = game.time.events.add(nextSpawnTime, () => new Fuel(this.game), this);
      this.mainState._flowerPlants.forEach(plant => Plant.updateSpawnBar(nextSpawnTime, "fuel", plant));
    });
  }
}
