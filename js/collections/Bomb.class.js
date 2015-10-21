var Bomb = function() {
  var x2 = game.rnd.integerInRange(0, game.width);
  this.bomb = game.add.sprite(x2, 0, 'bomb');
  this.bomb.anchor.setTo(0.5, 0.5);

  game.physics.p2.enable(this.bomb, debug);
  this.bomb.body.data.mass = 7;
  this.bomb.scale.setTo(.8,.8);
  this.bomb.body.damping = 1;

  this.bomb.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 && body1.sprite != null) {

      if (!this.bomb.hitCooldown) {
        this.bomb.hitCooldown = true;
        game.time.events.add(1000, function () {
          this.bomb.hitCooldown = false;
        }, this);
      }
      else {
        return;
      }


      if (body1.sprite.key != 'spaceship') {
        for (var i = 0, x = SpaceGame.enemySprites.length; i < x; i++) {
          if (SpaceGame.enemySprites[i].name == body1.sprite.key) {
            this.bomb.kill();
            game.audio.explosionSnd.play();
            body1.sprite.damage(10);
            updateScoreText();
            break;
          }
        }
      }
      else {
        this.bomb.kill();
        game.audio.explosionSnd.play();
        updateScore(true);
      }
    }
  }, this);
  var _this = this;
  this.bomb.update = function () {
    if (_this.bomb.alive && _this.bomb.y > game.height - _this.bomb.height) {
      _this.bomb.kill();
    }
  };
  this.bomb.events.onKilled.add(function (bomb) {
    game.audio.explosionSnd.play();
    var explode = game.add.sprite(bomb.x - 100, bomb.y - 150, 'explode', 19);
    var anim = explode.animations.add('explode');
    explode.animations.play('explode', 19, false, true);
    anim.onComplete.add(function () {
      Bomb.prototype.generateBomb();
    });
  }, this);

  SpaceGame._bombs.add(this.bomb);
};

Bomb.prototype = {
  generateBomb: function () {
    new Bomb();
  }
};