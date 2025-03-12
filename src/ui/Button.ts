import Phaser from 'phaser';

/**
 * Button style interface for type safety
 */
export interface ButtonStyle {
  width?: number;
  height?: number;
  fontSize?: string;
  fontStyle?: string;
  backgroundColor?: number;
  backgroundAlpha?: number;
  textColor?: string;
  padding?: { left: number, right: number, top: number, bottom: number };
  isOption?: boolean;
}

/**
 * Standard button styles for consistent UI appearance
 */
export const BUTTON_STYLES = {
  // Default button style
  DEFAULT: {
    backgroundColor: 0x444444,
    backgroundAlpha: 1,
    textColor: '#ffffff',
    fontStyle: 'bold',
    padding: { left: 20, right: 20, top: 15, bottom: 15 }
  },
  
  // Primary action buttons
  PRIMARY: {
    backgroundColor: 0x4a7bab, // Blue shade
    backgroundAlpha: 1,
    textColor: '#ffffff',
    fontStyle: 'bold',
    padding: { left: 20, right: 20, top: 15, bottom: 15 }
  },
  
  // Secondary/cancel buttons
  SECONDARY: {
    backgroundColor: 0x333333, // Darker gray
    backgroundAlpha: 1,
    textColor: '#ffffff',
    fontStyle: 'bold',
    padding: { left: 20, right: 20, top: 10, bottom: 10 }
  },
  
  // Back buttons
  BACK: {
    backgroundColor: 0x333333,
    backgroundAlpha: 1,
    textColor: '#cccccc',
    fontStyle: 'bold',
    padding: { left: 20, right: 20, top: 10, bottom: 10 }
  },
  
  // Danger/warning buttons
  DANGER: {
    backgroundColor: 0xd32f2f, // Red shade
    backgroundAlpha: 1,
    textColor: '#ffffff',
    fontStyle: 'bold',
    padding: { left: 20, right: 20, top: 15, bottom: 15 }
  },
  
  // Success/confirm buttons
  SUCCESS: {
    backgroundColor: 0x388e3c, // Green shade
    backgroundAlpha: 1,
    textColor: '#ffffff',
    fontStyle: 'bold',
    padding: { left: 20, right: 20, top: 15, bottom: 15 }
  }
};

/**
 * A reusable button component for consistent UI styling
 */
export class Button extends Phaser.GameObjects.Container {
  // Color constants for button states
  private static readonly HOVER_COLOR = 0x666666;  // Lighter color for hover state
  private static readonly PRESS_COLOR = 0x555555;  // Darker color for pressed state
  
  private text: Phaser.GameObjects.Text;
  private background: Phaser.GameObjects.Rectangle;
  private callback: () => void;
  private originalY: number;
  private isHovering: boolean = false;
  private buttonColor: number; // Store the original button color
  
  // Track active tweens for cleanup
  private activeTweens: Phaser.Tweens.Tween[] = [];
  
  /**
   * Create a new button
   * @param scene The Phaser scene to add this button to
   * @param x X position of the button
   * @param y Y position of the button
   * @param text Text to display on the button
   * @param callback Function to call when the button is clicked
   * @param style Custom style options to override the preset (optional)
   * @param stylePreset Predefined style preset to use (DEFAULT, PRIMARY, SECONDARY, etc.)
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    style: ButtonStyle & { preset?: keyof typeof BUTTON_STYLES } = {}
  ) {
    super(scene, x, y);
    
    this.originalY = y;
    this.callback = callback;
    
    // Detect if on mobile device for appropriate sizing
    const gameWidth = this.scene.scale.width;
    const isMobile = gameWidth < 768;
    
    // Get the preset style if specified
    const presetKey = style.preset || 'DEFAULT';
    const presetStyle = BUTTON_STYLES[presetKey];
    
    // Merge preset with custom styles, with custom styles taking precedence
    // Set default values with mobile-friendly sizes
    const {
      width = 150,
      height = 40,
      fontSize = isMobile ? '24px' : '16px',
      fontStyle = presetStyle.fontStyle || 'bold',
      backgroundColor = presetStyle.backgroundColor || 0x444444,
      backgroundAlpha = presetStyle.backgroundAlpha || 1,
      textColor = presetStyle.textColor || '#ffffff',
      padding = presetStyle.padding || { left: 20, right: 20, top: 15, bottom: 15 },
      
      /**
       * Indicates if this button should be tagged for automatic cleanup
       * When true, the button will be marked with 'isOption' data tag
       * which allows GameScene to identify and destroy it during UI cleanup
       */
      isOption = false
    } = style;
    
    // Store the original button color for hover/press effects
    this.buttonColor = backgroundColor;
    
    // Create background rectangle
    this.background = scene.add.rectangle(
      0,
      0,
      width,
      height,
      backgroundColor,
      backgroundAlpha
    );
    
    // Create text
    this.text = scene.add.text(
      0,
      0,
      text,
      {
        fontSize,
        fontStyle,
        color: textColor,
        padding
      }
    ).setOrigin(0.5);
    
    // Adjust background to fit text if width not specified
    if (!style.width) {
      this.background.width = this.text.width + padding.left + padding.right;
    }
    if (!style.height) {
      this.background.height = this.text.height + padding.top + padding.bottom;
    }
    
    // Add components to container
    this.add([this.background, this.text]);
    
    // Add container to scene
    scene.add.existing(this);
    
    // Make interactive
    this.setSize(this.background.width, this.background.height);
    this.setInteractive({ useHandCursor: true })
      .on('pointerdown', this.handlePointerDown, this)
      .on('pointerup', this.handlePointerUp, this)
      .on('pointerover', this.handlePointerOver, this)
      .on('pointerout', this.handlePointerOut, this);
    
    /**
     * Mark as an option if needed (for systematic cleanup)
     * When isOption is true, this button will be tagged for automatic cleanup
     * by GameScene.cleanupGameObjectsByTag(). This is used for temporary UI elements
     * like menu buttons that should be removed when the player closes a menu
     * or transitions between game states.
     */
    if (isOption) {
      this.setData('isOption', true);
    }
  }
  
  /**
   * Handle pointer down event
   */
  private handlePointerDown() {
    // Scale down slightly for press effect
    this.background.setScale(0.95);
    this.text.setScale(0.95);
    
    // Change background color to give a stronger visual indication of press
    this.background.setFillStyle(Button.PRESS_COLOR);
    
    // Add a flash effect for visual feedback
    const flashTween = this.scene.tweens.add({
      targets: this.background,
      alpha: { from: 0.8, to: 1 },
      duration: 100,
      yoyo: false,
      ease: 'Cubic.easeOut'
    });
    this.activeTweens.push(flashTween);
    
    // Add a very slight rotation for tactile feel (subtle)
    const rotationTween = this.scene.tweens.add({
      targets: this,
      angle: { from: 0, to: -1 },
      duration: 50,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
    this.activeTweens.push(rotationTween);
  }
  
  /**
   * Handle pointer up event
   */
  private handlePointerUp() {
    // Reset scale with animation for smoother feel
    const scaleTween = this.scene.tweens.add({
      targets: [this.background, this.text],
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    this.activeTweens.push(scaleTween);
    
    // Reset rotation
    this.setAngle(0);
    
    // Call the callback with a slight delay to allow visual feedback to be noticed
    this.scene.time.delayedCall(50, () => {
      this.callback();
      
      // Update hover state after callback (in case the button is destroyed)
      if (this.isHovering) {
        // Re-apply hover effect visually
        this.background.setFillStyle(Button.HOVER_COLOR);
      } else {
        // Reset to original color
        this.background.setFillStyle(this.buttonColor);
      }
    });
    
    // Create a ripple effect from the center
    this.createRippleEffect();
  }
  
  /**
   * Creates a ripple effect emanating from the button center
   */
  private createRippleEffect() {
    // Create a circle for the ripple
    const ripple = this.scene.add.circle(
      0, 0, // Centered in the button coordinate space
      Math.max(this.background.width, this.background.height) * 0.3, // Size based on button
      0xffffff, // White ripple
      0.4 // Semi-transparent
    );
    
    // Add ripple to this container
    this.add(ripple);
    
    // Animate the ripple growing and fading
    const rippleTween = this.scene.tweens.add({
      targets: ripple,
      scale: 2.5,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        ripple.destroy(); // Clean up when done
        
        // Remove from active tweens array
        const index = this.activeTweens.indexOf(rippleTween);
        if (index !== -1) {
          this.activeTweens.splice(index, 1);
        }
      }
    });
    this.activeTweens.push(rippleTween);
  }
  
  /**
   * Handle pointer over event
   */
  private handlePointerOver() {
    this.isHovering = true;
    
    // Highlight effect on hover
    this.background.setFillStyle(Button.HOVER_COLOR);
    
    // Only animate if not already at hover position
    if (this.y !== this.originalY - 2) {
      // Start hover animation
      const hoverTween = this.scene.tweens.add({
        targets: this,
        y: this.originalY - 2,
        duration: 100,
        ease: 'Power1'
      });
      this.activeTweens.push(hoverTween);
    }
  }
  
  /**
   * Handle pointer out event
   */
  private handlePointerOut() {
    this.isHovering = false;
    
    // Reset background color to original
    this.background.setFillStyle(this.buttonColor);
    
    // Only animate if not already at original position
    if (this.y !== this.originalY) {
      // Reset position
      const resetTween = this.scene.tweens.add({
        targets: this,
        y: this.originalY,
        duration: 100,
        ease: 'Power1'
      });
      this.activeTweens.push(resetTween);
    }
  }
  
  /**
   * Set the button text
   * @param newText New text for the button
   */
  public setText(newText: string) {
    this.text.setText(newText);
  }
  
  /**
   * Change the button callback
   * @param newCallback New function to call when the button is clicked
   */
  public setCallback(newCallback: () => void) {
    this.callback = newCallback;
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