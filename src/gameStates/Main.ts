/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../typings/phaser/phaser.d.ts" />
/// <reference path="../../typings/phaser/EPSY.d.ts" />

import * as Phaser from "phaser";
import {Plant} from "../gameObjects/Plant";
import {Tower} from "../gameObjects/Tower";
import {Enemy} from "../gameObjects/Enemy";
import {Brick} from "../gameObjects/collections/Brick";
import {Wall} from "../gameObjects/Wall";
import {Bomb} from "../gameObjects/Bomb";
import {GameOver} from "../gameStates/GameOver";
import {UI} from "../utils/ui";

declare var ParticlesConfigs: any;

export class Main extends Phaser.State {
  public priceList;
  public priceStyle;
  public _shipTrail;
  public _playerShield;
  public _playerBricks;
  public _playerMissles;
  public _cursors;
  public _fireButton;
  public _numberButtons;
  public _missleButton;
  public _brickButton;
  public _sateliteButton;
  public towers;
  public level;
  public score;

  private enemySprites;
  private _background;
  private _plantsGenerationEvents;
  private _scoreText;
  private _hearts;
  private _shields;
  private _bricks;
  private _walls;
  private _missles;
  private _bullets;
  private _frezzing_bullets;
  private _bombs;
  private _enemy_bullets;
  private _ufos;
  private _allEnemysAdded;
  private isTutorial;
  private _newLevelStarted;
  private rewpawnPickupsButton;
  private events;
  private dayLength;
  private _cloudsGroup;
  private _rainGroup;
  private _tweenClouds;
  private _cloud;
  private enemys;
  private _ammos;
  private _fuels;
  private _satelites;
  private _flowerPlants;
  private _UI;
  private pickupsLastTime;
  private _livesGraph;
  private _fireGraph;
  private _sun;
  private _sunTw;
  private lives;
  private _UiGroup;

  init() {
    this.level = this.level || 0;
    this.score = this.score || 50;
    this.lives = this.lives || 3;
    this.enemySprites = [
      {"name": "alian", "length": 9},
      {"name": "bazyaka", "length": 80},
      {"name": "cat", "length": 1},
      {"name": "nog", "length": 50}
    ];
    this.priceList = {
      "satelite_freeze": 30,
      "satelite": 20,
      "tower": 70,
      "laser_tower": 200,
      "wall": 10,
      "bomb": 40,
      "rocket": 10
    };
    this.priceStyle = {font: "50px eater", fill: "#E39B00"};

    this._background = null;

    this._fireButton = null;
    this._sateliteButton = null;
    this._brickButton = null;
    this._missleButton = null;
    this._cursors = null;
    this._plantsGenerationEvents = [];
    this._numberButtons = [];

    this._scoreText = null;

    this._shipTrail = null;
    this._hearts = null;
    this._shields = null;
    this._bricks = null;
    this._walls = null;
    this._missles = null;
    this._bullets = null;
    this._frezzing_bullets = null;
    this._bombs = null;

    this._playerShield = null;
    this._playerBricks = null;
    this._playerMissles = null;

    this._enemy_bullets = null;
    this._ufos = null;
  }

  render() {
    this.game.debug.text("Alive enemies: " + this.enemys.countLiving(), 10, 50);
    this._satelites.forEach(satelite =>this.game.debug.sprite(satelite._aimRect, 10, 100));
  }

  create(game?, tutorial?) {
    this.isTutorial = tutorial || false;
    if (game) {
      this.game = game;
    }
    (this.game as any).gameover = false;

    // Hide CSS element.
    (this.game as any).anim_elem.style.display = "none";
    (this.game as any).anim_elem.className += " gameCreated";

    this._newLevelStarted = false;

    this.prepareAudio();
    this.setPlayerKeys();

    /**
     * Init map.
     */
    this.game.physics.startSystem(Phaser.Physics.P2JS);
    this.game.physics.p2.setImpactEvents(true);
    this.game.physics.p2.restitution = 0.9;
    this.game.physics.p2.applyGravity = true;
    this.game.physics.p2.gravity.x = 0;
    this.game.physics.p2.gravity.y = 300;
    this.game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    // Background
    this.createDayTime.call(this);
    this.generateClouds.call(this);

    this.setupGameGroups();

    // Add one Flower.
    new Plant(this.game);

    this.initStealingSigns();

    this._UI = new UI(this);

    this.nextLevel.call(this);

    this.score -= 10;
    this.updateScore();
  }

  prepareAudio() {
    (this.game as any).audio.enemySndFire = this.game.add.audio("gulp", 2);
    (this.game as any).audio.playerSndFire = this.game.add.audio("gunshot", 0.01);
    (this.game as any).audio.toilSnd = this.game.add.audio("toil", 0.1);
    (this.game as any).audio.smackSnd = this.game.add.audio("smack", 0.2);
    (this.game as any).audio.laughSnd = this.game.add.audio("laugh", 0.5);
    (this.game as any).audio.springSnd = this.game.add.audio("spring", 0.2);
    (this.game as any).audio.kissSnd = this.game.add.audio("kiss", 0.2);
    (this.game as any).audio.explosionSnd = this.game.add.audio("explosion", 0.05);
    (this.game as any).audio.missleSnd = this.game.add.audio("missle", 0.1);
    (this.game as any).audio.laserSnd = this.game.add.audio("laser", 0.1);
    (this.game as any).audio.ufoSnd = [
      this.game.add.audio("scifi1", 0.2),
      this.game.add.audio("scifi2", 0.2),
      this.game.add.audio("scifi3", 0.1),
      this.game.add.audio("scifi4", 0.1),
      this.game.add.audio("scifi5", 0.1)
    ];
    (this.game as any).audio.completedSnd = this.game.add.audio("completed", 1);
    (this.game as any).audio.reloadSnd = this.game.add.audio("reload", 0.6);
  }

  setPlayerKeys() {
    this._fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    this._sateliteButton = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.rewpawnPickupsButton = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
    this._brickButton = this.game.input.keyboard.addKey(Phaser.Keyboard.B);
    this._missleButton = this.game.input.keyboard.addKey(Phaser.Keyboard.M);
    this._cursors = this.game.input.keyboard.createCursorKeys();
    let keysNumbers = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN"];
    for (let i = 0; i <= 7; i++) {
      this._numberButtons.push(this.game.input.keyboard.addKey(Phaser.Keyboard[keysNumbers[i]]));
    }
  }

  createDayTime() {
    let createBackground = () => {
      this._background = this.game.add.tileSprite(0, 0, this.game.width * 4, 889, "background");
      this._background.alpha = 1;
    };
    let createSun = () => {
      this._sun = this.game.add.sprite(60, 60, "sun");
    };

    this.events = {};
    this.events.onNightOver = new Phaser.Signal();

    createBackground();
    createSun();

    this.dayLength = 20000;
    this.createSunAndBgTweens();
    this.events.onNightOver.add(this.createSunAndBgTweens, this);

    // Clouds and rain groups.
    this._cloudsGroup = this.game.add.group();
    this._rainGroup = this.game.add.group();
  }

  createSunAndBgTweens() {
    let createBgTween = function () {
      this._backgroundTw = this.game.add.tween(this._background)
      .to({alpha: 0.1}, this.dayLength,
        Phaser.Easing.Quintic.InOut,
        true, // autostart?,
        0, // delay,
        1, // repeat?
        true // yoyo?
      );
    };
    let createSunTween = function () {
      this._sun.x = 10;
      this._sun.y = 10;
      this._sun.width = 10;
      this._sun.height = 10;
      this._sunTw = this.game.add.tween(this._sun).to({
        x: this.game.width - 180,
        width: 60,
        height: 60
      }, this.dayLength, Phaser.Easing.Quintic.InOut, true, 0, true, true);
      this._sunTw.onComplete.add(() => {
        this.events.onNightOver.dispatch(this);
      });
    };
    createBgTween.call(this);
    createSunTween.call(this);
  }

  generateClouds() {
    let cloudSises = {
      "0": {x: 124, y: 54, toX: 485, toY: 13},
      "1": {x: 132, y: 82, toX: 120, toY: 93},
      "2": {x: 324, y: 68, toX: 443, toY: 58},
      "3": {x: 272, y: 55, toX: 160, toY: 164},
      "4": {x: 505, y: 130, toX: 465, toY: 107},
      "5": {x: 450, y: 158, toX: 150, toY: 258},
      "6": {x: 352, y: 102, toX: 120, toY: 100}
    };
    this._tweenClouds = [];
    for (let i = 0; i <= 6; i++) {
      this._cloud = this.game.add.tileSprite(cloudSises[i].toX, cloudSises[i].toY, cloudSises[i].x, cloudSises[i].y, "cloud" + i);
      this._cloudsGroup.add(this._cloud);
      // Also enable sprite for drag
      this._cloud.inputEnabled = true;
      this._cloud.input.enableDrag();

      this._cloud.events.onDragStop.add(() => {
        if (this._rainGroup.children[0]) {
          this._rainGroup.children[0].y = this._cloud.y + this._cloud.height;
          this._rainGroup.children[0].x = this._cloud.x + 150;
        }
      });
    }
    this.game.time.events.add(300, this.makeRain, this);
  }

  makeRain() {
    let integerInRange = this.game.rnd.integerInRange(0, 6);
    let cloud = this._cloudsGroup.children[integerInRange];
    cloud.raining = true;

    let particleSystem1 = (this.game as any).epsyPlugin
    .loadSystem(ParticlesConfigs.epsyPluginConfig.rain, cloud.x, cloud.y + cloud.height);
    // let Phaser add the particle system to world group or choose to add it to a specific group
    this._rainGroup.add(particleSystem1);
    this._rainGroup.children[0].x = cloud.x + 150;
    this.game.time.events.add(5000, this.removeRain, this);
  }

  removeRain() {
    this._rainGroup.forEachAlive(element => element.destroy(), this);
    this._cloudsGroup.forEachAlive(function (cloud) {
      cloud.raining = false;
    }, this);
    this.game.time.events.add(3000, this.makeRain, this);
  }

  setupGameGroups() {

    /**
     * Tower
     */
    this.towers = this.game.add.group();
    this.game.physics.enable(this.towers, Phaser.Physics.P2JS, (this.game as any).debugOn);
    this.game.world.setBounds(0, 0, this.game.width * 4, 790);

    /**
     * Heart
     */
    this._hearts = this.game.add.group();
    this._hearts.createMultiple(1, "heart");

    /**
     * Ammo
     */
    this._ammos = this.game.add.group();
    this._ammos.createMultiple(1, "ammo");

    /**
     * Fuel
     */
    this._fuels = this.game.add.group();
    this._fuels.createMultiple(1, "fuel");

    /**
     * Shield
     */
    this._shields = this.game.add.group();
    this._shields.createMultiple(1, "shield");

    /**
     * Brick
     */
    this._bricks = this.game.add.group();
    this._bricks.createMultiple(1, "brick");

    /**
     * Wall
     */
    this._walls = this.game.add.group();
    this._walls.createMultiple(1, "wall-a");
    this._walls.createMultiple(1, "wall-b");
    this._walls.createMultiple(1, "wall-c");

    /**
     * Ufo
     */
    this._ufos = this.game.add.group();
    this._ufos.createMultiple(4, "ufo");

    /**
     * Bombs
     */
    this._bombs = this.game.add.group();
    this._bombs.createMultiple(1, "bomb");

    /**
     * Satelites
     */
    this._satelites = this.game.add.group();

    /**
     * Towers Bullets
     */
    this._bullets = this.game.add.group();
    this._bullets.enableBody = true;
    this._bullets.physicsBodyType = Phaser.Physics.P2JS;
    this._bullets.createMultiple(20, "green_bullet");
    this._bullets.setAll("checkWorldBounds", true);
    this._bullets.setAll("outOfBoundsKill", true);
    this._bullets.setAll("collideWorldBounds", false);
    this._bullets.setAll("anchor.x", 0.5);
    this._bullets.setAll("anchor.y", 1);

    this._frezzing_bullets = this.game.add.group();
    this._frezzing_bullets.enableBody = true;
    this._frezzing_bullets.physicsBodyType = Phaser.Physics.P2JS;
    this._frezzing_bullets.createMultiple(20, "freezing_bullet");
    this._frezzing_bullets.setAll("checkWorldBounds", true);
    this._frezzing_bullets.setAll("outOfBoundsKill", true);
    this._frezzing_bullets.setAll("collideWorldBounds", false);
    this._frezzing_bullets.setAll("anchor.x", 0.5);
    this._frezzing_bullets.setAll("anchor.y", 1);

    /**
     * Enemy Bullets
     */
    this._enemy_bullets = this.game.add.group();
    this._enemy_bullets.enableBody = true;
    this._enemy_bullets.physicsBodyType = Phaser.Physics.P2JS;

    this._enemy_bullets.createMultiple(20, "bullet");
    this._enemy_bullets.setAll("checkWorldBounds", true);
    this._enemy_bullets.setAll("outOfBoundsKill", true);
    this._enemy_bullets.setAll("collideWorldBounds", false);
    this._enemy_bullets.setAll("anchor.x", 0.5);
    this._enemy_bullets.setAll("anchor.y", 1);

    /**
     * Missles
     */
    this._missles = this.game.add.group();
    this._missles.enableBody = true;
    this._missles.physicsBodyType = Phaser.Physics.P2JS;

    this._missles.createMultiple(10, "missle");
    this._missles.setAll("checkWorldBounds", true);
    this._missles.setAll("outOfBoundsKill", true);
    this._missles.setAll("collideWorldBounds", false);
    this._missles.setAll("anchor.x", 0.5);
    this._missles.setAll("anchor.y", 1);
    this._missles.setAll("tracking", true);

    /**
     * Enemys
     */
    this.enemys = this.game.add.group();
    this.enemys.enableBody = true;
    this.enemys.physicsBodyType = Phaser.Physics.P2JS;
    this.game.physics.p2.enableBody(this.enemys, (this.game as any).debugOn);
    this.enemys.setAll("checkWorldBounds", true);
    this.enemys.setAll("outOfBoundsKill", true);

    /* Flowers */
    this._flowerPlants = this.game.add.group();
  }

  nextLevel() {
    this.level++;
    this.score += this.level * 20;
    let tower = new Tower(this.game, 0, 0, "spaceship");
    tower.addToPoint(400, 400);
    if (!this.isTutorial) {
      this.generateGrowingPickups();
    }
    this.changeScoreText();
    this.animateScore();
    if (this.isTutorial) {
      return;
    }
    this.showLevelTitle();
    this.addEnemys();
    this.addRndBricks();

    new Brick(this.game);
    for (let i = 0; i < parseInt(String(this.level / 2)); i++) {
      new Bomb(this.game, 0, 0);
    }
  }

  generateGrowingPickups() {
    if (!this.pickupsLastTime) {
      this.pickupsLastTime = this.game.time.now;
    }
    // Remove old generation events
    this._plantsGenerationEvents.forEach(event => this.game.time.events.remove(event));
    // Add new events
    this._flowerPlants.children.forEach(plant => {
      let __ret = plant.generate_pickup(plant);
      this._plantsGenerationEvents.push(this.game.time.events.add(__ret.nextSpawnTime, __ret.spawnFunction, this));
    });
  }

  initStealingSigns() {
    let initOneStealSign = (direction) => {
      let stealingSignSprite = this.game.add.sprite(this.game.width / 2, 130, "sign_" + direction);
      stealingSignSprite.scale.x = 0.3;
      stealingSignSprite.scale.y = 0.3;
      stealingSignSprite.anchor.setTo(0.5, 0.5);
      let text_l = this.game.add.text(0, -170,
        "Stealing!", {
          font: "50px eater",
          fill: "#D81E00",
          align: "center"
        });
      text_l.anchor.setTo(0.5, 0.5);
      stealingSignSprite.addChild(text_l);
      stealingSignSprite.alpha = 0;
      // stealingSignSprite.fixedToCamera = true;

      return stealingSignSprite;
    };

    this.enemys.stealSignLeft = initOneStealSign("left");
    this.enemys.stealSignRight = initOneStealSign("right");
  }

  drawLivesSprites() {
    this._livesGraph.removeAll(true);
    for (let i = 0; i < this.lives; i++) {
      let liveSprite = this.game.add.sprite(50 * i, 0, "spaceship");
      liveSprite.scale.setTo(0.2);
      liveSprite.tint = 0x0BA4FF;
      liveSprite.fixedToCamera = true;
      this._livesGraph.add(liveSprite);
    }
  }

  animateScore(moveOut = false) {
    // Animate walls
    this._walls.forEach(brick =>
      this.game.add.tween(brick)
      .to({alpha: moveOut ? 0 : 1}, 1000, Phaser.Easing.Linear.None, true, 0));

    this._UI.toggleUI(moveOut);
  }

  addRndBricks() {
    for (let i = 1; i < this.level * 3; i++) {
      let x = this.game.rnd.integerInRange(0, this.game.width);
      let y = this.game.rnd.integerInRange(300, this.game.height / 1.5);
      new Wall(this.game, x, y);
    }
  }

  showLevelTitle() {
    let style = {
      font: "60px eater",
      fill: "#F36200",
      align: "center"
    };
    let levelText = this.game.add.text(0, 0, "Level " + this.level, style);
    levelText.x = this.game.width / 2 - levelText.width / 2;
    levelText.y = this.game.height / 2 - levelText.height;
    levelText.alpha = 0;
    levelText.fixedToCamera = true;

    // Animate
    this.game.add.tween(levelText)
    .to({alpha: 1},
      1000 /*duration (in ms)*/,
      Phaser.Easing.Bounce.Out /*easing type*/,
      true /*autostart?*/)
    .onComplete.add(() => {
      this.game.add.tween(levelText)
      .to({y: -levelText.height, alpha: 0},
        1000 /*duration (in ms)*/,
        Phaser.Easing.Bounce.In /*easing type*/,
        true /*autostart?*/,
        2000 /*delay*/)
      .onComplete.add(() => levelText.destroy());
    });
  }

  static caculatetDistance(sprite1, sprite2) {
    let a = sprite1.x - sprite2.x;
    let b = sprite1.y - sprite2.y;
    return Math.sqrt(a * a + b * b);
  }

  updateScore(losingLife = false) {
    if (losingLife === true) {
      this.game.camera.shake();
      this.lives--;
      this.drawLivesSprites();
      this.score -= 10;
    }
    else {
      this.score += 10;
    }
    this.changeScoreText();
    if (this.lives < 0) {
      this.game.camera.shake();

      (this.game.time.events.add(0, () => this.GameOverTransition(), this) as any)
        .autoDestroy = true;
    }
  }

  changeScoreText() {
    let style = {font: "20px eater", fill: "#E39B00", align: "left"};
    let str = "    Level: " + this.level + "   $: " + this.score;
    if (this.towers && this.towers.children && typeof this.towers.children[0] !== "undefined") {
      str += "   Bricks: " + this.towers.children[0].countBricks;
      str += "   Missles: " + this.towers.children[0].missles + "";
      str += "   Bullets: " + this.towers.children[0].bullets + "";
      str += "   Fuel: " + this.towers.children[0].fuel + "";
    }
    if (!this._scoreText) {
      this._scoreText = this.game.add.text(0, this.game.height, str, style);
      this._UiGroup.add(this._scoreText);
    }
    else {
      this._scoreText.setText(str);
    }

    // Respawn dead player
    if (this.towers && this.towers.children.length && !this.towers.children[0].alive) {
      this.towers.children[0].destroy();
      Tower.prototype.addToPoint(400, 400);
    }
  }

  addEnemys() {
    let i = 0;
    this._allEnemysAdded = false;
    let enemysBcl = this.game.time.events.loop(this.level / 2 * Phaser.Timer.SECOND, () => {
      // Generate i=3*this.level number of enemys
      if (i < 2 * this.level) {
        let rndKey = this.game.rnd.integerInRange(0, this.enemySprites.length - 1);
        let animEnemy = this.enemySprites[rndKey];
        let enemy = new Enemy(this.game, 0, 0, animEnemy.name, animEnemy.length);
        let param = {
          x: this.game.rnd.integerInRange(0, this.game.width),
          y: this.game.rnd.integerInRange(0, this.game.height),
          countBricks: 1
        };
        Tower.prototype.addWall(param);
      } else {
        enemysBcl = null;
        this._allEnemysAdded = true;
      }
      i++;
    });
  }

  checkIntersectsWithRain(tower) {
    let intersectsWithRain = false;
    this._rainGroup.forEachAlive(
      element => intersectsWithRain = Phaser.Rectangle.intersects(element.getBounds(), tower.getBounds()),
      this
    );
    return intersectsWithRain;
  }

  update() {
    this._background.tilePosition.set(this.game.camera.x * -0.5, this.game.camera.y * -0.5);

    this.rewpawnPickupsButton.onDown.add(() => {
      if (this.game.time.now > this.pickupsLastTime + 1000) {
        this.pickupsLastTime = this.game.time.now + 1000;
        this.generateGrowingPickups();
      }
    });

    // Game over if no alive flowers.
    if (!this.isTutorial && !this._flowerPlants.countLiving()) {

      this.game.time.events.add(0, () => this.GameOverTransition(), this);
      return;
    }

    // Level completed.
    if (this.enemys.countLiving() === 0 && this._allEnemysAdded
      && !this._newLevelStarted && !this.isTutorial) {
      this._newLevelStarted = true;
      this.updateScore();
      this.levelCompleted();
    }

    /**
     *  Enemy stealing check
     */
    this.enemys.stealing = false;
    this.enemys.forEachAlive(enemy => Enemy.prototype.updateEnemy(enemy), this);

    this.towers.forEachAlive(tower => Tower.updateTower(tower), this);

    // Update spawn bar.
    this._flowerPlants.forEachAlive(plant => plant.updatePlant(plant), this);

  }

  levelCompleted() {
    this.lives++;
    (this.game as any).audio.completedSnd.play();

    let style = {
      font: "60px eater",
      fill: "#F36200",
      stroke: "#CCCCCC",
      align: "center",
      strokeThickness: 1
    };
    let levelText = this.game.add.text(0, 0, "Level Completed!", style);
    levelText.x = this.game.width / 2 - levelText.width / 2;
    levelText.y = this.game.height / 2 - levelText.height / 2;
    levelText.alpha = 0;
    levelText.fixedToCamera = true;

    // Animate
    this.game.add.tween(levelText)
    .to({alpha: 1},
      1000 /*duration (in ms)*/,
      Phaser.Easing.Bounce.Out /*easing type*/,
      true /*autostart?*/)
    .onComplete.add(() => {
      this.animateScore(true);
      this.game.add.tween(levelText)
      .to({y: -levelText.height / 2, alpha: 0},
        1000 /*duration (in ms)*/,
        Phaser.Easing.Bounce.In /*easing type*/,
        true /*autostart?*/,
        1000 /*delay*/)
      .onComplete.add(() => {
        levelText.destroy();
        if (this.towers && this.towers.children && typeof this.towers.children[0] !== "undefined") {
          this._playerShield = this.towers.children[0].shieldPower;
          this._playerBricks = this.towers.children[0].countBricks;
          this._playerMissles = this.towers.children[0].missles;
        }
        (this.game as any).transitionPlugin.to("Main");
        // Init score
        this._scoreText = undefined;
        this._fireGraph = undefined;
      });
    });
  }

  GameOverTransition() {
    if (!(this.game as any).gameover) {
      (this.game as any).gameover = true;

      // remove all event handlers
      this.game.input.onDown.removeAll();

      GameOver.prototype.init(this.game);
      GameOver.prototype.create();
    }
  }

}
