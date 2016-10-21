import {Missle} from '../gameObjects/collections/Missle';
import {Satelite} from '../gameObjects/Satelite';
import {ScreenUtils} from "./screenutils";
import {Wall} from "../gameObjects/Wall";
import {Bomb} from '../gameObjects/Bomb';

export class UI {
    private game;
    private item_width;
    private mainState;
    private _sateliteInitPos;
    private _wallInitPos;
    private _bombInitPos;
    private _rocketInitPos;
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
        mainState._UiGraph = this.createUiGraph.apply(mainState);
        mainState._sateliteBtn = this.createSateliteDraggable('satelite');
        mainState._sateliteFreezeBtn = this.createSateliteDraggable('satelite_freeze');
        mainState._sateliteRocketBtn = this.createSateliteDraggable('tower');
        mainState._satelitelasertBtn = this.createSateliteDraggable('laser_tower');
        mainState._wallBtn = this.createWallDraggable();
        mainState._bombBtn = this.createBombDraggable();
        mainState._rocketBtn = this.createRocketDraggable();
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
        var uiRect = this.game.add.graphics(0, this.game.height * ScreenUtils.screenMetrics.scaleY);
        uiRect.beginFill(0xFFFFFF);
        uiRect.clear();
        uiRect.drawRect(0, 0, this.game.width * 8, 100);
        uiRect.alpha = .8;
        this.game.physics.p2.enable(uiRect);
        uiRect.body.static = true;
        return uiRect;
    }

    createSateliteDraggable(key) {

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

        satelite.inputEnabled = true;
        satelite.input.enableDrag();

        // Add drag event handlers.
        satelite.events.onInputDown.add(satelite => {
            this._sateliteInitPos = {};
            this._sateliteInitPos.x = satelite.x;
            this._sateliteInitPos.y = satelite.y;
        });

        satelite.events.onDragStop.add(satelite => {
            var price = this.mainState.priceList[satelite.key];
            if (this.mainState.score >= price) {
                this.mainState -= price;
                this.mainState.changeScoreText();
                var isFreezing = satelite.key == 'satelite_freeze';
                var isRocket = satelite.key == 'tower';
                var isLaser = satelite.key == 'laser_tower';
                new Satelite(this.game, satelite.x, satelite.y, isFreezing, isRocket, isLaser);
            }
            satelite.x = this._sateliteInitPos.x;
            satelite.y = this._sateliteInitPos.y;
            this._sateliteInitPos = {};
        });

        satelite.events.onDragUpdate.add(satelite => {
            satelite.y = this.game.height * ScreenUtils.screenMetrics.scaleY - 70;
        });

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

    createWallDraggable() {
        var wallBtn = this.game.add.sprite(0, 0, 'wall-a');
        wallBtn.xPosition = this.item_width * 4;
        wallBtn.scale.setTo(0.4, 0.4);
        wallBtn.inputEnabled = true;
        wallBtn.input.enableDrag();

        // Add drag event handlers.
        wallBtn.events.onInputDown.add(wall=>{
            this._wallInitPos = {};
            this._wallInitPos.x = wall.x;
            this._wallInitPos.y = wall.y;
        });

        wallBtn.events.onDragStop.add(wall => {
            var price = this.mainState.priceList.wall;
            if (this.mainState.towers.children[0].countBricks > 0) {
                this.mainState.towers.children[0].countBricks--;
                this.mainState.prototype.changeScoreText();
                new Wall(this.game, wall.x, wall.y);
            }
            else if (this.mainState >= price) {
                this.mainState -= price;
                this.mainState.prototype.changeScoreText();
                new Wall(this.game, wall.x, wall.y);
            }

            wall.x = this._wallInitPos.x;
            wall.y = this._wallInitPos.y;
            this._wallInitPos = {};
        });

        var textObj = this.game.add.text(0, 100, this.mainState.priceList.wall + '$', this.mainState.priceStyle);
        textObj.scale.setTo(1.3, 1.3);
        wallBtn.addChild(textObj);
        var cRect = this.drawPriceCircle.call(this, '5');
        cRect.scale.set(1.0);
        wallBtn.addChild(cRect);

        return wallBtn;
    }

    createBombDraggable() {
        var bombBtn = this.game.add.sprite(0, 350, 'bomb');
        bombBtn.xPosition = this.item_width * 5;
        bombBtn.scale.setTo(0.7, 0.7);
        bombBtn.inputEnabled = true;
        bombBtn.input.enableDrag();

        // Add drag event handlers.
        bombBtn.events.onInputDown.add(bomb => {
            this._bombInitPos = {};
            this._bombInitPos.x = bomb.x;
            this._bombInitPos.y = bomb.y;
        });

        bombBtn.events.onDragStop.add((bomb)=> {
            var price = this.mainState.priceList.bomb;
            if (this.mainState >= price) {
                this.mainState -= price;
                this.mainState.prototype.changeScoreText();
                new Bomb(this.game, bomb.x, bomb.y);
            }
            bomb.x = this._bombInitPos.x;
            bomb.y = this._bombInitPos.y;
            this._bombInitPos = {};
        });

        bombBtn.events.onDragUpdate.add(bomb => bomb.y = 10);

        var textObj = this.game.add.text(0, 50, this.mainState.priceList.bomb + '$', this.mainState.priceStyle);
        textObj.scale.setTo(0.7, 0.7);
        bombBtn.addChild(textObj);

        var cRect = this.drawPriceCircle.call(this, '6');
        cRect.scale.set(0.6);
        bombBtn.addChild(cRect);

        return bombBtn;
    }

    createRocketDraggable() {
        var rocketBtn = this.game.add.sprite(0, 420, 'missle');
        rocketBtn.xPosition = this.item_width * 6;
        rocketBtn.scale.setTo(0.7, 0.7);
        rocketBtn.inputEnabled = true;
        rocketBtn.input.enableDrag();

        // Add drag event handlers.
        rocketBtn.events.onInputDown.add(rocket => {
            this._rocketInitPos = {};
            this._rocketInitPos.x = rocket.x;
            this._rocketInitPos.y = rocket.y;
        });

        rocketBtn.events.onDragStop.add(rocket => {
            var price = this.mainState.priceList.rocket;
            if (this.mainState >= price) {
                this.mainState -= price;
                this.mainState.changeScoreText();
                var missle = new Missle(this.game, rocket.x, rocket.y, true);
                (missle as any).body.moveUp(800);
            }

            rocket.x = this._rocketInitPos.x;
            rocket.y = this._rocketInitPos.y;
            this._rocketInitPos = {};
        });

        rocketBtn.events.onDragUpdate.add(rocket =>
            rocket.y = this.game.height * ScreenUtils.screenMetrics.scaleY - 30);


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
}
