import Phaser from 'phaser';

/**
 * A reusable panel for displaying information with a title and content
 */
export class InfoPanel extends Phaser.GameObjects.Container {
  private background: Phaser.GameObjects.Rectangle;
  private titleText: Phaser.GameObjects.Text;
  private contentText: Phaser.GameObjects.Text;
  private closeButton?: Phaser.GameObjects.Text;
  
  /**
   * Create a new information panel
   * @param scene The Phaser scene to add this panel to
   * @param x X position of the panel
   * @param y Y position of the panel
   * @param width Width of the panel
   * @param height Height of the panel
   * @param title Title text to display at the top of the panel
   * @param content Content text to display in the panel
   * @param config Additional configuration options
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    title: string,
    content: string,
    config: {
      backgroundColor?: number,
      backgroundAlpha?: number,
      titleColor?: string,
      contentColor?: string,
      titleFontSize?: string,
      contentFontSize?: string,
      padding?: number,
      closable?: boolean,
      onClose?: () => void,
      isOption?: boolean
    } = {}
  ) {
    super(scene, x, y);
    
    // Detect if on mobile device for appropriate sizing
    const gameWidth = this.scene.scale.width;
    const isMobile = gameWidth < 768;
    
    // Set default values with mobile-friendly sizes
    const {
      backgroundColor = 0x222222,
      backgroundAlpha = 0.8,
      titleColor = '#ffffff',
      contentColor = '#cccccc',
      titleFontSize = isMobile ? '22px' : '18px',
      contentFontSize = isMobile ? '18px' : '14px',
      padding = 20,
      closable = false,
      onClose = () => this.destroy(),
      isOption = false
    } = config;
    
    // Create background
    this.background = scene.add.rectangle(
      0,
      0,
      width,
      height,
      backgroundColor,
      backgroundAlpha
    ).setOrigin(0.5);
    
    // Create title text
    this.titleText = scene.add.text(
      -width/2 + padding,
      -height/2 + padding,
      title,
      {
        fontSize: titleFontSize,
        fontStyle: 'bold',
        color: titleColor,
        wordWrap: { width: width - (padding * 2) }
      }
    ).setOrigin(0, 0);
    
    // Calculate content position based on title height
    const contentY = -height/2 + padding + this.titleText.height + 10;
    
    // Create content text
    this.contentText = scene.add.text(
      -width/2 + padding,
      contentY,
      content,
      {
        fontSize: contentFontSize,
        color: contentColor,
        wordWrap: { width: width - (padding * 2) },
        lineSpacing: isMobile ? 5 : 2
      }
    ).setOrigin(0, 0);
    
    // Add components to container
    this.add([this.background, this.titleText, this.contentText]);
    
    // Add close button if requested
    if (closable) {
      this.closeButton = scene.add.text(
        width/2 - padding,
        -height/2 + padding,
        'X',
        {
          fontSize: titleFontSize,
          fontStyle: 'bold',
          color: titleColor
        }
      ).setOrigin(1, 0);
      
      this.closeButton.setInteractive({ useHandCursor: true })
        .on('pointerdown', onClose);
        
      this.add(this.closeButton);
    }
    
    // Add container to scene
    scene.add.existing(this);
    
    // Make interactive if closable
    if (closable) {
      this.setSize(this.background.width, this.background.height);
      this.setInteractive();
    }
    
    // Mark as option if needed (for cleanup)
    if (isOption) {
      this.setData('isOption', true);
    }
  }
  
  /**
   * Update the content text
   * @param newContent New content to display
   */
  public setContent(newContent: string) {
    this.contentText.setText(newContent);
  }
  
  /**
   * Update the title text
   * @param newTitle New title to display
   */
  public setTitle(newTitle: string) {
    this.titleText.setText(newTitle);
  }
  
  /**
   * Add a fade-in animation when showing the panel
   * @param duration Animation duration in milliseconds
   */
  public fadeIn(duration: number = 200) {
    this.alpha = 0;
    this.scene.tweens.add({
      targets: this,
      alpha: 1,
      duration,
      ease: 'Power2'
    });
  }
  
  /**
   * Add a fade-out animation and destroy the panel
   * @param duration Animation duration in milliseconds
   */
  public fadeOut(duration: number = 200) {
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration,
      ease: 'Power2',
      onComplete: () => this.destroy()
    });
  }
}