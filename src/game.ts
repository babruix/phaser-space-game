/**
 * @author Alexey Romanov
 * https://github.com/babruix
 */
/// <reference path="../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../node_modules/phaser/typescript/pixi.d.ts"/>

import "pixi";
import "p2";
import * as Phaser from "phaser";
import {Boot} from "./gameStates/Boot";
import {Preloader} from "./gameStates/Preloader";
import {Tutorial} from "./gameStates/Tutorial";
import {Menu} from "./gameStates/Menu";
import {Main} from "./gameStates/Main";
import {GameOver} from "./gameStates/GameOver";
import {ScreenUtils} from "./utils/screenutils";
import {Orientation} from "./utils/screenutils";

  export class Globals {
    // game derived from Phaser.Game
    static game: Game = null;

    // game orientation
    static correctOrientation: boolean = false;
  }

  export class Game extends Phaser.Game {
    public audio;
    public gameover;
    public debugOn;

    public epsyPlugin;
    public transitionPlugin;

    constructor() {
      let screenDims = ScreenUtils.calculateScreenMetrics(2880 / 2, 889, Orientation.LANDSCAPE);

      super(screenDims.gameWidth, screenDims.gameHeight, Phaser.AUTO, "content",
          null /* , transparent, antialias, physicsConfig */);

      this.audio = {};
      this.gameover = false;
      this.debugOn = window.location.hash === "#deb";
      this.state.add("Boot", Boot, true);
      this.state.add("Preloader", Preloader);
      this.state.add("Menu", Menu);
      this.state.add("Tutorial", Tutorial);
      this.state.add("Main", Main);
      this.state.add("GameOver", GameOver);
    }
  }


// -------------------------------------------------------------------------
window.onload = () => {
  Globals.game = new Game();
};
