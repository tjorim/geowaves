// src/main.ts - Entry point for the GeoWaves game
import Phaser from 'phaser';
import { MenuScene } from './scenes/MenuScene';
import { GameScene } from './scenes/GameScene';
import { GameOverScene } from './scenes/GameOverScene';

/**
 * Main Phaser configuration object
 */
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,     // Let Phaser decide whether to use WebGL or Canvas
  width: 800,            // Game width in pixels
  height: 600,           // Game height in pixels
  scene: [MenuScene, GameScene, GameOverScene],  // Scene order (MenuScene loads first)
  backgroundColor: '#242424',  // Dark background color
  physics: {
    default: 'arcade',   // Simple physics for basic movement and collisions
    arcade: {
      gravity: { x: 0, y: 0 }, // No gravity by default
      debug: process.env.NODE_ENV !== 'production'  // Enable in development to see physics bodies and velocities
    }
  }
};

// Initialize the game with our configuration
export const game = new Phaser.Game(config);
