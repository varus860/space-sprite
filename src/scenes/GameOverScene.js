import Phaser from 'phaser';

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  init(data) {
    this.enemiesDestroyed = data.enemiesDestroyed || 0;
    this.score = data.score || 0;
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 80, 'GAME OVER', {
      fontSize: '48px',
      color: '#ff0000',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 - 20, `Enemies Destroyed: ${this.enemiesDestroyed}`, {
      fontSize: '24px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, `Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    const tryAgainBtn = this.add.text(width / 2, height / 2 + 70, 'Try Again', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => tryAgainBtn.setStyle({ backgroundColor: '#555555' }))
      .on('pointerout', () => tryAgainBtn.setStyle({ backgroundColor: '#333333' }))
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      });
  }
}
