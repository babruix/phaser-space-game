/// <reference path="../../node_modules/phaser/typescript/phaser.d.ts"/>
/// <reference path="../../typings/phaser/phaser.d.ts" />
/// <reference path="../../typings/phaser/EPSY.d.ts" />
import * as Phaser from 'phaser';
import {ScreenUtils} from '../utils/screenutils';;

export class GameOver extends Phaser.State {
    private score;
    private highestScore;
    private _restartText;
    private _fontStyle;
    private mainState;

    init(score=0) {
        this.world.removeAll(true);
        this.score = score;
        this.mainState = this.game.state.states['Main'];
        this.highestScore = localStorage.getItem('highestScore') || 0;
        this.highestScore = Math.max(this.score, this.highestScore);
        localStorage.setItem('highestScore', this.highestScore);

        this._fontStyle = {
            font: "40px eater",
            fill: "#FFCC00",
            stroke: "#333",
            strokeThickness: 5,
            align: "center"
        };
    }

    create() {
        this.mainState = this.game.state.states['Main'];
        (this.game as any).audio.gameOverSnd = this.game.add.audio('gameOver', 1);
        (this.game as any).audio.gameOverSnd.play();

        // place game screenshot.
        var data = new Image();
        data.src = this.mainState.canvasDataURI;
        this.game.cache.addImage('image-data', this.mainState.canvasDataURI, data);
        var image = this.game.add.image(0, 0, 'image-data');

        var message = "GAME OVER! "
            + "\n Your score is " + this.score
            + "\n Highest score is " + this.highestScore
            + "\n press any key to restart";
        if (!this.mainState ._flowerPlants.countLiving() && (this.game as any).lives > 0) {
            message = "\n All flowers have been stolen :( \n" + message;
        }

        // place the assets and elements in their initial positions, create the state
        this._restartText = this.game.add.text(this.game.width / 2, 0, message, this._fontStyle);
        this._restartText.anchor.setTo(0.5, 0.5);
        this.game.add.tween(this._restartText).to({
            y: this.game.height*ScreenUtils.screenMetrics.scaleY / 2
        }, 1000, Phaser.Easing.Bounce.Out, true, 0, 0);

        // Init score
        this.game.time.events.add(3000, () => {
            this.game.input.keyboard.onDownCallback = (e) => {
                this.game.paused = false;
                this.game.input.keyboard.onDownCallback = null;
                this.mainState.level = 0;
                this.mainState.lives = 3;
                this.mainState.score = 50;
                // this.game.state.start('Main', false, false);
                (this.game as any).transitionPlugin.to('Main');
            };
        });
    }
    shutdown() {

    }

    update() {
        // if (this.game.input.activePointer.isDown) {
        //     (this.game as any).transitionPlugin.to('Menu');
        // }
    }
}
