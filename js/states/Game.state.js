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
  SpaceGame._plantsGenerationEvents = [];
  SpaceGame._numberButtons = [];

  SpaceGame._scoreText = null;

  SpaceGame._shipTrail = null;
  SpaceGame._hearts = null;
  SpaceGame._shields = null;
  SpaceGame._bricks = null;
  SpaceGame._walls = null;
  SpaceGame._missles = null;
  SpaceGame._bullets = null;
  SpaceGame._frezzing_bullets = null;
  SpaceGame._bombs = null;

  SpaceGame._playerShield = null;
  SpaceGame._playerBricks = null;
  SpaceGame._playerMissles = null;

  SpaceGame._enemy_bullets = null;
  SpaceGame._ufos = null;
};
SpaceGame.Main.prototype = {
  render: function() {
    // this.game.debug.start(20, 20, 'yellow');
    // this.game.debug.line();
},
  create: function () {
    // Hide CSS element.
    SpaceGame._anim_elem.style.display = 'none';
    SpaceGame._anim_elem.className += ' gameCreated';

    SpaceGame._newLevelStarted = false;

    this.prepareAudio();
    this.setPlayerKeys();

    /**
     * Init map.
     */
    game.physics.startSystem(Phaser.Physics.P2JS);
    game.physics.p2.setImpactEvents(true);
    game.physics.p2.restitution = 0.9;
    game.physics.p2.applyGravity = true;
    game.physics.p2.gravity.x = 0;
    game.physics.p2.gravity.y = 300;
    game.physics.p2.setBoundsToWorld(true, true, true, true, false);

    // Background
    this.createDayTime();
    this.generateClouds.call(this);

    this.setupGameGroups();

    // Add one Flower.
    new Plant();

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
    game.audio.laserSnd = game.add.audio('laser', 0.1);
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
    var keysNumbers = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
    for (var i = 0; i <= 7; i++) {
      SpaceGame._numberButtons.push(game.input.keyboard.addKey(Phaser.Keyboard[keysNumbers[i]]));
    }
  },

  createDayTime: function () {
    var createBackground = function () {
      SpaceGame._background = game.add.tileSprite(0, 0, getWidth() * 4, 800, 'background');
      SpaceGame._background.alpha = 1;
    };
    var createSun = function () {
      SpaceGame._sun = game.add.sprite(60, 60, 'sun');
    };

    SpaceGame.events = {};
    SpaceGame.events.onNightOver = new Phaser.Signal();

    createBackground();
    createSun();

    SpaceGame.dayLength = 20000;
    this.createSunAndBgTweens();
    SpaceGame.events.onNightOver.add(this.createSunAndBgTweens, this);

    // Clouds and rain groups.
    SpaceGame._cloudsGroup = game.add.group();
    SpaceGame._rainGroup = game.add.group();
  },
  createSunAndBgTweens: function () {
    var createBgTween = function () {
      SpaceGame._backgroundTw = game.add.tween(SpaceGame._background)
        .to({alpha: 0.1}, SpaceGame.dayLength,
          Phaser.Easing.Quintic.InOut,
          true, //autostart?,
          0, //delay,
          1, //repeat?
          true //yoyo?
        );
    };
    var createSunTween = function () {
      SpaceGame._sun.x = 10;
      SpaceGame._sun.y = 10;
      SpaceGame._sun.width = 10;
      SpaceGame._sun.height = 10;
      SpaceGame._sunTw = game.add.tween(SpaceGame._sun).to({
        x: game.width - 180,
        width: 60,
        height: 60
      }, SpaceGame.dayLength, Phaser.Easing.Quintic.InOut, true, 0, true, true);
      SpaceGame._sunTw.onComplete.add(function () {
        SpaceGame.events.onNightOver.dispatch(this);
      });
    };
    createBgTween();
    createSunTween();
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
    SpaceGame._tweenClouds = [];
    for (var i = 0; i <= 6; i++) {
      this._cloud = game.add.tileSprite(cloudSises[i].toX, cloudSises[i].toY, cloudSises[i].x, cloudSises[i].y, 'cloud' + i);
      SpaceGame._cloudsGroup.add(this._cloud);
      // Also enable sprite for drag
      this._cloud.inputEnabled = true;
      this._cloud.input.enableDrag();

      this._cloud.events.onDragStart.add(function () {
        //console.log('key=' + this._cloud.key);
        //console.log({x: this._cloud.x, y: this._cloud.y});
      }, this);
      this._cloud.events.onDragStop.add(function () {
        if (SpaceGame._rainGroup.children[0]) {
          SpaceGame._rainGroup.children[0].y = this._cloud.y + this._cloud.height;
          SpaceGame._rainGroup.children[0].x = this._cloud.x + 150;
        }
      }, this);
    }
    game.time.events.add(300, SpaceGame.Main.prototype.makeRain, this);
  },
  makeRain: function () {
    var integerInRange = game.rnd.integerInRange(0,6);
    var cloud = SpaceGame._cloudsGroup.children[integerInRange];
    cloud.raining = true;

    var config = SpaceGame.epsyPluginConfig.rain;
    var particleSystem1 = SpaceGame.epsyPlugin.loadSystem(config, cloud.x, cloud.y + cloud.height);
    // let Phaser add the particle system to world group or choose to add it to a specific group
    SpaceGame._rainGroup.add(particleSystem1);
    SpaceGame._rainGroup.children[0].x = cloud.x + 150;
    game.time.events.add(5000, this.removeRain, this);
  },
  removeRain: function () {
    SpaceGame._rainGroup.forEachAlive(function (element) {
      element.destroy();
    }, this);
    SpaceGame._cloudsGroup.forEachAlive(function (cloud) {
      cloud.raining = false;
    }, this);
    game.time.events.add(3000, this.makeRain, this);
  },

  setupWorldBounds: function () {
    SpaceGame.worldBounds = game.add.group();
    // Define a block using bitmap data rather than an image sprite
    var verticalShape = game.add.bitmapData(getWidth() * 8, 100);
    var horizontalShape = game.add.bitmapData(100, getHeight() * 2);
    // Create a new sprite using the bitmap data
    SpaceGame.bottomBound = game.add.sprite(0, 790, verticalShape);
    SpaceGame.worldBounds.add(SpaceGame.bottomBound);
    SpaceGame.topBound = game.add.sprite(0, 10, verticalShape);
    SpaceGame.worldBounds.add(SpaceGame.topBound);
    SpaceGame.leftBound = game.add.sprite(0, 0, horizontalShape);
    SpaceGame.worldBounds.add(SpaceGame.leftBound);
    SpaceGame.rightBound = game.add.sprite(getWidth() * 4, 0, horizontalShape);
    SpaceGame.worldBounds.add(SpaceGame.rightBound);
    // Enable P2 Physics and set the block not to move
    game.physics.p2.enable(SpaceGame.worldBounds);
    SpaceGame.worldBounds.setAll('body.static', true);
  }, 
  setupGameGroups: function () {

    /**
     * Tower
     */
    towers = game.add.group();
    game.physics.enable(towers, Phaser.Physics.P2JS, debug);
    game.world.setBounds(0, 0, getWidth() * 4, 790);
    this.setupWorldBounds();

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
     * Satelites
     */
    SpaceGame._satelites = game.add.group();

    /**
     * Towers Bullets
     */
    SpaceGame._bullets = game.add.group();
    SpaceGame._bullets.enableBody = true;
    SpaceGame._bullets.physicsBodyType = Phaser.Physics.P2JS;
    SpaceGame._bullets.createMultiple(20, 'green_bullet');
    SpaceGame._bullets.setAll('checkWorldBounds', true);
    SpaceGame._bullets.setAll('outOfBoundsKill', true);
    SpaceGame._bullets.setAll('collideWorldBounds', false);
    SpaceGame._bullets.setAll('anchor.x', 0.5);
    SpaceGame._bullets.setAll('anchor.y', 1);

    SpaceGame._frezzing_bullets = game.add.group();
    SpaceGame._frezzing_bullets.enableBody = true;
    SpaceGame._frezzing_bullets.physicsBodyType = Phaser.Physics.P2JS;
    SpaceGame._frezzing_bullets.createMultiple(20, 'freezing_bullet');
    SpaceGame._frezzing_bullets.setAll('checkWorldBounds', true);
    SpaceGame._frezzing_bullets.setAll('outOfBoundsKill', true);
    SpaceGame._frezzing_bullets.setAll('collideWorldBounds', false);
    SpaceGame._frezzing_bullets.setAll('anchor.x', 0.5);
    SpaceGame._frezzing_bullets.setAll('anchor.y', 1);

    /**
     * Enemy Bullets
     */
    SpaceGame._enemy_bullets = game.add.group();
    SpaceGame._enemy_bullets.enableBody = true;
    SpaceGame._enemy_bullets.physicsBodyType = Phaser.Physics.P2JS;

    SpaceGame._enemy_bullets.createMultiple(20, 'bullet');
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
    SpaceGame._missles.setAll('tracking', true);

    /**
     * Enemys
     */
    SpaceGame.enemys = game.add.group();
    SpaceGame.enemys.enableBody = true;
    SpaceGame.enemys.physicsBodyType = Phaser.Physics.P2JS;
    game.physics.p2.enableBody(SpaceGame.enemys, debug);

    /* Flowers */
    SpaceGame._flowerPlants = game.add.group();
  },
  nextLevel: function () {
    level++;
    score += level * 20;
    Tower.prototype.addToPoint(getWidth() / 2, getHeight() - 50);
    showLevelTitle();
    updateScoreText();
    addRndBricks();
    //addWalls();
    this.animateScore();
    this.addEnemys();

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

    // Remove old generation events
    for (var i = 0; i < SpaceGame._plantsGenerationEvents.length; i++) {
      game.time.events.remove(SpaceGame._plantsGenerationEvents[i]);
    }

    // Add new events
    for (var i = 0; i < SpaceGame._flowerPlants.children.length; i++) {
      var plant = SpaceGame._flowerPlants.children[i];
      var __ret = Plant.prototype.generate_pickup(plant);
      SpaceGame._plantsGenerationEvents.push(game.time.events.add(__ret.nextSpawnTime, __ret.spawnFunction, this));
    }
  },
  initStealingSigns: function () {
    function initOneStealSign(direction) {
      var stealingSignSprite = game.add.sprite(game.width / 2, 130, 'sign_' + direction);
      stealingSignSprite.scale.x = 0.3;
      stealingSignSprite.scale.y = 0.3;
      stealingSignSprite.anchor.setTo(0.5, 0.5);
      var text_l = game.add.text(0, -170,
        'Stealing!', {
          font: "50px eater",
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

  drawLivesSprites: function () {
    SpaceGame._livesGraph.removeAll(true);
    for (var i = 0; i < lives; i++) {
      var liveSprite = game.add.sprite(50 * i, 0, 'spaceship');
      liveSprite.scale.setTo(0.2);
      liveSprite.tint = 0x0BA4FF;
      liveSprite.fixedToCamera = true;
      SpaceGame._livesGraph.add(liveSprite);
    }
  }, initUI: function () {

    // Create elements.
    function createUiElements() {
      SpaceGame._livesGraph = game.add.group();
      this.drawLivesSprites();
      SpaceGame._UiGraph = createUiGraph();
      SpaceGame._sateliteBtn = createSateliteDraggable.call(this, 'satelite');
      SpaceGame._sateliteFreezeBtn = createSateliteDraggable.call(this, 'satelite_freeze');
      SpaceGame._sateliteRocketBtn = createSateliteDraggable.call(this, 'tower');
      SpaceGame._satelitelasertBtn = createSateliteDraggable.call(this, 'laser_tower');
      SpaceGame._wallBtn = createWallDraggable.call(this);
      SpaceGame._bombBtn = createBombDraggable.call(this);
      SpaceGame._rocketBtn = createRocketDraggable.call(this);
      SpaceGame._reloadBtn = createReloadBtn.call(this);
      SpaceGame._reloadBtn.events.onInputDown.add(reloadPickups);
    }
    createUiElements.call(this);

    // Add elements to UIGroup.
    function groupElements() {
      SpaceGame._UiGroup = game.add.group();
      SpaceGame._UiGroup.fixedToCamera = true;
      SpaceGame._UiGroup.add(SpaceGame._UiGraph);

      SpaceGame._UiGroup.add(SpaceGame._sateliteBtn);
      SpaceGame._UiGroup.add(SpaceGame._sateliteFreezeBtn);
      SpaceGame._UiGroup.add(SpaceGame._sateliteRocketBtn);
      SpaceGame._UiGroup.add(SpaceGame._satelitelasertBtn);
      SpaceGame._UiGroup.add(SpaceGame._wallBtn);
      SpaceGame._UiGroup.add(SpaceGame._bombBtn);
      SpaceGame._UiGroup.add(SpaceGame._rocketBtn);
      SpaceGame._UiGroup.add(SpaceGame._reloadBtn);
    }
    groupElements();

    // Functions to create elements.
    function createUiGraph() {
      var uiRect = game.add.graphics(0, 0);
      uiRect.beginFill(0xFFFFFF);
      uiRect.clear();
      uiRect.drawRect(game.width - 150, 0, 150, game.height);
      uiRect.alpha = .8;
      return uiRect;
    }
    function createSateliteDraggable(key) {

      var yPos = 0;
      switch (key) {
        case 'satelite_freeze':
          yPos = 128 * 0.5;
          break;
        case 'tower':
          yPos = 2 * 128 * 0.5;
          break;
        case 'laser_tower':
          yPos = 3 * 128 * 0.5;
          break;
      }

      var satelite = game.add.sprite(0, yPos, key);
      satelite.anchor.setTo(0, 0);
      satelite.scale.setTo(0.5, 0.5);

      satelite.inputEnabled = true;
      satelite.input.enableDrag();
      // Add drag event handlers.
      satelite.events.onInputDown.add(eventSateliteInputDown);
      satelite.events.onDragStop.add(eventSateliteDragStop);
      satelite.events.onDragUpdate.add(eventSateliteDragUpdate);

      var textObj = game.add.text(150, 50, SpaceGame.priceList[key] + '$', SpaceGame.priceStyle);
      satelite.addChild(textObj);

      var text = '1';
      switch (key) {
        case 'satelite_freeze':
          text = 2;
          break;
        case 'tower':
          text = 3;
          break;
        case 'laser_tower':
          text = 4;
          break;
      }

      var cRect = drawPriceCircle(text);
      satelite.addChild(cRect);

      return satelite;
    }
    function createWallDraggable() {
      var wallBtn = game.add.sprite(0, 300, 'wall-a');
      wallBtn.scale.setTo(0.4, 0.4);
      wallBtn.inputEnabled = true;
      wallBtn.input.enableDrag();
      // Add drag event handlers.
      wallBtn.events.onInputDown.add(eventWallInputDown);
      wallBtn.events.onDragStop.add(eventWallDragStop);

      var textObj = game.add.text(150, 15, SpaceGame.priceList.wall + '$', SpaceGame.priceStyle);
      textObj.scale.setTo(1.3, 1.3);
      wallBtn.addChild(textObj);
      var cRect = drawPriceCircle('5');
      cRect.scale.set(1.2);
      wallBtn.addChild(cRect);

      return wallBtn;
    }
    function createBombDraggable() {
      var bombBtn = game.add.sprite(0, 350, 'bomb');
      bombBtn.scale.setTo(0.7, 0.7);
      bombBtn.inputEnabled = true;
      bombBtn.input.enableDrag();
      // Add drag event handlers.
      bombBtn.events.onInputDown.add(eventBombInputDown);
      bombBtn.events.onDragStop.add(eventBombDragStop);
      bombBtn.events.onDragUpdate.add(eventBombDragUpdate);

      var textObj = game.add.text(75, 15, SpaceGame.priceList.bomb + '$', SpaceGame.priceStyle);
      textObj.scale.setTo(0.7, 0.7);
      bombBtn.addChild(textObj);

      var cRect = drawPriceCircle('6');
      cRect.scale.set(0.7);
      bombBtn.addChild(cRect);

      return bombBtn;
    }
    function createRocketDraggable() {
      var rocketBtn = game.add.sprite(0, 420, 'missle');
      rocketBtn.scale.setTo(0.7, 0.7);
      rocketBtn.inputEnabled = true;
      rocketBtn.input.enableDrag();
      // Add drag event handlers.
      rocketBtn.events.onInputDown.add(eventRocketInputDown);
      rocketBtn.events.onDragStop.add(eventRocketDragStop);
      rocketBtn.events.onDragUpdate.add(eventRocketDragUpdate);

      var textObj = game.add.text(50, 0, SpaceGame.priceList.rocket + '$', SpaceGame.priceStyle);
      textObj.scale.setTo(0.7, 0.7);
      rocketBtn.addChild(textObj);

      var cRect = drawPriceCircle('7');
      cRect.scale.set(0.7);
      rocketBtn.addChild(cRect);

      return rocketBtn;
    }
    function createReloadBtn() {
      var reloadBtn = game.add.sprite(0, 480, 'reload');
      reloadBtn.scale.setTo(0.2, 0.2);
      reloadBtn.inputEnabled = true;
      var cRect = drawPriceCircle('R');
      cRect.scale.setTo(2.4);
      reloadBtn.addChild(cRect);
      return reloadBtn;
    }
    function drawPriceCircle (text) {
      var cRect = game.add.graphics(0, 50).beginFill(0xff5a00, 1).drawCircle(0, 0, 55);
      var number = game.add.text(0, 5, text, {
        font: '40px Arial',
        fill: '#FFFFFF'
      });
      number.anchor.setTo(0.5);
      cRect.scale.setTo(1);
      cRect.addChild(number);
      return cRect;
    }

    // Functions events handlers
    function eventSateliteInputDown(satelite) {
      SpaceGame._sateliteInitPos = {};
      SpaceGame._sateliteInitPos.x = satelite.x;
      SpaceGame._sateliteInitPos.y = satelite.y;
    }
    function eventSateliteDragStop(satelite) {
      var price = SpaceGame.priceList[satelite.key];
      if (score >= price) {
        score -= price;
        updateScoreText();
        var isFreezing = satelite.key == 'satelite_freeze';
        var isRocket = satelite.key == 'tower';
        var isLaser = satelite.key == 'laser_tower';
        new Satelite(satelite.x, satelite.y, isFreezing, isRocket, isLaser);
      }
      satelite.x = SpaceGame._sateliteInitPos.x;
      satelite.y = SpaceGame._sateliteInitPos.y;
      SpaceGame._sateliteInitPos = {};
    }
    function eventSateliteDragUpdate(tower) {
      tower.y = game.height - 70;
    }
    function eventWallInputDown(wall) {
      SpaceGame._wallInitPos = {};
      SpaceGame._wallInitPos.x = wall.x;
      SpaceGame._wallInitPos.y = wall.y;
    }
    function eventWallDragStop(wall) {
      var price = SpaceGame.priceList.wall;
      if (towers.children[0].countBricks > 0) {
        towers.children[0].countBricks--;
        updateScoreText();
        new Wall(wall.x, wall.y);
      }
      else if (score >= price) {
        score -= price;
        updateScoreText();
        new Wall(wall.x, wall.y);
      }

      wall.x = SpaceGame._wallInitPos.x;
      wall.y = SpaceGame._wallInitPos.y;
      SpaceGame._wallInitPos = {};
    }
    function eventBombInputDown(bomb) {
      SpaceGame._bombInitPos = {};
      SpaceGame._bombInitPos.x = bomb.x;
      SpaceGame._bombInitPos.y = bomb.y;
    }
    function eventBombDragUpdate(bomb) {
      bomb.y = 10;
    }
    function eventBombDragStop(bomb) {
      var price = SpaceGame.priceList.bomb;
      if (score >= price) {
        score -= price;
        updateScoreText();
        new Bomb(bomb.x, bomb.y);
      }

      bomb.x = SpaceGame._bombInitPos.x;
      bomb.y = SpaceGame._bombInitPos.y;
      SpaceGame._bombInitPos = {};
    }
    function eventRocketInputDown(rocket) {
      SpaceGame._rocketInitPos = {};
      SpaceGame._rocketInitPos.x = rocket.x;
      SpaceGame._rocketInitPos.y = rocket.y;
    }
    function eventRocketDragUpdate(rocket) {
      rocket.y = game.height - 30;
    }
    function eventRocketDragStop(rocket) {
      var price = SpaceGame.priceList.rocket;
      if (score >= price) {
        score -= price;
        updateScoreText();
        var missle = new Missle(rocket.x, rocket.y, true);
        missle.body.moveUp(800);
      }

      rocket.x = SpaceGame._rocketInitPos.x;
      rocket.y = SpaceGame._rocketInitPos.y;
      SpaceGame._rocketInitPos = {};
    }
    function reloadPickups() {
      if (game.time.now > SpaceGame.Main.pickupsLastTime + 1000) {
        SpaceGame.Main.pickupsLastTime = game.time.now + 1000;
        SpaceGame.Main.prototype.generateGrowingPickups();
      }
    }
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
  },
  addEnemys: function () {
    var i = 0;
    SpaceGame._allEnemysAdded = false;
    var enemysBcl = game.time.events.loop(level / 2 * Phaser.Timer.SECOND, function () {
      // Generate i=3*level number of enemys
      if (i < 2 * level) {
        var rndKey = game.rnd.integerInRange(0, SpaceGame.enemySprites.length - 1);
        var animEnemy = SpaceGame.enemySprites[rndKey];
        var enemy = new Enemy(0, 0, animEnemy.name, animEnemy.length);
        var param = {
          x: parseInt(game.rnd.integerInRange(0, game.width)),
          y: parseInt(game.rnd.integerInRange(0, game.height))
        };
        param.countBricks = 1;
        Tower.prototype.addWall(param);
      } else {
        enemysBcl = null;
        SpaceGame._allEnemysAdded = true;
      }
      i++;
    });
  },

  checkIntersectsWithRain: function (tower) {
    var intersectsWithRain = false;
    SpaceGame._rainGroup.forEachAlive(function (element) {
      intersectsWithRain = Phaser.Rectangle.intersects(element.getBounds(), tower.getBounds());
    }, this);
    return intersectsWithRain;
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
      // save game screenshot.
      SpaceGame.canvasDataURI = game.canvas.toDataURL();
      game.camera.flash(0xFF0010, 2000, true);
      game.time.events.add(0, SpaceGame.GameOverTransition, this).autoDestroy = true;
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
    game.physics.arcade.collide(SpaceGame.enemys);
    SpaceGame.enemys.forEachAlive(function (enemy) {
      // Slow down under the rain
      enemy.body.damping = SpaceGame.Main.prototype.checkIntersectsWithRain(enemy)
        ? 1
        : 0.1;

      // Steal a plant
      if (enemy.closestPlant && enemy.closestPlant.alive) {
        if (enemy.closestPlant.stealing) {
          SpaceGame.enemys.stealing = true;
          enemy.body.velocity.y = -100;
          enemy.closestPlant.x = enemy.x;
          enemy.closestPlant.y = enemy.y;
        }

        // protect with wall
        if (enemy.y < 200 && towers.children[0].countBricks > 0
          && game.time.now > enemy.blockedLastTime) {
          towers.children[0].countBricks--;

          new Wall(enemy.x, enemy.y - enemy.height);
          enemy.blockedLastTime = game.time.now + 300;
          updateScoreText();
        }

        // use/steal plant
        if (enemy.closestPlant.y < 100 && enemy.closestPlant) {
          game.audio.springSnd.play();
          enemy.closestPlant.destroy();
          updateScore(true);
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
    });
    
    towers.forEachAlive(function (tower) {
      if (tower.alpha < 1) {
        return;
      }

      // Move tower
      tower.body.setZeroVelocity();
      var speed = game.height / 1.3 + game.height - tower.body.y / 1.3;

      // Slow down under the rain
      if (SpaceGame.Main.prototype.checkIntersectsWithRain(tower)) {
        speed -= tower.body.y;
      }

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
  }
};
