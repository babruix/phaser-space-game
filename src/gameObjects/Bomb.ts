/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../typings/phaser/phaser.d.ts" />
/// <reference path="../../typings/phaser/EPSY.d.ts" />

import {ScreenUtils} from '../utils/screenutils';
import {Missle} from '../gameObjects/collections/Missle';

export class Bomb {
  private game;
  private mainState;
  private bomb;

  constructor(game, x, y) {
    this.game = game;
    this.mainState = this.game.state.states['Main'];

    var x2 = x || game.rnd.integerInRange(0, game.width);
    var y2 = y || 0;
    this.bomb = game.add.sprite(x2, y2, 'bomb');
    this.bomb.anchor.setTo(0.5, 0.5);

    game.physics.p2.enable(this.bomb, this.game.debugOn);
    this.bomb.body.data.mass = 7;
    this.bomb.scale.setTo(.8,.8);
    this.bomb.body.damping = 1;

    this.bomb.body.onBeginContact.add((body1, shapeA, shapeB)=> {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

      if (body1.sprite.key != 'spaceship') {
        this.game = game;
        Missle.prototype.explode.call(this, this.bomb);
      }
      else {
        if (this.bomb.alive) {
          this.bomb.destroy();
          game.audio.explosionSnd.play();
          this.mainState.updateScore(true);
        }
      }
    });

    var bomb = this.bomb;
    this.bomb.update = ()=> {
      if (bomb.alive && bomb.y > game.height - bomb.height) {
        Missle.prototype.explode.call(this, bomb);
      }
    };

    this.mainState._bombs.add(this.bomb);
  }

}
