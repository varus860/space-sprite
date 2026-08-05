import Phaser from 'phaser';
import Bullet from '../entities/Bullet';
import Enemy from '../entities/Enemy';
import HUD from '../ui/HUD';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  create() {
    console.log('GameScene create() fired');

    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;

    const makeStars = (key, size, count, color, textureSize) => {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(color, 1);
      for (let i = 0; i < count; i++) {
        graphics.fillRect(Phaser.Math.Between(0, textureSize), Phaser.Math.Between(0, textureSize), size, size);
      }
      graphics.generateTexture(key, textureSize, textureSize);
      graphics.destroy();
    };

    makeStars('starsSmall', 1, 150, 0xffffff, 400);
    makeStars('starsMedium', 2, 50, 0xaaaaaa, 400);
    makeStars('starsLarge', 3, 20, 0x777777, 400);

    this.bgStarsSmall = this.add.tileSprite(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 'starsSmall');
    this.bgStarsMedium = this.add.tileSprite(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 'starsMedium');
    this.bgStarsLarge = this.add.tileSprite(gameWidth / 2, gameHeight / 2, gameWidth, gameHeight, 'starsLarge');

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

    // particle texture
    g.clear();
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 4, 4);
    g.generateTexture('particleTexture', 4, 4);

    g.destroy();

    this.explosionEmitter = this.add.particles(0, 0, 'particleTexture', {
      lifespan: 500,
      speed: { min: 50, max: 200 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      blendMode: 'ADD',
      emitting: false,
      tint: [0xffaa00, 0xff0000, 0xffff00]
    });

    this.bulletTrailEmitter = this.add.particles(0, 0, 'particleTexture', {
      lifespan: 300,
      scale: { start: 1.5, end: 0 },
      alpha: { start: 0.6, end: 0 },
      blendMode: 'ADD',
      emitting: false,
      tint: 0x00ffff
    });

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

    // Playes faces up
    this.facingAngle = -Math.PI / 2;
    // Space to fire
    this.fireKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    this.health = 5;
    this.invincible = false;

    this.totalEnemies = this.enemies.getChildren().length;
    this.score = 0;

    this.hud = new HUD(this);
    this.hud.update(this.health);
    this.hud.updateEnemies(this.totalEnemies, this.totalEnemies);
    this.hud.updateScore(this.score);

    this.physics.add.overlap(this.bullets, this.enemies, this.handleBulletEnemyCollision, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.handlePlayerEnemyCollision, null, this);
  }

  handlePlayerEnemyCollision(player, enemy) {
    if (this.invincible) return;

    this.health -= 1;
    this.hud.update(this.health);

    if (this.health <= 0) {
      const enemiesDestroyed = this.totalEnemies - this.enemies.countActive();
      this.scene.start('GameOverScene', { enemiesDestroyed, score: this.score });
      return;
    }

    this.invincible = true;

    const angle = Phaser.Math.Angle.Between(enemy.x, enemy.y, player.x, player.y);
    const knockbackSpeed = 300;
    player.setVelocity(Math.cos(angle) * knockbackSpeed, Math.sin(angle) * knockbackSpeed);

    // Blink effect
    this.tweens.add({
      targets: player,
      alpha: 0,
      duration: 100,
      ease: 'Linear',
      yoyo: true,
      repeat: 4
    });

    // End invincibility after 1 second
    this.time.delayedCall(1000, () => {
      this.invincible = false;
      player.setAlpha(1);
    });
  }

  handleBulletEnemyCollision(bullet, enemy) {
    if (bullet.active && enemy.active) {
      bullet.setActive(false);
      bullet.setVisible(false);
      const wasAlive = enemy.isAlive;
      enemy.takeDamage(1);
      if (wasAlive && !enemy.isAlive) {
        this.explosionEmitter.explode(20, enemy.x, enemy.y);
        this.cameras.main.shake(100, 0.005);

        this.score += 100;
        this.hud.updateScore(this.score);

        const activeEnemies = this.enemies.countActive();
        this.hud.updateEnemies(activeEnemies, this.totalEnemies);
        if (activeEnemies === 0) {
          this.scene.start('WinScene', { score: this.score });
        }
      }
    }
  }

  fireBullet() {
    const bullet = this.bullets.get();
    if (bullet) {
      bullet.fire(this.player.x, this.player.y, this.facingAngle);
      this.sound.play('shoot', { volume: 0.3 });
    }
  }

  update(time, delta) {
    // Scroll starfield
    this.bgStarsSmall.tilePositionX += 0.01 * delta;
    this.bgStarsSmall.tilePositionY += 0.01 * delta;
    this.bgStarsMedium.tilePositionX += 0.03 * delta;
    this.bgStarsMedium.tilePositionY += 0.03 * delta;
    this.bgStarsLarge.tilePositionX += 0.06 * delta;
    this.bgStarsLarge.tilePositionY += 0.06 * delta;

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

      // Update direction
      this.facingAngle = Math.atan2(velocityY, velocityX);
    }
    this.player.setVelocity(velocityX, velocityY);

    // Rotate player
    this.player.rotation = this.facingAngle + Math.PI / 2;
    // Fire
    if (this.fireKey.isDown && time > this.lastFired) {
      this.fireBullet();
      this.lastFired = time + this.fireRate;
    }
  }
}

