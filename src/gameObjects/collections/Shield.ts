
import * as Phaser from "phaser";
import {Plant} from "../Plant";

export class Shield {
  private game;
  private mainState;
  private shield;

  constructor(game) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];
    const flowerPlant = this.mainState._flowerPlants.children[0];

    let x2 = flowerPlant.growingItem.x;
    let y2 = flowerPlant.growingItem.y;
    flowerPlant.growingItem.kill();

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
  }
}
