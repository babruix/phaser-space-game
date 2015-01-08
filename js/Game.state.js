var lives = 3;
var level = 0;
var score = 0;
var towers;

var SpaceGame = {};
SpaceGame.Main = function(game){
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

  SpaceGame._enemy_bullets = null;
  SpaceGame._ufos = null;
};
SpaceGame.Main.prototype = {

  preload: function() {
    /*
     * Sounds
     */
    game.load.audio('gulp', ['assets/audio/gulp-2.wav']);
    game.load.audio('gunshot', ['assets/audio/gunshot2.wav']);
    game.load.audio('toil', ['assets/audio/toilet.wav']);
    game.load.audio('smack', ['assets/audio/smack.wav']);
    game.load.audio('laugh', ['assets/audio/laugh-short.wav']);
    game.load.audio('spring', ['assets/audio/spring.wav']);
    game.load.audio('kiss', ['assets/audio/kiss.wav']);
    game.load.audio('explosion', ['assets/audio/explosion.wav']);
    game.load.audio('missle', ['assets/audio/miss.wav']);
    game.load.audio('scifi1', ['assets/audio/scifi1.wav']);
    game.load.audio('scifi2', ['assets/audio/scifi2.wav']);
    game.load.audio('scifi3', ['assets/audio/scifi3.wav']);
    game.load.audio('scifi4', ['assets/audio/scifi4.wav']);
    game.load.audio('scifi5', ['assets/audio/scifi5.wav']);
    game.load.audio('completed', ['assets/audio/level-completed.mp3']);

    game.load.tilemap('desert', 'assets/maps/tower-defense-clean.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/maps/tmw_desert_spacing.png');

    game.load.image('tower', 'assets/sprites/tower.png');

    game.load.image('bullet', 'assets/sprites/bullet.png');
    game.load.image('missle', 'assets/sprites/missile.png');

    //game.load.image("background", "assets/sprites/background.jpg");
    game.load.image('background', 'assets/sprites/background2.png');

    /*
     * Enemys
     */
    game.load.spritesheet('duck', 'assets/sprites/duck.png', 32, 32, 8);
    game.load.spritesheet('panda', 'assets/sprites/panda.png', 32, 32, 3);
    game.load.spritesheet('dog', 'assets/sprites/dog.png', 32, 32, 6);
    game.load.spritesheet('penguin', 'assets/sprites/penguin.png', 32, 32, 4);
    game.load.spritesheet('alian', 'assets/sprites/space_alian5.png', 32, 40, 9);
    game.load.spritesheet('bazyaka', 'assets/sprites/bazyaka.png', 70, 64, 80);
    game.load.spritesheet('ufo', 'assets/sprites/tarelka.png', 108, 64, 10);
    game.load.spritesheet('cat', 'assets/sprites/cat.png', 64, 104, 1);

    /**
     * Effects
     */
    game.load.spritesheet('explode', 'assets/sprites/explosion.png', 157, 229, 19);
    game.load.image('emit', 'assets/sprites/emit.png');
    game.load.image('heart', 'assets/sprites/heart.png');
    game.load.image('brick', 'assets/sprites/brick.png');
    game.load.image('wall', 'assets/sprites/wall.png');
    game.load.spritesheet('shield', 'assets/sprites/shield.png', 55, 64, 2);
  },

  create: function() {
    // set scale options
    /* this.input.maxPointers = 1;
     this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
     this.scale.pageAlignHorizontally = true;
     this.scale.pageAlignVertically = true;
     this.scale.setScreenSize(true);*/

    game.audio.enemySndFire = game.add.audio('gulp', 2);
    game.audio.playerSndFire = game.add.audio('gunshot', 0.03);
    game.audio.toilSnd = game.add.audio('toil', 0.3);
    game.audio.smackSnd = game.add.audio('smack', 0.3);
    game.audio.laughSnd = game.add.audio('laugh', 0.8);
    game.audio.springSnd = game.add.audio('spring', 0.3);
    game.audio.kissSnd = game.add.audio('kiss', 0.3);
    game.audio.explosionSnd = game.add.audio('explosion', 0.2);
    game.audio.missleSnd = game.add.audio('missle', 0.1);
    game.audio.ufoSnd = [
      game.add.audio('scifi1', 0.6),
      game.add.audio('scifi2', 0.6),
      game.add.audio('scifi3', 0.6),
      game.add.audio('scifi4', 0.3),
      game.add.audio('scifi5', 0.3)
    ];
    game.audio.completedSnd = game.add.audio('completed', 1);

    this._background = game.add.tileSprite(0, 0, 1000, 600, 'background');
    this._background.alpha=0;
    game.add.tween(this._background).to({alpha: 1}, 20000,
      Phaser.Easing.Linear.In,
      true, //autostart?,
      0, //delay,
      false, //repeat?
      true //yoyo?
    );
    //

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
    generateHeart();
    generateBrick();
    generateShield();
    generateMissle();

    score -= 10;
    updateScore();
    SpaceGame._cursors = game.input.keyboard.createCursorKeys();
  },

  update: function() {
    /*
     *  Enemy
     */
    enemys.forEach(function (enemy) {

      if (enemy && enemy.alive) {
         if (enemy.y > 660) {
          // bottom fall
          var style = {font: "20px Tahoma", fill: "#000000", align: "center"};
          var cRect = game.add.graphics(0, 0)
            .beginFill(0xff5a00)
            .drawCircle(towers.children[0].x, towers.children[0].y, 40);
          var health = game.add.text(towers.children[0].x-10, towers.children[0].y-15, '-' + enemy.health, style);
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


          game.audio.springSnd.play();
          if (towers.children[0].health > enemy.health) {
            towers.children[0].damage(enemy.health);
          }
          else {
            towers.children[0].damage(enemy.health - 1);
          }

          if (towers && towers.children[0]) {
            towers.children[0].fireTime += enemy.health;
          }
          enemy.kill();
          updateScoreText();
        }
      }
    });

    towers.forEachAlive(function (tower) {
      if (tower.alpha < 1) {
        return;
      }

      // Move tower
      tower.body.setZeroVelocity();
      var speed = 100 + game.height - tower.body.y / 1.9;

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
