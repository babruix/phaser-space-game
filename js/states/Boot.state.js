var SpaceGame = {};
var lives = 3;
var level = 0;
var score = 0;
var towers;
SpaceGame.Boot = function (game) {
};
SpaceGame.Boot.prototype = {
  init: function () {
    // Set scale options
    game.input.maxPointers = 1; // No multi-touch
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
  },
  preload: function () {
    // Load preloader image
    game.load.image('preloaderBar', 'assets/sprites/preload-bar.png');
    // load background
    game.load.image('background', 'assets/sprites/bg0.png');


    // transition plugin
    SpaceGame.transitionPlugin = game.plugins.add(Phaser.Plugin.StateTransition);
    //define new properties to be tweened, duration, even ease
    SpaceGame.transitionPlugin.settings({

      //how long the animation should take
      duration: 1000,
      //ease property
      ease: Phaser.Easing.Exponential.InOut, /* default ease */
      //what property should be tweened
      properties: {
        alpha: 0,
        scale: {
          x: 1.5,
          y: 1.5
        }
      }
    });

    // Praclecles plugin
    SpaceGame.epsyPlugin = game.plugins.add(Phaser.Plugin.EPSY);
  },
  create: function () {
    SpaceGame.transitionPlugin.to('Preloader');
  }
};