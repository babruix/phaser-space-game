/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../typings/phaser/phaser.d.ts" />
/// <reference path="../../typings/phaser/EPSY.d.ts" />

export class Bullet {
  public body;
  public rotation;

  private game;
  private mainState;
  private bullet;

  constructor(game, worldX, worldY, enemyBullet, freezingBullet?) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];

    if (enemyBullet) {
      this.mainState._enemy_bullets.createMultiple(1, "bullet", 0, false);
      this.bullet = this.mainState._enemy_bullets.getFirstExists(false);
      this.bullet.enemyBullet = true;
      this.bullet.towerBullet = false;
      worldY += 10;
    }
    else {
      if (freezingBullet) {
        this.mainState._frezzing_bullets.createMultiple(1, "freezing_bullet", 0, false);
      }
      else {
        this.mainState._bullets.createMultiple(1, "green_bullet", 0, false);
      }
      this.bullet = this.mainState._bullets.getFirstExists(false);
      this.bullet.enemyBullet = false;
      this.bullet.towerBullet = true;
    }
    this.bullet.freezingBullet = freezingBullet || false;

    if (this.bullet.body) {
      this.bullet.body.setCircle(15);
      this.bullet.body.mass = 100;
      this.bullet.lifespan = 1000;

      this.bullet.reset(worldX, worldY);
      this.bullet.body.damping = 0.1;
      this.bullet.body.onBeginContact.add(function (body1, shapeA, shapeB) {
        if (!body1 || !body1.sprite || !body1.sprite.key) {
          return
        }

        if (body1.sprite.key.ctx) {
          this.bullet.kill();
          return;
        }

        if (body1.sprite.key.indexOf("bullet") >= 0) {
          this.bullet.kill();
        }
      }, this);
    }
    else {
      this.bullet.destroy();
    }

    return this.bullet;
  }
}
