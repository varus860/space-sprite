import Phaser from 'phaser';

export default class MainMenuScene extends Phaser.Scene {
  constructor() {
    super('MainMenuScene');
  }

  create() {
    const { width, height } = this.scale;

    // Background particle effect
    const g = this.make.graphics({ x: 0, y: 0, add: false });
    g.fillStyle(0xffffff, 1);
    g.fillCircle(4, 4, 4);
    g.generateTexture('menuParticle', 8, 8);
    g.destroy();

    this.add.particles(0, 0, 'menuParticle', {
      x: { min: 0, max: width },
      y: { min: 0, max: height },
      lifespan: 4000,
      speedY: { min: -10, max: 10 },
      speedX: { min: -10, max: 10 },
      scale: { start: 0.5, end: 0 },
      alpha: { start: 0.5, end: 0 },
      frequency: 100,
      blendMode: 'ADD'
    });

    // Game Title
    this.add.text(width / 2, height / 2 - 80, 'SPACE SHOOTER', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '64px',
      color: '#00ffff',
      fontStyle: 'bold',
      stroke: '#ffffff',
      strokeThickness: 2,
      shadow: { blur: 10, color: '#00ffff', fill: true }
    }).setOrigin(0.5);

    // Start Game Button
    const startBtn = this.add.text(width / 2, height / 2 + 50, 'Start Game', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '32px',
      color: '#ffffff',
      backgroundColor: '#222222',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => startBtn.setStyle({ backgroundColor: '#444444' }))
      .on('pointerout', () => startBtn.setStyle({ backgroundColor: '#222222' }))
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      });
  }
}
