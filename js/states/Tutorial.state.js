SpaceGame.Tutorial = function (game) {
  SpaceGame.Tutorial.game = game;
  SpaceGame.Tutorial.tooltipDelay = 5000;

  SpaceGame.TutorialTexts = [
    '\nGreeting on the Tutorial level!\n\nHere you will get study about game features.\n ',
    '\nYou have to Save The World!\n\n\nAgain!!!\n\n',
    '\nYou can drive UFO \n(Unbelievably Fun Object) \nwith arrow keys:\n ← → ↑ ↓\n ',
    '\nWhen you flying up ↑ , UFO consumes fuel resource \n',
    '\nIf you do not have any fuel left,\n you can not fly up.\n ',
    '\nThe bottom pannel shows your resources:\n\nmoney, missiles, bullets, fuel.\n',
    '\nYour main weapon loaded with bullets.\nYou can shoot using [SPACEBAR]\n',
    '\nIf you are out of bullets, main weapon will be switched to missiles.\n',
    '\nYour additional weapon is missiles.\nYou can shoot using key [M] or [7]\n ',
    '\nNote: if you are out of missiles,\nthey will be purchased.\n ',
    '\nFlower can generate useful pick-ups:\narmor, fuel, bullets, missiles... \n',
    '\nCurrently generating item showed at the bottom of the Flower.\n ',
    '\nYou can change generating item by pressing [R].\n ',
    '\nSome sneaky alien race "Farting Aliens"\n got aware about this Flower\n and decided to steal it\n',
    '\nYour goal is to protect The Last Flower on the Planet\n and kill all h̶u̶m̶a̶n̶s̶ aliens.\n ',
    '\nBe careful:\nenemies also can shoot you\n',
    '\nYou can build different towers\nto get some help with defence\n ',
    '\nNormal Tower [1], \nFreezing Tower [2], \nRocket Launcher [3] \nLaser [4]\n',
    '\nYou can build asteroids [5], \nthey are cheep and can be destroyed\n',
    '\nYou can request orbital mine [6], \nbe careful, it also can explode near you!\n',
    '\nIt rains quite often here, and in the rain nobody can fly really fast.\n',
    '\nYou can move rain by dragging cloud and dropping it to the new place. \n'
  ];

  SpaceGame.Tutorial._TipOptions = {
    strokeColor: 0x82C1C4,
    width: 800,
    padding: 100,
    strokeWeight: 4,
    position: 'top',
    positionOffset: 300,
    animation: 'grow',
    fixedToCamera: true,
    textStyle: {
      fontSize: 23,
      fill: "#F18B0B",
      wordWrap: true,
      align: "center",
      wordWrapWidth: 500
    }
  };
};

SpaceGame.Tutorial.prototype = {

  showAllToolTips: function () {
    SpaceGame.Tutorial._TipOptions.targetObject = SpaceGame._flowerPlants.children[0];
    SpaceGame.myTooltip = new Phasetips(game, SpaceGame.Tutorial._TipOptions);

    SpaceGame.TutorialTexts
      .forEach(function (text, i) {
        // Show tool tips with delay.
        game.time.events.add(i * SpaceGame.Tutorial.tooltipDelay, function () {
          SpaceGame.Tutorial.prototype.showGameObjects(i);
          var textWithId = /*i + ':' +*/ text;
          SpaceGame.Tutorial.prototype.showTooltipWithText(textWithId);
        }, this);

        // Remove last tooltip.
        if (i == SpaceGame.TutorialTexts.length - 1) {
          game.time.events.add(++i * SpaceGame.Tutorial.tooltipDelay, function () {
            SpaceGame.myTooltip.destroy();
            SpaceGame.isTutorial = false;
            SpaceGame.Main.prototype.addEnemys();
            score = 30;
          });
        }
      });
  },

  showTooltipWithText: function (text) {
    SpaceGame.Tutorial._TipOptions.context = text;
    SpaceGame.myTooltip.destroy();
    SpaceGame.myTooltip = new Phasetips(game, SpaceGame.Tutorial._TipOptions);
    SpaceGame.myTooltip.showTooltip();
  },

  hideGameObjects: function () {
    towers.setAll('visible', false);
    towers.children[0].HealthBar.bgSprite.alpha = 0;
    towers.children[0].HealthBar.barSprite.alpha = 0;

    game.time.events.add(510, function() {
      Tower.prototype.destroyCirclesGroup();
    });
    SpaceGame._shipTrail.visible = false;

    SpaceGame._UiGroup.setAll('visible', false);
    SpaceGame._livesGraph.setAll('visible', false);
  },

  blinkSprite: function (sprite) {
    game.add.tween(sprite)
      .to({alpha: 0},
        150, Phaser.Easing.Exponential.In, true, 0, 10, true);
  },

  hideTutorialSprite: function () {
    if (!SpaceGame.newTooltip) {
      return;
    }
    SpaceGame.newTooltip.destroy();
  },

  showTutorialSprite: function (key) {
    this.hideTutorialSprite();
    SpaceGame.tutorialSptite = game.add.sprite(0, 0, key);
    var options = SpaceGame.Tutorial._TipOptions;
    options.context = SpaceGame.tutorialSptite;
    options.positionOffset = 200;
    options.position = 'bottom';
    SpaceGame.newTooltip = new Phasetips(game, options);
    SpaceGame.newTooltip.showTooltip();
  },

  showGameObjects: function (i) {

    switch (i) {
      case 2:
        SpaceGame._livesGraph.setAll('visible', true);
        towers.setAll('visible', true);
        towers.setAll('fuel', 250);
        SpaceGame._shipTrail.visible = true;
        this.blinkSprite(towers.children[0]);

        // Show new sprite
        this.showTutorialSprite('spaceship');
        break;

      case 5:
        SpaceGame.tutorialSptite.kill();
        if (SpaceGame.newTooltip){
          SpaceGame.newTooltip.destroy();
        }
        this.blinkSprite(SpaceGame._UiGroup.children[0]);
        SpaceGame._UiGroup.setAll('visible', true);
        SpaceGame._sateliteBtn.visible = false;
        SpaceGame._sateliteFreezeBtn.visible = false;
        SpaceGame._sateliteRocketBtn.visible = false;
        SpaceGame._satelitelasertBtn.visible = false;
        break;

      case 6:
        this.showTutorialSprite('green_bullet');
        towers.setAll('bullets', 50);
        break;

      case 7:
        towers.setAll('bullets', 0);
        this.showTutorialSprite('missle');
        break;

      case 9:
        this.hideTutorialSprite();
        towers.setAll('missles', 0);
        break;

      case 10:
        this.showTutorialSprite('flow');
        SpaceGame.tutorialSptite.scale.setTo(0.3);
        SpaceGame.newTooltip.y = SpaceGame.newTooltip.y - SpaceGame.newTooltip.height;
        SpaceGame._flowerPlants.children[0].alive = true;
        SpaceGame.Main.prototype.generateGrowingPickups();
        SpaceGame._flowerPlants.setAll('visible', true);
        this.blinkSprite(SpaceGame._flowerPlants);
        break;

      case 11:
        this.hideTutorialSprite();
        this.blinkSprite(SpaceGame._flowerPlants.children[0].growingItem);
        break;

      case 12:
        this.showTutorialSprite('reload');
        SpaceGame.tutorialSptite.scale.setTo(0.3);
        this.blinkSprite(SpaceGame._reloadBtn);
        break;

      case 13:
        this.hideTutorialSprite();
        break;

      case 16:
        this.showTutorialSprite('satelite');
        SpaceGame._sateliteBtn.visible = true;
        SpaceGame._sateliteFreezeBtn.visible = true;
        SpaceGame._sateliteRocketBtn.visible = true;
        SpaceGame._satelitelasertBtn.visible = true;
        this.blinkSprite(SpaceGame._sateliteBtn);
        this.blinkSprite(SpaceGame._sateliteFreezeBtn);
        this.blinkSprite(SpaceGame._sateliteRocketBtn);
        this.blinkSprite(SpaceGame._satelitelasertBtn);
        break;

      case 18:
        this.blinkSprite(SpaceGame._wallBtn);
        break;

      case 19:
        this.blinkSprite(SpaceGame._bombBtn);
        break;

      case 21:
        this.blinkSprite(SpaceGame._cloudsGroup);
        break;
    }
  },

  create: function () {
    level = -1;
    SpaceGame.Main.prototype.create(true, this.game);
    this.hideGameObjects();
    this.showLevelAnimation();
  },

  showLevelAnimation: function () {
    var style = {
      font: "60px eater",
      fill: "#F36200",
      stroke: "#CCCCCC",
      align: "center",
      strokeThickness: 1
    };
    var levelText = game.add.text(0, 0, 'Tutorial Level', style);
    levelText.x = game.width / 2 - levelText.width / 2;
    levelText.y = game.height / 2 - levelText.height / 2;
    levelText.alpha = 0;
    levelText.fixedToCamera = true;
    game.add.tween(levelText)
      .to({alpha: 1},
        5000 /*duration (in ms)*/,
        Phaser.Easing.Bounce.Out /*easing type*/,
        true /*autostart?*/)
      .onComplete.add(function () {
        levelText.destroy();
        SpaceGame.Tutorial.prototype.showAllToolTips();
    });
  },

  update: function () {
    SpaceGame.Main.prototype.update();
  },

  init: function () {
    score = 300;
  }
};