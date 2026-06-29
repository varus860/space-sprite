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
  }

  update(health) {
    this.healthText.setText(`HP: ${health}`);
  }
}
