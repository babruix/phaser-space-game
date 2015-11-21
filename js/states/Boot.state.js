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
  create : function(){
    // Set scale options
    game.input.maxPointers = 1; // No multi-touch
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    game.scale.pageAlignHorizontally = true;
    game.scale.pageAlignVertically = true;
    game.scale.setScreenSize(true);
    SpaceGame.transitionPlugin.to('Preloader');
  }
};
SpaceGame.epsyPluginConfig = {};
SpaceGame.epsyPluginConfig.circles = [{
  "pos": {"x": 0, "y": 0},
  "posVar": {"x": 0, "y": 40},
  "speed": 0,
  "speedVar": 0,
  "angle": 90,
  "angleVar": 0,
  "life": 2,
  "lifeVar": 0,
  "radius": 50,
  "radiusVar": 0,
  "textureAdditive": true,
  "startScale": 1,
  "startScaleVar": 0,
  "endScale": 4,
  "endScaleVar": 0,
  "startColor": [255, 0, 44, 1],
  "startColorVar": [0, 0, 0, 0],
  "endColor": [210, 0, 255, 0],
  "endColorVar": [0, 0, 0, 0],
  "colorList": [],
  "gravity": {"x": 0, "y": 0},
  "radialAccel": 0,
  "radialAccelVar": 0,
  "tangentialAccel": 0,
  "tangentialAccelVar": 0,
  "texture": "data:image/png;base64,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",
  "totalParticles": 20,
  "emissionRate": 50,
  "xEquation": "",
  "yEquation": "",
  "textureEnabled": true,
  "active": true,
  "duration": null,
  "id": "emitter2",
  "aFactor": {"x": 0, "y": 0},
  "xFactor": {"x": 0, "y": 0},
  "border": {"top": 200, "left": 200, "bottom": 200, "right": 200},
  "zIndex": 0
}];
SpaceGame.epsyPluginConfig.galaxy = [{
  "pos": {"x": 0, "y": 0},
  "posVar": {"x": 10, "y": 0},
  "speed": 60,
  "speedVar": 10,
  "angle": 90,
  "angleVar": 360,
  "life": 4,
  "lifeVar": 1,
  "radius": 40,
  "radiusVar": 10,
  "textureAdditive": true,
  "startScale": 1,
  "startScaleVar": 0,
  "endScale": 1,
  "endScaleVar": 0,
  "startColor": [30, 63, 193, 1],
  "startColorVar": [0, 0, 0, 0],
  "endColor": [0, 0, 0, 1],
  "endColorVar": [0, 0, 0, 0],
  "colorList": [],
  "gravity": {"x": 0, "y": 0},
  "radialAccel": -80,
  "radialAccelVar": 0,
  "tangentialAccel": 80,
  "tangentialAccelVar": 0,
  "texture": "assets/sprites/particle.png",
  "totalParticles": 200,
  "emissionRate": 50,
  "xEquation": "",
  "yEquation": "",
  "textureEnabled": true,
  "active": true,
  "duration": null,
  "id": "galax",
  "aFactor": {"x": 0, "y": 0},
  "xFactor": {"x": 0, "y": 0},
  "border": {"top": 200, "left": 200, "bottom": 200, "right": 200},
  "zIndex": 0
}];