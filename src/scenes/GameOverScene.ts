import Phaser from 'phaser';

/**
 * Scene that displays game outcome and allows returning to menu
 */
export class GameOverScene extends Phaser.Scene {
  constructor() { super('GameOverScene'); }
  
  /**
   * Create the game over scene elements
   * @param data Parameters containing enhanced outcome data and score
   */
  create(data: { 
    outcome: string, 
    title?: string,
    description?: string,
    rating?: string,
    score?: number,
    scorePercent?: number,
    scoreBreakdown?: {
      research: number,
      opinion: number,
      risk: number,
      money: number,
      time: number,
      bonus: number
    }
  }) {
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    
    // Calculate positions based on screen size
    const titleY = isMobile ? gameHeight * 0.15 : gameHeight * 0.2;
    const subtitleY = titleY + (isMobile ? 50 : 60);
    const messageY = subtitleY + (isMobile ? 80 : 100);
    const scoreY = messageY + (isMobile ? 80 : 100);
    const buttonY = scoreY + (isMobile ? 140 : 180);
    
    // Default values for backwards compatibility
    const { 
      outcome, 
      title = outcome === 'win' ? 'Success!' : 'Project Failed',
      description = outcome === 'win' ? 'Your geothermal project is complete.' : 'The project was shut down.',
      rating = outcome === 'win' ? 'Success' : 'Failure',
      score = 0,
      scorePercent = 0,
      scoreBreakdown = null
    } = data;
    
    // Determine colors based on outcome type
    let mainColor;
    switch (outcome) {
      case 'win':
        mainColor = '#00dd00'; // Bright green
        break;
      case 'partial':
        mainColor = '#dddd00'; // Yellow
        break;
      case 'lose':
        mainColor = '#dd0000'; // Red
        break;
      default:
        mainColor = '#ffffff'; // White
    }
    
    // Background panel
    const bgWidth = Math.min(600, gameWidth * 0.9);
    const bgHeight = gameHeight * 0.7;
    const bgX = gameWidth / 2 - bgWidth / 2;
    const bgY = gameHeight / 2 - bgHeight / 2;
    
    // Add semi-transparent panel background
    this.add.rectangle(bgX, bgY, bgWidth, bgHeight, 0x222222, 0.8)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x444444);
    
    // Header with outcome title
    this.add.text(gameWidth / 2, titleY, title, { 
      fontSize: isMobile ? '28px' : '36px', 
      fontStyle: 'bold',
      color: mainColor,
      align: 'center',
      wordWrap: { width: bgWidth * 0.9 }
    }).setOrigin(0.5);
    
    // Rating/grade display
    const ratingText = this.add.text(gameWidth / 2, subtitleY, `Rating: ${rating}`, { 
      fontSize: isMobile ? '22px' : '28px', 
      color: '#ffffff',
      align: 'center'
    }).setOrigin(0.5);
    
    // Add highlight box around rating
    const ratingBounds = ratingText.getBounds();
    this.add.rectangle(
      ratingBounds.centerX, 
      ratingBounds.centerY, 
      ratingBounds.width + 20, 
      ratingBounds.height + 10, 
      0x333333
    ).setStrokeStyle(2, 0x666666).setDepth(-1);
    
    // Detailed outcome description 
    this.add.text(gameWidth / 2, messageY, description, { 
      fontSize: isMobile ? '16px' : '18px', 
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: bgWidth * 0.85 }
    }).setOrigin(0.5);
    
    // Score display section
    if (scoreBreakdown) {
      // Create score summary
      this.createScoreBreakdown(
        gameWidth / 2, 
        scoreY, 
        scoreBreakdown, 
        score, 
        scorePercent,
        isMobile
      );
    }
    
    // Play again button
    const playAgainButton = this.add.text(gameWidth / 2 - (isMobile ? 0 : 100), buttonY, 'Play Again', { 
      fontSize: isMobile ? '18px' : '20px', 
      backgroundColor: '#335533',
      color: '#ffffff',
      padding: { left: 15, right: 15, top: 10, bottom: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    
    // Return to menu button
    const menuButton = this.add.text(gameWidth / 2 + (isMobile ? 0 : 100), isMobile ? buttonY + 50 : buttonY, 'Main Menu', { 
      fontSize: isMobile ? '18px' : '20px', 
      backgroundColor: '#333355',
      color: '#ffffff',
      padding: { left: 15, right: 15, top: 10, bottom: 10 }
    }).setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
      
    // Add hover effects for buttons
    this.applyButtonHoverEffects(playAgainButton, '#335533', '#447744');
    this.applyButtonHoverEffects(menuButton, '#333355', '#444466');
    
    // Button click handlers
    playAgainButton.on('pointerdown', () => {
      // Animation feedback
      this.tweens.add({
        targets: playAgainButton,
        scale: { from: 0.95, to: 1 },
        duration: 200,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Restart the game scene
          this.scene.start('GameScene');
        }
      });
    });
    
    menuButton.on('pointerdown', () => {
      // Animation feedback
      this.tweens.add({
        targets: menuButton,
        scale: { from: 0.95, to: 1 },
        duration: 200,
        ease: 'Back.easeOut',
        onComplete: () => {
          // Return to menu
          this.scene.start('MenuScene');
        }
      });
    });
    
    // Add resize listener for responsive layout
    this.scale.on('resize', this.handleResize, this);
  }
  
  /**
   * Apply hover effects to a button element
   * @param button The button text object
   * @param defaultColor The button's default background color
   * @param hoverColor The button's hover background color
   */
  private applyButtonHoverEffects(
    button: Phaser.GameObjects.Text, 
    defaultColor: string, 
    hoverColor: string
  ) {
    button.on('pointerover', () => {
      button.setStyle({ backgroundColor: hoverColor });
      this.tweens.add({
        targets: button,
        y: '-=3',
        duration: 100,
        ease: 'Sine.easeOut'
      });
    });
    
    button.on('pointerout', () => {
      button.setStyle({ backgroundColor: defaultColor });
      this.tweens.add({
        targets: button,
        y: '+=3',
        duration: 100,
        ease: 'Sine.easeOut'
      });
    });
  }
  
  /**
   * Create score breakdown visualization
   */
  private createScoreBreakdown(
    x: number, 
    y: number, 
    scoreBreakdown: { 
      research: number, 
      opinion: number, 
      risk: number, 
      money: number, 
      time: number, 
      bonus: number 
    }, 
    totalScore: number, 
    scorePercent: number, 
    isMobile: boolean
  ) {
    const { research, opinion, risk, money, time, bonus } = scoreBreakdown;
    
    // Score header
    this.add.text(x, y - (isMobile ? 40 : 50), `FINAL SCORE: ${totalScore} (${scorePercent}%)`, {
      fontSize: isMobile ? '18px' : '24px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5);
    
    // Box dimensions
    const boxWidth = isMobile ? 260 : 350;
    const boxHeight = isMobile ? 160 : 180;
    const boxX = x - boxWidth / 2;
    const boxY = y - boxHeight / 2 + (isMobile ? 10 : 15);
    
    // Background box
    this.add.rectangle(boxX, boxY, boxWidth, boxHeight, 0x333333, 0.7)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x555555);
    
    // Column spacing
    const colWidth = boxWidth / 2;
    const rowHeight = isMobile ? 22 : 26;
    const fontSize = isMobile ? '12px' : '14px';
    
    // Row 1: Research and Opinion
    this.createScoreRow(boxX, boxY + rowHeight, 'Research:', research, 100, 'green', colWidth, fontSize);
    this.createScoreRow(boxX + colWidth, boxY + rowHeight, 'Opinion:', opinion, 50, 'yellow', colWidth, fontSize);
    
    // Row 2: Risk and Money Management
    this.createScoreRow(boxX, boxY + rowHeight * 2.5, 'Safety:', risk, 30, 'blue', colWidth, fontSize);
    this.createScoreRow(boxX + colWidth, boxY + rowHeight * 2.5, 'Economy:', money, 30, 'orange', colWidth, fontSize);
    
    // Row 3: Time and Bonuses
    this.createScoreRow(boxX, boxY + rowHeight * 4, 'Efficiency:', time, 20, 'purple', colWidth, fontSize);
    this.createScoreRow(boxX + colWidth, boxY + rowHeight * 4, 'Bonus:', bonus, 25, 'cyan', colWidth, fontSize);
    
    // Total with progress bar
    const barY = boxY + rowHeight * 5.5;
    this.add.text(boxX + 10, barY, 'TOTAL:', {
      fontSize: fontSize,
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0, 0.5);
    
    // Total bar background
    const barWidth = boxWidth - 80;
    const barHeight = isMobile ? 12 : 16;
    this.add.rectangle(boxX + 70, barY, barWidth, barHeight, 0x222222)
      .setOrigin(0, 0.5)
      .setStrokeStyle(1, 0x444444);
    
    // Total bar fill using percentage
    const fillWidth = (scorePercent / 100) * barWidth;
    this.add.rectangle(boxX + 70, barY, fillWidth, barHeight, 0x00aaff)
      .setOrigin(0, 0.5);
      
    // Score percentage at the end of the bar
    this.add.text(boxX + 70 + barWidth + 10, barY, `${scorePercent}%`, {
      fontSize: fontSize,
      color: '#ffffff'
    }).setOrigin(0, 0.5);
  }
  
  /**
   * Create a single score row with label, value, and small bar
   */
  private createScoreRow(
    x: number, 
    y: number, 
    label: string, 
    value: number, 
    maxValue: number, 
    color: string, 
    width: number, 
    fontSize: string
  ) {
    // Map color strings to hex values
    const colorMap: {[key: string]: number} = {
      green: 0x00ff00,
      yellow: 0xffff00,
      blue: 0x0088ff,
      orange: 0xff8800,
      purple: 0xaa66ff, 
      cyan: 0x00ffff
    };
    
    const barWidth = width - 100;
    const barHeight = 8;
    
    // Label
    this.add.text(x + 10, y, label, {
      fontSize: fontSize,
      color: '#dddddd'
    }).setOrigin(0, 0.5);
    
    // Small bar background
    this.add.rectangle(x + 70, y, barWidth, barHeight, 0x222222)
      .setOrigin(0, 0.5);
    
    // Small bar fill
    const fillWidth = (value / maxValue) * barWidth;
    this.add.rectangle(x + 70, y, fillWidth, barHeight, colorMap[color] || 0xffffff)
      .setOrigin(0, 0.5);
    
    // Value
    this.add.text(x + 75 + barWidth, y, `${value}/${maxValue}`, {
      fontSize: fontSize,
      color: '#ffffff'
    }).setOrigin(0, 0.5);
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    // Re-create the scene on resize
    this.scene.restart();
  }
}