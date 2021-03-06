

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
      this.bullet = this.mainState._enemy_bullets.getFirstDead(true);
      this.bullet.enemyBullet = true;
      this.bullet.towerBullet = false;
      this.bullet.scale.y = -1;
      worldY += 10;
    }
    else {
      this.bullet = this.mainState._bullets.getFirstDead(true);
      this.bullet.enemyBullet = false;
      this.bullet.towerBullet = true;
    }
    this.bullet.reset();
    this.bullet.freezingBullet = freezingBullet || false;
    this.bullet.outOfBoundsKill = true;

    if (this.bullet.body) {
      this.bullet.body.setCircle(15);
      this.bullet.body.mass = 0.1;
      this.bullet.lifespan = 500;

      this.bullet.reset(worldX, worldY);
      this.bullet.body.damping = 0;
      this.bullet.body.onBeginContact.add(function (body1, shapeA, shapeB) {
        if (!body1 || !body1.sprite || !body1.sprite.key) {
          this.bullet.kill();
          return;
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
