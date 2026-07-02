import Phaser from 'phaser';

export default class WinScene extends Phaser.Scene {
  constructor() {
    super('WinScene');
  }

  init(data) {
    this.score = data.score || 0;
  }

  create() {
    const { width, height } = this.scale;

    this.add.text(width / 2, height / 2 - 50, 'YOU WIN!', {
      fontSize: '48px',
      color: '#00ff00',
      fontStyle: 'bold'
    }).setOrigin(0.5);

    this.add.text(width / 2, height / 2 + 10, `Final Score: ${this.score}`, {
      fontSize: '24px',
      color: '#ffff00'
    }).setOrigin(0.5);

    const playAgainBtn = this.add.text(width / 2, height / 2 + 70, 'Play Again', {
      fontSize: '24px',
      color: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 20, y: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerover', () => playAgainBtn.setStyle({ backgroundColor: '#555555' }))
      .on('pointerout', () => playAgainBtn.setStyle({ backgroundColor: '#333333' }))
      .on('pointerdown', () => {
        this.scene.start('GameScene');
      });
  }
}
