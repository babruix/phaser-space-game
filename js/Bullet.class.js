var Bullet = function (worldX, worldY, enemyBullet, freezingBullet) {

  if (enemyBullet) {
    SpaceGame._enemy_bullets.createMultiple(1, 'bullet', 0, false);
    this.bullet = SpaceGame._enemy_bullets.getFirstExists(false);
    this.bullet.enemyBullet = true;
    this.bullet.towerBullet = false;
    worldY += 10;
  }
  else {
    if (freezingBullet) {
      SpaceGame._frezzing_bullets.createMultiple(1, 'freezing_bullet', 0, false);
    }
    else {
      SpaceGame._bullets.createMultiple(1, 'green_bullet', 0, false);
    }
    this.bullet = SpaceGame._bullets.getFirstExists(false);
    this.bullet.enemyBullet = false;
    this.bullet.towerBullet = true;
  }
  this.bullet.freezingBullet = freezingBullet || false;

  if (this.bullet.body) {
    this.bullet.body.setCircle(15);
    this.bullet.body.mass = 100;
    this.bullet.lifespan = 15000;

    this.bullet.reset(worldX, worldY);
    this.bullet.body.damping = 0.1;
    this.bullet.body.onBeginContact.add(function (body1, shapeA, shapeB) {
      if (body1 == null || (body1.sprite != null && body1.sprite.key.indexOf('bullet') >= 0)) {
        this.bullet.kill();
      }
    }, this);
  }
  else {
    this.bullet.destroy();
  }

  return this.bullet;
}