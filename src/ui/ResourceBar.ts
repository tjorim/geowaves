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
    // Create container (outline)
    this.barContainer = this.scene.add.graphics();
    this.barContainer.lineStyle(2, 0xffffff, 1);
    this.barContainer.strokeRect(this.x, this.y, this.width, this.height);

    // Create fill
    this.barFill = this.scene.add.graphics();
    this.updateBar();

    // Create label
    this.textLabel = this.scene.add.text(
      this.x + this.width + 10,
      this.y + (this.height / 2),
      `${this.label}: ${this.currentValue}/${this.maxValue}`,
      { fontSize: '16px', color: '#ffffff' }
    ).setOrigin(0, 0.5);
  }

  /**
   * Update the bar's value
   * @param newValue The new value to display on the bar
   */
  public setValue(newValue: number) {
    this.currentValue = Phaser.Math.Clamp(newValue, 0, this.maxValue);
    this.updateBar();
    this.textLabel.setText(`${this.label}: ${this.currentValue}/${this.maxValue}`);
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