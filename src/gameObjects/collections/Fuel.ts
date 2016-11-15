
import * as Phaser from "phaser";
import {Plant} from "../Plant";

export class Fuel {
  private game;
  private mainState;
  private fuel;

  constructor(game) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];
    const flowerPlant = this.mainState._flowerPlants.children[0];


    let x2 = flowerPlant.growingItem.x;
    let y2 = flowerPlant.growingItem.y;
    flowerPlant.growingItem.kill();

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
  }
}
