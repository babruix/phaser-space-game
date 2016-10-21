/// <reference path="../../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../../typings/phaser/phaser.d.ts" />
/// <reference path="../../../typings/phaser/EPSY.d.ts" />
import * as Phaser from 'phaser';
import {Plant} from "../Plant";
import {ScreenUtils} from '../../utils/screenutils';

export class Ammo {
  private game;
  private mainState;
  private ammo;

  constructor(game) {
    this.game = game;
    this.mainState = this.game.state.states['Main'];

    var x2 = game.rnd.integerInRange(0, game.width);
    this.mainState._flowerPlants.forEachAlive((plant)=> {
      if (plant.growingItem.key == 'ammo') {
        x2 = plant.x;
        Plant.prototype.removeSpawnBar(plant);
      }
    });
    var y2 = game.rnd.integerInRange(0, game.height*ScreenUtils.screenMetrics.scaleY);
    this.ammo = game.add.sprite(x2, y2, 'ammo');
    this.ammo.anchor.setTo(0.5, 0.5);
    game.physics.p2.enable(this.ammo, this.game.debugOn);

    this.mainState._ammos.add(this.ammo);

    this.ammo.body.onBeginContact.add((body1, shapeA, shapeB)=> {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

      if (body1.sprite.key=='spaceship') {

        if (!this.ammo.hitCooldown) {
          this.ammo.hitCooldown = true;
          game.time.events.add(1000, ()=>this.ammo.hitCooldown = false);
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
    this.ammo.events.onKilled.add((ammo) =>{
      var nextSpawnTime = Phaser.Timer.SECOND * game.rnd.integerInRange(20, 40);
      this.mainState._ammoTimer = game.time.events.add(nextSpawnTime, ()=>new Ammo(this.game), this);
      this.mainState._flowerPlants.forEach(plant => Plant.prototype.updateSpawnBar(nextSpawnTime, 'ammo', plant));
    });
  }
}
