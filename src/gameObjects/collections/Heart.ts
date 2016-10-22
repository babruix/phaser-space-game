/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../../typings/phaser/phaser.d.ts" />
/// <reference path="../../../typings/phaser/EPSY.d.ts" />
import * as Phaser from "phaser";
import {Plant} from "../Plant";

export class Heart {
  private game;
  private mainState;
  private heart;

  constructor(game) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];

    let x2 = game.rnd.integerInRange(0, game.width);
    this.mainState._flowerPlants.forEachAlive((plant) => {
      if (plant.growingItem.key === "heart") {
        x2 = plant.x;
        Plant.prototype.removeSpawnBar(plant);
      }
    });
    let y2 = game.rnd.integerInRange(0, game.height);
    this.heart = game.add.sprite(x2, y2, "heart");
    this.heart.anchor.setTo(0.5, 0.5);

    game.physics.p2.enable(this.heart, this.game.debugOn);
    this.heart.scale.setTo(.3, .3);

    this.mainState._hearts.add(this.heart);

    this.heart.body.onBeginContact.add((body1, shapeA, shapeB) => {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

      if (body1.sprite.key === "spaceship") {

        if (!this.heart.hitCooldown) {
          this.heart.hitCooldown = true;
          game.time.events.add(1000, () => this.heart.hitCooldown = false);
        }
        else {
          return;
        }

        // do not kill pickable items, only tower can pickup.
        // @todo: enemy can pickup?
        this.heart.kill();
        game.audio.kissSnd.play();
        this.mainState.lives++;
        this.mainState.drawLivesSprites();
        this.mainState.changeScoreText();
      }
    });
    this.heart.events.onKilled.add((heart) => {
      let nextSpawnTime = Phaser.Timer.SECOND * game.rnd.integerInRange(70, 100);
      this.mainState._heartTimer = game.time.events.add(nextSpawnTime, () => new Heart(this.game), this);
      this.mainState._flowerPlants.forEach(plant => Plant.prototype.updateSpawnBar(nextSpawnTime, "heart", plant));
    });
  }
}
