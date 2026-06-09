import Phaser from 'phaser';
import Bullet from '../entities/Bullet';
import Enemy from '../entities/Enemy';

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

    g.clear();
    g.fillStyle(0xffff00, 1);
    g.fillRect(0, 0, 8, 8);
    g.generateTexture('bulletTexture', 8, 8);

    // enemy texture
    g.clear();
    g.fillStyle(0xff3333, 1);
    g.beginPath();
    g.moveTo(16, 0);
    g.lineTo(32, 16);
    g.lineTo(16, 32);
    g.lineTo(0, 16);
    g.closePath();
    g.fillPath();
    g.generateTexture('enemyTexture', 32, 32);

    g.destroy();

    this.player = this.physics.add.sprite(400, 300, 'playerTexture');
    this.player.setCollideWorldBounds(true);

    this.player.body.setSize(24, 24);
    this.player.body.setOffset(4, 8);

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D
    });

    this.bullets = this.physics.add.group({
      classType: Bullet,
      maxSize: 30,
      runChildUpdate: true
    });

    this.enemies = this.physics.add.group({
      classType: Enemy,
      runChildUpdate: true
    });

    const randomX = Phaser.Math.Between(50, 750);
    const randomY = Phaser.Math.Between(50, 550);
    const enemy = new Enemy(this, randomX, randomY);
    this.enemies.add(enemy);

    this.lastFired = 0;
    this.fireRate = 200;

    this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletEnemyCollision, null, this);
  }

  handleBulletEnemyCollision(bullet, enemy) {
    if (bullet.active && enemy.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      enemy.takeDamage(1);
    }
  }

  fireBullet() {
    const bullet = this.bullets.get();
    if (bullet) {
      const pointer = this.input.activePointer;
      const angle = Phaser.Math.Angle.Between(this.player.x, this.player.y, pointer.worldX, pointer.worldY);
      bullet.fire(this.player.x, this.player.y, angle);
    }
  }

  update(time, delta) {
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

    if (this.input.activePointer.isDown && this.input.activePointer.button === 0) {
      if (time > this.lastFired) {
        this.fireBullet();
        this.lastFired = time + this.fireRate;
      }
    }
  }
}
