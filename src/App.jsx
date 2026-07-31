import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import BootScene from './scenes/BootScene';
import MainMenuScene from './scenes/MainMenuScene';
import GameScene from './scenes/GameScene';
import WinScene from './scenes/WinScene';
import GameOverScene from './scenes/GameOverScene';

export default function App() {
  const gameRef = useRef(null);

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: 800,
      height: 600,
      backgroundColor: '#0a0a1a',
      parent: 'game-container',
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { x: 0, y: 0 },
          debug: false,
        },
      },
      scene: [BootScene, MainMenuScene, GameScene, WinScene, GameOverScene],
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
      }
    };
  }, []);

  return <div id="game-container" />;
}
