SpaceGame.Preloader = function(game){ };
SpaceGame.Preloader.prototype = {
  preload : function(){
    // Preloader
    game.preloadBar = game.add.sprite((game.width-288)/2,
      (game.height-24)/2, 'preloaderBar');
    game.load.setPreloadSprite(game.preloadBar);
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
    game.load.audio('gameOver', ['assets/audio/game-over.wav']);

    game.load.tilemap('desert', 'assets/maps/tower-defense-clean.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/maps/tmw_desert_spacing.png');

    game.load.image('tower', 'assets/sprites/tower.png');

    game.load.image('bullet', 'assets/sprites/bullet.png');
    game.load.image('missle', 'assets/sprites/missile.png');

    game.load.image("background", "assets/sprites/bg0.png");

    for (var i = 0; i < 7; i++) {
      game.load.image("cloud" + i, "assets/sprites/cloud_"+i+".png");
    }

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
    game.load.image('bomb', 'assets/sprites/bomb.png');
    game.load.spritesheet('shield', 'assets/sprites/shield.png', 55, 64, 2);
    game.load.spritesheet('button-start', 'assets/sprites/button-start.png', 401, 143);
  },
  create : function(){
    game.preloadBar.kill();
    game.state.start('Menu');
  }
};