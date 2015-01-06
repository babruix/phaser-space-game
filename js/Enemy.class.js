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
          updateScore();
        }
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
      enemy.destroy();
      if (enemys.countLiving() == 0 && allEnemysAdded) {
        levelCompleted();
      }
      game.audio.explosionSnd.play();

      var explode = game.add.sprite(enemy.x - 100, enemy.y - 150, 'explode', 19);
      //// To load the new texture (('key', frame))
      explode.loadTexture('explode', 0);
      //// Adding an animation ( 'key' )
      explode.animations.add('explode');
      //// To play the animation with the new texture ( 'key', frameRate, loop, killOnComplete)
      explode.animations.play('explode', 19, false, true);

    }
  }
};
