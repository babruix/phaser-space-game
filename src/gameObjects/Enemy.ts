

import * as Phaser from "phaser";
import {Wall} from "../gameObjects/Wall";
import {Bullet} from "../gameObjects/Bullet";

export class Enemy {
  private game;
  private mainState;
  private enemy;

  constructor(game, x, y, anim, animLength) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];

    let xDestination = this.game.rnd.integerInRange(100, this.game.world.width / 2);
    let rndInt = this.game.rnd.integerInRange(0, this.game.audio.ufoSnd.length - 1);
    this.game.audio.ufoSnd[rndInt].play();
    let ufo = this.game.add.sprite(xDestination - this.game.rnd.integerInRange(0, xDestination), 0, "ufo");
    ufo.animations.add("walk");
    ufo.animations.play("walk", 10, true);
    ufo.anchor.setTo(0.5, 0);
    this.game.physics.enable(ufo, Phaser.Physics.ARCADE);
    ufo.body.velocity.x = 100;
    ufo.body.mass = 10;
    this.mainState._ufos.add(ufo);

    this.enemy = this.game.add.sprite(x, 50, anim);
    this.enemy.game = game;
    this.enemy.mainState = this.mainState;
    this.enemy.anchor.setTo(.5);
    this.enemy.alpha = 0;
    this.enemy.animations.add("walk");
    this.enemy.animations.play("walk", animLength, true);

    this.enemy.ufo_beam = this.game.add.sprite(0, 50, "ufo_beam");
    this.enemy.ufo_beam.alpha = 0;
    this.enemy.ufo_beam.anchor.setTo(0.5, 0);

    this.game.physics.enable(this.enemy);
    this.enemy.body.velocity.x = 100;
    this.enemy.ufo_exists = true;
    this.enemy.ufo = ufo;
    this.enemy.ufo_sound = this.game.audio.ufoSnd[rndInt];
    ufo.body.velocity.x = 100;
    this.enemy.drop_enemy_at_x = xDestination;

    let _this = this;
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
          this.game.add.tween(_this.enemy.ufo_beam)
          .to({alpha: 0.2}, 200, null, true);

          this.game.time.events.add(Phaser.Timer.SECOND * 3, function () {
            let beamTween = _this.game.add.tween(_this.enemy.ufo_beam)
            .to({alpha: 0}, 200, null, true);
            beamTween.onComplete.add(function () {
              _this.enemy.ufo_beam.destroy();
            }, this);

            if (_this.enemy.ufo.alive) {
              Enemy.prototype.initEnemy(_this.enemy);
              _this.enemy.ufo.alive = false;
            }

            let ufo_tween = _this.game.add.tween(_this.enemy.ufo);
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

    this.mainState.enemys.add(this.enemy);
  }

  putPlantBack(enemy) {
    if (enemy.closestPlant && enemy.closestPlant.alive) {
      enemy.closestPlant.stealing = false;
      enemy.steals = false;
      enemy.closestPlant.y = enemy.game.height - 50;
      enemy.closestPlant.angle = 0;
      enemy.closestPlant.scale.x = (1);
      enemy.closestPlant.scale.y = (1);
      enemy.closestPlant = null;
      this.hideStealingSign.call(enemy);
      enemy.mainState.generateGrowingPickups();
    }
  }

  initEnemy(enemy) {
    enemy.ufo_sound.stop();
    enemy.ufo.animations.stop("walk");
    enemy.game.audio.toilSnd.play();
    let x = enemy.x;
    let y = enemy.y;
    let anim = enemy.key;
    let animLength = enemy.animations._outputFrames.length;
    const game = enemy.game;
    const mainState = enemy.mainState;
    enemy.destroy();

    enemy = game.add.sprite(x, y, anim);
    enemy.mainState = mainState;
    enemy.health = mainState.level * 3;
    enemy.anchor.setTo(0.5, 0.5);
    enemy.speed = 1;
    enemy.speedX = 0;
    enemy.speedY = 0;
    enemy.curTile = 0;
    enemy.boundsPadding = 20;
    enemy.fireTime = 1000;
    enemy.fireLastTime = game.time.now + enemy.fireTime;
    enemy.blockedLastTime = game.time.now + 300;

    enemy.animations.add("walk");
    enemy.animations.play("walk", animLength, true);
    game.physics.p2.enable(enemy, game.debugOn);
    enemy.body.mass = 1;
    enemy.body.fixedRotation = true;
    enemy.body.velocity.x = 150;

    // Add health bar.
    let barConfig = {
      x: enemy.health,
      y: -40,
      height: 5,
      width: enemy.width,
      bg: {
        color: "#56807D"
      },
      bar: {
        color: "#D81E00"
      }
    };
    enemy.enemyHealthBar = new HealthBar(game, barConfig);

    enemy.ufo_exists = false;
    enemy.ufo = null;

    enemy.body.onBeginContact.add(function (body1) {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {
        return
      }

      if (body1.sprite.key.indexOf("bullet") >= 0 && !body1.sprite.enemyBullet) {
        if (!enemy.lastDamage) {
          enemy.lastDamage = game.time.now;
        }
        if (body1.sprite.freezingBullet) {
          enemy.freezed = true;
          enemy.lastFreezed = game.time.now;
          enemy.alpha = 0.2;
        }
        else {
          this.damageEnemy(enemy, game);
        }
      }

      if (body1.sprite.key.indexOf("spaceship") >= 0) {
        this.damageEnemy(enemy, game);
      }
    }, this);

    enemy.events.onOutOfBounds.add(function (enemy) {
      enemy.destroy();
    }, this);

    enemy.update = function () {
      if (enemy) {
        if (enemy.freezed === true) {
          enemy.body.velocity.x = 0;
          enemy.body.velocity.y = 0;
          // Unfreeze after 4s.
          if (enemy.lastFreezed + Phaser.Timer.SECOND * 4 < this.game.time.now) {
            enemy.freezed = false;
            enemy.alpha = 1;
          }
        }
        else {
          Enemy.prototype.fire(enemy);
        }

        Enemy.prototype.scale(enemy);
        // Update health bar.
        let bar = enemy.enemyHealthBar;
        if (bar.barSprite) {
          bar.setPercent(enemy.health * 10);
          let y = enemy.y > this.game.height - enemy.height
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
      mainState.score += mainState.level * 3;
      mainState.changeScoreText();
    }, this);

    mainState.enemys.add(enemy);
  }

  private damageEnemy(enemy, game: any) {
    if (enemy.lastDamage + 700 <= game.time.now) {
      return;
    }
    enemy.lastDamage = game.time.now;
    game.audio.smackSnd.play();

    enemy.damage(1);
    let style = {
      font: "20px eater",
      fontWeight: 500,
      fill: "#FFF",
      align: "center"
    };
    let shift = enemy.health > 9 ? 11 : 6;
    let cRect = game.add.graphics(0, 0).beginFill(0xff5a00).drawCircle(enemy.x + shift, enemy.y + 13, 30);
    let health = game.add.text(enemy.x, enemy.y, enemy.health, style);
    let health_tween = game.add.tween(cRect).to({alpha: 0.3}, 100,
      Phaser.Easing.Linear.None,
      true /*autostart?*/,
      500 /*delay*/);
    //
    health_tween.onComplete.add(function () {
      health.destroy();
      cRect.destroy();
    }, this);

    enemy.mainState.score += enemy.health % 3;

    // flash in red
    enemy.tint = 0xFF0010;
    game.time.events.add(300, () => enemy.tint = 0xFFFFFF);

    if (enemy.health === 1) {
      this.explode(enemy);
      this.hideStealingSign();
    }
    this.putPlantBack(enemy);
  }

  fire(enemy) {
    if (enemy.alive && enemy.game.time.now > enemy.fireLastTime) {
      enemy.game.audio.enemySndFire.play();
      let bullet = new Bullet(enemy.game, enemy.x, enemy.y, true);
      bullet.rotation = parseFloat(enemy.game.physics.arcade.angleToXY(
          bullet, enemy.mainState.towers.children[0].x, enemy.mainState.towers.children[0].y)
        ) * 180 / Math.PI;
      enemy.game.physics.arcade.moveToObject(bullet, enemy.mainState.towers.children[0], 500);
      bullet = null;
      enemy.fireLastTime = enemy.game.time.now + enemy.fireTime;
    }
  }

  explode(enemy) {
    if (enemy.alive) {
      this.game = enemy.game;
      this.mainState = enemy.mainState;
      enemy.kill();
      enemy.game.audio.explosionSnd.play();

      let explode = enemy.game.add.sprite(enemy.x - 100, enemy.y - 150, "explode", 19);
      //// To load the new texture (('key', frame))
      explode.loadTexture("explode", 0);
      //// Adding an animation ( 'key' )
      explode.animations.add("explode");
      //// To play the animation with the new texture ( 'key', frameRate, loop, killOnComplete)
      explode.animations.play("explode", 19, false, true);

      this.hideStealingSign();
    }
  }

  scale(enemy) {
    // Scale depending on enemy.y
    let scale = enemy.y / 2.5 / 100;
    scale = scale > 1.5 ? 1.5 : scale;
    scale = scale < 0.3 ? 0.3 : scale;
    enemy.scale.x = scale;
    enemy.scale.y = scale;
  }

  showStealingSign(enemy) {
    // this.mainState._anim_elem.style.display = 'block';
    // show left/right sign
    let stealingDirection = enemy.x < enemy.mainState.towers.children[0].x ? "left" : "right";
    if (stealingDirection === "left") {
      enemy.mainState.enemys.stealSignLeft.alpha = 1;
      enemy.mainState.enemys.stealSignRight.alpha = 0;
    }
    else {
      enemy.mainState.enemys.stealSignRight.alpha = 1;
      enemy.mainState.enemys.stealSignLeft.alpha = 0;
    }

    enemy.mainState.enemys.stealSignLeft.x = enemy.mainState.towers.children[0].x;
    enemy.mainState.enemys.stealSignLeft.y = 30;

    enemy.mainState.enemys.stealSignRight.x = enemy.mainState.towers.children[0].x;
    enemy.mainState.enemys.stealSignRight.y = 30;
  }

  hideStealingSign() {
    // Hide stealing sign.
    this.mainState.enemys.stealSignLeft.alpha = 0;
    this.mainState.enemys.stealSignRight.alpha = 0;

    // Hide CSS3 animation effect div
    this.game.anim_elem.style.display = "none";
  }

  updateEnemy(enemy) {
    // Slow down under the rain
    enemy.body.damping = enemy.game.state.states["Main"].checkIntersectsWithRain(enemy)
      ? 0.9
      : 0.4;

    // Steal a plant
    if (enemy.closestPlant && enemy.closestPlant.alive) {
      if (enemy.closestPlant.stealing) {
        enemy.game.state.states["Main"].enemys.stealing = true;
        enemy.body.velocity.y = -300;
        enemy.closestPlant.x = enemy.x;
        enemy.closestPlant.y = enemy.y;
      }

      // protect with wall
      if (enemy.y < 200 && enemy.game.state.states["Main"].towers.children[0].countBricks > 0
        && enemy.game.time.now > enemy.blockedLastTime) {
        enemy.game.state.states["Main"].towers.children[0].countBricks--;

        new Wall(enemy.game, enemy.x, enemy.y - enemy.height);
        enemy.blockedLastTime = enemy.game.time.now + 300;
        enemy.game.state.states["Main"].changeScoreText();
      }

      // use/steal plant
      if (enemy.closestPlant.y < 100 && enemy.closestPlant) {
        enemy.game.audio.springSnd.play();
        enemy.closestPlant.destroy();
        enemy.game.state.states["Main"].updateScore(true);
      }
    }

    // Plant is too far, forget
    if (enemy.y < 100 && enemy.closestPlant
      && !enemy.game.state.states["Main"].enemys.stealing) {
      enemy.closestPlant.stealing = false;
      enemy.closestPlant = false;
      enemy.steals = false;
    }

    if (enemy.y > 600) {
      // find closest  plant
      enemy.closestPlant = enemy.game.state.states["Main"]._flowerPlants.getFirstAlive();
      enemy.game.state.states["Main"]._flowerPlants.forEachAlive(function (plant) {
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
          enemy.game.state.states["Main"].enemys.stealing = true;
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
    if (!enemy.game.state.states["Main"]._flowerPlants.countLiving()) {
      Enemy.prototype.explode(enemy);
    }
  }
}
