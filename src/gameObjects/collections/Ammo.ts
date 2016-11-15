
import * as Phaser from "phaser";
import {Plant} from "../Plant";

export class Ammo {
  private game;
  private mainState;
  private ammo;

  constructor(game) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];
    const flowerPlant = this.mainState._flowerPlants.children[0];


    let x2 = flowerPlant.growingItem.x;
    let y2 = flowerPlant.growingItem.y;
    flowerPlant.growingItem.kill();

    this.ammo = game.add.sprite(x2, y2, "ammo");
    this.ammo.anchor.setTo(0.5, 0.5);
    game.physics.p2.enable(this.ammo, this.game.debugOn);

    this.mainState._ammos.add(this.ammo);

    this.ammo.body.onBeginContact.add((body1, shapeA, shapeB) => {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {
        return
      }

      if (body1.sprite.key === "spaceship") {

        if (!this.ammo.hitCooldown) {
          this.ammo.hitCooldown = true;
          game.time.events.add(1000, () => this.ammo.hitCooldown = false);
        }
        else {
          return;
        }

        // do not kill pickable items, only tower can pickup.
        // @todo: enemy can pickup?
        this.ammo.kill();
        game.audio.reloadSnd.play();
        this.mainState.towers.children[0].bullets += this.mainState.level * 10;
        this.mainState.changeScoreText();
      }
    });
  }
}
