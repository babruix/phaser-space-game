SpaceGame.Main = function (game) {
  SpaceGame.Main.game = game;
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
    // this.game.debug.spriteInfo(towers.children[0], 32, 32);
},
  create: function (tutorial, game) {
    SpaceGame.isTutorial = tutorial || false;
    if (SpaceGame.isTutorial) {
      this.game = game;
    }
    // Hide CSS element.
    SpaceGame._anim_elem.style.display = 'none';
    SpaceGame._anim_elem.className += ' gameCreated';

    SpaceGame._newLevelStarted = false;

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
    this.createDayTime();
    this.generateClouds.call(this);

    this.setupGameGroups();

    // Add one Flower.
    new Plant();

    this.initStealingSigns();
    this.initUI();

    this.nextLevel();

    score -= 10;
    this.updateScore();
  },

  prepareAudio: function () {
    this.game.audio.enemySndFire = this.game.add.audio('gulp', 2);
    this.game.audio.playerSndFire = this.game.add.audio('gunshot', 0.01);
    this.game.audio.toilSnd = this.game.add.audio('toil', 0.1);
    this.game.audio.smackSnd = this.game.add.audio('smack', 0.2);
    this.game.audio.laughSnd = this.game.add.audio('laugh', 0.5);
    this.game.audio.springSnd = this.game.add.audio('spring', 0.2);
    this.game.audio.kissSnd = this.game.add.audio('kiss', 0.2);
    this.game.audio.explosionSnd = this.game.add.audio('explosion', 0.05);
    this.game.audio.missleSnd = this.game.add.audio('missle', 0.1);
    this.game.audio.laserSnd = this.game.add.audio('laser', 0.1);
    this.game.audio.ufoSnd = [
      this.game.add.audio('scifi1', 0.2),
      this.game.add.audio('scifi2', 0.2),
      this.game.add.audio('scifi3', 0.1),
      this.game.add.audio('scifi4', 0.1),
      this.game.add.audio('scifi5', 0.1)
    ];
    this.game.audio.completedSnd = this.game.add.audio('completed', 1);
    this.game.audio.reloadSnd = this.game.add.audio('reload', 0.6);
  },
  setPlayerKeys: function () {
    SpaceGame._fireButton = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
    SpaceGame._sateliteButton = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    SpaceGame.rewpawnPickupsButton = this.game.input.keyboard.addKey(Phaser.Keyboard.R);
    SpaceGame._brickButton = this.game.input.keyboard.addKey(Phaser.Keyboard.B);
    SpaceGame._missleButton = this.game.input.keyboard.addKey(Phaser.Keyboard.M);
    SpaceGame._cursors = this.game.input.keyboard.createCursorKeys();
    var keysNumbers = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN'];
    for (var i = 0; i <= 7; i++) {
      SpaceGame._numberButtons.push(this.game.input.keyboard.addKey(Phaser.Keyboard[keysNumbers[i]]));
    }
  },

  createDayTime: function () {
    var createBackground = function () {
      SpaceGame._background = this.game.add.tileSprite(0, 0, getWidth() * 4, 800, 'background');
      SpaceGame._background.alpha = 1;
    };
    var createSun = function () {
      SpaceGame._sun = this.game.add.sprite(60, 60, 'sun');
    };

    SpaceGame.events = {};
    SpaceGame.events.onNightOver = new Phaser.Signal();

    createBackground();
    createSun();

    SpaceGame.dayLength = 20000;
    this.createSunAndBgTweens();
    SpaceGame.events.onNightOver.add(this.createSunAndBgTweens, this);

    // Clouds and rain groups.
    SpaceGame._cloudsGroup = this.game.add.group();
    SpaceGame._rainGroup = this.game.add.group();
  },
  createSunAndBgTweens: function () {
    var createBgTween = function () {
      SpaceGame._backgroundTw = this.game.add.tween(SpaceGame._background)
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
      SpaceGame._sunTw = this.game.add.tween(SpaceGame._sun).to({
        x: this.game.width - 180,
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
      this._cloud = this.game.add.tileSprite(cloudSises[i].toX, cloudSises[i].toY, cloudSises[i].x, cloudSises[i].y, 'cloud' + i);
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
    this.game.time.events.add(300, SpaceGame.Main.prototype.makeRain, this);
  },
  makeRain: function () {
    var integerInRange = this.game.rnd.integerInRange(0,6);
    var cloud = SpaceGame._cloudsGroup.children[integerInRange];
    cloud.raining = true;

    var config = SpaceGame.epsyPluginConfig.rain;
    var particleSystem1 = SpaceGame.epsyPlugin.loadSystem(config, cloud.x, cloud.y + cloud.height);
    // let Phaser add the particle system to world group or choose to add it to a specific group
    SpaceGame._rainGroup.add(particleSystem1);
    SpaceGame._rainGroup.children[0].x = cloud.x + 150;
    this.game.time.events.add(5000, this.removeRain, this);
  },
  removeRain: function () {
    SpaceGame._rainGroup.forEachAlive(function (element) {
      element.destroy();
    }, this);
    SpaceGame._cloudsGroup.forEachAlive(function (cloud) {
      cloud.raining = false;
    }, this);
    this.game.time.events.add(3000, this.makeRain, this);
  },

  setupGameGroups: function () {

    /**
     * Tower
     */
    towers = this.game.add.group();
    this.game.physics.enable(towers, Phaser.Physics.P2JS, debug);
    this.game.world.setBounds(0, 0, getWidth() * 4, 790);

    /**
     * Heart
     */
    SpaceGame._hearts = this.game.add.group();
    SpaceGame._hearts.createMultiple(1, 'heart');

    /**
     * Ammo
     */
    SpaceGame._ammos = this.game.add.group();
    SpaceGame._ammos.createMultiple(1, 'ammo');

    /**
     * Fuel
     */
    SpaceGame._fuels = this.game.add.group();
    SpaceGame._fuels.createMultiple(1, 'fuel');

    /**
     * Shield
     */
    SpaceGame._shields = this.game.add.group();
    SpaceGame._shields.createMultiple(1, 'shield');

    /**
     * Brick
     */
    SpaceGame._bricks = this.game.add.group();
    SpaceGame._bricks.createMultiple(1, 'brick');

    /**
     * Wall
     */
    SpaceGame._walls = this.game.add.group();
    SpaceGame._walls.createMultiple(1, 'wall-a');
    SpaceGame._walls.createMultiple(1, 'wall-b');
    SpaceGame._walls.createMultiple(1, 'wall-c');

    /**
     * Ufo
     */
    SpaceGame._ufos = this.game.add.group();
    SpaceGame._ufos.createMultiple(4, 'ufo');

    /**
     * Bombs
     */
    SpaceGame._bombs = this.game.add.group();
    SpaceGame._bombs.createMultiple(1, 'bomb');

    /**
     * Satelites
     */
    SpaceGame._satelites = this.game.add.group();

    /**
     * Towers Bullets
     */
    SpaceGame._bullets = this.game.add.group();
    SpaceGame._bullets.enableBody = true;
    SpaceGame._bullets.physicsBodyType = Phaser.Physics.P2JS;
    SpaceGame._bullets.createMultiple(20, 'green_bullet');
    SpaceGame._bullets.setAll('checkWorldBounds', true);
    SpaceGame._bullets.setAll('outOfBoundsKill', true);
    SpaceGame._bullets.setAll('collideWorldBounds', false);
    SpaceGame._bullets.setAll('anchor.x', 0.5);
    SpaceGame._bullets.setAll('anchor.y', 1);

    SpaceGame._frezzing_bullets = this.game.add.group();
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
    SpaceGame._enemy_bullets = this.game.add.group();
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
    SpaceGame._missles = this.game.add.group();
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
    SpaceGame.enemys = this.game.add.group();
    SpaceGame.enemys.enableBody = true;
    SpaceGame.enemys.physicsBodyType = Phaser.Physics.P2JS;
    this.game.physics.p2.enableBody(SpaceGame.enemys, debug);
    SpaceGame.enemys.setAll('checkWorldBounds', true);
    SpaceGame.enemys.setAll('outOfBoundsKill', true);

    /* Flowers */
    SpaceGame._flowerPlants = this.game.add.group();
  },
  nextLevel: function () {
    level++;
    score += level * 20;
    Tower.prototype.addToPoint(400, 400);
    if (!SpaceGame.isTutorial) {
      this.generateGrowingPickups();
    }
    SpaceGame.Main.prototype.changeScoreText();
    this.animateScore();
    if (SpaceGame.isTutorial) {
      return;
    }
    this.showLevelTitle();
    this.addEnemys();
    this.addRndBricks();

    Brick.prototype.generateBrick();
    for (var i = 0; i < parseInt(level / 2); i++) {
      Bomb.prototype.generateBomb();
    }
  },

  generateGrowingPickups : function() {
    if (!SpaceGame.Main.pickupsLastTime ) {
      SpaceGame.Main.pickupsLastTime = this.game.time.now;
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
      var stealingSignSprite = this.game.add.sprite(this.game.width / 2, 130, 'sign_' + direction);
      stealingSignSprite.scale.x = 0.3;
      stealingSignSprite.scale.y = 0.3;
      stealingSignSprite.anchor.setTo(0.5, 0.5);
      var text_l = this.game.add.text(0, -170,
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
  },
  initUI: function () {
    var item_width = 70;

    // Create elements.
    function createUiElements() {
      SpaceGame._livesGraph = this.game.add.group();
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

    // Add button to mute/unmute sound.
    function addSoundControl() {
      this.game.sound.mute = Boolean(parseInt(localStorage.getItem('soundMute')));
      this.muteSound = this.game.add.button(this.game.width - 150, 15, 'sound', function () {
          this.game.sound.mute = !this.game.sound.mute;
          this.muteSound.frame = this.game.sound.mute ? 1 : 2;
          localStorage.setItem('soundMute', Number(this.game.sound.mute));
        }, this);
      this.muteSound.frame = this.game.sound.mute ? 1 : 2;
      this.muteSound.fixedToCamera = true;
    };
    addSoundControl.call(this);

    // Add elements to UIGroup.
    function groupElements() {
      SpaceGame._UiGroup = this.game.add.group();
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
      var uiRect = this.game.add.graphics(0, this.game.height);
      uiRect.beginFill(0xFFFFFF);
      uiRect.clear();
      uiRect.drawRect(0, 0, this.game.width * 8, 100);
      uiRect.alpha = .4;
      this.game.physics.p2.enable(uiRect);
      uiRect.body.static = true;
      return uiRect;
    }
    function createSateliteDraggable(key) {

      var xPos = 0;
      switch (key) {
        case 'satelite_freeze':
          xPos = item_width;
          break;
        case 'tower':
          xPos = item_width*2;
          break;
        case 'laser_tower':
          xPos = item_width * 3;
          break;
      }

      var satelite = this.game.add.sprite(0, 0, key);
      satelite.xPosition = xPos;
      satelite.anchor.setTo(0, 0);
      satelite.scale.setTo(0.4, 0.4);

      satelite.inputEnabled = true;
      satelite.input.enableDrag();
      // Add drag event handlers.
      satelite.events.onInputDown.add(eventSateliteInputDown);
      satelite.events.onDragStop.add(eventSateliteDragStop);
      satelite.events.onDragUpdate.add(eventSateliteDragUpdate);

      var textObj = this.game.add.text(0, 100, SpaceGame.priceList[key] + '$', SpaceGame.priceStyle);
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
      var wallBtn = this.game.add.sprite(0, 0, 'wall-a');
      wallBtn.xPosition = item_width*4;
      wallBtn.scale.setTo(0.4, 0.4);
      wallBtn.inputEnabled = true;
      wallBtn.input.enableDrag();
      // Add drag event handlers.
      wallBtn.events.onInputDown.add(eventWallInputDown);
      wallBtn.events.onDragStop.add(eventWallDragStop);

      var textObj = this.game.add.text(0, 100, SpaceGame.priceList.wall + '$', SpaceGame.priceStyle);
      textObj.scale.setTo(1.3, 1.3);
      wallBtn.addChild(textObj);
      var cRect = drawPriceCircle('5');
      cRect.scale.set(1.0);
      wallBtn.addChild(cRect);

      return wallBtn;
    }
    function createBombDraggable() {
      var bombBtn = this.game.add.sprite(0, 350, 'bomb');
      bombBtn.xPosition = item_width*5
      bombBtn.scale.setTo(0.7, 0.7);
      bombBtn.inputEnabled = true;
      bombBtn.input.enableDrag();
      // Add drag event handlers.
      bombBtn.events.onInputDown.add(eventBombInputDown);
      bombBtn.events.onDragStop.add(eventBombDragStop);
      bombBtn.events.onDragUpdate.add(eventBombDragUpdate);

      var textObj = this.game.add.text(0, 50, SpaceGame.priceList.bomb + '$', SpaceGame.priceStyle);
      textObj.scale.setTo(0.7, 0.7);
      bombBtn.addChild(textObj);

      var cRect = drawPriceCircle('6');
      cRect.scale.set(0.6);
      bombBtn.addChild(cRect);

      return bombBtn;
    }
    function createRocketDraggable() {
      var rocketBtn = this.game.add.sprite(0, 420, 'missle');
      rocketBtn.xPosition = item_width*6;
      rocketBtn.scale.setTo(0.7, 0.7);
      rocketBtn.inputEnabled = true;
      rocketBtn.input.enableDrag();
      // Add drag event handlers.
      rocketBtn.events.onInputDown.add(eventRocketInputDown);
      rocketBtn.events.onDragStop.add(eventRocketDragStop);
      rocketBtn.events.onDragUpdate.add(eventRocketDragUpdate);

      var textObj = this.game.add.text(0, 50, SpaceGame.priceList.rocket + '$', SpaceGame.priceStyle);
      textObj.scale.setTo(0.7, 0.7);
      rocketBtn.addChild(textObj);

      var cRect = drawPriceCircle('7');
      cRect.scale.set(0.6);
      rocketBtn.addChild(cRect);

      return rocketBtn;
    }
    function createReloadBtn() {
      var reloadBtn = this.game.add.sprite(0, 480, 'reload');
      reloadBtn.xPosition = item_width*7;
      reloadBtn.scale.setTo(0.2, 0.2);
      reloadBtn.inputEnabled = true;
      var cRect = drawPriceCircle('R');
      cRect.scale.setTo(2.0);
      reloadBtn.addChild(cRect);
      return reloadBtn;
    }
    function drawPriceCircle (text) {
      var cRect = this.game.add.graphics(0, 50).beginFill(0xff5a00, 1).drawCircle(0, 0, 55);
      var number = this.game.add.text(0, 5, text, {
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
        SpaceGame.Main.prototype.changeScoreText();
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
      tower.y = this.game.height - 70;
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
        SpaceGame.Main.prototype.changeScoreText();
        new Wall(wall.x, wall.y);
      }
      else if (score >= price) {
        score -= price;
        SpaceGame.Main.prototype.changeScoreText();
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
        SpaceGame.Main.prototype.changeScoreText();
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
      rocket.y = this.game.height - 30;
    }
    function eventRocketDragStop(rocket) {
      var price = SpaceGame.priceList.rocket;
      if (score >= price) {
        score -= price;
        SpaceGame.Main.prototype.changeScoreText();
        var missle = new Missle(rocket.x, rocket.y, true);
        missle.body.moveUp(800);
      }

      rocket.x = SpaceGame._rocketInitPos.x;
      rocket.y = SpaceGame._rocketInitPos.y;
      SpaceGame._rocketInitPos = {};
    }
    function reloadPickups() {
      if (this.game.time.now > SpaceGame.Main.pickupsLastTime + 1000) {
        SpaceGame.Main.pickupsLastTime = this.game.time.now + 1000;
        SpaceGame.Main.prototype.generateGrowingPickups();
      }
    }
  },

  animateScore: function (moveOut) {
    moveOut = moveOut || false;

    // Animate walls
    SpaceGame._walls.forEachAlive(function (brick) {
      this.game.add.tween(brick)
        .to({alpha: moveOut ? 0 : 1}, 1000, Phaser.Easing.Linear.None, true, 0);
    });

    SpaceGame._UiGroup.forEach(function (item) {

      // Graphics animation doesn't work here.
      if (item.type == 0) {
        item.y = moveOut ? item.y : this.game.height + item.height;
        item.alpha = moveOut ? 1 : 0;

        var toY = moveOut ? this.game.height + item.height : this.game.height - 70;
        var delay = moveOut ? 700 : 500;

        if (SpaceGame._scoreText == item) {
          toY = moveOut ? this.game.height - item.height : this.game.height - 30;
          this.game.add.tween(item).to({alpha: moveOut ? 0 : 1, x: 0, y: toY},
            700, Phaser.Easing.Linear.None, true, delay);
        }
        else {
          this.game.add.tween(item).to({alpha: moveOut ? 0 : 1, x:this.game.width/2+100+item.xPosition, y: toY},
            700, Phaser.Easing.Linear.None, true, delay);
        }

      }
    });
  },

  addRndBricks: function () {
    for (var i = 1; i < level * 3; i++) {
      var x = this.game.rnd.integerInRange(0, this.game.width);
      var y = this.game.rnd.integerInRange(300, this.game.height / 1.5);
      new Wall(x, y);
    }
  },

  showLevelTitle: function () {
    var style = {
      font: "60px eater",
      fill: "#F36200",
      align: "center"
    };
    var levelText = this.game.add.text(0, 0, 'Level ' + level, style);
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
      .onComplete.add(function () {
      this.game.add.tween(levelText)
        .to({y: -levelText.height, alpha: 0},
          1000 /*duration (in ms)*/,
          Phaser.Easing.Bounce.In /*easing type*/,
          true /*autostart?*/,
          2000 /*delay*/)
        .onComplete.add(function () {
        levelText.destroy();
      })
    }, this);
  },

  caculatetDistance: function (sprite1, sprite2) {
    var a = sprite1.x - sprite2.x;
    var b = sprite1.y - sprite2.y;
    return Math.sqrt(a * a + b * b);
  },

  updateScore: function (losingLife) {
    if (losingLife === true) {
      game.camera.shake();
      lives--;
      SpaceGame.Main.prototype.drawLivesSprites();
      score -= 10;
    }
    else {
      score += 10;
    }
    this.changeScoreText();
    if (lives < 0) {
      this.game.camera.shake();
      // save this.game screenshot.
      SpaceGame.canvasDataURI = this.game.canvas.toDataURL();
      this.game.time.events.add(Phaser.Timer.SECOND * 2, SpaceGame.GameOverTransition, this).autoDestroy = true;
    }
  },

  changeScoreText: function () {
    var style = {font: '20px eater', fill: '#E39B00', align: 'left'};
    var str = "    Level: " + level + "   $: " + score;
    if (towers && towers.children && typeof towers.children[0] != "undefined") {
      str += "   Bricks: " + towers.children[0].countBricks;
      str += "   Missles: " + towers.children[0].missles + "";
      str += "   Bullets: " + towers.children[0].bullets + "";
      str += "   Fuel: " + towers.children[0].fuel + "";
    }
    if (!SpaceGame._scoreText) {
      SpaceGame._scoreText = game.add.text(0, game.height, str, style);
      SpaceGame._UiGroup.add(SpaceGame._scoreText);
    }
    else {
      SpaceGame._scoreText.setText(str);
    }

    // Respawn dead player
    if (towers && towers.children && !towers.children[0].alive) {
      towers.children[0].destroy();
      Tower.prototype.addToPoint(400, 400);
    }
  },

  addEnemys: function () {
    var i = 0;
    SpaceGame._allEnemysAdded = false;
    var enemysBcl = this.game.time.events.loop(level / 2 * Phaser.Timer.SECOND, function () {
      // Generate i=3*level number of enemys
      if (i < 2 * level) {
        var rndKey = this.game.rnd.integerInRange(0, SpaceGame.enemySprites.length - 1);
        var animEnemy = SpaceGame.enemySprites[rndKey];
        var enemy = new Enemy(0, 0, animEnemy.name, animEnemy.length);
        var param = {
          x: parseInt(this.game.rnd.integerInRange(0, this.game.width)),
          y: parseInt(this.game.rnd.integerInRange(0, this.game.height))
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
    SpaceGame._background.tilePosition.set(this.game.camera.x * -0.5, this.game.camera.y * -0.5);

    SpaceGame.rewpawnPickupsButton.onDown.add(function () {
      if (this.game.time.now > SpaceGame.Main.pickupsLastTime + 1000) {
        SpaceGame.Main.pickupsLastTime = this.game.time.now + 1000;
        SpaceGame.Main.prototype.generateGrowingPickups();
      }
    }, this);

    // Game over if no alive flowers.
    if (!SpaceGame.isTutorial && !SpaceGame._flowerPlants.countLiving()) {
      // Save this.game canvas "screenshot".
      SpaceGame.canvasDataURI = this.game.canvas.toDataURL();
      this.game.camera.flash(0xFF0010, 2000, true);
      this.game.time.events.add(0, SpaceGame.GameOverTransition, this).autoDestroy = true;
      return;
    }

    // Level completed.
    if (SpaceGame.enemys.countLiving() === 0 && SpaceGame._allEnemysAdded
      && !SpaceGame._newLevelStarted && !SpaceGame.isTutorial) {
      SpaceGame._newLevelStarted = true;
      this.updateScore();
      this.levelCompleted();
    }

    /**
     *  Enemy stealing check
     */
    SpaceGame.enemys.stealing = false;
    SpaceGame.enemys.forEachAlive(function (enemy) {
      Enemy.prototype.updateEnemy(enemy);
    });
    
    towers.forEachAlive(function (tower) {
      Tower.prototype.updateTower(tower);
    });

    // Update spawn bar.
    SpaceGame._flowerPlants.forEachAlive(function (plant) {
      Plant.prototype.updatePlant(plant);
    });
  },

  levelCompleted: function () {
  lives++;
  this.game.audio.completedSnd.play();

  var style = {
    font: "60px eater",
    fill: "#F36200",
    stroke: "#CCCCCC",
    align: "center",
    strokeThickness: 1
  };
  var levelText = this.game.add.text(0, 0, 'Level Completed!', style);
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
    .onComplete.add(function () {
    SpaceGame.Main.prototype.animateScore(true);
    this.game.add.tween(levelText)
      .to({y: -levelText.height / 2, alpha: 0},
        1000 /*duration (in ms)*/,
        Phaser.Easing.Bounce.In /*easing type*/,
        true /*autostart?*/,
        1000 /*delay*/)
      .onComplete.add(function () {
      levelText.destroy();
      if (towers && towers.children && typeof towers.children[0] != 'undefined') {
        SpaceGame._playerShield = towers.children[0].shieldPower;
        SpaceGame._playerBricks = towers.children[0].countBricks;
        SpaceGame._playerMissles = towers.children[0].missles;
      }
      SpaceGame.transitionPlugin.to('Main');
      // Init score
      SpaceGame._scoreText = undefined;
      SpaceGame._fireGraph = undefined;
    }, this);
  }, this);
}
};
