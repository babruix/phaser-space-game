
import * as Phaser from "phaser";

export class GameOver extends Phaser.State {
  private score;
  private highestScore;
  private _restartText;
  private _fontStyle;
  private mainState;
  private message;

  init(game) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];
    this.score = this.mainState.score;
    (this.game as any).audio.gameOverSnd = this.game.add.audio("gameOver", 1);

    this.highestScore = String(localStorage.getItem("highestScore")) || 0;
    if (isNaN(this.highestScore)) {
      this.highestScore = this.score;
    }
    else {
      this.highestScore = Math.max(this.score, Number(this.highestScore));
    }
    localStorage.setItem("highestScore", String(this.highestScore));

    this._fontStyle = {
      font: "40px eater",
      fill: "#FFCC00",
      stroke: "#333",
      strokeThickness: 5,
      align: "center"
    };

    this.message = `
        GAME OVER!
         Your score is ${this.score} 
         Highest score is ${this.highestScore}
         press any key to restart`;
  }

  create() {
    (this.game as any).audio.gameOverSnd.play();

    // place the assets and elements in their initial positions, create the state
    this._restartText = this.game.add.text(this.game.width / 2, 0, this.message, this._fontStyle);
    this._restartText.anchor.setTo(0.5, 0.5);
    this.game.camera.follow(this._restartText);

    this.game.add.tween(this._restartText)
    .to({y: this.game.height / 2}, 1000, Phaser.Easing.Bounce.Out, true)
    .onComplete.add(() => this.game.paused = true);

    this.removeKeysCapturing();

    this.game.time.events.add(Phaser.Timer.SECOND, () => {
      this.game.input.keyboard.processKeyPress = (e) => {
        this.game.input.keyboard.processKeyPress = (e) => {
        };
        this.mainState.level = 0;
        this.mainState.lives = 3;
        this.mainState.score = 50;
        this.game.paused = false;

        this.game.time.events.add(0, () => {
          this.mainState.isTutorial = true;
          (this.game as any).transitionPlugin.to("Main");
        });
      };
    });
  }

  private removeKeysCapturing() {
    let keyCodes = [Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.S, Phaser.Keyboard.R, Phaser.Keyboard.M];
    ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN"].forEach(
      keyNumber => keyCodes.push(Phaser.Keyboard[keyNumber])
    );
    keyCodes.forEach(key => this.game.input.keyboard.removeKeyCapture(key));
  }
}
