
import * as Phaser from "phaser";
import {Plant} from "../Plant";
import {Main} from "../../gameStates/Main";

export class Missle {
  private game;
  private mainState;
  private missle;

  constructor(game, x?, y?, fired = false) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];
    const flowerPlant = this.mainState._flowerPlants.children[0];
    let x2, y2;

    if (!fired) {
      x2 = flowerPlant.growingItem.x;
      y2 = flowerPlant.growingItem.y;
      flowerPlant.growingItem.kill();
    }
    else {
      x2 = x;
      y2 = y;
    }

    this.mainState._missles.createMultiple(1, "missle", 0, false);
    this.missle = this.mainState._missles.getFirstExists(false);
    this.missle.checkWorldBounds = true;
    this.missle.outOfBoundsKill = true;
    this.missle.collideWorldBounds = false;
    this.missle.anchor.x = 0.5;
    this.missle.anchor.y = 1;
    this.missle.tracking = true;

    this.missle.body.setCircle(15);
    this.missle.body.mass = 0.1;
    this.missle.body.damping = 0;
    this.missle.towerBullet = true;
    this.missle.enemyBullet = false;
    this.missle.activated = fired || false;
    this.missle.reset(x2, y2);

    this.missle.body.onBeginContact.add((body1, shapeA, shapeB) => {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {
        return
      }

      if (body1.sprite.key !== "spaceship") {
        Missle.prototype.explode.call(this, this.missle);
      }
      else {
        if (!this.missle.activated) {
          // pickup
          game.audio.laughSnd.play();
          body1.sprite.missles++;
          this.mainState.changeScoreText();
          this.missle.kill();
        }
      }

    }, this);

    let missle = this.missle;
    this.missle.update = () => {
      if (missle.y < 100) {
        Missle.prototype.explode.call(this, missle);
      }
    };
    return this.missle;
  }

  explode(missle) {
    if (missle.alive) {
      missle.destroy();
      this.game.audio.explosionSnd.play();
      let explode = this.game.add.sprite(missle.x - 100, missle.y - 150, "explode", 19);
      explode.animations.add("explode");
      explode.animations.play("explode", 19, false, true);

      // Kill everybody who is close
      [this.mainState.enemys,
        this.mainState._walls,
        this.mainState._bombs,
        this.mainState._satelites
      ].forEach((group) => {
        group.forEachAlive((sprite) => {
          if (!sprite.ufo_exists && Main.caculatetDistance(missle, sprite) < 70) {
            sprite.kill();
          }
        });
      });
    }
  }
}
