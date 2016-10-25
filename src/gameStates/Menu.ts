
import * as Phaser from "phaser";
declare var ParticlesConfigs: any;

export class Menu extends Phaser.State {
  private _fontStyle;
  private _background;
  private _startText;

  init() {
  }

  create() {
    (this.game as any).anim_elem = document.getElementById("anim_elem");

    this._background = this.game.add.tileSprite(0, 0, this.game.width * 4, 889, "background");
    this._background.alpha = 1;
    this._fontStyle = {
      font: "70px eater",
      fill: "#FFCC00",
      stroke: "#333",
      strokeThickness: 5,
      align: "center"
    };

    this.addGameTitleText();
    this._fontStyle.font = "50px eater";
    this.addButtonStart();
    this.addButtonTutorial();

    // uncomment to start immediately...
    // level=15;
    (this.game as any).transitionPlugin.to("Main");
    // this.transitionPlugin.to('Tutorial');

    // Nice practicles
    let particleSystem1 = (this.game as any).epsyPlugin.loadSystem(ParticlesConfigs.epsyPluginConfig.circles, this.game.width / 2, 50);
    let _circlesGroup = this.game.add.group();
    _circlesGroup.add(particleSystem1);
  }

  addGameTitleText() {
    this._startText = this.add.text(this.game.width / 2, this.game.height, "-[ FARTING ALIENS ]-", this._fontStyle);
    this._startText.anchor.setTo(0.5, 0.5);
    this.add.tween(this._startText).to({
      y: (this.game.height - 250) / 2
    }, 1000, Phaser.Easing.Circular.Out, true, 50, 0);
  }

  addButtonStart() {
    let buttonStart = this.game.add.text(this.game.width / 2, -143, "Play game", this._fontStyle);
    buttonStart.anchor.set(0.5);
    buttonStart.inputEnabled = true;
    buttonStart.input.useHandCursor = true;
    this.add.tween(buttonStart).to({
      y: this.game.height / 2
    }, 1000, Phaser.Easing.Bounce.Out, true, 500, 0);
    buttonStart.events.onInputOver.add(item => item.fill = "#ffff44");
    buttonStart.events.onInputOut.add(item => item.fill = this._fontStyle.fill);
    buttonStart.events.onInputDown.add(this.startGame, this);
  }

  addButtonTutorial() {
    let textStartTutorial = this.add.text(this.game.width / 2, -100, "Tutorial", this._fontStyle);
    textStartTutorial.anchor.set(0.5);
    this.add.tween(textStartTutorial).to({
      y: ((this.game.height - 250) / 2) + 200
    }, 1000, Phaser.Easing.Bounce.Out, true, 1000, 0);
    textStartTutorial.inputEnabled = true;
    textStartTutorial.input.useHandCursor = true;
    textStartTutorial.events.onInputOver.add(item => item.fill = "#ffff44");
    textStartTutorial.events.onInputOut.add((item) => item.fill = this._fontStyle.fill);
    textStartTutorial.events.onInputDown.add(this.StartTutorial, this);
  }

  startGame() {
    // Start game
    (this.game as any).transitionPlugin.to("Main");
  }

  StartTutorial() {
    // Start Tutorial
    (this.game as any).transitionPlugin.to("Tutorial");
  }
}
