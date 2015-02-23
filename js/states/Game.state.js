SpaceGame.Main = function (game) {
  SpaceGame.enemySprites = [
    {'name': 'alian', 'length': 9},
    {'name': 'bazyaka', 'length': 80},
    {'name': 'cat', 'length': 1},
    {'name': 'nog', 'length': 50}
  ];

  this._background = null;

  SpaceGame._fireButton = null;
  SpaceGame._brickButton = null;
  SpaceGame._missleButton = null;
  SpaceGame._cursors = null;

  SpaceGame._scoreText = null;
  SpaceGame._lifeGraph = null;
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
SpaceGame.Main.prototype = {
  create: function () {
    SpaceGame._newLevelStarted = false;

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
      game.add.audio('scifi1', 0.5),
      game.add.audio('scifi2', 0.5),
      game.add.audio('scifi3', 0.5),
      game.add.audio('scifi4', 0.3),
      game.add.audio('scifi5', 0.3)
    ];
    game.audio.completedSnd = game.add.audio('completed', 1);

    this.createDayTime();

    this.generateClouds.call(this);

    this.shakeFlowers();

    SpaceGame._fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    SpaceGame._brickButton = game.input.keyboard.addKey(Phaser.Keyboard.B);
    SpaceGame._missleButton = game.input.keyboard.addKey(Phaser.Keyboard.M);

    /**
     * Init map
     */
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.applyGravity = true;
    game.physics.p2.gravity.x = 0;
    game.physics.p2.gravity.y = 300;

    /*
     * Tower
     */
    towers = game.add.group();
    game.physics.enable(towers, Phaser.Physics.P2JS, debug);
    game.physics.p2.setImpactEvents(true);
    game.camera.follow(towers);
    game.world.setBounds(0, 0, 1600, 800);
    /*
     * Heart
     */
    SpaceGame._hearts = game.add.group();
    SpaceGame._hearts.createMultiple(1, 'heart');

    /*
     * Shield
     */
    SpaceGame._shields = game.add.group();
    SpaceGame._shields.createMultiple(1, 'shield');

    /*
     * Brick
     */
    SpaceGame._bricks = game.add.group();
    SpaceGame._bricks.createMultiple(1, 'brick');

    /*
     * Wall
     */
    SpaceGame._walls = game.add.group();
    SpaceGame._walls.createMultiple(1, 'wall');

    /*
     * Ufo
     */
    SpaceGame._ufos = game.add.group();
    SpaceGame._ufos.createMultiple(4, 'ufo');

    /*
     * Bombs
     */
    SpaceGame._bombs = game.add.group();
    SpaceGame._bombs.createMultiple(1, 'bomb');


    /*
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

    /*
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

    /*
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

    /*
     * Enemy
     */
    enemys = game.add.group();
    enemys.enableBody = true;
    enemys.physicsBodyType = Phaser.Physics.P2JS;
    game.physics.p2.enableBody(enemys, debug);
    game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    nextLevel();

    score -= 10;
    updateScore();
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
    SpaceGame._backgroundTw = game.add.tween(SpaceGame._background).to({alpha: 0}, SpaceGame.dayLength,
      Phaser.Easing.Quintic.InOut,
      true, //autostart?,
      0, //delay,
      1, //repeat?
      true //yoyo?
    );
  },
  createBackground: function () {
    SpaceGame._background = game.add.tileSprite(0, 0, 1700, 800, 'background');
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
      }, this);

      var speed = game.rnd.integerInRange(this._cloud.x+this._cloud.width*50, this._cloud.width * 500);
       this._tweenClouds[i] = game.add.tween(this._cloud).to({x: game.rnd.integerInRange(this._cloud.x, this._cloud.x+this._cloud.width)}, speed,
       Phaser.Easing.Sinusoidal.InOut,
       true, //autostart?,
       0, //delay,
       false, //repeat?
       true //yoyo?
       );
    }
  },
  shakeFlowers: function () {
    SpaceGame._flowerPlants = game.add.group();
    var plant = null;
    for (var i = 0; i < level + 1; i++) {
      plant = game.add.sprite(76, 174, 'flow');
      plant.x = game.rnd.integerInRange(0, game.width);
      plant.y = game.rnd.integerInRange(game.height - 130 * 2, game.height - 70);
      plant.anchor.setTo(0.5, 1);
      plant.angle = -10 * i;
      SpaceGame._flowerPlants.add(plant);
      var tween = game.add.tween(plant);
      tween.to({
          angle: 10
        }, 3000,
        Phaser.Easing.Linear.NONE,
        true /*autostart?*/,
        0 /*delay*/,
        false /*yoyo?*/, true);
      plant = null;
    }

  },
  update: function () {
    SpaceGame._background.tilePosition.set(game.camera.x * -0.5, game.camera.y * -0.5);
    if (enemys.countLiving() == 0
      && SpaceGame._allEnemysAdded
      && !SpaceGame._newLevelStarted) {
      SpaceGame._newLevelStarted = true;
      updateScore();
      levelCompleted();
    }
    /*
     *  Enemy
     */
    enemys.stealing = false;
    enemys.forEach(function (enemy) {

      if (enemy && enemy.alive) {

        // steal a plant
        if (enemy.closestPlant && enemy.closestPlant.alive) {
          enemys.stealing = true;
          enemy.body.velocity.y = -100;
          enemy.closestPlant.x = enemy.x;
          enemy.closestPlant.y = enemy.y;

          // protect with wall
          if (enemy.y < 200 && towers.children[0].countBricks > 0 && game.time.now > enemy.blockedLastTime) {
            towers.children[0].countBricks--;

            new Wall(enemy.x, enemy.y - enemy.height);
            enemy.blockedLastTime = game.time.now + 300;
            updateScoreText();
          }

          // use plant
          if (enemy.closestPlant.y < 100 && enemy.closestPlant) {
            game.audio.springSnd.play();
            //enemy.kill();
            enemy.closestPlant.destroy();
            var cRect = game.add.graphics(0, 0)
              .beginFill(0xff5a00)
              .drawCircle(towers.children[0].x, towers.children[0].y, 40);
            var health = game.add.text(towers.children[0].x - 10, towers.children[0].y - 15, '-' + enemy.health, {
              font: "20px Tahoma",
              fill: "#000000",
              align: "center"
            });
            var health_tween = game.add.tween(health);
            health_tween.to({opacity: 0.3}, 1000,
              Phaser.Easing.Cubic.NONE,
              true /*autostart?*/,
              100 /*delay*/,
              false /*yoyo?*/);
            //
            health_tween.onLoop.add(function () {
              health.destroy();
              cRect.destroy();
            }, this);

            if (towers.children[0].health > enemy.health) {
              towers.children[0].damage(enemy.health);
            }
            else {
              towers.children[0].damage(enemy.health - 1);
            }
            if (towers && towers.children[0]) {
              towers.children[0].fireTime += enemy.health;
            }
            //
            // enemy.kill();
            updateScoreText();
          }
        }


        if (enemy.y > 460) {
          // find closest  plant
          enemy.closestPlant = SpaceGame._flowerPlants.getFirstAlive();
          SpaceGame._flowerPlants.forEachAlive(function (plant) {
            if (!plant.stealing && enemy.closestPlant.x - enemy.x < plant.x - enemy.x) {
              enemy.closestPlant = plant;
            }
          });

          // plant stealing in progress...
          if (enemy.closestPlant && enemy.closestPlant.alive) {
            enemy.closestPlant.stealing = true;
            enemy.closestPlant.scale.x = (0.5);
            enemy.closestPlant.scale.y = (0.5);
            enemy.body.velocity.y = -7000;
            enemy.closestPlant.x = enemy.x;
            enemy.closestPlant.y = enemy.y;
          }
        }
      }
    });

    if (!SpaceGame._flowerPlants.countLiving()) {
      game.state.start('GameOver');
    }

    towers.forEachAlive(function (tower) {
      if (tower.alpha < 1) {
        return;
      }

      // Move tower
      tower.body.setZeroVelocity();
      var speed = 50 + game.height - tower.body.y / 1.3;

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
        tower.body.velocity.y = -speed;
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
  }
};
