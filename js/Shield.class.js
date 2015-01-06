var Shield = function(x, y) {
  var x2 = x ? x : parseInt(Math.random() * game.width);
  var y2 = y ? y : parseInt(Math.random() * game.height);
  this.shield = game.add.sprite(x2, y2, 'shield');
  this.shield.animations.add('blim');
  this.shield.animations.play('blim', 2, true);
  this.shield.anchor.setTo(0.5, 0.5);

  game.physics.p2.enable(this.shield, debug);
  this.shield.body.data.gravityScale = 0.05;
  //this.shield.body.static = true;
  this.shield.scale.setTo(.5,.5);


  shields.add(this.shield);

  this.shield.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    this.shield.destroy();
    if (body1 && body1.sprite && body1.sprite.key=='tower') {
      body1.sprite.shieldPower+=10;
      updateScoreText();
    }
    game.time.events.add(Phaser.Timer.SECOND * 3.85, generateShield, this);
  }, this);
}