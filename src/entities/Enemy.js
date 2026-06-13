import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemyTexture');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.setBounce(1);

    this.health = 1;
    this.isAlive = true;
  }

  pickRandomDirection() {
    if (!this.active) return;

    const speed = Phaser.Math.Between(30, 80);
    const angle = Phaser.Math.FloatBetween(0, Math.PI * 2);

    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

    const delay = Phaser.Math.Between(2000, 4000);

    this.driftTimer = this.scene.time.addEvent({
      delay: delay,
      callback: this.pickRandomDirection,
      callbackScope: this
    });
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isAlive = false;
      if (this.driftTimer) {
        this.driftTimer.remove();
      }
      this.destroy();
    }
  }
}
