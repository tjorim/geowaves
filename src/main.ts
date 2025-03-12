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
  width: 800,            // Base game width in pixels
  height: 600,           // Base game height in pixels
  scene: [MenuScene, GameScene, GameOverScene],  // Scene order (MenuScene loads first)
  backgroundColor: '#242424',  // Dark background color
  parent: 'game-container', // Use the div from our HTML
  scale: {
    mode: Phaser.Scale.RESIZE, // Use RESIZE mode to fill screen
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game in both dimensions
    width: '100%',
    height: '100%',
    min: {
      width: 320,
      height: 480
    },
    max: {
      width: 2560,
      height: 1440
    }
  },
  dom: {
    createContainer: true // Add DOM support for better UI integration
  },
  physics: {
    default: 'arcade',   // Simple physics for basic movement and collisions
    arcade: {
      gravity: { x: 0, y: 0 }, // No gravity by default
      debug: process.env.NODE_ENV !== 'production'  // Enable in development to see physics bodies and velocities
    }
  },
  input: {
    activePointers: 3, // Support for multi-touch
  }
};

// Initialize the game with our configuration
export const game = new Phaser.Game(config);
