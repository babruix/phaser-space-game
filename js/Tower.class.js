var Tower = function (worldX, worldY, tile) {
  this.tower = game.add.sprite(worldX, worldY, tile);
  this.tower.worldX = worldX;
  this.tower.worldY = worldY;
  this.tower.health = 10;
  this.tower.fireTime = 200;
  this.tower.wallTime = 100;
  this.tower.missles = 0;
  this.tower.countBricks = 0;
  this.tower.shieldPower = 0;
  this.tower.fireLastTime = game.time.now + this.tower.fireTime;
  this.tower.wallLastTime = game.time.now + this.tower.wallTime;
  game.physics.p2.enable(this.tower, debug);

  this.tower.body.data.gravityScale = 5;
  this.tower.body.mass = 10;
  this.tower.body.damping = 0.1;
  this.tower.body.fixedRotation = true;
  this.tower.body.collideWorldBounds = true;
  towers.add(this.tower);
  game.camera.follow(this.tower);
  this.tower.body.onBeginContact.add(function (body1, shapeA, shapeB) {
    if (body1 && body1.sprite != null && body1.sprite.key == 'bullet') {
      game.audio.smackSnd.play();
      if (typeof(body1.sprite.enemyBullet) != "undefined"
        && body1.sprite.alive
        && body1.sprite.enemyBullet == true) {
        if (body1.sprite.y > 690) {
          return;
        }
        if (this.tower.shieldPower > 0) {
          this.tower.shieldPower -= 10;
        }
        else {
          body1.sprite.destroy();
          towers.children[0].fireTime += 1;
          this.tower.damage(1);
        }

        if (this.tower.health <= 1) {
          this.tower.health = 10;
          updateScore(true);
        }
        updateScoreText();
      }

    }
  }, this);
  this.tower.events.onKilled.add(function() {
    if(shipTrail != undefined) {
      shipTrail.destroy();
    }
  });
};

Tower.prototype = {
  addToPoint: function (worldX, worldY) {
    new Tower(worldX, worldY, 'tower');
    towers.children[0].alpha = 0;
    game.add.tween(towers.children[0]).to({alpha: 1}, 500,
      Phaser.Easing.Linear.In,
      true, //autostart?,
      1000, //delay,
      true, //yoyo?
      false
    );

    // Add an emitter for the ship's trail
    shipTrail = game.add.emitter(game, towers.children[0].x, towers.children[0].y + 10, 400);
    shipTrail.width = 10;
    shipTrail.makeParticles('emit');
    shipTrail.setXSpeed(30, -30);
    shipTrail.setYSpeed(200, 180);
    shipTrail.setRotation(50, -50);
    shipTrail.setAlpha(1, 0.01, 800);
    shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    shipTrail.start(false, 5000, 10);
    //shipTrail.alpha = 0;
  },
  fire: function (tower) {
    if (tower.alive && game.time.now > tower.fireLastTime) {
      game.audio.playerSndFire.play();
      var bullet = new Bullet(tower.x, tower.y - 1, false);
      if (bullet != undefined && bullet.body != undefined) {
        bullet.body.moveUp(500*level);
        //game.physics.arcade.moveToObject(bullet, towers.children[0], level*100);
        bullet = null;
        tower.fireLastTime = game.time.now + tower.fireTime;
      }
    }
  },
  fireMissle: function (tower) {
    if (tower.alive && tower.missles > 0 && game.time.now > tower.fireLastTime) {
      game.audio.missleSnd.play();
      tower.missles--;
      updateScoreText();
      var missle = new Missle(tower.x + tower.width / 2, tower.y - tower.height * 2, false);
      if (missle != undefined && missle.body != undefined) {
        missle.body.moveUp(1800);
        missle = null;
        tower.fireLastTime = game.time.now + tower.fireTime;
      }
    }
  },
  addWall: function (tower) {
    if (tower.countBricks > 0 && game.time.now > tower.wallLastTime) {
      game.audio.laughSnd.play();
      tower.countBricks--;
      updateScoreText();
      new Wall(tower.x, tower.y);
      tower.wallLastTime = game.time.now + tower.wallTime;
    }
  },
  redrawProtectRect: function (tower) {
    if (tower.shieldPower > 0) {
      if (protectRect != undefined) {
        protectRect.destroy();
      }
      protectRect = game.add.graphics(0, 0);
      protectRect.lineWidth = towers.children[0].shieldPower / 10;
      protectRect.lineColor = 0xFFFFFF;
      protectRect.alpha = 0.7;
      protectRect.drawCircle(towers.children[0].x, towers.children[0].y, 30 + towers.children[0].shieldPower / 10);
    }
  }
};
