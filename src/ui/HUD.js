import Phaser from 'phaser';

export default class HUD {
  constructor(scene) {
    this.scene = scene;

    this.healthText = scene.add.text(16, 16, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });
    this.healthText.setScrollFactor(0);
    this.healthText.setDepth(10);

    this.enemyText = scene.add.text(784, 16, '', {
      fontSize: '18px',
      fill: '#ffffff'
    });
    this.enemyText.setScrollFactor(0);
    this.enemyText.setDepth(10);
    this.enemyText.setOrigin(1, 0);
  }

  update(health) {
    this.healthText.setText(`HP: ${health}`);
  }

  updateEnemies(remaining, total) {
    this.enemyText.setText(`Enemies: ${remaining} / ${total}`);
  }
}
