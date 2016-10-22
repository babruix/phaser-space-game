/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../../typings/phaser/phaser.d.ts" />
/// <reference path="../../../typings/phaser/EPSY.d.ts" />
import * as Phaser from 'phaser';
import {Plant} from "../Plant";
import {Main} from '../../gameStates/Main';
import {ScreenUtils} from '../../utils/screenutils';

export class Missle {
  private game;
  private mainState;
  private missle;

  constructor(game, x?, y?, fired?) {
    this.game = game;
    this.mainState = this.game.state.states['Main'];

    var x2 = x ? x : game.rnd.integerInRange(0, game.width);
    if (!fired) {
      this.mainState._flowerPlants.forEachAlive((plant)=> {
        if (plant.growingItem.key == 'missle') {
          x2 = plant.x;
          Plant.prototype.removeSpawnBar(plant);
        }
      });
    }
    var y2 = y ? y : game.rnd.integerInRange(0, game.height);
    this.mainState._missles.createMultiple(1, 'missle', 0, false);
    this.missle = this.mainState._missles.getFirstExists(false);
    this.missle.body.setCircle(15);
    this.missle.body.mass = 10;
    this.missle.body.damping = 0.01;
    this.missle.towerBullet = true;
    this.missle.enemyBullet = false;
    this.missle.activated = fired || false;
    this.missle.reset(x2, y2);

    this.missle.body.onBeginContact.add((body1, shapeA, shapeB)=> {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

      if (body1.sprite.key != 'spaceship') {
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
    this.missle.events.onKilled.add((missle)=> {
      var nextSpawnTime = Phaser.Timer.SECOND * game.rnd.integerInRange(10, 30);
      this.mainState._missleTimer = game.time.events.add(nextSpawnTime, () => new Missle(game));
      this.mainState._flowerPlants.forEach(plant => Plant.prototype.updateSpawnBar(nextSpawnTime, 'missle', plant));
    });
    var missle = this.missle;
    this.missle.update = ()=> {
      if (missle.y < 100) {
        Missle.prototype.explode.call(this, missle);
      }
    };
    return this. missle;
  }

    explode (missle) {
      if (missle.alive) {
        missle.destroy();
        this.game.audio.explosionSnd.play();
        var explode = this.game.add.sprite(missle.x - 100, missle.y - 150, 'explode', 19);
        explode.animations.add('explode');
        explode.animations.play('explode', 19, false, true);

        // Kill everybody who is close
        [this.mainState.enemys,
          this.mainState._walls,
          this.mainState._bombs,
          this.mainState._satelites
        ].forEach((group)=>{
          group.forEachAlive((sprite)=> {
            if (!sprite.ufo_exists && Main.caculatetDistance(missle, sprite) < 50) {
              sprite.kill();
            }
          });
        });
      }
    }
}
