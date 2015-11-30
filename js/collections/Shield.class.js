var Shield = function() {
  var x2 = game.rnd.integerInRange(0, game.width);
  SpaceGame._flowerPlants.forEachAlive(function (plant) {
    if (plant.growingItem.key == 'shield') {
      x2 = plant.x;
    }
  });
  var y2 = game.rnd.integerInRange(0, game.height);
  this.shield = game.add.sprite(x2, y2, 'shield');
  this.shield.animations.add('blim');
  this.shield.animations.play('blim', 2, true);
  this.shield.anchor.setTo(0.5, 0.5);

  game.physics.p2.enable(this.shield, debug);
  //this.shield.body.data.gravityScale = 0.05;
  //this.shield.body.static = true;
  this.shield.scale.setTo(.5,.5);


  SpaceGame._shields.add(this.shield);

  this.shield.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 && body1.sprite && body1.sprite.key=='spaceship') {

      if (!this.shield.hitCooldown) {
        this.shield.hitCooldown = true;
        game.time.events.add(1000, function () {
          this.shield.hitCooldown = false;
        }, this);
      }
      else {
        return;
      }

      // do not kill pickable items, only tower can pickup.
      // @todo: enemy can pickup?
      this.shield.kill();
      body1.sprite.shieldPower+=10;
      updateScoreText();
    }
  }, this);
  this.shield.events.onKilled.add(function (shield) {
    SpaceGame._shieldTimer = game.time.events.add(Phaser.Timer.SECOND * 4, Shield.prototype.generateShield, this);
    // @todo: update spawn bar
  });
};

Shield.prototype = {
  generateShield: function () {
    new Shield();
  }
};