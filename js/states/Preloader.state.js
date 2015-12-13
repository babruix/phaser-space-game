SpaceGame.Preloader = function (game) {
};
SpaceGame.Preloader.prototype = {
  preload: function () {

    // Nice practicles :)
    var particleSystem1 = SpaceGame.epsyPlugin.loadSystem(SpaceGame.epsyPluginConfig.galaxy, game.width / 2, 50);
    // let Phaser add the particle system to world group or choose to add it to a specific group
    this.myGroup = game.add.group();
    this.myGroup.add(particleSystem1);

    /**
     * Preloader
     */
    game.preloadBar = game.add.sprite(game.world.centerX, game.world.centerY, 'preloaderBar');
    game.preloadBar.anchor.setTo(0.5, 0.5);
    game.load.setPreloadSprite(game.preloadBar);

    /**
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
    game.load.audio('gameOver', ['assets/audio/game-over.wav']);
    game.load.audio('reload', ['assets/audio/reload.mp3']);

    game.load.tilemap('desert', 'assets/maps/tower-defense-clean.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/maps/tmw_desert_spacing.png');

    game.load.image('spaceship', 'assets/sprites/spaceship.png');
    game.load.image('satelite', 'assets/sprites/satelite-fire.png');
    game.load.image('satelite_freeze', 'assets/sprites/satelite.png');

    game.load.image('bullet', 'assets/sprites/bullet.png');
    game.load.image('missle', 'assets/sprites/missile.png');
    game.load.image('ammo', 'assets/sprites/ammo.png');
    game.load.image('fuel', 'assets/sprites/fuel.png');

    game.load.image('background', 'assets/sprites/bg0.png');

    for (var i = 0; i < 7; i++) {
      game.load.image('cloud' + i, 'assets/sprites/cloud_' + i + '.png');
    }
    game.load.image('flow', 'assets/sprites/flow.png');
    game.load.image('sign_left', 'assets/sprites/sign_left.png');
    game.load.image('sign_right', 'assets/sprites/sign_right.png');

    /**
     * Enemys
     */
    game.load.spritesheet('alian', 'assets/sprites/space_alian5.png', 32, 40, 9);
    game.load.spritesheet('bazyaka', 'assets/sprites/bazyaka.png', 70, 64, 80);
    game.load.spritesheet('ufo', 'assets/sprites/tarelka.png', 108, 64, 10);
    game.load.spritesheet('cat', 'assets/sprites/cat.png', 64, 104, 1);
    game.load.spritesheet('nog', 'assets/sprites/nog50.png', 89, 119, 50);

    /**
     * Physics
     */
    game.load.physics('enemy_physics', 'assets/sprites/aliens_pshysics.json');
    game.load.physics('spaceship_pshysics', 'assets/sprites/spaceship_pshysics.json');

    /**
     * Effects
     */
    game.load.image('sun', 'assets/sprites/sun.png');
    game.load.spritesheet('explode', 'assets/sprites/explosion.png', 157, 229, 19);
    game.load.image('emit', 'assets/sprites/emit.png');
    game.load.image('heart', 'assets/sprites/heart.png');
    game.load.image('brick', 'assets/sprites/brick.png');
    game.load.image('wall-a', 'assets/sprites/wall-a.png');
    game.load.image('wall-b', 'assets/sprites/wall-b.png');
    game.load.image('wall-c', 'assets/sprites/wall-c.png');
    game.load.image('bomb', 'assets/sprites/bomb.png');
    game.load.spritesheet('shield', 'assets/sprites/shield.png', 55, 64, 2);
    game.load.spritesheet('button-start', 'assets/sprites/button-start.png', 401, 143);
  },
  create: function () {
    game.preloadBar.kill();
    this.showMenu();
  },
  showMenu: function () {
    game.state.start('Menu');
  }
};