var Enemy = function (x, y, anim, animLength) {
  var xDestination = game.rnd.integerInRange(100, game.world.width / 2);
  var rndInt = game.rnd.integerInRange(0, game.audio.ufoSnd.length - 1);
  game.audio.ufoSnd[rndInt].play();
  var ufo = game.add.sprite(xDestination - game.rnd.integerInRange(0, xDestination), 0, 'ufo');
  ufo.animations.add('walk');
  ufo.animations.play('walk', 10, true);
  ufo.anchor.setTo(0.5, 0);
  game.physics.enable(ufo, Phaser.arcade);
  ufo.body.velocity.x = 100;
  ufo.body.mass = 10;
  SpaceGame._ufos.add(ufo);

  this.enemy = game.add.sprite(x, 50, anim);
  this.enemy.anchor.setTo(.5);
  this.enemy.alpha = 0;
  this.enemy.animations.add('walk');
  this.enemy.animations.play('walk', animLength, true);

  this.enemy.ufo_beam = game.add.sprite(0, 50, 'ufo_beam');
  this.enemy.ufo_beam.alpha = 0;
  this.enemy.ufo_beam.anchor.setTo(0.5, 0);

  game.physics.enable(this.enemy);
  this.enemy.body.velocity.x = 100;
  this.enemy.ufo_exists = true;
  this.enemy.ufo = ufo;
  this.enemy.ufo_sound = game.audio.ufoSnd[rndInt];
  ufo.body.velocity.x = 100;
  this.enemy.drop_enemy_at_x = xDestination;

  var _this = this;
  this.enemy.update = function () {
    Enemy.prototype.scale(_this.enemy);
    if (_this.enemy.ufo_exists) {
      if (_this.enemy.ufo.x > _this.enemy.drop_enemy_at_x) {
        _this.enemy.alpha = 1;
        _this.enemy.x = _this.enemy.drop_enemy_at_x;
        _this.enemy.ufo.body.velocity.x = 0;
        _this.enemy.body.velocity.x = 0;
        _this.enemy.body.velocity.y = 20;

        _this.enemy.ufo_beam.x = _this.enemy.ufo.x;
        game.add.tween(_this.enemy.ufo_beam)
          .to({alpha: 0.2}, 200, null, true);

        game.time.events.add(Phaser.Timer.SECOND * 3, function () {
          var beamTween = game.add.tween(_this.enemy.ufo_beam)
            .to({alpha: 0}, 200, null, true);
          beamTween.onComplete.add(function () {
            _this.enemy.ufo_beam.destroy();
          }, this);

          if (_this.enemy.ufo.alive) {
            Enemy.prototype.initEnemy(_this.enemy);
            _this.enemy.ufo.alive = false;
          }

          var ufo_tween = game.add.tween(_this.enemy.ufo);
          ufo_tween.to({
            x: _this.enemy.ufo.x - 200
          }, 1000, Phaser.Easing.Exponential.Out, true);
          ufo_tween.onComplete.add(function () {
            _this.enemy.ufo.destroy();
          }, this);

        }, this);

      }
    }
  };

  SpaceGame.enemys.add(this.enemy);
};

Enemy.prototype = {
  putPlantBack: function (enemy) {
    if (enemy.closestPlant && enemy.closestPlant.alive) {
      enemy.closestPlant.stealing = false;
      enemy.steals = false;
      enemy.closestPlant.y = game.height - 50;
      enemy.closestPlant.angle = 0;
      enemy.closestPlant.scale.x = (1);
      enemy.closestPlant.scale.y = (1);
      enemy.closestPlant = null;
      this.hideStealingSign();
      SpaceGame.Main.prototype.generateGrowingPickups();
    }
  }, 
  initEnemy: function (enemy) {
    enemy.ufo_sound.stop();
    enemy.ufo.animations.stop('walk');
    game.audio.toilSnd.play();
    var x = enemy.x;
    var y = enemy.y;
    var anim = enemy.key;
    var animLength = enemy.animations._outputFrames.length;
    enemy.destroy();

    enemy = game.add.sprite(x, y, anim);
    enemy.health = level * 3;
    enemy.anchor.setTo(0.5, 0.5);
    enemy.speed = 1;
    enemy.speedX = 0;
    enemy.speedY = 0;
    enemy.curTile = 0;
    enemy.boundsPadding = 20;
    enemy.fireTime = 1000;
    enemy.fireLastTime = game.time.now + enemy.fireTime;
    enemy.blockedLastTime = game.time.now + 300;

    enemy.animations.add('walk');
    enemy.animations.play('walk', animLength, true);
    game.physics.p2.enable(enemy, debug);
    enemy.body.mass = 1;
    enemy.body.fixedRotation = true;
    enemy.body.velocity.x = 150;

    // Add  PhysicsEditor bounding shape.
    enemy.body.clearShapes();
    enemy.body.loadPolygon('enemy_physics', anim);

    // Add health bar.
    var barConfig = {
      x: enemy.health,
      y: -40,
      height: 5,
      width: enemy.width,
      bg: {
        color: '#56807D'
      },
      bar: {
        color: '#D81E00'
      }
    };
    enemy.enemyHealthBar = new HealthBar(game, barConfig);

    enemy.ufo_exists = false;
    enemy.ufo = null;

    enemy.body.onBeginContact.add(function (body1) {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {return}

      if (body1.sprite.key.indexOf('bullet') >= 0 && !body1.sprite.enemyBullet) {
        if (!enemy.lastDamage) {
          enemy.lastDamage = game.time.now;
        }
        if (body1.sprite.freezingBullet) {
          enemy.freezed = true;
          enemy.lastFreezed = game.time.now;
          enemy.alpha = 0.2;
        }
        else {
          if (enemy.lastDamage + 500 < game.time.now) {
            enemy.lastDamage = game.time.now;
            game.audio.smackSnd.play();
            enemy.damage(1);
            var style = {
              font: "20px eater",
              fontWeight: 500,
              fill: "#FFF",
              align: "center"
            };
            var shift = enemy.health > 9 ? 11 : 6;
            var cRect = game.add.graphics(0, 0).beginFill(0xff5a00).drawCircle(enemy.x + shift, enemy.y + 13, 30);
            var health = game.add.text(enemy.x, enemy.y, enemy.health, style);
            var health_tween = game.add.tween(cRect).to({alpha: 0.3}, 100,
              Phaser.Easing.Linear.In,
              true /*autostart?*/,
              500 /*delay*/);
            //
            health_tween.onComplete.add(function () {
              health.destroy();
              cRect.destroy();
            }, this);

            score += enemy.health % 3;
          }
        }

        // flash in red
        enemy.tint = 0xFF0010;
        game.time.events.add(300, function() {
          enemy.tint = 0xFFFFFF;
        }, this);

        if (enemy.health == 1) {
          this.explode(enemy);
          this.hideStealingSign();
        }
        this.putPlantBack(enemy);
      }
    }, this);

    enemy.events.onOutOfBounds.add(function (enemy) {
      enemy.destroy();
    }, this);

    enemy.update = function () {
      if (enemy) {
        if (enemy.freezed == true) {
          enemy.body.velocity.x = 0;
          enemy.body.velocity.y = 0;
          // Unfreeze after 4s.
          if (enemy.lastFreezed + Phaser.Timer.SECOND * 4 < game.time.now) {
            enemy.freezed = false;
            enemy.alpha = 1;
          }
        }
        else {
          Enemy.prototype.fire(enemy);
        }

        Enemy.prototype.scale(enemy);
        // Update health bar.
        var bar = enemy.enemyHealthBar;
        if (bar.barSprite) {
          bar.setPercent(enemy.health * 10);
          var y = enemy.y > game.height - enemy.height
            ? enemy.y + 20
            : enemy.y + 30;
          bar.setPosition(enemy.x, y);
        }
      }
    };
    enemy.events.onKilled.add(function (enemy) {
      this.putPlantBack(enemy);
      enemy.enemyHealthBar.barSprite.kill();
      enemy.enemyHealthBar.bgSprite.kill();
      score += level * 3;
      SpaceGame.Main.prototype.changeScoreText();
    }, this);

    SpaceGame.enemys.add(enemy);
  },
  fire: function (enemy) {
    if (enemy.alive && game.time.now > enemy.fireLastTime) {
      game.audio.enemySndFire.play();
      var bullet = new Bullet(enemy.x, enemy.y, true);
      bullet.rotation = parseFloat(game.physics.arcade.angleToXY(bullet, towers.children[0].x, towers.children[0].y)) * 180 / Math.PI;
      game.physics.arcade.moveToObject(bullet, towers.children[0], 500);
      bullet = null;
      enemy.fireLastTime = game.time.now + enemy.fireTime;
    }
  },
  explode: function (enemy) {
    if (enemy.alive) {
      enemy.kill();
      game.audio.explosionSnd.play();

      var explode = game.add.sprite(enemy.x - 100, enemy.y - 150, 'explode', 19);
      //// To load the new texture (('key', frame))
      explode.loadTexture('explode', 0);
      //// Adding an animation ( 'key' )
      explode.animations.add('explode');
      //// To play the animation with the new texture ( 'key', frameRate, loop, killOnComplete)
      explode.animations.play('explode', 19, false, true);

      this.hideStealingSign();
    }
  },
  scale: function (enemy) {
    // Scale depending on enemy.y
    var scale = parseInt(enemy.y / 2.5) / 100;
    scale = scale > 1.5 ? 1.5 : scale;
    scale = scale < 0.3 ? 0.3 : scale;
    enemy.scale.x = scale;
    enemy.scale.y = scale;
  },
  showStealingSign: function (enemy) {
    //SpaceGame._anim_elem.style.display = 'block';
    // show left/right sign
    var stealingDirection = enemy.x < towers.children[0].x ? 'left' : 'right';
    if (stealingDirection == 'left') {
      SpaceGame.enemys.stealSignLeft.alpha = 1;
      SpaceGame.enemys.stealSignRight.alpha = 0;
    }
    else {
      SpaceGame.enemys.stealSignRight.alpha = 1;
      SpaceGame.enemys.stealSignLeft.alpha = 0;
    }

    SpaceGame.enemys.stealSignLeft.x = towers.children[0].x;
    SpaceGame.enemys.stealSignLeft.y = 0;

    SpaceGame.enemys.stealSignRight.x = towers.children[0].x;
    SpaceGame.enemys.stealSignRight.y = 0;
  },
  hideStealingSign: function () {
    // Hide stealing sign.
    SpaceGame.enemys.stealSignLeft.alpha = 0;
    SpaceGame.enemys.stealSignRight.alpha = 0;

    // Hide CSS3 animation effect div
    SpaceGame._anim_elem.style.display = 'none';
  },
  updateEnemy: function (enemy) {
    // Slow down under the rain
    enemy.body.damping = SpaceGame.Main.prototype.checkIntersectsWithRain(enemy)
      ? 0.9
      : 0.4;

    // Steal a plant
    if (enemy.closestPlant && enemy.closestPlant.alive) {
      if (enemy.closestPlant.stealing) {
        SpaceGame.enemys.stealing = true;
        enemy.body.velocity.y = -300;
        enemy.closestPlant.x = enemy.x;
        enemy.closestPlant.y = enemy.y;
      }

      // protect with wall
      if (enemy.y < 200 && towers.children[0].countBricks > 0
        && game.time.now > enemy.blockedLastTime) {
        towers.children[0].countBricks--;

        new Wall(enemy.x, enemy.y - enemy.height);
        enemy.blockedLastTime = game.time.now + 300;
        SpaceGame.Main.prototype.changeScoreText();
      }

      // use/steal plant
      if (enemy.closestPlant.y < 100 && enemy.closestPlant) {
        game.audio.springSnd.play();
        enemy.closestPlant.destroy();
        SpaceGame.Main.prototype.updateScore(true);
      }
    }

    // Plant is too far, forget
    if (enemy.y < 100 && enemy.closestPlant && !SpaceGame.enemys.stealing) {
      enemy.closestPlant.stealing = false;
      enemy.closestPlant = false;
      enemy.steals = false;
    }

    if (enemy.y > 600) {
      // find closest  plant
      enemy.closestPlant = SpaceGame._flowerPlants.getFirstAlive();
      SpaceGame._flowerPlants.forEachAlive(function (plant) {
        if (!plant.stealing && enemy.closestPlant.x - enemy.x < plant.x - enemy.x) {
          enemy.closestPlant = plant;
        }
      });

      if (enemy.closestPlant && enemy.closestPlant.alive) {

        if (Math.abs(enemy.x - enemy.closestPlant.x) > 100) {
          // come close
          enemy.body.velocity.x = 700;
          if (enemy.x > enemy.closestPlant.x) {
            enemy.body.velocity.x *= -1;
          }
        }
        else {
          // plant stealing in progress...
          SpaceGame.enemys.stealing = true;
          Enemy.prototype.showStealingSign(enemy);
          enemy.closestPlant.stealing = true;
          enemy.closestPlant.scale.x = (0.5);
          enemy.closestPlant.scale.y = (0.5);
          enemy.body.velocity.y = -100;
          enemy.closestPlant.x = enemy.x;
          enemy.closestPlant.y = enemy.y;
          enemy.steals = true;
        }

        if (!enemy.steals) {
          enemy.closestPlant = null;
        }
      }
    }
    if (!SpaceGame._flowerPlants.countLiving()) {
      Enemy.prototype.explode(enemy);
    }
  }
};
