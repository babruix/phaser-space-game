/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../typings/phaser/phaser.d.ts" />
/// <reference path="../../typings/phaser/EPSY.d.ts" />
import * as Phaser from "phaser";
import {ScreenUtils} from "../utils/screenutils";

export class Boot extends Phaser.State {

  init() {
    this.input.maxPointers = 1;
    this.stage.disableVisibilityChange = false;
    let screenDims = ScreenUtils.screenMetrics;

    if (this.game.device.desktop) {
      this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
      this.scale.setUserScale(screenDims.scaleX, screenDims.scaleY);
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
    }
    else {
      this.scale.scaleMode = Phaser.ScaleManager.USER_SCALE;
      this.scale.setUserScale(screenDims.scaleX, screenDims.scaleY);
      this.scale.pageAlignHorizontally = true;
      this.scale.pageAlignVertically = true;
      this.scale.forceOrientation(true, false);
    }
  }

  preload() {
    // Load preloader image
    this.game.load.image("preloaderBar", "assets/sprites/preload-bar.png");
    // load background
    this.game.load.image("background", "assets/sprites/bg0.png");

    // transition plugin
    (this.game as any).transitionPlugin = <Phaser.Plugin.StateTransition> this.game.plugins.add(Phaser.Plugin.StateTransition);
    // define new properties to be tweened, duration, even ease
    (this.game as any).transitionPlugin.configure({
      // how long the animation should take
      duration: 1000,
      // ease property
      ease: Phaser.Easing.Exponential.InOut, /* default ease */
      // what property should be tweened
      properties: {
        alpha: 0,
        scale: {
          x: 2,
          y: 2
        }
      }
    });

    // Practicles plugin
    (this.game as any).epsyPlugin = <Phaser.Plugin.EPSY> this.game.plugins.add(Phaser.Plugin.EPSY);
  }

  create() {
    this.game.state.start("Preloader");
  }
}
