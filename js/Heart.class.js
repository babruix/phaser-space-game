var Heart = function() {
  var x2 = parseInt(Math.random() * game.width);
  var y2 = parseInt(Math.random() * game.height);
  this.heart = game.add.sprite(x2, y2, 'heart');
  this.heart.anchor.setTo(0.5, 0.5);

  game.physics.p2.enable(this.heart, debug);
  this.heart.body.data.gravityScale = 0.05;
  //this.heart.body.static = true;
  this.heart.scale.setTo(.3,.3);

  hearts.add(this.heart);

  this.heart.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    this.heart.destroy();
    if (body1 && body1.sprite != null && body1.sprite.key=='tower') {
      game.audio.kissSnd.play();
      body1.sprite.damage(-1);
      updateScoreText();
    }
    game.time.events.add(Phaser.Timer.SECOND * 30 * Math.random(), generateHeart, this);
  }, this);
}