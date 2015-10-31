var Wall = function (x, y) {
  var walls = ["a", "b", "c"];
  var wall_key = game.rnd.integerInRange(0, 2);
  this.wall = game.add.sprite(x, y, 'wall-' + walls[wall_key]);
  this.wall.anchor.setTo(0.5, 0.5);
  game.physics.p2.enable(this.wall, debug);
  this.wall.body.mass = level * 50;
  this.wall.body.static = true;
  this.wall.health = 50;
  SpaceGame._walls.add(this.wall);

  this.wall.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (towers.children[0].wallLastTime + 1000 > game.time.now) {
      return;
    }
    this.wall.damage(1);
    this.wall.alpha -= 0.1;
  }, this);
};