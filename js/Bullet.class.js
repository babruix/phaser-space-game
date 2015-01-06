var Bullet = function(worldX, worldY, enemyBullet) {
  if (enemyBullet) {
    enemy_bullets.createMultiple(1, 'bullet', 0, false);
    this.bullet = enemy_bullets.getFirstExists(false);
    this.bullet.blendMode=6;
    this.bullet.enemyBullet = true;
    this.bullet.towerBullet = false;
    worldY +=10;
  }
  else {
    bullets.createMultiple(1, 'bullet', 0, false);
    this.bullet = bullets.getFirstExists(false);
    this.bullet.enemyBullet = false;
    this.bullet.towerBullet = true;
    this.bullet.blendMode = 0;
  }
  this.bullet.body.setCircle(15);
  this.bullet.body.mass = 100;
  this.bullet.lifespan = 1500;

  this.bullet.reset(worldX, worldY);
  this.bullet.body.damping = 0.1;
  this.bullet.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 == null ||  (body1.sprite != null && body1.sprite.key=='bullet')) {
      this.bullet.destroy();
    }
  }, this);

  return this.bullet;
}