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
  
  // Track hovering state
  private isHovering: boolean = false;
  
  // Track active tweens for cleanup
  private activeTweens: Phaser.Tweens.Tween[] = [];
  
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
    
    // Calculate the interactive area size to encompass all content
    const totalWidth = this.getTotalWidth();
    const totalHeight = this.getTotalHeight();
    
    // Make entire container interactive instead of just the background
    // This allows users to click anywhere on the option (including text)
    this.setSize(totalWidth, totalHeight);
    this.setInteractive({ useHandCursor: true })
      .on('pointerdown', this.handlePointerDown, this)
      .on('pointerup', this.handlePointerUp, this)
      .on('pointerover', this.handlePointerOver, this)
      .on('pointerout', this.handlePointerOut, this);
    
    /**
     * Mark this component with 'isOption' tag for systematic cleanup
     * This tag is used by GameScene.cleanupGameObjectsByTag() to identify
     * temporary UI elements that should be destroyed when clearing the UI,
     * such as when closing option menus or transitioning between game states
     */
    this.setData('isOption', true);
  }
  
  /**
   * Handle pointer down event
   */
  private handlePointerDown() {
    // Create an array of elements to apply scale effect
    const scaleTargets = [this.background, this.titleText, this.costText];
    
    // Scale down slightly for press effect
    scaleTargets.forEach(element => element.setScale(0.98));
    
    // Darken background for press indication
    this.background.setFillStyle(0x555555);
    
    // Add a subtle flash/glow effect to the whole container
    const flashTween = this.scene.tweens.add({
      targets: this.background,
      alpha: { from: 0.9, to: 1 },
      duration: 150,
      ease: 'Sine.easeOut'
    });
    this.activeTweens.push(flashTween);
    
    // Apply effects to all text elements for consistent feedback
    const textElements = [this.titleText, this.costText];
    if (this.descriptionText) {
      textElements.push(this.descriptionText);
    }
    
    // Make text appear pressed by darkening slightly
    textElements.forEach(text => {
      text.setStyle({ color: '#dddddd' });
    });
    
    // Slightly move entire container to give a "pressed" feel
    const pressTween = this.scene.tweens.add({
      targets: this, // Apply to container for consistent movement
      y: '+=2',
      duration: 100,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
    this.activeTweens.push(pressTween);
  }
  
  /**
   * Handle pointer up event
   */
  private handlePointerUp() {
    // Create an array of all elements
    const allElements = [this.background, this.titleText, this.costText];
    if (this.descriptionText) {
      allElements.push(this.descriptionText);
    }
    
    // Reset scale with animation
    const scaleTween = this.scene.tweens.add({
      targets: allElements,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    this.activeTweens.push(scaleTween);
    
    // Add highlight pulse on selection for better feedback
    const pulseTween = this.scene.tweens.add({
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
        
        // Reset text colors based on hover state
        const textColor = this.isHovering ? '#ffffff' : '#ffffff';
        const descColor = this.isHovering ? '#dddddd' : '#cccccc';
        
        this.titleText.setStyle({ color: textColor });
        this.costText.setStyle({ color: descColor });
        if (this.descriptionText) {
          this.descriptionText.setStyle({ color: descColor });
        }
      }
    });
    this.activeTweens.push(pulseTween);
    
    // Call the callback with a slight delay for better feedback
    this.scene.time.delayedCall(50, () => {
      this.callback();
    });
  }
  
  /**
   * Handle pointer over event
   */
  private handlePointerOver() {
    this.isHovering = true;
    
    // Highlight effect on hover
    this.background.setFillStyle(0x888888);
    
    // Create targets array with all relevant elements
    const riseTargets = [this.background, this.titleText, this.costText];
    
    // Add description text to animation if it exists
    if (this.descriptionText) {
      riseTargets.push(this.descriptionText);
    }
    
    // Subtle rise animation for the entire option
    this.scene.tweens.add({
      targets: riseTargets,
      y: '-=2',
      duration: 150,
      ease: 'Sine.easeOut'
    });
    
    // Track the tween for cleanup
    const tween = this.scene.tweens.add({
      targets: this.titleText,
      alpha: 1.0, // No actual change, just to track the tween
      duration: 150,
      onComplete: () => {
        // Slightly brighten text on hover for better feedback
        this.titleText.setStyle({ color: '#ffffff' });
        if (this.descriptionText) {
          this.descriptionText.setStyle({ color: '#dddddd' });
        }
      }
    });
    
    // Add to active tweens for proper cleanup
    this.activeTweens.push(tween);
  }
  
  /**
   * Handle pointer out event
   */
  private handlePointerOut() {
    this.isHovering = false;
    
    // Reset background color
    this.background.setFillStyle(0x666666);
    
    // Create targets array with all elements
    const fallTargets = [this.background, this.titleText, this.costText];
    
    // Add description text to animation if it exists
    if (this.descriptionText) {
      fallTargets.push(this.descriptionText);
    }
    
    // Return to original position
    this.scene.tweens.add({
      targets: fallTargets,
      y: '+=2',
      duration: 150,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // Reset text colors
        this.titleText.setStyle({ color: '#ffffff' });
        if (this.descriptionText) {
          this.descriptionText.setStyle({ color: '#cccccc' });
        }
      }
    });
  }
  
  /**
   * Get the width of this component including description
   * This ensures the interactive area covers all content
   */
  public getTotalWidth(): number {
    const buttonWidth = this.background.width;
    
    // For horizontal layout, add description width if present
    if (this.descriptionText && this.descriptionText.x > 0) {
      // Get actual rendered width for wrapped text for more accurate calculation
      const actualTextWidth = this.descriptionText.width;
      const textStyle = this.descriptionText.style;
      const wrappedWidth = textStyle.wordWrapWidth || actualTextWidth;
      
      // Use the smaller of actual width or wrap width to prevent overflow issues
      const safeTextWidth = Math.min(actualTextWidth, wrappedWidth);
      
      return buttonWidth + safeTextWidth + 20; // Add extra padding to account for word wrap variations
    }
    
    // For vertical layout or no description, use the maximum width
    return Math.max(
      buttonWidth,
      this.descriptionText ? this.descriptionText.width : 0
    );
  }
  
  /**
   * Get the height of this component including description
   * This ensures the interactive area covers all content
   */
  public getTotalHeight(): number {
    const buttonHeight = this.background.height;
    
    // For vertical layout, add description height if present
    if (this.descriptionText && this.descriptionText.y > buttonHeight) {
      // Get actual rendered height accounting for word wrap
      const actualTextHeight = this.descriptionText.height;
      
      // Add extra padding to account for potential rendering variations
      return buttonHeight + actualTextHeight + 15;
    }
    
    // For horizontal layout, use the larger of button height or description height
    if (this.descriptionText && this.descriptionText.x > 0) {
      return Math.max(
        buttonHeight,
        this.descriptionText.height + 5 // Add small padding for horizontal layout
      );
    }
    
    // For no description, use button height
    return buttonHeight;
  }
  
  /**
   * Override destroy to ensure proper cleanup of event listeners and tweens
   * @param fromScene Whether the destruction comes from a scene shutdown
   */
  public destroy(fromScene?: boolean): void {
    // Stop all active tweens
    this.activeTweens.forEach(tween => {
      if (tween.isPlaying()) {
        tween.stop();
      }
    });
    this.activeTweens = [];
    
    // Remove event listeners
    if (this.background) {
      this.background.removeAllListeners();
    }
    
    // Call parent destroy method
    super.destroy(fromScene);
  }
}