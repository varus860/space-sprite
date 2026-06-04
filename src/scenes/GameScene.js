import Phaser from 'phaser';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    console.log('GameScene create() fired');

    // Create player texture
    const width = 32;
    const height = 32;
    const g = this.make.graphics({ x: 0, y: 0, add: false });

    g.fillStyle(0x00ffff, 1);
    g.beginPath();
    g.moveTo(16, 0);
    g.lineTo(32, 32);
    g.lineTo(0, 32);
    g.closePath();
    g.fillPath();

    g.generateTexture('playerTexture', width, height);
    g.destroy();

    // Create player sprite
    this.player = this.add.sprite(400, 300, 'playerTexture');
  }

  update() {
    // Game loop logic
  }
}
