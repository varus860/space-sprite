import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this.load.audio('shoot', 'assets/audio/shoot.mp3');
  }

  create() {
    const { width, height } = this.scale;
    this.add.text(width / 2, height / 2, 'Loading...', {
      fontSize: '32px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Transition to GameScene after a short delay so the loading text is visible
    this.time.delayedCall(1000, () => {
      this.scene.start('GameScene');
    });
  }
}
