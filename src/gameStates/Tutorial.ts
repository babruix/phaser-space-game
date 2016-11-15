import * as Phaser from "phaser";
import {Main} from "../gameStates/Main";
declare var Phasetips: any;

export class Tutorial extends Phaser.State {
  private tooltipDelay;
  private TutorialTexts;
  private _TipOptions;
  private myTooltip;
  private mainState;
  private levelText;
  private newTooltip;

  init() {
    this.tooltipDelay = 5000;
    this.TutorialTexts = [
      "\nGreeting on the Tutorial level!\n\nHere you will get study about game features.\n ",
      "\nYou have to Save The World!\n\n\nAgain!!!\n\n",
      "\nYou can drive UFO \n(Unbelievably Fun Object) \nwith arrow keys:\n ← → ↑ ↓\n ",
      "\nWhen you flying up ↑ , UFO consumes fuel resource \n",
      "\nIf you do not have any fuel left,\n you can not fly up.\n ",
      "\nThe bottom pannel shows your resources:\n\nmoney, missiles, bullets, fuel.\n",
      "\nYour main weapon loaded with bullets.\nYou can shoot using [SPACEBAR]\n",
      "\nIf you are out of bullets, main weapon will be switched to missiles.\n",
      "\nYour additional weapon is missiles.\nYou can shoot using key [M] or [7]\n ",
      "\nNote: if you are out of missiles,\nthey will be purchased.\n ",
      "\nFlower can generate useful pick-ups:\narmor, fuel, bullets, missiles... \n",
      "\nCurrently generating item showed at the bottom of the Flower.\n ",
      "\nYou can change generating item by pressing [R].\n ",
      "\nSome sneaky alien race \"Farting Aliens\"\n got aware about this Flower\n and decided to steal it\n",
      "\nYour goal is to protect The Last Flower on the Planet\n and kill all h̶u̶m̶a̶n̶s̶ aliens.\n ",
      "\nBe careful:\nenemies also can shoot you\n",
      "\nYou can build different towers\nto get some help with defence\n ",
      "\nNormal Tower [1], \nFreezing Tower [2], \nRocket Launcher [3] \nLaser [4]\n",
      "\nYou can build asteroids [5], \nthey are cheep and can be destroyed\n",
      "\nYou can request orbital mine [6], \nbe careful, it also can explode near you!\n",
    ];
    this._TipOptions = {
      strokeColor: 0x82C1C4,
      width: 800,
      padding: 100,
      strokeWeight: 4,
      position: "top",
      positionOffset: 300,
      animation: "grow",
      fixedToCamera: true,
      textStyle: {
        fontSize: 23,
        fill: "#F18B0B",
        wordWrap: true,
        align: "center",
        wordWrapWidth: 500
      }
    };
  }

  create() {
    Main.prototype.init();
    Main.prototype.create(this.game, true);
    this.mainState = this.game.state.states["Main"];
    this.mainState.level = 0;
    this.mainState.game = this.game;
    this.hideGameObjects();
    this.showLevelAnimation();
  }

  showLevelAnimation() {
    const style = {
      font: "60px eater",
      fill: "#F36200",
      stroke: "#CCCCCC",
      align: "center",
      strokeThickness: 1
    };
    this.levelText = this.game.add.text(0, 0, "Tutorial Level", style);
    this.levelText.x = this.game.width / 2 - this.levelText.width / 2;
    this.levelText.y = this.game.height / 2 - this.levelText.height / 2;
    this.levelText.alpha = 0;
    this.levelText.fixedToCamera = true;
    this.game.add.tween(this.levelText)
      .to({alpha: 1},
        5000 /*duration (in ms)*/,
        Phaser.Easing.Bounce.Out /*easing type*/,
        true /*autostart?*/)
      .onComplete.add(() => this.showAllToolTips());
  }

  update() {
    this.mainState.update();
  }

  showAllToolTips() {
    this.levelText.destroy();
    this._TipOptions.targetObject = this.mainState._flowerPlants.children[0];
    this.myTooltip = new Phasetips(this.game, this._TipOptions);

    this.TutorialTexts
      .forEach((text, i) => {
        // Show tool tips with delay.
        this.game.time.events.add(i * this.tooltipDelay, () => {
          this.showGameObjects(i);
          let textWithId = /*i + ':' +*/ text;
          this.showTooltipWithText(textWithId);
        });

        // Remove last tooltip.
        if (i === this.TutorialTexts.length - 1) {
          this.game.time.events.add(++i * this.tooltipDelay, () => {
            this.myTooltip.destroy();
            this.hideTutorialSprite();
            this.mainState.isTutorial = false;
            this.mainState.addEnemys();
            this.mainState.score = 30;
          });
        }
      });
  }

  showTooltipWithText(text) {
    this._TipOptions.context = text;
    this.myTooltip.destroy();
    this.myTooltip = new Phasetips(this.game, this._TipOptions);
    this.myTooltip.showTooltip();
  }

  hideGameObjects() {
    this.mainState.towers.setAll("visible", false);
    const tower = this.mainState.towers.children[0];
    tower.HealthBar.bgSprite.alpha = 0;
    tower.HealthBar.barSprite.alpha = 0;
    tower.shieldPower = 0;

    this.mainState._shipTrail.visible = false;

    this.mainState._UiGroup.setAll("visible", false);
    this.mainState._livesGraph.setAll("visible", false);
  }

  blinkSprite(sprite) {
    this.game.add.tween(sprite)
      .to({alpha: 0},
        150, Phaser.Easing.Exponential.In, true, 0, 10, true);
  }

  hideTutorialSprite() {
    if (!this.newTooltip) {
      return;
    }
    this.newTooltip.destroy();
  }

  showTutorialSprite(key) {
    this.hideTutorialSprite();
    this.mainState.tutorialSptite = this.game.add.sprite(0, 0, key);
    let options = this._TipOptions;
    options.context = this.mainState.tutorialSptite;
    options.positionOffset = 200;
    options.position = "bottom";
    this.newTooltip = new Phasetips(this.game, options);
    this.newTooltip.showTooltip();
  }

  showGameObjects(i) {
    switch (i) {
      case 2:
        this.mainState._livesGraph.setAll("visible", true);
        this.mainState.towers.setAll("visible", true);
        this.mainState.towers.setAll("fuel", 250);
        this.mainState._shipTrail.visible = true;
        this.blinkSprite(this.mainState.towers.children[0]);

        // Show new sprite
        this.showTutorialSprite("spaceship");
        break;

      case 5:
        this.mainState.tutorialSptite.kill();
        if (this.newTooltip) {
          this.newTooltip.destroy();
        }
        this.blinkSprite(this.mainState._UiGroup.children[0]);
        this.mainState._UiGroup.setAll("visible", true);
        this.mainState._sateliteBtn.visible = false;
        this.mainState._sateliteFreezeBtn.visible = false;
        this.mainState._sateliteRocketBtn.visible = false;
        this.mainState._satelitelasertBtn.visible = false;
        break;

      case 6:
        this.showTutorialSprite("green_bullet");
        this.mainState.towers.setAll("bullets", 50);
        break;

      case 7:
        this.mainState.towers.setAll("bullets", 0);
        this.showTutorialSprite("missle");
        break;

      case 9:
        this.hideTutorialSprite();
        this.mainState.towers.setAll("missles", 0);
        break;

      case 10:
        this.showTutorialSprite("flow");
        this.mainState.tutorialSptite.scale.setTo(0.3);
        this.newTooltip.y = this.newTooltip.y - this.newTooltip.height;
        this.mainState._flowerPlants.children[0].alive = true;
        this.mainState.generateGrowingPickups();
        this.mainState._flowerPlants.setAll("visible", true);
        this.blinkSprite(this.mainState._flowerPlants);
        break;

      case 11:
        this.hideTutorialSprite();
        this.blinkSprite(this.mainState._flowerPlants.children[0].growingItem);
        break;

      case 12:
        this.showTutorialSprite("reload");
        this.mainState.tutorialSptite.scale.setTo(0.3);
        this.blinkSprite(this.mainState._reloadBtn);
        break;

      case 13:
        this.hideTutorialSprite();
        break;

      case 16:
        this.showTutorialSprite("satelite");
        this.mainState._sateliteBtn.visible = true;
        this.mainState._sateliteFreezeBtn.visible = true;
        this.mainState._sateliteRocketBtn.visible = true;
        this.mainState._satelitelasertBtn.visible = true;
        this.blinkSprite(this.mainState._sateliteBtn);
        this.blinkSprite(this.mainState._sateliteFreezeBtn);
        this.blinkSprite(this.mainState._sateliteRocketBtn);
        this.blinkSprite(this.mainState._satelitelasertBtn);
        break;

      case 18:
        this.blinkSprite(this.mainState._wallBtn);
        break;

      case 19:
        this.blinkSprite(this.mainState._bombBtn);
        break;
    }
  }

}
