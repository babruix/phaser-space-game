var Enemy = function (x, y, anim, animLength) {
  var x2 = game.rnd.integerInRange(100, game.width-200);
  var rndInt = game.rnd.integerInRange(0, game.audio.ufoSnd.length-1);
  game.audio.ufoSnd[rndInt].play();
  var ufo = game.add.sprite(0, 0, 'ufo');
  ufo.animations.add('walk');
  ufo.animations.play('walk', 10, true);
  ufo.anchor.setTo(0.5, 0);
  game.physics.enable(ufo, Phaser.arcade);
  ufo.body.velocity.x = 100;
  ufo.body.mass = 10;
  ufos.add(ufo);

  this.enemy = game.add.sprite(x, 0, anim);
  this.enemy.animations.add('walk');
  this.enemy.animations.play('walk', animLength, true);

  game.physics.enable(this.enemy, Phaser.arcade);
  this.enemy.body.velocity.x = 100;
  this.enemy.ufo_exists = true;
  this.enemy.ufo = ufo;
  this.enemy.ufo_sound = game.audio.ufoSnd[rndInt];
  ufo.body.velocity.x = 100;
  this.enemy.to_x = x2;

  var _this = this;
  this.enemy.update = function () {
    Enemy.prototype.scale(_this.enemy);
    if (_this.enemy.ufo_exists) {
      var ufoScale = parseInt(_this.enemy.ufo.x / 5) / 100;
      ufoScale = ufoScale > 1 ? 1 : ufoScale;
      ufoScale = ufoScale < 0.1 ? 0.1 : ufoScale;
      _this.enemy.ufo.scale.x = ufoScale;
      _this.enemy.ufo.scale.y = ufoScale;
      if (_this.enemy.ufo.x > _this.enemy.to_x) {
        _this.enemy.ufo.body.velocity.x = 0;
        _this.enemy.body.velocity.x = 0;
        _this.enemy.body.velocity.y = 20;
        var ufo_tween = game.add.tween(_this.enemy.ufo);
        ufo_tween.to({
            width: 0,
            height: 0
          }, 3000 /*duration of the tween (in ms)*/,
          Phaser.Easing.Bounce.Out /*easing type*/,
          true /*autostart?*/,
          1000 /*delay*/,
          false /*yoyo?*/, false);

        ufo_tween.onLoop.add(function () {
          if (_this.enemy.ufo.alive) {
            Enemy.prototype.initEnemy(_this.enemy);
          }
          _this.enemy.ufo.destroy();
        });

      }
    }
  };

  enemys.add(this.enemy);
};

Enemy.prototype = {
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
    enemy.health = level * 2;
    enemy.anchor.setTo(0.5, 0.5);
    enemy.speed = 1;
    enemy.speedX = 0;
    enemy.speedY = 0;
    enemy.curTile = 0;
    enemy.boundsPadding = 20;
    enemy.fireTime = 1000;
    enemy.fireLastTime = game.time.now + enemy.fireTime;

    enemy.animations.add('walk');
    enemy.animations.play('walk', animLength, true);
    game.physics.p2.enable(enemy, debug);
    enemy.body.mass = 1;
    enemy.body.velocity.x = 150;

    enemy.ufo_exists = false;
    enemy.ufo = null;

    enemy.body.onBeginContact.add(function (body1, shapeA, shapeB) {
      if (!body1 || !body1.sprite) return;
      if (body1.sprite.key == 'bullet' && !body1.sprite.enemyBullet) {
        game.audio.smackSnd.play();
        enemy.damage(1);
        var style = {
          font: "20px Tahoma",
          fontWeight: 500,
          fill: "#FFF",
          align: "center"
        };
        var shift = enemy.health > 9 ? 11 : 6;
        var cRect = game.add.graphics(0, 0).beginFill(0xff5a00).drawCircle(enemy.x + shift, enemy.y + 13, 30);
        var health = game.add.text(enemy.x, enemy.y, enemy.health, style);
        var health_tween = game.add.tween(cRect).to({alpha: 0.3}, 500,
          Phaser.Easing.Elastic.In,
          true /*autostart?*/,
          1000 /*delay*/,
          false /*yoyo?*/);
        //
        health_tween.onLoop.add(function () {
          health.destroy();
          cRect.destroy();
        }, this);

        if (enemy.health == 1) {
          this.explode(enemy);
        }
      }
    }, this);

    enemy.update = function () {
      if (typeof enemy != "undefined") {
        Enemy.prototype.fire(enemy);
        Enemy.prototype.scale(enemy);
      }
    }

    enemy.events.onKilled.add(function () {
      if (enemys.countLiving() == 0 && allEnemysAdded) {
        this.explode(enemy);
        updateScore();
        levelCompleted();
      }
    }, this);

    enemys.add(enemy);
  },
  fire: function (enemy) {
    if (enemy.alive && game.time.now > enemy.fireLastTime && bullets.countLiving() < 5) {
      game.audio.enemySndFire.play();
      towers.children[0].fireTime += 0.5;
      var bullet = new Bullet(enemy.x, enemy.y, true);
      bullet.rotation = parseFloat(game.physics.arcade.angleToXY(bullet, towers.children[0].x, towers.children[0].y)) * 180 / Math.PI;
      game.physics.arcade.moveToObject(bullet, towers.children[0], level*50);
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

    }
  },
  scale: function(enemy) {
    // Scale depending on enemy.y
    var scale = parseInt(enemy.y / 2.5) / 100;
    scale = scale > 1.5 ? 1.5 : scale;
    scale = scale < 0.2 ? 0.2 : scale;
    enemy.scale.x = scale;
    enemy.scale.y = scale;
  }
};
