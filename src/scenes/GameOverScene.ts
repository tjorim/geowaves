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
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    
    // Calculate positions based on screen size
    const titleY = isMobile ? gameHeight * 0.3 : gameHeight * 0.4;
    const messageY = titleY + (isMobile ? 80 : 100);
    const buttonY = messageY + (isMobile ? 100 : 120);
    
    const { outcome, reason } = data;
    const title = outcome === 'win' ? 'Success!' : 'Project Failed';
    const color = outcome === 'win' ? '#0f0' : '#f00';
    
    // Title with responsive positioning
    this.add.text(gameWidth / 2, titleY, title, { 
      fontSize: isMobile ? '28px' : '32px', 
      color 
    }).setOrigin(0.5);
    
    // Message text with responsive wrapping
    if (outcome === 'win') {
      this.add.text(gameWidth / 2, messageY, 'Your geothermal plant is up and running.', { 
        fontSize: isMobile ? '14px' : '16px', 
        color: '#fff',
        align: 'center',
        wordWrap: { width: gameWidth * 0.8 }
      }).setOrigin(0.5);
    } else {
      // Show reason for failure if provided
      this.add.text(gameWidth / 2, messageY, reason || 'The project was shut down.', { 
        fontSize: isMobile ? '14px' : '16px', 
        color: '#fff', 
        align: 'center',
        wordWrap: { width: gameWidth * 0.8 } 
      }).setOrigin(0.5);
    }
    
    // Return to menu button with improved styling
    const menuButton = this.add.text(gameWidth / 2, buttonY, 'Return to Main Menu', { 
      fontSize: isMobile ? '16px' : '18px', 
      backgroundColor: '#333',
      color: '#fff',
      padding: { left: 15, right: 15, top: 10, bottom: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
      
    // Add hover effects for better UX
    menuButton.on('pointerover', () => {
      menuButton.setStyle({ backgroundColor: '#555' });
    });
    
    menuButton.on('pointerout', () => {
      menuButton.setStyle({ backgroundColor: '#333' });
    });
    
    menuButton.on('pointerdown', () => this.scene.start('MenuScene'));
    
    // Add resize listener for responsive layout
    this.scale.on('resize', this.handleResize, this);
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    // Re-create the scene on resize
    this.scene.restart();
  }
}