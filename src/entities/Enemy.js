import Phaser from 'phaser';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'enemyTexture');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);

    this.health = 1;
    this.speed = 50;
    this.isAlive = true;
  }

  takeDamage(amount) {
    this.health -= amount;
    if (this.health <= 0) {
      this.isAlive = false;
      this.destroy();
    }
  }
}
