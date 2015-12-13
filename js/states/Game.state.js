SpaceGame.Main = function (game) {
  SpaceGame.enemySprites = [
    {'name': 'alian', 'length': 9},
    {'name': 'bazyaka', 'length': 80},
    {'name': 'cat', 'length': 1},
    {'name': 'nog', 'length': 50}
  ];

  this._background = null;

  SpaceGame._fireButton = null;
  SpaceGame._sateliteButton = null;
  SpaceGame._brickButton = null;
  SpaceGame._missleButton = null;
  SpaceGame._cursors = null;

  SpaceGame._scoreText = null;
  SpaceGame._fireGraph = null;

  SpaceGame._shipTrail = null;
  SpaceGame._hearts = null;
  SpaceGame._shields = null;
  SpaceGame._bricks = null;
  SpaceGame._walls = null;
  SpaceGame._missles = null;
  SpaceGame._bullets = null;
  SpaceGame._bombs = null;

  SpaceGame._playerShield = null;
  SpaceGame._playerBricks = null;
  SpaceGame._playerMissles = null;
  SpaceGame._playerFireSpeed = null;

  SpaceGame._enemy_bullets = null;
  SpaceGame._ufos = null;
};
SpaceGame.GameOverWithScreenshot = function () {
  // save game screenshot.
  SpaceGame.canvasDataURI = game.canvas.toDataURL();
  SpaceGame.transitionPlugin.to('GameOver');
};
SpaceGame.Main.prototype = {
  create: function () {
    // Hide CSS element.
    SpaceGame._anim_elem.style.display = 'none';
    SpaceGame._anim_elem.className += ' gameCreated';

    SpaceGame._newLevelStarted = false;

    this.prepareAudio();
    this.setPlayerKeys();

    this.createDayTime();
    this.generateClouds.call(this);
    this.shakeFlowers();

    /**
     * Init map.
     */
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.applyGravity = true;
    game.physics.p2.gravity.x = 0;
    game.physics.p2.gravity.y = 300;

    this.setupGameGroups();
    this.initStealingSigns();
    this.initUI();

    this.nextLevel();

    score -= 10;
    updateScore();
  },
  prepareAudio: function () {
    game.audio.enemySndFire = game.add.audio('gulp', 2);
    game.audio.playerSndFire = game.add.audio('gunshot', 0.01);
    game.audio.toilSnd = game.add.audio('toil', 0.1);
    game.audio.smackSnd = game.add.audio('smack', 0.2);
    game.audio.laughSnd = game.add.audio('laugh', 0.5);
    game.audio.springSnd = game.add.audio('spring', 0.2);
    game.audio.kissSnd = game.add.audio('kiss', 0.2);
    game.audio.explosionSnd = game.add.audio('explosion', 0.05);
    game.audio.missleSnd = game.add.audio('missle', 0.1);
    game.audio.ufoSnd = [
      game.add.audio('scifi1', 0.2),
      game.add.audio('scifi2', 0.2),
      game.add.audio('scifi3', 0.1),
      game.add.audio('scifi4', 0.1),
      game.add.audio('scifi5', 0.1)
    ];
    game.audio.completedSnd = game.add.audio('completed', 1);
    game.audio.reloadSnd = game.add.audio('reload', 0.6);
  },
  setPlayerKeys: function () {
    SpaceGame._fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    SpaceGame._sateliteButton = game.input.keyboard.addKey(Phaser.Keyboard.S);
    SpaceGame.rewpawnPickupsButton = game.input.keyboard.addKey(Phaser.Keyboard.R);
    SpaceGame._brickButton = game.input.keyboard.addKey(Phaser.Keyboard.B);
    SpaceGame._missleButton = game.input.keyboard.addKey(Phaser.Keyboard.M);
    SpaceGame._cursors = game.input.keyboard.createCursorKeys();
  },
  createDayTime: function () {
    SpaceGame.events = {};
    SpaceGame.events.onNightOver = new Phaser.Signal();

    this.createBackground();
    this.createSun();

    SpaceGame.dayLength = 20000;
    this.createSunAndBgTweens();
    SpaceGame.events.onNightOver.add(this.createSunAndBgTweens, this);
  },
  createSunAndBgTweens: function () {
    this.createSunTween();
    this.createBgTween();
  },
  createBgTween: function () {
    SpaceGame._backgroundTw = game.add.tween(SpaceGame._background)
      .to({alpha: 0.1}, SpaceGame.dayLength,
        Phaser.Easing.Quintic.InOut,
        true, //autostart?,
        0, //delay,
        1, //repeat?
        true //yoyo?
      );
  },
  createBackground: function () {
    SpaceGame._background = game.add.tileSprite(0, 0, getWidth() * 4, 800, 'background');
    SpaceGame._background.alpha = 1;
  },
  createSun: function () {
    SpaceGame._sun = game.add.sprite(60, 60, 'sun');
  },
  createSunTween: function () {
    SpaceGame._sun.x = 10;
    SpaceGame._sun.y = 10;
    SpaceGame._sun.width = 10;
    SpaceGame._sun.height = 10;
    SpaceGame._sunTw = game.add.tween(SpaceGame._sun).to({
      x: game.width - 70,
      width: 60,
      height: 60
    }, SpaceGame.dayLength, Phaser.Easing.Quintic.InOut, true, 0, true, true);
    SpaceGame._sunTw.onComplete.add(function () {
      SpaceGame.events.onNightOver.dispatch(this);
    });
  },
  generateClouds: function () {
    var cloudSises = {
      '0': {x: 124, y: 54, toX: 485, toY: 13},
      '1': {x: 132, y: 82, toX: 120, toY: 93},
      '2': {x: 324, y: 68, toX: 443, toY: 58},
      '3': {x: 272, y: 55, toX: 160, toY: 164},
      '4': {x: 505, y: 130, toX: 465, toY: 107},
      '5': {x: 450, y: 158, toX: 150, toY: 258},
      '6': {x: 352, y: 102, toX: 120, toY: 100}
    };
    this._tweenClouds = [];
    for (var i = 0; i <= 6; i++) {
      this._cloud = game.add.tileSprite(cloudSises[i].toX, cloudSises[i].toY, cloudSises[i].x, cloudSises[i].y, 'cloud' + i);
      // Also enable sprite for drag
      this._cloud.inputEnabled = true;
      this._cloud.input.enableDrag();

      this._cloud.events.onDragStart.add(function () {
        console.log('key=' + this._cloud.key);
        console.log({x: this._cloud.x, y: this._cloud.y});
      }, this);
      this._cloud.events.onDragStop.add(function () {
        console.log({'x': this._cloud.x, 'y': this._cloud.y});
        this._rainGroup.children[0].y = this._cloud.y;
        console.log(this._rainGroup.children[0].width);
      }, this);

      var speed = game.rnd.integerInRange(this._cloud.x + this._cloud.width * 50, this._cloud.width * 500);
      var state = {x: game.rnd.integerInRange(this._cloud.x, this._cloud.x + this._cloud.width)};
      this._tweenClouds[i] = game.add.tween(this._cloud).to(state, speed,
        Phaser.Easing.Sinusoidal.InOut,
        true, //autostart?,
        0, //delay,
        false, //repeat?
        true //yoyo?
      );
    }

    this.makeRain(this._cloud.x, this._cloud.y);
    //this.removeRain();
  },
  makeRain: function (x, y) {
    var particleSystem1 = SpaceGame.epsyPlugin.loadSystem(SpaceGame.epsyPluginConfig.rain, x, y);
    // let Phaser add the particle system to world group or choose to add it to a specific group
    this._rainGroup = game.add.group();
    this._rainGroup.add(particleSystem1);
  },
  removeRain: function () {
    this._rainGroup.destroy();
  },
  shakeFlowers: function () {
    SpaceGame._flowerPlants = game.add.group();
    for (var i = 0; i < level + 1; i++) {
      var plant = Plant.prototype.generatePlant();
      var tween = game.add.tween(plant);
      tween.to({
          angle: 10
        }, 3000,
        Phaser.Easing.Linear.NONE,
        true /*autostart?*/,
        0 /*delay*/, -1, true);
    }

  },
  setupGameGroups: function () {

    /**
     * Tower
     */
    towers = game.add.group();
    game.physics.enable(towers, Phaser.Physics.P2JS, debug);
    game.physics.p2.setImpactEvents(true);
    game.world.setBounds(0, 0, getWidth() * 2, 800);

    /**
     * Heart
     */
    SpaceGame._hearts = game.add.group();
    SpaceGame._hearts.createMultiple(1, 'heart');

    /**
     * Ammo
     */
    SpaceGame._ammos = game.add.group();
    SpaceGame._ammos.createMultiple(1, 'ammo');

    /**
     * Fuel
     */
    SpaceGame._fuels = game.add.group();
    SpaceGame._fuels.createMultiple(1, 'fuel');

    /**
     * Shield
     */
    SpaceGame._shields = game.add.group();
    SpaceGame._shields.createMultiple(1, 'shield');

    /**
     * Brick
     */
    SpaceGame._bricks = game.add.group();
    SpaceGame._bricks.createMultiple(1, 'brick');

    /**
     * Wall
     */
    SpaceGame._walls = game.add.group();
    SpaceGame._walls.createMultiple(1, 'wall-a');
    SpaceGame._walls.createMultiple(1, 'wall-b');
    SpaceGame._walls.createMultiple(1, 'wall-c');

    /**
     * Ufo
     */
    SpaceGame._ufos = game.add.group();
    SpaceGame._ufos.createMultiple(4, 'ufo');

    /**
     * Bombs
     */
    SpaceGame._bombs = game.add.group();
    SpaceGame._bombs.createMultiple(1, 'bomb');

    /**
     * Towers Bullets
     */
    SpaceGame._bullets = game.add.group();
    SpaceGame._bullets.enableBody = true;
    SpaceGame._bullets.physicsBodyType = Phaser.Physics.P2JS;
    SpaceGame._bullets.createMultiple(20, 'bullet');
    SpaceGame._bullets.setAll('checkWorldBounds', true);
    SpaceGame._bullets.setAll('outOfBoundsKill', true);
    SpaceGame._bullets.setAll('collideWorldBounds', false);
    SpaceGame._bullets.setAll('anchor.x', 0.5);
    SpaceGame._bullets.setAll('anchor.y', 1);

    /**
     * Enemy Bullets
     */
    SpaceGame._enemy_bullets = game.add.group();
    SpaceGame._enemy_bullets.enableBody = true;
    SpaceGame._enemy_bullets.physicsBodyType = Phaser.Physics.P2JS;

    SpaceGame._enemy_bullets.createMultiple(40, 'bullet');
    SpaceGame._enemy_bullets.setAll('checkWorldBounds', true);
    SpaceGame._enemy_bullets.setAll('outOfBoundsKill', true);
    SpaceGame._enemy_bullets.setAll('collideWorldBounds', false);
    SpaceGame._enemy_bullets.setAll('anchor.x', 0.5);
    SpaceGame._enemy_bullets.setAll('anchor.y', 1);

    /**
     * Missles
     */
    SpaceGame._missles = game.add.group();
    SpaceGame._missles.enableBody = true;
    SpaceGame._missles.physicsBodyType = Phaser.Physics.P2JS;

    SpaceGame._missles.createMultiple(10, 'missle');
    SpaceGame._missles.setAll('checkWorldBounds', true);
    SpaceGame._missles.setAll('outOfBoundsKill', true);
    SpaceGame._missles.setAll('collideWorldBounds', false);
    SpaceGame._missles.setAll('anchor.x', 0.5);
    SpaceGame._missles.setAll('anchor.y', 1);

    /**
     * Enemys
     */
    SpaceGame.enemys = game.add.group();
    SpaceGame.enemys.enableBody = true;
    SpaceGame.enemys.physicsBodyType = Phaser.Physics.P2JS;
    game.physics.p2.enableBody(SpaceGame.enemys, debug);
    game.physics.p2.setBoundsToWorld(true, true, true, true, false);
  },
  nextLevel: function () {
    level++;
    Tower.prototype.addToPoint(game.width / 2, game.height - 50);
    showLevelTitle();
    updateScoreText();
    addRndBricks();
    //addWalls();
    this.animateScore();
    addEnemys();

    Brick.prototype.generateBrick();
    for (var i = 0; i < parseInt(level / 2); i++) {
      Bomb.prototype.generateBomb();
    }

    this.generateGrowingPickups();
  },
  generateGrowingPickups : function() {
    if (!SpaceGame.Main.pickupsLastTime ) {
      SpaceGame.Main.pickupsLastTime = game.time.now;
    }
    for (var i = 0; i < SpaceGame._flowerPlants.children.length; i++) {
      var plant = SpaceGame._flowerPlants.children[i];
      var __ret = Plant.prototype.generate_pickup(plant);
      plant._spawnTimer = game.time.events.add(__ret.nextSpawnTime, __ret.spawnFunction, this);
    }
  },
  getBarConfig: function (randomSpawnTime, plant) {
    var barConfig = {
      x: 100,
      y: -40,
      height: 5,
      width: 100,
      bg: {
        color: '#0509D8'
      },
      bar: {
        color: '#20E331'
      }
    };
    return barConfig;
  },
  update: function () {
    SpaceGame._background.tilePosition.set(game.camera.x * -0.5, game.camera.y * -0.5);
    SpaceGame.rewpawnPickupsButton.onDown.add(function () {
      if (game.time.now > SpaceGame.Main.pickupsLastTime + 1000) {
        SpaceGame.Main.pickupsLastTime = game.time.now + 1000;
        SpaceGame.Main.prototype.generateGrowingPickups();
      }
    }, this);
    // Game over if no alive flowers.
    if (!SpaceGame._flowerPlants.countLiving()) {
      game.time.events.add(0, SpaceGame.GameOverWithScreenshot, this).autoDestroy = true;
      return;
    }

    // Level completed.
    if (SpaceGame.enemys.countLiving() == 0
      && SpaceGame._allEnemysAdded
      && !SpaceGame._newLevelStarted) {
      SpaceGame._newLevelStarted = true;
      updateScore();
      levelCompleted();
    }

    /**
     *  Enemy stealing check
     */
    SpaceGame.enemys.stealing = false;
    SpaceGame.enemys.forEach(function (enemy) {

      if (enemy && enemy.alive) {

        // steal a plant
        if (enemy.closestPlant && enemy.closestPlant.alive) {
          if (enemy.closestPlant.stealing) {
            SpaceGame.enemys.stealing = true;
            enemy.body.velocity.y = -100;
            enemy.closestPlant.x = enemy.x;
            enemy.closestPlant.y = enemy.y;
          }

          // protect with wall
          if (enemy.y < 200 && towers.children[0].countBricks > 0 && game.time.now > enemy.blockedLastTime) {
            towers.children[0].countBricks--;

            new Wall(enemy.x, enemy.y - enemy.height);
            enemy.blockedLastTime = game.time.now + 300;
            updateScoreText();
          }

          // use/steal plant
          if (enemy.closestPlant.y < 100 && enemy.closestPlant) {
            game.audio.springSnd.play();
            enemy.closestPlant.destroy();
            if (towers && towers.children[0]) {
              towers.children[0].fireTime += enemy.health * 2;
              lives--;
            }
            updateScoreText();
          }
        }

        // plant is too far, forget
        if (enemy.y < 100 && enemy.closestPlant && !SpaceGame.enemys.stealing) {
          enemy.closestPlant.stealing = false;
          enemy.closestPlant = false;
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
            }
          }
        }
        SpaceGame.GameOver.prototype._flowerLiving = SpaceGame._flowerPlants.countLiving();
        if (!SpaceGame.GameOver.prototype._flowerLiving) {
          Enemy.prototype.explode(enemy);
        }
      }
    });


    towers.forEachAlive(function (tower) {
      if (tower.alpha < 1) {
        return;
      }

      // Move tower
      tower.body.setZeroVelocity();
      var speed = game.height / 1.3 + game.height - tower.body.y / 1.3;

      if (SpaceGame._cursors.left.isDown) {
        tower.angle = -30;
        if (SpaceGame._cursors.up.isDown) {
          tower.angle = -60;
        }
        tower.body.velocity.x = -speed;
      }
      else if (SpaceGame._cursors.right.isDown) {
        tower.angle = 30;
        if (SpaceGame._cursors.up.isDown) {
          tower.angle = 60;
        }
        tower.body.velocity.x = speed;
      }
      else {
        tower.rotation = 0;
      }
      speed *= 2;
      if (SpaceGame._cursors.up.isDown) {
        if (tower.fuel > 0) {
          tower.body.velocity.y = -speed;
          tower.fuel--;
          updateScoreText();
        }
      }
      else if (SpaceGame._cursors.down.isDown) {
        tower.body.velocity.y = speed;
      }
      if (this.game.input.activePointer.isDown) {
        if (this.game.input.activePointer.isMouse) {
          // @todo: In the case of a mouse, check mouse button status?
          if (this.game.input.activePointer.button == Phaser.Mouse.RIGHT_BUTTON) {

          }
        }
        else {
//        if (Math.floor(game.input.x/(game.width/2)) === 0) {
          if (game.input.x < tower.x) {
            tower.angle = -30;
            tower.body.velocity.x = -speed;
          }
//        if (Math.floor(game.input.x/(game.width/2)) === 1) {
          if (game.input.x > tower.x) {
            tower.angle = 30;
            tower.body.velocity.x = speed;
          }
//        if(Math.floor(game.input.y/(game.height/2)) === 0){
          if (game.input.y < tower.y) {
            tower.body.velocity.y = -speed;
          }
//        if(Math.floor(game.input.y/(game.height/2)) === 1){
          if (game.input.y > tower.y) {
            tower.body.velocity.y = speed;
          }
          /*          if (game.input.y > 600) {
           Tower.prototype.fire(tower);
           }*/

          // Multiple touches/pointers
          /*if (this.game.input.pointer1.isDown && this.game.input.pointer2.isDown)
           alert(this.game.input.pointer2.isDown);*/
        }
      }
    });

    // Update spawn bar.
    SpaceGame._flowerPlants.forEachAlive(function (plant) {
      var bar = plant.spawnBar;
      if (bar) {
        if (!plant.stealing) {
          bar.barSprite.alpha = 1;
          bar.bgSprite.alpha = 1;
        }
        else {
          bar.barSprite.alpha = 0;
          bar.bgSprite.alpha = 0;
        }
        if (plant.alive) {
          var newValue = (plant.randomSpawnTime - game.time.now) * 100 / plant.randomSpawnTime;
          bar.setPercent(newValue);
          bar.setPosition(plant.x, plant.y);
        }
      }
    });

    // Follow camera.
    SpaceGame._UiGroup.x = game.camera.x + 20;
  },
  initStealingSigns: function () {
    function initOneStealSign(direction) {
      var stealingSignSprite = game.add.sprite(game.width / 2, 130, 'sign_' + direction);
      stealingSignSprite.scale.x = 0.3;
      stealingSignSprite.scale.y = 0.3;
      stealingSignSprite.anchor.setTo(0.5, 0.5);
      var text_l = game.add.text(0, -170,
        'Stealing detected!', {
          font: "50px Tahoma",
          fill: "#D81E00",
          align: "center"
        });
      text_l.anchor.setTo(0.5, 0.5);
      stealingSignSprite.addChild(text_l);
      stealingSignSprite.alpha = 0;
      stealingSignSprite.fixedToCamera = true;

      return stealingSignSprite;
    }

    SpaceGame.enemys.stealSignLeft = initOneStealSign('left');
    SpaceGame.enemys.stealSignRight = initOneStealSign('right');
  },
  initUI: function () {
    SpaceGame._UiGraph = game.add.graphics(0, 0);
    SpaceGame._UiGraph.beginFill(0xFFFFFF);
    SpaceGame._UiGraph.clear();
    SpaceGame._UiGraph.drawRect(game.width - 150, 0, 150, game.height);
    SpaceGame._UiGraph.alpha = .8;
    SpaceGame._UiGraph.update();

    function createSateliteDraggable(key) {
      var yPos = key == 'satelite_freeze' ? 150 : 0;
      var satelite = game.add.sprite(game.width - 150, yPos, key);
      satelite.inputEnabled = true;
      satelite.input.enableDrag();
      // Add dag event handlers.
      satelite.events.onInputDown.add(this.eventSateliteInputDown);
      satelite.events.onDragStop.add(this.eventSateliteDragStop);

      return satelite;
    }

    SpaceGame._sateliteBtn = createSateliteDraggable.call(this, 'satelite');
    SpaceGame._sateliteFreezeBtn = createSateliteDraggable.call(this, 'satelite_freeze');

    SpaceGame._UiGroup = game.add.group();
    SpaceGame._UiGroup.add(SpaceGame._UiGraph);
    SpaceGame._UiGroup.add(SpaceGame._sateliteBtn);
    SpaceGame._UiGroup.add(SpaceGame._sateliteFreezeBtn);
  },
  eventSateliteInputDown: function (satelite) {
    SpaceGame._sateliteInitPos = {};
    SpaceGame._sateliteInitPos.x = satelite.x;
    SpaceGame._sateliteInitPos.y = satelite.y;
  },
  eventSateliteDragStop: function (satelite) {
    if (score >= 25) {
      score -= 25;
      updateScoreText();
      Satelite.prototype.addToPoint(satelite.x, satelite.y, satelite.key == 'satelite_freeze');
    }
    satelite.x = SpaceGame._sateliteInitPos.x;
    satelite.y = SpaceGame._sateliteInitPos.y;
    SpaceGame._sateliteInitPos = {};
  },
  animateScore: function (moveOut) {
    moveOut = moveOut || false;

    // Animate walls
    SpaceGame._walls.forEachAlive(function (brick) {
      game.add.tween(brick)
        .to({alpha: moveOut ? 0 : 1}, 1000, Phaser.Easing.Linear.None, true, 0);
    });

    SpaceGame._UiGroup.forEach(function (item) {

      // Graphics does not work to animate here :(
      if (item.type == 0) {
        item.x = moveOut ? item.x : game.width + item.width;
        item.alpha = moveOut ? 1 : 0;

        var toX = moveOut ? game.width + item.width : game.width - 150;
        var delay = moveOut ? 700 : 500;

        game.add.tween(item).to({alpha: moveOut ? 0 : 1, x: toX},
          700, Phaser.Easing.Linear.None, true, delay);
      }
    });
  }
};
