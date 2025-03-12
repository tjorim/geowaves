import Phaser from 'phaser';

/**
 * Main menu scene that serves as the entry point for the game
 */
export class MenuScene extends Phaser.Scene {
  constructor() { super('MenuScene'); }

  /**
   * Create the menu elements including title and start button
   */
  create() {
    // Game title
    this.add.text(400, 200, 'GeoWaves: The Heat is On!', {
      fontSize: '32px', color: '#ffffff'
    }).setOrigin(0.5);

    // Start game button with interactive event
    const startBtn = this.add.text(400, 300, 'Start Project', {
      backgroundColor: '#000',
      padding: { left: 10, right: 10, top: 10, bottom: 10 }
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Transition to game scene when button is clicked
    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
  }
}
