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
  
  // Base dimensions used for internal calculations and positioning
  // These are NOT the final display size - the game will scale responsively
  // to fill the available screen space (see scale settings below)
  width: 800,            // Base coordinate system width
  height: 600,           // Base coordinate system height
  
  scene: [MenuScene, GameScene, GameOverScene],  // Scene order (MenuScene loads first)
  backgroundColor: '#242424',  // Dark background color
  parent: 'game-container', // Use the div from our HTML
  scale: {
    // Responsive scaling configuration
    mode: Phaser.Scale.RESIZE,          // Dynamically resize as the browser window changes
    autoCenter: Phaser.Scale.CENTER_BOTH, // Center the game canvas in the window
    
    // These override the base dimensions above for the display size
    width: '100%',                      // Fill the container width
    height: '100%',                     // Fill the container height
    
    // Set sensible boundaries for the game's scaling
    min: {
      width: 320,                       // Minimum width (mobile phones)
      height: 480                       // Minimum height (mobile phones)
    },
    max: {
      width: 2560,                      // Maximum width (high-res displays)
      height: 1440                      // Maximum height (high-res displays)
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
