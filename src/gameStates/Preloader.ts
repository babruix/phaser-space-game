
import * as Phaser from "phaser";

export class Preloader extends Phaser.State {
  private preloadBar;

  init() {
    // Set scale options
    this.game.input.maxPointers = 1; // No multi-touch
    this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    this.game.scale.pageAlignHorizontally = true;
    this.game.scale.pageAlignVertically = true;
  }

  preload() {

    // Background
    this.game.add.tileSprite(0, 0, this.game.width, 889, "background");
    let text = this.game.add.text(this.game.width / 2, this.game.height / 2 - 100, "Loading...", {
      font: "57px eater",
      fill: "#F36200"
    });
    text.anchor.set(0.5);

    // Preloader
    this.preloadBar = this.game.add.sprite(this.game.world.centerX, this.game.world.centerY, "preloaderBar");
    this.preloadBar.anchor.setTo(0.5, 0.5);
    this.game.load.setPreloadSprite(this.preloadBar);

    /**
     * Sounds
     */
    this.game.load.audio("gulp", ["assets/audio/gulp-2.wav"]);
    this.game.load.audio("gunshot", ["assets/audio/gunshot2.wav"]);
    this.game.load.audio("toil", ["assets/audio/toilet.wav"]);
    this.game.load.audio("smack", ["assets/audio/smack.wav"]);
    this.game.load.audio("laugh", ["assets/audio/laugh-short.wav"]);
    this.game.load.audio("spring", ["assets/audio/spring.wav"]);
    this.game.load.audio("kiss", ["assets/audio/kiss.wav"]);
    this.game.load.audio("explosion", ["assets/audio/explosion.wav"]);
    this.game.load.audio("missle", ["assets/audio/miss.wav"]);
    this.game.load.audio("laser", ["assets/audio/laser.mp3"]);
    this.game.load.audio("scifi1", ["assets/audio/scifi1.wav"]);
    this.game.load.audio("scifi2", ["assets/audio/scifi2.wav"]);
    this.game.load.audio("scifi3", ["assets/audio/scifi3.wav"]);
    this.game.load.audio("scifi4", ["assets/audio/scifi4.wav"]);
    this.game.load.audio("scifi5", ["assets/audio/scifi5.wav"]);
    this.game.load.audio("completed", ["assets/audio/level-completed.mp3"]);
    this.game.load.audio("gameOver", ["assets/audio/game-over.wav"]);
    this.game.load.audio("reload", ["assets/audio/reload.mp3"]);

    this.game.load.tilemap("desert", "assets/maps/tower-defense-clean.json", null, Phaser.Tilemap.TILED_JSON);
    this.game.load.image("tiles", "assets/maps/tmw_desert_spacing.png");

    this.game.load.image("spaceship", "assets/sprites/spaceship.png");
    this.game.load.image("satelite", "assets/sprites/satelite-fire.png");
    this.game.load.image("satelite_freeze", "assets/sprites/satelite.png");
    this.game.load.image("tower", "assets/sprites/tower.png");
    this.game.load.image("laser_tower", "assets/sprites/laser_tower.png");

    this.game.load.image("bullet", "assets/sprites/bullet.png");
    this.game.load.image("freezing_bullet", "assets/sprites/freezing_bullet.png");
    this.game.load.image("green_bullet", "assets/sprites/green_bullet.png");
    this.game.load.image("missle", "assets/sprites/missile.png");
    this.game.load.image("ammo", "assets/sprites/ammo.png");
    this.game.load.image("fuel", "assets/sprites/fuel.png");
    this.game.load.image("reload", "assets/sprites/reload.png");
    this.game.load.spritesheet("sound", "assets/sprites/sound.png", 48, 48, 2);

    for (let i = 0; i < 7; i++) {
      this.game.load.image("cloud" + i, "assets/sprites/cloud_" + i + ".png");
    }
    this.game.load.image("flow", "assets/sprites/flow.png");
    this.game.load.image("sign_left", "assets/sprites/sign_left.png");
    this.game.load.image("sign_right", "assets/sprites/sign_right.png");

    /**
     * Enemys
     */
    this.game.load.spritesheet("alian", "assets/sprites/space_alian5.png", 32, 40, 9);
    this.game.load.spritesheet("bazyaka", "assets/sprites/bazyaka.png", 70, 64, 80);
    this.game.load.spritesheet("ufo", "assets/sprites/tarelka.png", 108, 64, 10);
    this.game.load.spritesheet("cat", "assets/sprites/cat.png", 64, 104, 1);
    this.game.load.spritesheet("nog", "assets/sprites/nog50.png", 89, 119, 50);
    this.game.load.image("ufo_beam", "assets/sprites/ufo-beam.png");

    /**
     * Physics
     */
    this.game.load.physics("enemy_physics", "assets/sprites/aliens_pshysics.json");
    this.game.load.physics("spaceship_pshysics", "assets/sprites/spaceship_pshysics.json");

    /**
     * Effects
     */
    this.game.load.image("sun", "assets/sprites/sun.png");
    this.game.load.spritesheet("explode", "assets/sprites/explosion.png", 157, 229, 19);
    this.game.load.image("emit", "assets/sprites/emit.png");
    this.game.load.image("heart", "assets/sprites/heart.png");
    this.game.load.image("brick", "assets/sprites/brick.png");
    this.game.load.image("wall-a", "assets/sprites/wall-a.png");
    this.game.load.image("wall-b", "assets/sprites/wall-b.png");
    this.game.load.image("wall-c", "assets/sprites/wall-c.png");
    this.game.load.image("bomb", "assets/sprites/bomb.png");
    this.game.load.spritesheet("shield", "assets/sprites/shield.png", 55, 64, 2);
    this.game.load.spritesheet("button-start", "assets/sprites/button-start.png", 401, 143);
  }

  create() {
    this.preloadBar.kill();
    this.showMenu();
  }

  showMenu() {
    (this.game as any).transitionPlugin.to("Menu");
  }
}
