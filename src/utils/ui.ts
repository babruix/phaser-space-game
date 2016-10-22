import {Missle} from '../gameObjects/collections/Missle';
import {Satelite} from '../gameObjects/Satelite';
import {ScreenUtils} from "./screenutils";
import {Wall} from "../gameObjects/Wall";
import {Bomb} from '../gameObjects/Bomb';
import * as Phaser from 'phaser';

export class UI {
    private game;
    private item_width;
    private mainState;
    private muteSound;

    constructor(mainState) {
        this.game = mainState.game;
        this.mainState = mainState;
        this.item_width = 70;

        this.createUIElements(mainState);
        this.groupElements();
        this.addSoundControl();
    }

    // Create UI elements.
    private createUIElements(mainState) {
        mainState._livesGraph = this.game.add.group();
        mainState.drawLivesSprites.call(mainState);
        mainState._UiGraph = this.createUiGraph();
        mainState._sateliteBtn = this.createSatelite('satelite');
        mainState._sateliteFreezeBtn = this.createSatelite('satelite_freeze');
        mainState._sateliteRocketBtn = this.createSatelite('tower');
        mainState._satelitelasertBtn = this.createSatelite('laser_tower');
        mainState._wallBtn = this.createWall();
        mainState._bombBtn = this.createBomb();
        mainState._rocketBtn = this.createRocket();
        mainState._reloadBtn = this.createReloadBtn();
        mainState._reloadBtn.events.onInputDown.add(this.reloadPickups);
    }

    // Add elements to UIGroup.
    groupElements() {
        this.mainState._UiGroup = this.game.add.group();
        this.mainState._UiGroup.fixedToCamera = true;
        this.mainState._UiGroup.add(this.mainState._UiGraph);

        this.mainState._UiGroup.add(this.mainState._sateliteBtn);
        this.mainState._UiGroup.add(this.mainState._sateliteFreezeBtn);
        this.mainState._UiGroup.add(this.mainState._sateliteRocketBtn);
        this.mainState._UiGroup.add(this.mainState._satelitelasertBtn);
        this.mainState._UiGroup.add(this.mainState._wallBtn);
        this.mainState._UiGroup.add(this.mainState._bombBtn);
        this.mainState._UiGroup.add(this.mainState._rocketBtn);
        this.mainState._UiGroup.add(this.mainState._reloadBtn);
    }

    // Add button to mute/unmute sound.
    addSoundControl() {
        this.game.sound.mute = Boolean(parseInt(localStorage.getItem('soundMute')));
        this.muteSound = this.game.add.button(this.game.width - 150, 15, 'sound', function () {
            this.game.sound.mute = !this.game.sound.mute;
            this.muteSound.frame = this.game.sound.mute ? 1 : 2;
            localStorage.setItem('soundMute', String(Number(this.game.sound.mute)));
        }, this);
        this.muteSound.frame = this.game.sound.mute ? 1 : 2;
        this.muteSound.fixedToCamera = true;
    }

    // Functions to create elements.
    createUiGraph() {
        var uiRect = this.game.add.graphics(0, this.game.height - 50);
        uiRect.beginFill(0xFFFFFF);
        uiRect.clear();
        uiRect.drawRect(0, 0, this.game.width * 8, 10);
        // uiRect.alpha = .8;
        this.game.physics.p2.enable(uiRect);
        uiRect.body.static = true;
        return uiRect;
    }

    createSatelite(key) {

        var xPos = 0;
        switch (key) {
            case 'satelite_freeze':
                xPos = this.item_width;
                break;
            case 'tower':
                xPos = this.item_width * 2;
                break;
            case 'laser_tower':
                xPos = this.item_width * 3;
                break;
        }

        var satelite = this.game.add.sprite(0, 0, key);
        satelite.xPosition = xPos;
        satelite.anchor.setTo(0, 0);
        satelite.scale.setTo(0.4, 0.4);

        var textObj = this.game.add.text(0, 100, this.mainState.priceList[key] + '$', this.mainState.priceStyle);
        satelite.addChild(textObj);

        var text = '1';
        switch (key) {
            case 'satelite_freeze':
                text = '2';
                break;
            case 'tower':
                text = '3';
                break;
            case 'laser_tower':
                text = '4';
                break;
        }

        var cRect = this.drawPriceCircle.call(this, text);
        satelite.addChild(cRect);

        return satelite;
    }

    createWall() {
        var wallBtn = this.game.add.sprite(0, 0, 'wall-a');
        wallBtn.xPosition = this.item_width * 4;
        wallBtn.scale.setTo(0.4, 0.4);

        var textObj = this.game.add.text(0, 100, this.mainState.priceList.wall + '$', this.mainState.priceStyle);
        textObj.scale.setTo(1.3, 1.3);
        wallBtn.addChild(textObj);
        var cRect = this.drawPriceCircle.call(this, '5');
        cRect.scale.set(1.0);
        wallBtn.addChild(cRect);

        return wallBtn;
    }

    createBomb() {
        var bombBtn = this.game.add.sprite(0, 350, 'bomb');
        bombBtn.xPosition = this.item_width * 5;
        bombBtn.scale.setTo(0.7, 0.7);

        var textObj = this.game.add.text(0, 50, this.mainState.priceList.bomb + '$', this.mainState.priceStyle);
        textObj.scale.setTo(0.7, 0.7);
        bombBtn.addChild(textObj);

        var cRect = this.drawPriceCircle.call(this, '6');
        cRect.scale.set(0.6);
        bombBtn.addChild(cRect);

        return bombBtn;
    }

    createRocket() {
        var rocketBtn = this.game.add.sprite(0, 420, 'missle');
        rocketBtn.xPosition = this.item_width * 6;
        rocketBtn.scale.setTo(0.7, 0.7);

        const price = this.mainState.priceList.rocket + '$';
        var textObj = this.game.add.text(0, 50, price, this.mainState.priceStyle);
        textObj.scale.setTo(0.7, 0.7);
        rocketBtn.addChild(textObj);

        var cRect = this.drawPriceCircle.call(this, '7');
        cRect.scale.set(0.6);
        rocketBtn.addChild(cRect);

        return rocketBtn;
    }

    createReloadBtn() {
        var reloadBtn = this.game.add.sprite(0, 480, 'reload');
        reloadBtn.xPosition = this.item_width * 7;
        reloadBtn.scale.setTo(0.2, 0.2);
        reloadBtn.inputEnabled = true;

        var cRect = this.drawPriceCircle.call(this, 'R');
        cRect.scale.setTo(2.0);
        reloadBtn.addChild(cRect);

        return reloadBtn;
    }

    drawPriceCircle(text) {
        var cRect = this.game.add.graphics(0, 50).beginFill(0xff5a00, 1).drawCircle(0, 0, 55);
        var number = this.game.add.text(0, 5, text, {
            font: '40px Arial',
            fill: '#FFFFFF'
        });
        number.anchor.setTo(0.5);
        cRect.scale.setTo(1);
        cRect.addChild(number);

        return cRect;
    }

    reloadPickups() {
        if (this.game.time.now > this.mainState.pickupsLastTime + 1000) {
            this.mainState.pickupsLastTime = this.game.time.now + 1000;
            this.mainState.generateGrowingPickups();
        }
    }

    toggleUI(moveOut) {
        this.mainState._UiGroup.forEach(item => {
            var toY;
            const height = this.game.height;

            if (item.type == 0) { // Graphics animation doesn't work here.

                item.y = moveOut ? item.y : height + item.height;
                item.alpha = moveOut ? 1 : 0;

                const toX = this.mainState._scoreText == item ?
                    0
                    : this.game.width / 2 + 100 + item.xPosition;

                if (this.mainState._scoreText == item) {
                    toY = moveOut
                        ? height + item.height
                        : height - this.mainState._scoreText.height;
                }
                else {
                    toY = moveOut
                        ? height + item.height
                        : height - this.mainState._scoreText.height * 2;
                }

                const delay = moveOut ? 700 : 500;

                this.game.add.tween(item).to(
                    {alpha: moveOut ? 0 : 1, x: toX, y: toY},
                    700, Phaser.Easing.Linear.None, true, delay);
            }
        });
    }
}
