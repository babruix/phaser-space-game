var Bomb = function(x, y) {
  var x2 = x || game.rnd.integerInRange(0, game.width);
  var y2 = y || 0;
  this.bomb = game.add.sprite(x2, y2, 'bomb');
  this.bomb.anchor.setTo(0.5, 0.5);

  game.physics.p2.enable(this.bomb, debug);
  this.bomb.body.data.mass = 7;
  this.bomb.scale.setTo(.8,.8);
  this.bomb.body.damping = 1;

  this.bomb.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

    if (body1.sprite.key != 'spaceship') {
      Missle.prototype.explode(this.bomb);
    }
    else {
      this.bomb.kill();
      game.audio.explosionSnd.play();
      updateScore(true);
    }

  }, this);

  var bomb = this.bomb;
  this.bomb.update = function () {
    if (bomb.alive && bomb.y > game.height - bomb.height) {
      Missle.prototype.explode(bomb);
    }
  };

  SpaceGame._bombs.add(this.bomb);
};

Bomb.prototype = {
  generateBomb: function () {
    new Bomb(0, 100);
  }
};