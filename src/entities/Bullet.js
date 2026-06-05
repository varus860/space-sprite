import Phaser from 'phaser';

export default class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'bulletTexture');
  }

  fire(x, y, angle) {
    this.enableBody(true, x, y, true, true);
    this.setActive(true);
    this.setVisible(true);

    this.scene.physics.velocityFromRotation(angle, 500, this.body.velocity);
  }

  preUpdate(time, delta) {
    super.preUpdate(time, delta);

    const bounds = this.scene.physics.world.bounds;

    if (
      this.y <= bounds.y ||
      this.y >= bounds.y + bounds.height ||
      this.x <= bounds.x ||
      this.x >= bounds.x + bounds.width
    ) {
      this.setActive(false);
      this.setVisible(false);
      this.body.stop();
    }
  }
}
