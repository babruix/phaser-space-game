var Wall = function(x, y) {
  this.wall = game.add.sprite(x, y, 'wall');
  this.wall.anchor.setTo(0.5, 0.5);
  game.physics.p2.enable(this.wall, debug);
  this.wall.body.mass = level*50;
  this.wall.body.static = true;
  this.wall.health = 10;
  SpaceGame._walls.add(this.wall);

  this.wall.body.onBeginContact.add(function (body1, shapeA, shapeB) {

    this.wall.damage(1);
    this.wall.alpha -= 0.1;
  }, this);
};