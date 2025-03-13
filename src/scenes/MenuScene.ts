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
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;

    // Calculate positions based on screen size
    const titleY = isMobile ? gameHeight * 0.3 : gameHeight * 0.4;
    const buttonY = titleY + (isMobile ? 100 : 120);
    
    // Game title - centered and responsive size
    this.add.text(gameWidth / 2, titleY, 'GeoWaves: The Heat is On!', {
      fontSize: isMobile ? '24px' : '32px', 
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: gameWidth * 0.8 }
    }).setOrigin(0.5);

    // Start game button with interactive event
    const startBtn = this.add.text(gameWidth / 2, buttonY, 'Start Project', {
      backgroundColor: '#3d4',
      color: '#000',
      padding: { left: 15, right: 15, top: 15, bottom: 15 },
      fontSize: isMobile ? '20px' : '24px'
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    // Add hover effects for better UX
    startBtn.on('pointerover', () => {
      startBtn.setStyle({ backgroundColor: '#5f6' });
    });
    
    startBtn.on('pointerout', () => {
      startBtn.setStyle({ backgroundColor: '#3d4' });
    });

    // Transition to game scene when button is clicked
    startBtn.on('pointerdown', () => {
      this.scene.start('GameScene');
    });
    
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
