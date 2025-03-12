import Phaser from 'phaser';

/**
 * Scene that displays game outcome and allows returning to menu
 */
export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  
  /**
   * Create the game over scene elements
   * @param data Parameters containing outcome and failure reason if applicable
   */
  create(data: { outcome: 'win' | 'lose', reason?: string }) {
    const { outcome, reason } = data;
    const title = outcome === 'win' ? 'Success!' : 'Project Failed';
    const color = outcome === 'win' ? '#0f0' : '#f00';
    this.add.text(400, 200, title, { fontSize: '32px', color }).setOrigin(0.5);
    
    if (outcome === 'win') {
      this.add.text(400, 300, 'Your geothermal plant is up and running.', { fontSize: '16px', color: '#fff' }).setOrigin(0.5);
    } else {
      // Show reason for failure if provided
      this.add.text(400, 300, reason || 'The project was shut down.', { fontSize: '16px', color: '#fff', wordWrap: { width: 600 } }).setOrigin(0.5);
    }
    
    this.add.text(400, 400, 'Click to return to Main Menu', { fontSize: '14px', color: '#aaa' }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('MenuScene'));
  }
}