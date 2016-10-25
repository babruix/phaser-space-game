
import * as Phaser from "phaser";

export class Brick {
  private brick;
  private game;
  private mainState;

  constructor(game) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];

    let x2 = this.game.rnd.integerInRange(0, this.game.width);
    let y2 = this.game.rnd.integerInRange(0, this.game.height);
    this.brick = this.game.add.sprite(x2, y2, "brick");
    this.brick.anchor.setTo(0.5, 0.5);

    this.game.physics.p2.enable(this.brick, this.game.debugOn);
    this.brick.scale.setTo(.5, .5);

    this.mainState._bricks.add(this.brick);

    this.brick.body.onBeginContact.add((body1, shapeA, shapeB) => {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {
        return
      }

      if (body1.sprite.key === "spaceship") {

        if (!this.brick.hitCooldown) {
          this.brick.hitCooldown = true;
          this.game.time.events.add(1000, () => this.brick.hitCooldown = false);
        }
        else {
          return;
        }

        // do not kill pickable items, only tower can pickup.
        // @todo: enemy can pickup?
        this.brick.kill();
        body1.sprite.countBricks += 1;
        this.mainState.changeScoreText();
      }
    }, this);
    this.brick.events.onKilled.add(() => {
      this.game.time.events.add(Phaser.Timer.SECOND * this.game.rnd.integerInRange(6, 20), () => new Brick(this.game), this);
    });
  }
}
