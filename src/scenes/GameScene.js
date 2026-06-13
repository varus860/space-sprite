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
      runChildUpdate: true,
      collideWorldBounds: true,
      bounceX: 1,
      bounceY: 1
    });

    const ENEMY_COUNT = 10;
    const MIN_DISTANCE_FROM_PLAYER = 150;
    const MIN_DISTANCE_BETWEEN_ENEMIES = 40;

    for (let i = 0; i < ENEMY_COUNT; i++) {
      let x, y;
      let validPosition = false;
      let attempts = 0;

      while (!validPosition && attempts < 100) {
        x = Phaser.Math.Between(50, 750);
        y = Phaser.Math.Between(50, 550);
        validPosition = true;

        // Check distance from player
        if (Phaser.Math.Distance.Between(x, y, this.player.x, this.player.y) < MIN_DISTANCE_FROM_PLAYER) {
          validPosition = false;
        }

        // Check distance from other enemies
        if (validPosition) {
          for (const enemy of this.enemies.getChildren()) {
            if (Phaser.Math.Distance.Between(x, y, enemy.x, enemy.y) < MIN_DISTANCE_BETWEEN_ENEMIES) {
              validPosition = false;
              break;
            }
          }
        }
        attempts++;
      }

      if (validPosition) {
        const enemy = new Enemy(this, x, y);
        this.enemies.add(enemy);
        enemy.pickRandomDirection();
      }
    }

    this.lastFired = 0;
    this.fireRate = 200;

    // Player faces upward by default (angle in radians, -PI/2 = up)
    this.facingAngle = -Math.PI / 2;

    // Space key to fire
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

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
      bullet.fire(this.player.x, this.player.y, this.facingAngle);
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

      // Update facing direction based on movement
      this.facingAngle = Math.atan2(velocityY, velocityX);
    }
    this.player.setVelocity(velocityX, velocityY);

    // Rotate player to face movement direction (+ 90° to align the triangle)
    this.player.rotation = this.facingAngle + Math.PI / 2;

    // Fire on Space key
    if (this.fireKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }
  }
}

