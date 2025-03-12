import Phaser from 'phaser';

/**
 * A reusable button component for consistent UI styling
 */
export class Button extends Phaser.GameObjects.Container {
  private text: Phaser.GameObjects.Text;
  private background: Phaser.GameObjects.Rectangle;
  private callback: () => void;
  private originalY: number;
  private isHovering: boolean = false;
  
  /**
   * Create a new button
   * @param scene The Phaser scene to add this button to
   * @param x X position of the button
   * @param y Y position of the button
   * @param text Text to display on the button
   * @param callback Function to call when the button is clicked
   * @param style Style options for the button
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    callback: () => void,
    style: {
      width?: number,
      height?: number,
      fontSize?: string,
      fontStyle?: string,
      backgroundColor?: number,
      backgroundAlpha?: number,
      textColor?: string,
      padding?: { left: number, right: number, top: number, bottom: number },
      isOption?: boolean
    } = {}
  ) {
    super(scene, x, y);
    
    this.originalY = y;
    this.callback = callback;
    
    // Detect if on mobile device for appropriate sizing
    const gameWidth = this.scene.scale.width;
    const isMobile = gameWidth < 768;
    
    // Set default values with mobile-friendly sizes
    const {
      width = 150,
      height = 40,
      fontSize = isMobile ? '24px' : '16px',
      fontStyle = 'bold',
      backgroundColor = 0x444444,
      backgroundAlpha = 1,
      textColor = '#ffffff',
      padding = { left: 20, right: 20, top: 15, bottom: 15 },
      isOption = false
    } = style;
    
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
    
    // Mark as option if needed (for cleanup)
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
    const pressColor = 0x555555; // Darker color when pressed
    this.background.setFillStyle(pressColor);
    
    // Add a flash effect for visual feedback
    this.scene.tweens.add({
      targets: this.background,
      alpha: { from: 0.8, to: 1 },
      duration: 100,
      yoyo: false,
      ease: 'Cubic.easeOut'
    });
    
    // Add a very slight rotation for tactile feel (subtle)
    this.scene.tweens.add({
      targets: this,
      angle: { from: 0, to: -1 },
      duration: 50,
      yoyo: true,
      ease: 'Sine.easeOut'
    });
  }
  
  /**
   * Handle pointer up event
   */
  private handlePointerUp() {
    // Reset scale with animation for smoother feel
    this.scene.tweens.add({
      targets: [this.background, this.text],
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    // Reset rotation
    this.setAngle(0);
    
    // Call the callback with a slight delay to allow visual feedback to be noticed
    this.scene.time.delayedCall(50, () => {
      this.callback();
      
      // Update hover state after callback (in case the button is destroyed)
      if (this.isHovering) {
        // Re-apply hover effect visually
        this.background.setFillStyle(0x666666);
      } else {
        // Reset to default color
        this.background.setFillStyle(0x444444);
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
    this.scene.tweens.add({
      targets: ripple,
      scale: 2.5,
      alpha: 0,
      duration: 400,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        ripple.destroy(); // Clean up when done
      }
    });
  }
  
  /**
   * Handle pointer over event
   */
  private handlePointerOver() {
    this.isHovering = true;
    
    // Highlight effect on hover
    this.background.setFillStyle(0x666666);
    
    // Only animate if not already at hover position
    if (this.y !== this.originalY - 2) {
      // Start hover animation
      this.scene.tweens.add({
        targets: this,
        y: this.originalY - 2,
        duration: 100,
        ease: 'Power1'
      });
    }
  }
  
  /**
   * Handle pointer out event
   */
  private handlePointerOut() {
    this.isHovering = false;
    
    // Reset background color
    this.background.setFillStyle(0x444444);
    
    // Only animate if not already at original position
    if (this.y !== this.originalY) {
      // Reset position
      this.scene.tweens.add({
        targets: this,
        y: this.originalY,
        duration: 100,
        ease: 'Power1'
      });
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
}