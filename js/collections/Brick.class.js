var Brick = function() {
  var x2 = game.rnd.integerInRange(0, game.width);
  var y2 = game.rnd.integerInRange(0, game.height);
  this.brick = game.add.sprite(x2, y2, 'brick');
  this.brick.anchor.setTo(0.5, 0.5);

  game.physics.p2.enable(this.brick, debug);
  //this.brick.body.data.gravityScale = 0.05;
  //this.brick.body.static = true;
  this.brick.scale.setTo(.5,.5);

  SpaceGame._bricks.add(this.brick);

  this.brick.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 && body1.sprite != null && body1.sprite.key=='tower') {
      // do not kill pickable items, only tower can pickup.
      // @todo: enemy can pickup?
      this.brick.kill();
      body1.sprite.countBricks++;
      updateScoreText();
    }
  }, this);
  this.brick.events.onKilled.add(function (brick) {
    game.time.events.add(Phaser.Timer.SECOND, Brick.prototype.generateBrick, this);
  });
};

Brick.prototype = {
  generateBrick: function () {
    new Brick();
  }
};