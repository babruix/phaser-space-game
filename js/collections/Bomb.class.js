var Bomb = function() {
  var x2 = game.rnd.integerInRange(0, game.width);
  this.bomb = game.add.sprite(x2, 0, 'bomb');
  this.bomb.anchor.setTo(0.5, 0.5);

  game.physics.p2.enable(this.bomb, debug);
  //this.bomb.body.data.gravityScale = 0.01;
  //this.bomb.body.data.mass = 0.1;
  //this.bomb.body.static = true;
  this.bomb.scale.setTo(.5,.5);
  this.bomb.body.damping = 0.9;

  //this.bomb.body.checkWorldBounds = true;
  //this.bomb.body.collideWorldBounds = false;


  this.bomb.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 && body1.sprite != null) {
      if (body1.sprite.key != 'tower') {
        for (var i = 0, x = enemySprites.length; i < x; i++) {
          if (enemySprites[i].name == body1.sprite.key) {
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
        body1.sprite.damage(10);
        updateScoreText();
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