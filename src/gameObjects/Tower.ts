
import * as Phaser from "phaser";
import {Bullet} from "../gameObjects/Bullet";
import {Missle} from "../gameObjects/collections/Missle";
import {Wall} from "../gameObjects/Wall";
import {Bomb} from "../gameObjects/Bomb";
import {Satelite} from "../gameObjects/Satelite";

declare var ParticlesConfigs: any;

export class Tower {
  public game;
  public mainState;

  private tower;
  private _circlesGroup;

  constructor(game, worldX, worldY, tile) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];

    this.tower = this.game.add.sprite(worldX, worldY, tile);
    this.tower.mainState = this.mainState;
    this.tower.worldX = worldX;
    this.tower.worldY = worldY;
    this.tower.health = 10;
    this.tower.actionTime = 100;
    this.tower.fireTime = 200;
    this.tower.missles = (this.game as any)._playerMissles || 10;
    this.tower.countBricks = (this.game as any)._playerBricks || 0;
    this.tower.shieldPower =  20;
    this.tower.fireLastTime = this.game.time.now + this.tower.fireTime;
    this.tower.actionLastTime = this.game.time.now + this.tower.actionTime;
    this.game.physics.p2.enable(this.tower, this.game.debugOn);
    this.tower.bullets = 50 * this.mainState.level;
    this.tower.fuel = 1000 * this.mainState.level;

    this.tower.width = 100;
    this.tower.height = 42;
    this.tower.body.setRectangle(100, 50);

    this.tower.body.data.gravityScale = 70;
    this.tower.body.mass = 50;
    this.tower.body.damping = 0;
    this.tower.body.fixedRotation = true;
    this.tower.body.collideWorldBounds = true;
    this.mainState.towers.add(this.tower);
    this.game.camera.follow(this.tower);

    this.tower.body.onBeginContact.add((body1, shapeA, shapeB) => {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {
        return
      }

      if (body1 && body1.sprite.key.indexOf("bullet") >= 0) {
        this.game.audio.smackSnd.play();
        if (typeof(body1.sprite.enemyBullet) !== "undefined"
          && body1.sprite.alive
          && body1.sprite.enemyBullet === true) {
          if (this.tower.shieldPower > 0) {
            this.tower.shieldPower -= 10;
          }
          else {
            this.tower.damage(1);
            // flash in red
            this.tower.tint = 0xFF0010;
            this.game.time.events.add(100, () => this.tower.tint = 0xFFFFFF);
          }
          body1.sprite.destroy();

          if (this.tower.health <= 1) {
            this.tower.health = 10;
            this.mainState.updateScore(true);
          }
          else {
            this.mainState.changeScoreText();
          }
        }

      }
    }, this);

    this.tower.events.onKilled.add(() => {
      if (this.mainState._shipTrail !== null) {
        this.mainState._shipTrail.destroy();
      }
      this.mainState._playerShield = this.tower.shieldPower;
      this.mainState._playerBricks = this.tower.countBricks;
      this.mainState._playerMissles = this.tower.missles;
    });

    this.tower.update = () => {
      // Fire
      // this.fire(_this.tower);
      this.mainState._fireButton.onDown.add(() => this.fire(this.tower));
      if (this.mainState._fireButton.isDown) {
        this.fire(this.tower);
      }

      // Add basic Satelite
      this.mainState._numberButtons[0].onDown.add(() => this.addSatelite(this.tower));

      // Add Freeze Satelite
      this.mainState._numberButtons[1].onDown.add(() => this.addSatelite(this.tower, "freeze"));

      // Add Rocket Satelite
      this.mainState._numberButtons[2].onDown.add(() => this.addSatelite(this.tower, "rocket"));

      // Add Laser Satelite
      this.mainState._numberButtons[3].onDown.add(() => this.addSatelite(this.tower, "laser"));

      // Add Wall
      this.mainState._numberButtons[4].onDown.add(() => this.addWall(this.tower));

      // Add bomb
      this.mainState._numberButtons[5].onDown.add(() => this.addBomb(this.tower));

      // Fire missle
      this.mainState._numberButtons[6].onDown.add(() => this.fireMissle(this.tower));

      // Add Wall
      this.mainState._brickButton.onDown.add(() => this.addWall(this.tower));

      // Add Missle
      this.mainState._missleButton.onDown.add(() => this.fireMissle(this.tower));

      // Shield
      this.tower.redrawProtectRect(this.tower);

      // Keep the this.mainState._shipTrail lined up with the ship
      this.mainState._shipTrail.x = this.tower.x;
      this.mainState._shipTrail.y = this.tower.y + 10;

      // Update health bar.
      let bar = this.mainState.towers.children[0].HealthBar;
      bar.setPercent(this.tower.health * 10);
      let y = this.tower.y > this.game.height - this.tower.height
        ? this.tower.y + 20
        : this.tower.y + 30;
      bar.setPosition(this.tower.x, y);

      if (this.mainState._sateliteButton) {
        this.mainState._sateliteButton.onDown.add(() => this.addSatelite(this.tower));
      }

      // Take life when health is too small.
      if (this.tower.health < 3) {
        this.tower.health = 10;
        this.mainState.updateScore(true);
      }
    };

    this.tower.redrawProtectRect = (tower) => {
      if (tower.shieldPower > 0) {
        if (tower._protectRect !== undefined) {
          tower._protectRect.destroy();
        }
        tower._protectRect = this.game.add.graphics(0, 0);
        const player = this.mainState.towers.children[0];
        tower._protectRect.lineStyle(player.shieldPower / 10, 0xFFFFFF, 1);
        tower._protectRect.alpha = 0.7;
        tower._protectRect.drawCircle(player.world.x, player.world.y, player.width + player.shieldPower / 10);
      }
    }
  }

  addToPoint(worldX, worldY) {
    // new Tower(this.game, worldX, worldY, 'spaceship');
    const player = this.mainState.towers.children[0];

    // Add health bar.
    let barConfig = {
      x: player.health,
      y: -40,
      height: 5,
      width: player.width,
      bg: {
        color: "#56807D"
      },
      bar: {
        color: "#20E331"
      }
    };

    player.HealthBar = new HealthBar(this.game, barConfig);

    player.alpha = 0;
    player.fireTime = 200;
    player.anchor.setTo(0.5, 0.5);

    this.game.time.events.add(500, () => {
      // let Phaser add the particle system to world group or choose to add it to a specific group
      const player = this.mainState.towers.children[0];
      let particleSystem1 = (this.game as any).epsyPlugin.loadSystem(ParticlesConfigs.epsyPluginConfig.circles, player.x, player.y);
      this._circlesGroup = this.game.add.group();
      this._circlesGroup.add(particleSystem1);
      this.game.time.events.add(1000, this.destroyCirclesGroup, this).autoDestroy = true;

      this.game.add.tween(player)
      .to({alpha: 1}, 1000, Phaser.Easing.Linear.None,
        true, 500)
      .onComplete.add(() => this.mainState._shipTrail.alpha = 1);
    });

    // Add an emitter for the ship's trail
    this.mainState._shipTrail = this.game.add.emitter(this.game, player.x, player.y + 10, 400);
    this.mainState._shipTrail.width = 10;
    this.mainState._shipTrail.makeParticles("emit");
    this.mainState._shipTrail.setXSpeed(30, -30);
    this.mainState._shipTrail.setYSpeed(200, 180);
    this.mainState._shipTrail.setRotation(50, -50);
    this.mainState._shipTrail.setAlpha(1, 0.01, 800);
    this.mainState._shipTrail.setScale(0.05, 0.4, 0.05, 0.4, 2000, Phaser.Easing.Quintic.Out);
    this.mainState._shipTrail.start(false, 5000, 10);
    this.mainState._shipTrail.alpha = 0;
  }

  destroyCirclesGroup() {
    this._circlesGroup.destroy();
  }

  fire(tower) {
    if (tower.alive && this.game.time.now > tower.fireLastTime) {
      if (tower.bullets > 0) {
        tower.bullets--;
        this.mainState.changeScoreText();
        this.game.audio.playerSndFire.play();
        let bullet = new Bullet(this.game, tower.x, tower.y - tower.height, false);
        if (bullet !== undefined && bullet.body !== undefined) {
          bullet.body.moveUp(1500);
          bullet = null;
        }
        tower.fireLastTime = this.game.time.now + tower.fireTime;
      }
      else {
        // Fire missles when there are no bullets
        this.fireMissle(tower);
      }
    }
  }

  fireMissle(tower) {
    if (!tower.alive || this.game.time.now <= tower.fireLastTime) {
      return;
    }
    if (tower.missles <= 0 && this.mainState.score < this.mainState.priceList.rocket) {
      return;
    }

    this.game.audio.missleSnd.play();
    if (tower.missles > 0) {
      tower.missles--;
    }
    else {
      this.mainState.score -= this.mainState.priceList.rocket;
    }
    this.mainState.changeScoreText();

    let missle = new Missle(this.game, tower.x + tower.width / 2, tower.y - tower.height * 2, true);
    if (missle !== undefined && (missle as any).body !== undefined) {
      (missle as any).body.moveUp(800);
      tower.fireLastTime = this.game.time.now + tower.fireTime;
    }
  }

  addWall(tower) {
    if (!tower.alive || this.game.time.now <= tower.actionLastTime || tower.y > 500) {
      return;
    }
    if (tower.countBricks <= 0 && this.mainState.score < this.mainState.priceList.wall) {
      return;
    }

    this.game.audio.laughSnd.play();
    if (tower.countBricks > 0) {
      tower.countBricks--;
    }
    else {
      this.mainState.score -= this.mainState.priceList.wall;
    }
    this.mainState.changeScoreText();

    new Wall(this.game, tower.x, tower.y);
    tower.actionLastTime = this.game.time.now + tower.actionTime;
  }

  addSatelite(tower, type?) {
    let freeze = type === "freeze";
    let rocket = type === "rocket";
    let laser = type === "laser";
    let key = "satelite";
    if (freeze) {
      key = "satelite_freeze";
    }
    if (rocket) {
      key = "tower";
    }
    if (laser) {
      key = "laser_tower";
    }
    let price = this.mainState.priceList[key];
    if (this.mainState.score >= price && this.game.time.now > tower.actionLastTime) {
      this.mainState.score -= price;
      this.mainState.changeScoreText();
      // use last wall time variable
      tower.actionLastTime = this.game.time.now + tower.actionTime;
      new Satelite(this.game, tower.x, tower.y - tower.height, freeze, rocket, laser);
    }
  }

  addBomb(tower) {
    if (this.mainState.score < this.mainState.priceList.bomb || this.game.time.now < tower.actionLastTime) {
      return;
    }

    new Bomb(this.game, tower.x, 100);
    this.mainState.score -= this.mainState.priceList.bomb;
    tower.actionLastTime = this.game.time.now + tower.actionTime;
  }

  static updateTower(tower) {
    if (tower.alpha < 1) {
      return;
    }

    // Move tower
    tower.body.setZeroVelocity();
    let speed = tower.game.height / 1.3 + tower.game.height - tower.body.y / 1.3;


    if (tower.mainState._cursors.left.isDown) {
      tower.angle = -30;
      if (tower.mainState._cursors.up.isDown) {
        tower.angle = -60;
      }
      tower.body.velocity.x = -speed;
    }
    else if (tower.mainState._cursors.right.isDown) {
      tower.angle = 30;
      if (tower.mainState._cursors.up.isDown) {
        tower.angle = 60;
      }
      tower.body.velocity.x = speed;
    }
    else {
      tower.rotation = 0;
    }
    speed *= 2;
    if (tower.mainState._cursors.up.isDown) {
      if (tower.fuel > 0) {
        tower.body.velocity.y = -speed;
        tower.fuel--;
        tower.mainState.changeScoreText();
      }
    }
    else if (tower.mainState._cursors.down.isDown) {
      tower.body.velocity.y = speed;
    }
    if (tower.game.input.activePointer.isDown) {
      if (tower.game.input.activePointer.isMouse) {
        // @todo: In the case of a mouse, check mouse button status?
        if (tower.game.input.activePointer.button === Phaser.Mouse.RIGHT_BUTTON) {

        }
      }
      else {
        //        if (Math.floor(this.game.input.x/(this.game.width/2)) === 0) {
        if (tower.game.input.x < tower.x) {
          tower.angle = -30;
          tower.body.velocity.x = -speed;
        }
        //        if (Math.floor(this.game.input.x/(this.game.width/2)) === 1) {
        if (tower.game.input.x > tower.x) {
          tower.angle = 30;
          tower.body.velocity.x = speed;
        }
        //        if(Math.floor(this.game.input.y/(this.game.height/2)) === 0){
        if (tower.game.input.y < tower.y) {
          tower.body.velocity.y = -speed;
        }
        //        if(Math.floor(this.game.input.y/(this.game.height/2)) === 1){
        if (tower.game.input.y > tower.y) {
          tower.body.velocity.y = speed;
        }
        /*          if (this.game.input.y > 600) {
         this.fire(tower);
         }*/

        // Multiple touches/pointers
        /*if (this.game.input.pointer1.isDown && this.game.input.pointer2.isDown)
         alert(this.game.input.pointer2.isDown);*/
      }
    }
  }
}
