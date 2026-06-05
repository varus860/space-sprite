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

    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(true);

    this.player.body.setSize(24, 24);
    this.player.body.setOffset(4, 8);

    // Initialize keyboard inputs (Phase 7)
    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });
  }

  update() {
    const speed = 200;
    let velocityX = 0;
    let velocityY = 0;

    if (this.cursors.left.isDown || this.wasd.left.isDown) {
      velocityX = -1;
    } else if (this.cursors.right.isDown || this.wasd.right.isDown) {
      velocityX = 1;
    }

    if (this.cursors.up.isDown || this.wasd.up.isDown) {
      velocityY = -1;
    } else if (this.cursors.down.isDown || this.wasd.down.isDown) {
      velocityY = 1;
    }

    // Normalize diagonal movement
    if (velocityX !== 0 || velocityY !== 0) {
      const length = Math.sqrt(velocityX * velocityX + velocityY * velocityY);
      velocityX = (velocityX / length) * speed;
      velocityY = (velocityY / length) * speed;
    }
    this.player.setVelocity(velocityX, velocityY);

    // look at cursor
    const pointer = this.input.activePointer;
    const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);

    // add 90 degrees to aligh the polygon with the angle
    this.player.rotation = angle + Math.PI / 2;
  }
}
