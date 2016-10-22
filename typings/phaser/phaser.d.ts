// definition for https://github.com/aaccurso/phaser-state-transition-plugin

declare module Phaser {
    module Plugin {
        class StateTransition extends Phaser.Plugin {
            // not sure what parent type is
            constructor(game: Phaser.Game, parent: any);

            configure(options: Object): any;

            // to(key, clearWorld, clearCache, parameter)
            to(key: string, clearWorld?: boolean, clearCache?: boolean, parameter?: Object): void;
        }

        class EPSY extends Phaser.Plugin {
            constructor(game: Phaser.Game, parent: any);
        }
    }
}

declare class HealthBar {
    constructor(game,config);
}

