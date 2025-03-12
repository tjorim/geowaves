import Phaser from 'phaser';

/**
 * Interface for action option data (for research or community actions)
 */
export interface ActionData {
  id: string;
  name: { [key: string]: string };
  description: { [key: string]: string };
  cost: number;
  timeRequired: number;
  effects: { 
    seismicRisk: number; 
    publicOpinion: number; 
    knowledge: number; // Now required in all actions (will be 0 if no effect)
    money: number;
  };
}

/**
 * A reusable component for displaying action options with descriptions
 */
export class ActionOption extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private descriptionText: Phaser.GameObjects.Text;
  private costText: Phaser.GameObjects.Text;
  private callback: () => void;
  
  /**
   * Create a new action option
   * @param scene The Phaser scene to add this component to
   * @param x X position of the component
   * @param y Y position of the component
   * @param action The action data to display
   * @param callback Function to call when the action is selected
   * @param isHorizontal Whether to display horizontally (description beside) or vertically (description below)
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    action: ActionData,
    callback: () => void,
    isHorizontal: boolean = true
  ) {
    super(scene, x, y);
    
    this.callback = callback;
    
    // Detect if on mobile device for appropriate sizing
    const gameWidth = this.scene.scale.width;
    const isMobile = gameWidth < 768;
    
    // Calculate sizes based on layout and screen size
    const maxWidth = gameWidth * 0.8;  // Ensure button doesn't exceed 80% of screen width
    const buttonWidth = isMobile ? 
      (isHorizontal ? Math.min(150, gameWidth * 0.3) : Math.min(250, Math.min(gameWidth * 0.7, maxWidth - 40))) : 
      180;
    const buttonHeight = 60;
    const padding = 10;
    
    // Create button background
    this.background = scene.add.rectangle(
      0,
      0,
      buttonWidth,
      buttonHeight,
      0x666666,
      1
    ).setOrigin(0, 0);
    
    // Create title text
    this.titleText = scene.add.text(
      padding,
      padding,
      action.name.en,
      {
        fontSize: isMobile ? '20px' : '16px',
        fontStyle: 'bold',
        color: '#ffffff',
        wordWrap: { width: buttonWidth - (padding * 2) }
      }
    ).setOrigin(0, 0);
    
    // Get formatted cost text
    const costString = `Cost: $${action.cost}, Time: ${action.timeRequired} turns`;
    
    // Create cost text
    this.costText = scene.add.text(
      padding,
      buttonHeight - padding - 14,
      costString,
      {
        fontSize: isMobile ? '14px' : '12px',
        color: '#cccccc'
      }
    ).setOrigin(0, 1);
    
    // Create description text - positioned based on layout
    const descX = isHorizontal ? buttonWidth + padding : padding;
    const descY = isHorizontal ? 0 : buttonHeight + padding;
    const descWidth = isHorizontal ? 
      (isMobile ? Math.min(gameWidth * 0.4, Math.min(200, gameWidth - buttonWidth - padding * 3)) : 300) : 
      buttonWidth;
    
    // Format description text
    let descriptionContent = action.description.en;
    
    // Add effect descriptions
    if (action.effects) {
      const effects = [];
      
      // Only show non-zero effects for cleaner display
      if (action.effects.seismicRisk !== 0) {
        effects.push(`Risk: ${action.effects.seismicRisk > 0 ? '+' : ''}${action.effects.seismicRisk}`);
      }
      
      if (action.effects.publicOpinion !== 0) {
        effects.push(`Opinion: ${action.effects.publicOpinion > 0 ? '+' : ''}${action.effects.publicOpinion}`);
      }
      
      if (action.effects.knowledge !== 0) { // Now show knowledge only if non-zero
        effects.push(`Knowledge: ${action.effects.knowledge > 0 ? '+' : ''}${action.effects.knowledge}`);
      }
      
      // Only show money effect if it's not just the negative of the cost and non-zero
      if (action.effects.money !== 0 && action.effects.money !== -action.cost) {
        effects.push(`Money: ${action.effects.money > 0 ? '+' : ''}${action.effects.money}`);
      }
      
      if (effects.length > 0) {
        descriptionContent = `Effects: ${effects.join(', ')}\n${descriptionContent}`;
      }
    }
    
    this.descriptionText = scene.add.text(
      descX,
      descY,
      descriptionContent,
      {
        fontSize: isMobile ? '16px' : '12px',
        color: '#cccccc',
        wordWrap: { width: descWidth },
        lineSpacing: isMobile ? 5 : 2
      }
    ).setOrigin(0, 0);
    
    // Add components to container
    this.add([this.background, this.titleText, this.costText, this.descriptionText]);
    
    // Add container to scene
    scene.add.existing(this);
    
    // Make interactive
    this.background.setInteractive({ useHandCursor: true })
      .on('pointerdown', this.handlePointerDown, this)
      .on('pointerup', this.handlePointerUp, this)
      .on('pointerover', this.handlePointerOver, this)
      .on('pointerout', this.handlePointerOut, this);
    
    // Mark for cleanup
    this.setData('isOption', true);
  }
  
  /**
   * Handle pointer down event
   */
  private handlePointerDown() {
    // Scale down slightly for press effect
    this.background.setScale(0.98);
    this.titleText.setScale(0.98);
    this.costText.setScale(0.98);
    
    // Darken background for press indication
    this.background.setFillStyle(0x555555);
    
    // Add a subtle flash/glow effect
    this.scene.tweens.add({
      targets: this.background,
      alpha: { from: 0.9, to: 1 },
      duration: 150,
      ease: 'Sine.easeOut'
    });
    
    // Slightly move descriptionText to give a "pressed" feel
    if (this.descriptionText) {
      this.scene.tweens.add({
        targets: this.descriptionText,
        y: '+=2',
        duration: 100,
        yoyo: true,
        ease: 'Sine.easeOut'
      });
    }
  }
  
  /**
   * Handle pointer up event
   */
  private handlePointerUp() {
    // Reset scale with animation
    this.scene.tweens.add({
      targets: [this.background, this.titleText, this.costText],
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    // Add highlight pulse on selection
    this.scene.tweens.add({
      targets: this.background,
      fillAlpha: { from: 1, to: 0.7 },
      yoyo: true,
      duration: 200,
      ease: 'Sine.easeInOut',
      onComplete: () => {
        // Restore proper hover state
        if (this.isHovering) {
          this.background.setFillStyle(0x888888);
        } else {
          this.background.setFillStyle(0x666666);
        }
      }
    });
    
    // Call the callback with a slight delay for better feedback
    this.scene.time.delayedCall(50, () => {
      this.callback();
    });
  }
  
  // Track hovering state
  private isHovering: boolean = false;
  
  /**
   * Handle pointer over event
   */
  private handlePointerOver() {
    this.isHovering = true;
    
    // Highlight effect on hover
    this.background.setFillStyle(0x888888);
    
    // Subtle rise animation
    this.scene.tweens.add({
      targets: this.background,
      y: '-=2',
      duration: 150,
      ease: 'Sine.easeOut'
    });
    
    // Subtle highlight for title text
    this.scene.tweens.add({
      targets: this.titleText,
      y: '-=2',
      duration: 150,
      ease: 'Sine.easeOut'
    });
  }
  
  /**
   * Handle pointer out event
   */
  private handlePointerOut() {
    this.isHovering = false;
    
    // Reset background color
    this.background.setFillStyle(0x666666);
    
    // Return to original position
    this.scene.tweens.add({
      targets: [this.background, this.titleText],
      y: '+=2',
      duration: 150,
      ease: 'Sine.easeOut'
    });
  }
  
  /**
   * Get the width of this component including description
   */
  public getTotalWidth(): number {
    return Math.max(
      this.background.width,
      this.background.width + this.descriptionText.width
    );
  }
  
  /**
   * Get the height of this component including description
   */
  public getTotalHeight(): number {
    return Math.max(
      this.background.height,
      this.background.height + this.descriptionText.height
    );
  }
}