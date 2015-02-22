var SpaceGame = {};
var lives = 3;
var level = 0;
var score = 0;
var towers;
SpaceGame.Boot = function(game){ };
SpaceGame.Boot.prototype = {
  preload : function(){
    // Load preloader image
    game.load.image('preloaderBar', 'assets/sprites/preload-bar.png');
  },
  create : function(){
    // Set scale options
    game.input.maxPointers = 1; // No multi-touch
    game.scale.scaleMode = Phaser.ScaleManager.EXACT_FIT;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setScreenSize(true);
    game.state.start('Preloader');
  }
};