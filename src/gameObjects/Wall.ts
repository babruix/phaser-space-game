

export class Wall {
  private game;
  private mainState;
  private wall;

  constructor(game, x, y) {
    this.game = game;
    this.mainState = this.game.state.states["Main"];

    const walls = ["a", "b", "c"];
    const wall_key = game.rnd.integerInRange(0, 2);
    this.wall = game.add.sprite(x, y, "wall-" + walls[wall_key]);
    this.wall.anchor.setTo(0.5, 0.5);
    game.physics.p2.enable(this.wall, this.game.debugOn);
    this.wall.body.mass = this.mainState.level * 50;
    this.wall.body.static = true;
    this.wall.health = 50;
    this.mainState._walls.add(this.wall);

    this.wall.body.onBeginContact.add((body1, shapeA, shapeB) => {
      if (!body1 || !body1.sprite || !body1.sprite.key || body1.sprite.key.ctx) {
        return
      }

      if (this.mainState.towers.children[0].actionLastTime + 1000 > game.time.now) {
        return;
      }
      this.wall.damage(1);
      this.wall.alpha -= 0.1;
    });
  }

}
