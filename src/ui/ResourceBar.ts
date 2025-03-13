import Phaser from 'phaser';

/**
 * Tooltip text descriptions for each resource type
 */
export const RESOURCE_TOOLTIPS = {
  Money: "Available funds for project activities. Required for most actions.",
  Turns: "Remaining turns until project completion. Each action consumes turns.",
  Opinion: "Public support for your project. Low opinion can lead to project cancellation.",
  Risk: "Seismic risk level. Higher risk increases chance of negative events.",
  Research: "Knowledge points gained. Reach the target to complete the project successfully."
};

/**
 * A UI component for displaying resource bars with labels and tooltips
 */
export class ResourceBar {
  private scene: Phaser.Scene;
  private x: number;
  private y: number;
  private width: number;
  private height: number;
  private maxValue: number;
  private currentValue: number;
  private label: string;
  private color: number;
  private tooltipText: string;
  
  private barContainer!: Phaser.GameObjects.Graphics;
  private barFill!: Phaser.GameObjects.Graphics;
  private textLabel!: Phaser.GameObjects.Text;
  private tooltip!: Phaser.GameObjects.Container;
  private isTooltipVisible: boolean = false;
  
  // Track active tweens for cleanup
  private activeTweens: Phaser.Tweens.Tween[] = [];

  /**
   * Create a new resource bar
   * @param scene The Phaser scene to add this bar to
   * @param x X position of the bar
   * @param y Y position of the bar
   * @param width Width of the bar in pixels
   * @param height Height of the bar in pixels
   * @param maxValue Maximum value that the bar can represent
   * @param initialValue Starting value for the bar
   * @param label Text label to display next to the bar
   * @param color Color of the bar fill (in hex format, e.g. 0xff0000 for red)
   * @param tooltipText Optional custom tooltip text (defaults to predefined text for the resource type)
   */
  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    width: number,
    height: number,
    maxValue: number,
    initialValue: number,
    label: string,
    color: number,
    tooltipText?: string
  ) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.maxValue = maxValue;
    this.currentValue = initialValue;
    this.label = label;
    this.color = color;
    // Use provided tooltip text or default from resource tooltips
    this.tooltipText = tooltipText || RESOURCE_TOOLTIPS[label as keyof typeof RESOURCE_TOOLTIPS] || 
      `${label}: ${initialValue}/${maxValue}`;

    this.create();
  }

  /**
   * Create the visual elements of the resource bar
   */
  private create() {
    // Make sure any previous instances are cleaned up
    if (this.barContainer) {
      this.barContainer.destroy();
    }
    if (this.barFill) {
      this.barFill.destroy();
    }
    if (this.textLabel) {
      this.textLabel.destroy();
    }
    if (this.tooltip) {
      this.tooltip.destroy();
    }
    
    // Create container (outline)
    this.barContainer = this.scene.add.graphics();
    this.barContainer.lineStyle(2, 0xffffff, 1);
    this.barContainer.strokeRect(this.x, this.y, this.width, this.height);
    
    // Make bar container interactive
    const hitArea = new Phaser.Geom.Rectangle(this.x, this.y, this.width, this.height);
    this.barContainer.setInteractive(hitArea, Phaser.Geom.Rectangle.Contains);
    
    // Add hover events for tooltip
    this.barContainer.on('pointerover', this.showTooltip, this);
    this.barContainer.on('pointerout', this.hideTooltip, this);

    // Create fill
    this.barFill = this.scene.add.graphics();
    this.updateBar();
    
    // Create tooltip container but don't add content until hover
    this.tooltip = this.scene.add.container(0, 0);
    this.tooltip.setVisible(false);
    this.isTooltipVisible = false;

    // Detect if on mobile device
    const gameWidth = this.scene.scale.width;
    const isMobile = gameWidth < 768;
    
    // Create label - adjust position and size for mobile
    // Calculate how far the label needs to be from the bar based on screen size
    const labelOffset = isMobile 
      ? Math.min(10, gameWidth * 0.02) // Smaller offset on mobile
      : 10;
    
    // For very small screens, place labels below the bar instead of to the right
    const verySmallScreen = gameWidth < 400;
    
    const labelX = verySmallScreen 
      ? this.x + (this.width / 2) // Center below the bar on very small screens
      : this.x + this.width + labelOffset;
      
    const labelY = verySmallScreen
      ? this.y + this.height + 10 // Below the bar on very small screens
      : this.y + (this.height / 2); // Centered vertically on larger screens
    
    // Create the label with appropriate text
    const labelText = verySmallScreen
      ? `${this.label}\n${this.currentValue}/${this.maxValue}` // Split to two lines on very small screens
      : `${this.label}: ${this.currentValue}/${this.maxValue}`;
    
    // Calculate responsive font size based on screen width and value length
    const baseFontSize = this.calculateResponsiveFontSize();
      
    this.textLabel = this.scene.add.text(
      labelX,
      labelY,
      labelText,
      { 
        fontSize: `${baseFontSize}px`, 
        color: '#ffffff',
        align: verySmallScreen ? 'center' : 'left',
        // Make label more compact on mobile
        padding: isMobile ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined
      }
    ).setOrigin(verySmallScreen ? 0.5 : 0, 0.5);
    
    // Make text label interactive for tooltips
    this.textLabel.setInteractive({ useHandCursor: true });
    this.textLabel.on('pointerover', this.showTooltip, this);
    this.textLabel.on('pointerout', this.hideTooltip, this);
  }

  /**
   * Update the bar's value
   * @param newValue The new value to display on the bar
   */
  public setValue(newValue: number) {
    this.currentValue = Phaser.Math.Clamp(newValue, 0, this.maxValue);
    this.updateBar();
    
    // Check if we're on a very small screen
    const gameWidth = this.scene.scale.width;
    const verySmallScreen = gameWidth < 400;
    
    // Format label text based on screen size
    const labelText = verySmallScreen
      ? `${this.label}\n${this.currentValue}/${this.maxValue}` // Split to two lines on very small screens
      : `${this.label}: ${this.currentValue}/${this.maxValue}`;
    
    // Get the responsive font size based on the new value
    const fontSize = this.calculateResponsiveFontSize();
    
    // Update text content and font size
    this.textLabel.setText(labelText);
    this.textLabel.setFontSize(`${fontSize}px`);
  }
  
  /**
   * Calculate the appropriate font size based on screen size and value length
   * @returns The calculated font size in pixels
   */
  private calculateResponsiveFontSize(): number {
    const gameWidth = this.scene.scale.width;
    
    // Base font sizes for different screen sizes
    let baseFontSize = 16; // Default for desktop
    
    if (gameWidth < 768) { // Mobile
      baseFontSize = 12;
    }
    
    if (gameWidth < 400) { // Very small screens
      baseFontSize = 10;
    }
    
    // Calculate digital length of the current and maximum values
    const currentValueLength = this.currentValue.toString().length;
    const maxValueLength = this.maxValue.toString().length;
    
    // Adjust font size based on the total displayed value length
    const totalLength = this.label.length + currentValueLength + maxValueLength + 3; // +3 for ": " and "/"
    
    // Adjust font size for very long numbers or available width
    if (totalLength > 20 || this.width < 120) {
      baseFontSize = Math.max(8, baseFontSize - 2);
    }
    
    // Further reduce for extremely long values
    if (totalLength > 30 || currentValueLength > 6 || maxValueLength > 6) {
      baseFontSize = Math.max(8, baseFontSize - 2);
    }
    
    // Consider available horizontal space (especially for side-by-side layout)
    const availableWidth = gameWidth - (this.x + this.width + 20);
    if (availableWidth < 150 && gameWidth >= 400) { // Only for horizontal layout
      baseFontSize = Math.max(8, baseFontSize - 2);
    }
    
    return baseFontSize;
  }

  /**
   * Redraw the bar fill based on the current value
   * Shows red color when below 20% capacity
   */
  private updateBar() {
    this.barFill.clear();
    
    // Change color based on resource level
    let fillColor = this.color;
    if (this.currentValue / this.maxValue < 0.2) {
      fillColor = 0xff0000; // Red for critical levels
    }
    
    this.barFill.fillStyle(fillColor, 1);

    // Calculate width based on current value compared to max
    const fillWidth = (this.currentValue / this.maxValue) * this.width;
    this.barFill.fillRect(this.x, this.y, fillWidth, this.height);
  }

  /**
   * Get the current value of the resource bar
   */
  public getValue(): number {
    return this.currentValue;
  }

  /**
   * Show tooltip when hovering over the resource bar
   */
  private showTooltip() {
    if (this.isTooltipVisible) return;
    
    // Clear any previous tooltip content
    this.tooltip.removeAll(true);
    
    // Detect if on mobile device for responsive sizing
    const gameWidth = this.scene.scale.width;
    const isMobile = gameWidth < 768;
    
    // Create tooltip background
    const tooltipPadding = 10;
    const tooltipWidth = isMobile ? Math.min(300, gameWidth * 0.7) : 250;
    const tooltipBackground = this.scene.add.graphics();
    tooltipBackground.fillStyle(0x222222, 0.9);
    tooltipBackground.lineStyle(2, 0xaaaaaa, 0.8);
    
    // Create tooltip text
    const tooltipText = this.scene.add.text(
      tooltipPadding, 
      tooltipPadding, 
      this.tooltipText,
      {
        fontSize: isMobile ? '14px' : '12px',
        color: '#ffffff',
        wordWrap: { width: tooltipWidth - (tooltipPadding * 2) }
      }
    );
    
    // Size background to fit text
    const bgWidth = tooltipText.width + (tooltipPadding * 2);
    const bgHeight = tooltipText.height + (tooltipPadding * 2);
    tooltipBackground.fillRoundedRect(0, 0, bgWidth, bgHeight, 6);
    tooltipBackground.strokeRoundedRect(0, 0, bgWidth, bgHeight, 6);
    
    // Position tooltip above or below the bar based on available space
    const tooltipY = this.y - bgHeight - 5; // Default to above the bar
    
    // If tooltip would go off the top of the screen, position below instead
    const finalY = tooltipY < 10 ? this.y + this.height + 5 : tooltipY;
    
    // Add elements to tooltip container
    this.tooltip.add([tooltipBackground, tooltipText]);
    this.tooltip.setPosition(this.x, finalY);
    this.tooltip.setDepth(100); // Ensure tooltip is on top
    this.tooltip.setVisible(true);
    this.isTooltipVisible = true;
    
    // Add a subtle appear animation
    this.tooltip.setAlpha(0);
    const appearTween = this.scene.tweens.add({
      targets: this.tooltip,
      alpha: 1,
      duration: 200,
      ease: 'Sine.easeOut',
      onComplete: () => {
        // Remove from active tweens when complete
        const index = this.activeTweens.indexOf(appearTween);
        if (index !== -1) {
          this.activeTweens.splice(index, 1);
        }
      }
    });
    this.activeTweens.push(appearTween);
  }
  
  /**
   * Hide tooltip when pointer leaves the resource bar
   */
  private hideTooltip() {
    if (!this.isTooltipVisible) return;
    
    // Add a fade out animation before hiding
    const fadeOutTween = this.scene.tweens.add({
      targets: this.tooltip,
      alpha: 0,
      duration: 200,
      ease: 'Sine.easeIn',
      onComplete: () => {
        this.tooltip.setVisible(false);
        this.isTooltipVisible = false;
        
        // Remove from active tweens when complete
        const index = this.activeTweens.indexOf(fadeOutTween);
        if (index !== -1) {
          this.activeTweens.splice(index, 1);
        }
      }
    });
    this.activeTweens.push(fadeOutTween);
  }
  
  /**
   * Remove all graphics and text elements and clean up event listeners
   */
  public destroy() {
    // Stop all active tweens
    this.activeTweens.forEach(tween => {
      if (tween.isPlaying()) {
        tween.stop();
      }
    });
    this.activeTweens = [];
    
    // Remove event listeners
    if (this.barContainer) {
      this.barContainer.removeAllListeners();
    }
    
    if (this.textLabel) {
      this.textLabel.removeAllListeners();
    }
    
    // Destroy graphical elements
    this.barContainer.destroy();
    this.barFill.destroy();
    this.textLabel.destroy();
    this.tooltip.destroy();
  }
  
  /**
   * Update the position of the resource bar
   * @param x The new x position
   * @param y The new y position (optional - keep current y if not specified)
   */
  public setPosition(x: number, y?: number) {
    // Hide tooltip if visible
    if (this.isTooltipVisible) {
      this.hideTooltip();
    }
    
    // Update stored coordinates
    this.x = x;
    if (y !== undefined) {
      this.y = y;
    }
    
    // Redraw the entire bar at the new position
    this.create();
  }
  
  /**
   * Update the width of the resource bar
   * @param width The new width in pixels
   */
  public setWidth(width: number) {
    // Hide tooltip if visible
    if (this.isTooltipVisible) {
      this.hideTooltip();
    }
    
    // Update stored width
    this.width = width;
    
    // Redraw the entire bar with the new width
    this.create();
  }
  
  /**
   * Get the Y position of the resource bar
   * @returns The current Y position
   */
  public getY(): number {
    return this.y;
  }
  
  /**
   * Get the height of the resource bar
   * @returns The height in pixels
   */
  public getHeight(): number {
    return this.height;
  }
}