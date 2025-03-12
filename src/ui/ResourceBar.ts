import Phaser from 'phaser';

/**
 * A UI component for displaying resource bars with labels
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

  private barContainer!: Phaser.GameObjects.Graphics;
  private barFill!: Phaser.GameObjects.Graphics;
  private textLabel!: Phaser.GameObjects.Text;

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
    color: number
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
    
    // Create container (outline)
    this.barContainer = this.scene.add.graphics();
    this.barContainer.lineStyle(2, 0xffffff, 1);
    this.barContainer.strokeRect(this.x, this.y, this.width, this.height);

    // Create fill
    this.barFill = this.scene.add.graphics();
    this.updateBar();

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
      
    this.textLabel = this.scene.add.text(
      labelX,
      labelY,
      labelText,
      { 
        fontSize: isMobile ? '12px' : '16px', 
        color: '#ffffff',
        align: verySmallScreen ? 'center' : 'left',
        // Make label more compact on mobile
        padding: isMobile ? { left: 0, right: 0, top: 0, bottom: 0 } : undefined
      }
    ).setOrigin(verySmallScreen ? 0.5 : 0, 0.5);
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
      
    this.textLabel.setText(labelText);
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
   * Remove all graphics and text elements
   */
  public destroy() {
    this.barContainer.destroy();
    this.barFill.destroy();
    this.textLabel.destroy();
  }
}