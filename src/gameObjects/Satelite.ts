/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../typings/phaser/phaser.d.ts" />
/// <reference path="../../typings/phaser/EPSY.d.ts" />

import * as Phaser from "phaser";
import {Missle} from "../gameObjects/collections/Missle";
import {Bullet} from "../gameObjects/Bullet";
import {Main} from "../gameStates/Main";

export class Satelite {
    private game;
    private mainState;
    private satelite;
    private _dot;
    private _aimRect;

    constructor(game, worldX, worldY, freeze, rocket, laser) {
        this.game = game;
        this.mainState = this.game.state.states["Main"];

        let texture = freeze ? "satelite_freeze" : "satelite";
        if (rocket) {
            texture = "tower";
        }
        if (laser) {
            texture = "laser_tower";
        }

        this.satelite = game.add.sprite(worldX, worldY, texture);
        this.satelite.game = game;
        this.satelite.mainState = this.mainState;
        this.satelite.worldX = worldX;
        this.satelite.worldY = worldY;
        this.satelite.health = 10;
        game.physics.p2.enable(this.satelite, this.game.debugOn);
        this.satelite.fireLastTime = game.time.now;
        this.satelite.fireTime = laser ? 1600 : 300;
        this.satelite.freezing = freeze || false;
        this.satelite.rocket = rocket || false;
        this.satelite.laser = laser || false;

        this.satelite.body.mass = 50;
        this.satelite.body.damping = 1;

        this.satelite.scale.setTo(0.5, 0.5);

        this.mainState._satelites.add(this.satelite);

        // Add health bar.
        const barConfig = {
            x: this.satelite.health,
            y: -40,
            height: 5,
            width: this.satelite.width,
            bg: {
                color: this.satelite.freezing ? "#56807D" : "#56807D"
            },
            bar: {
                color: this.satelite.freezing ? "#20E331" : "#56807D"
            }
        };
        this.satelite.HealthBar = new HealthBar(game, barConfig);

        this.satelite.body.onBeginContact.add((body1, shapeA, shapeB) => {
            if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {
                return
            }

            if (body1.sprite.key.indexOf("bullet") >= 0) {
                if (typeof(body1.sprite.enemyBullet) !== "undefined" && body1.sprite.enemyBullet === true) {
                    game.audio.smackSnd.play();
                    this.satelite.damage(2);
                    if (this.satelite.health <= 2) {
                        this.satelite.kill();
                    }
                }
            }
        }, this);

        this.satelite.update = () => {
            Satelite.prototype.fire(this.satelite);

            // Update health bar.
            let bar = this.satelite.HealthBar;
            bar.setPercent(this.satelite.health * 10);
            let y = this.satelite.y > game.height - this.satelite.height
                ? this.satelite.y + 20
                : this.satelite.y + 30;
            bar.setPosition(this.satelite.x, y);
        };

        this.satelite.events.onKilled.add(satelite => {
            satelite.HealthBar.barSprite.kill();
            satelite.HealthBar.bgSprite.kill();
        });
    }

    getClosestEnemy(satelite, minimalReactDistance?) {
        // Satellite fire only when enemy distance less 700.
        minimalReactDistance = minimalReactDistance || 700;
        if (satelite.laser) {
            minimalReactDistance = 200;
        }

        let closestEnemy = satelite.mainState.enemys.getFirstAlive();

        satelite.mainState.enemys.forEachAlive((enemy) => {
            if (enemy.body) {
                // Distance to previous closest enemy
                let prevClosestDistance = Main.caculatetDistance(satelite, closestEnemy);
                let newClosestDistance = Main.caculatetDistance(satelite, enemy);

                if (newClosestDistance < prevClosestDistance) {
                    closestEnemy = enemy;
                }
            }
        });
        // Not react if enemy was not initialized.
        if (!closestEnemy || !closestEnemy.alive || closestEnemy.ufo_exists) {
            return false;
        }
        let closestDistance = Main.caculatetDistance(satelite, closestEnemy);
        if (closestDistance > minimalReactDistance) {
            return false;
        }

        // Highlight closest enemy.
        this.drawAimRect(satelite, closestEnemy);
        satelite.mainState._aimRect = satelite._aimRect;
        satelite.mainState._dot = satelite._dot;
        satelite.game.time.events.add(Phaser.Timer.SECOND * 1, Satelite.prototype.removeAimRect, this);

        return closestDistance < minimalReactDistance ? closestEnemy : false;
    }

    fire(satelite) {
        if (satelite.alive && satelite.game.time.now > satelite.fireLastTime) {

            // Find closest enemy.
            let closestEnemy = this.getClosestEnemy(satelite);
            if (!closestEnemy) {
                return;
            }

            if (satelite.rocket) {
                // Missile fire
                let x = closestEnemy.x > satelite.x
                    ? satelite.x + satelite.width * 2
                    : satelite.x - satelite.width * 2;
                let y = closestEnemy.y > satelite.y
                    ? satelite.y + satelite.height * 2
                    : satelite.y - satelite.height * 2;
                let missle = new Missle(satelite.game, x, y, true);
                (missle as any).anchor.setTo(0.5, 0.5);
                satelite.fireLastTime = satelite.game.time.now + satelite.fireTime + 1000;
                satelite.game.physics.arcade.moveToObject(missle, closestEnemy, 800);
                (missle as any).body.rotation = satelite.game.physics.arcade.angleToPointer(closestEnemy) - Math.PI / 2;
                return;
            }

            let enemyBullet, bullet, speed;

            if (satelite.laser) {
                satelite.game.audio.laserSnd.play();
                if (satelite.laserLine) {
                    satelite.laserLine.kill();
                }
                // @todo: collision detection? speed?
                satelite.laserLine = satelite.game.add.graphics(0, 0);
                satelite.laserLine.lineStyle(20, 0xffffff, 0.6);
                // draw a shape
                satelite.laserLine.moveTo(satelite.x, satelite.y);
                satelite.laserLine.lineTo(closestEnemy.x, closestEnemy.y);
                satelite.laserLine.endFill();
                satelite.game.time.events.add(Phaser.Timer.SECOND / 10, () => {
                    satelite.laserLine.kill();
                    closestEnemy.kill();
                });

                satelite.game.camera.flash(0xffffff, 100);
                satelite.fireLastTime = satelite.game.time.now + satelite.fireTime;
                return;
            }

            // Normal or frezing fire
            satelite.game.audio.enemySndFire.play();
            enemyBullet = false;
            let isFreezing = satelite.freezing;
            bullet = new Bullet(satelite.game, satelite.x, satelite.y, enemyBullet, isFreezing);
            bullet.rotation = parseFloat(satelite.game.physics.arcade.angleToXY(bullet, closestEnemy.x, closestEnemy.y)) * 180 / Math.PI;
            speed = isFreezing ? satelite.mainState.level * 10 : satelite.mainState.level * 30;
            satelite.game.physics.arcade.moveToObject(bullet, closestEnemy, speed);
            if (isFreezing) {
                satelite.fireLastTime += 200;
            }
            satelite.fireLastTime = satelite.game.time.now + satelite.fireTime;
        }
    }

    // Satellite aim only when enemy distance less 700.
    drawAimRect(satelite, enemy, minimalReactDistance = 700) {

        if (satelite._aimRect !== undefined) {
            satelite._aimRect.destroy();
        }
        if (satelite._dot !== undefined) {
            satelite._dot.destroy();
        }
        if (Main.caculatetDistance(satelite, enemy) > minimalReactDistance) {
            return;
        }

        let lineColor = satelite.freezing ? 0x13D7D8 : 0xD81E00;

        satelite._aimRect = satelite.game.add.graphics(0, 0);
        satelite._aimRect.lineWidth = 2;
        satelite._aimRect.lineColor = lineColor;
        satelite._aimRect.alpha = 0.7;
        satelite._aimRect.drawCircle(enemy.x, enemy.y, enemy.width + 10);

        satelite._dot = satelite.game.add.graphics(0, 0);
        satelite._dot.lineWidth = 2;
        satelite._dot.lineColor = lineColor;
        satelite._dot.alpha = 0.7;
        satelite._dot.drawCircle(enemy.x, enemy.y, 5);

        satelite.game.time.events.add(2000, () => this.removeAimRect());
    }

    removeAimRect() {
        // Hilight remove from enemy.
        if (this._aimRect !== undefined) {
            this._aimRect.destroy();
        }
        if (this._dot !== undefined) {
            this._dot.destroy();
        }
    }
}
