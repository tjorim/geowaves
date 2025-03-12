import Phaser from 'phaser';
import { ResourceBar } from '../ui/ResourceBar';
import { Button, BUTTON_STYLES } from '../ui/Button';
import { ActionOption, ActionData } from '../ui/ActionOption';
import { 
  events,
  GameEvent,
  getWeightedEvents
} from '../data/events';
import { communityEngagement } from '../data/community';
import { researchTheoretical } from '../data/researchTheoretical';
import { researchPractical } from '../data/researchPractical';
import { GameConfig, DEFAULT_GAME_CONFIG } from '../config/gameConfig';

export class GameScene extends Phaser.Scene {
  // Reference to game configuration for easy access
  private config: GameConfig = DEFAULT_GAME_CONFIG;
  
  // Define the type for the resize event handler
  private resizeHandler: ((scene: Phaser.Scene, width: number, height: number) => void) | null = null;
  
  // Track resize timeout ID for cleanup
  private resizeTimeoutId: number | null = null;

  // Game variables
  private money = this.config.initialValues.money;
  private turnsRemaining = this.config.initialValues.turns;
  private publicOpinion = this.config.initialValues.opinion;
  private risk = this.config.initialValues.risk;
  private turn = 1;
  
  // Research points as a resource
  private researchPoints = this.config.initialValues.research;
  
  // UI elements
  private moneyBar?: ResourceBar;
  private turnsBar?: ResourceBar;
  private opinionBar?: ResourceBar;
  private riskBar?: ResourceBar;
  private researchBar?: ResourceBar;
  private infoText?: Phaser.GameObjects.Text;
  
  // Event pacing variables
  private turnsSinceLastEvent = 0;
  private consecutiveQuietTurns = 0;
  private hadEventLastTurn = false;
  
  // Track passive rewards (applied only once per turn)
  private passiveRewardsApplied = false;
  
  // Define standard colors for use throughout the UI
  private static readonly COLORS = {
    POSITIVE: 0x2ecc71, // Green for positive effects
    NEGATIVE: 0xe74c3c, // Red for negative effects
    NEUTRAL: 0x3498db,  // Blue for neutral/information
    MONEY: 0xf1c40f,    // Yellow/gold for money
    RISK: 0xe67e22,     // Orange for risk
    INFO: 0x95a5a6,     // Gray for information
    DARK_BG: 0x2c3e50,  // Dark background
    WARNING: 0xff9800,  // Orange for warnings
    SUCCESS: 0x27ae60,  // Green for success
    ERROR: 0xc0392b,    // Darker red for errors
  };
  
  // Define layout constants for consistent UI
  private static readonly LAYOUT = {
    SEPARATOR_HEIGHT: 2,
    MARGIN: 20,
    SPACING: 10,
    INFO_HEIGHT: 60,
    RESOURCE_HEIGHT: 30,
    BUTTON_HEIGHT: 50,
    BUTTON_WIDTH: 180,
    OPTION_PADDING: 10,
    TEXT_WRAP_PERCENT: 0.7, // Percentage of screen width for text wrapping
  };

  constructor() {
    super({ key: 'GameScene' });
  }

  /**
   * Helper method to get layout parameters based on current screen dimensions
   * @returns Object with calculated layout values
   */
  private getLayoutParams() {
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isLandscape = gameWidth > gameHeight;
    const isMobile = gameWidth < 768; // Detect mobile based on width
    
    // Calculate positioning based on orientation
    const mainX = isLandscape ? gameWidth * 0.05 : gameWidth * 0.1;
    const mainY = isLandscape ? gameHeight * 0.1 : gameHeight * 0.05;
    
    // Scale resource bar widths based on screen size
    const resourceWidth = isLandscape 
      ? Math.min(gameWidth * 0.25, 300) 
      : Math.min(gameWidth * 0.8, 400);
    
    // Return all layout values in one object
    return {
      gameWidth,
      gameHeight,
      isLandscape,
      isMobile,
      mainX,
      mainY,
      resourceWidth
    };
  }
  
  /**
   * Create a consistent ResourceBar with standard styling
   */
  private createResourceBar(
    x: number, 
    y: number, 
    width: number, 
    value: number, 
    maxValue: number, 
    label: string, 
    color: number,
    tooltipText?: string
  ): ResourceBar {
    return new ResourceBar(
      this,
      x,
      y,
      width,
      GameScene.LAYOUT.RESOURCE_HEIGHT,
      value,
      maxValue,
      label,
      color,
      tooltipText
    );
  }
  
  /**
   * Create a consistent Button with standard styling
   */
  private createButton(
    x: number, 
    y: number, 
    text: string, 
    callback: () => void,
    isOption: boolean = false,
    style: keyof typeof BUTTON_STYLES = 'DEFAULT'
  ): Button {
    return new Button(
      this, 
      x, 
      y, 
      text, 
      callback, 
      { preset: style, isOption }
    );
  }
  
  /**
   * Create a consistent separator line
   */
  private createSeparator(
    x: number, 
    y: number, 
    width: number, 
    color: number = 0xffffff,
    alpha: number = 0.3
  ): Phaser.GameObjects.Rectangle {
    return this.add.rectangle(
      x,
      y,
      width,
      GameScene.LAYOUT.SEPARATOR_HEIGHT,
      color,
      alpha
    ).setOrigin(0, 0);
  }
  
  /**
   * Create a consistent text element
   */
  private createText(
    x: number, 
    y: number, 
    text: string, 
    style: Phaser.Types.GameObjects.Text.TextStyle = {}
  ): Phaser.GameObjects.Text {
    // Get layout parameters
    const layout = this.getLayoutParams();
    
    // Create default style
    const defaultStyle: Phaser.Types.GameObjects.Text.TextStyle = {
      fontSize: layout.isMobile ? '20px' : '16px',
      color: '#fff',
      wordWrap: { width: layout.gameWidth * GameScene.LAYOUT.TEXT_WRAP_PERCENT }
    };
    
    // Merge with custom style
    const mergedStyle = { ...defaultStyle, ...style };
    
    return this.add.text(x, y, text, mergedStyle);
  }
  
  /**
   * Formats a value with prefix when positive
   * @param value The value to format
   * @param prefix Optional prefix for positive values (default '+')
   * @returns Formatted string
   */
  private formatWithSign(value: number, prefix: string = '+'): string {
    return value > 0 ? `${prefix}${value}` : `${value}`;
  }
  
  /**
   * Builds formatted effect message text from an effects object
   * @param effects Object containing effect values
   * @returns Formatted effects message
   */
  private buildEffectsMessage(effects: {
    knowledge?: number | null;
    money?: number | null;
    publicOpinion?: number | null;
    seismicRisk?: number | null;
  }): string {
    const messageEffects: string[] = [];
    
    // Properly check knowledge effect (null, undefined, and zero checks)
    if (effects.knowledge !== undefined && effects.knowledge !== null && effects.knowledge !== 0) {
      messageEffects.push(`Knowledge ${this.formatWithSign(effects.knowledge)}`);
    }
    
    // Properly check money effect (null, undefined, and zero checks)
    if (effects.money !== undefined && effects.money !== null && effects.money !== 0) {
      messageEffects.push(`Money ${this.formatWithSign(effects.money, '+$')}`);
    }
    
    // Properly check opinion effect (null, undefined, and zero checks)
    if (effects.publicOpinion !== undefined && effects.publicOpinion !== null && effects.publicOpinion !== 0) {
      messageEffects.push(`Opinion ${this.formatWithSign(effects.publicOpinion)}`);
    }
    
    // Properly check risk effect (null, undefined, and zero checks)
    if (effects.seismicRisk !== undefined && effects.seismicRisk !== null && effects.seismicRisk !== 0) {
      messageEffects.push(`Risk ${this.formatWithSign(effects.seismicRisk)}`);
    }
    
    return messageEffects.length > 0 ? ` (${messageEffects.join(', ')})` : '';
  }
  
  /**
   * Cleans up all game objects marked with a specific data tag
   * 
   * This method is a central part of the UI cleanup system. It searches through
   * all child objects in the scene and destroys any that have been tagged with
   * the specified data property (typically 'isOption').
   * 
   * Usage:
   * - Used by clearActionOptions() to remove temporary UI elements
   * - Called directly when transitioning between UI states
   * - The 'isOption' tag is commonly used to mark elements for cleanup
   * 
   * The tagging system allows for targeted cleanup of temporary UI elements
   * without affecting permanent UI components.
   * 
   * @param tag The data property name to check for (e.g., 'isOption')
   */
  private cleanupGameObjectsByTag(tag: string): void {
    const childrenToCheck = [...this.children.list];
    
    childrenToCheck.forEach(child => {
      if (child.getData && child.getData(tag)) {
        child.destroy();
      }
    });
  }

  create() {
    // Reset passive rewards tracking
    this.passiveRewardsApplied = false;
    
    // Get layout parameters based on device
    const layout = this.getLayoutParams();
    
    // Calculate positions
    const basePosX = layout.mainX;
    const basePosY = layout.mainY;
    const spacing = GameScene.LAYOUT.SPACING;
    const resourceWidth = layout.resourceWidth;
    
    // Initialize UI components
    // Resource bars with tooltips
    this.moneyBar = this.createResourceBar(
      basePosX, 
      basePosY, 
      resourceWidth, 
      this.money, 
      this.config.maxValues.money, 
      'Money', 
      GameScene.COLORS.MONEY,
      'Your available funds for research and community engagement.'
    );
    
    this.riskBar = this.createResourceBar(
      basePosX, 
      basePosY + spacing + GameScene.LAYOUT.RESOURCE_HEIGHT, 
      resourceWidth, 
      this.risk, 
      this.config.maxValues.risk, 
      'Seismic Risk', 
      GameScene.COLORS.RISK,
      'Risk of seismic activity. Higher risk increases chance of negative events.'
    );
    
    this.opinionBar = this.createResourceBar(
      basePosX, 
      basePosY + (spacing + GameScene.LAYOUT.RESOURCE_HEIGHT) * 2, 
      resourceWidth, 
      this.publicOpinion, 
      this.config.maxValues.opinion, 
      'Public Opinion', 
      GameScene.COLORS.POSITIVE,
      'Public support for your project. Affects funding and event outcomes.'
    );

    // Research points bar
    this.researchBar = this.createResourceBar(
      basePosX, 
      basePosY + (spacing + GameScene.LAYOUT.RESOURCE_HEIGHT) * 3, 
      resourceWidth, 
      this.researchPoints, 
      this.config.maxValues.research, 
      'Research Points', 
      GameScene.COLORS.NEUTRAL,
      'Scientific knowledge gained. Affects project success and unlocks new options.'
    );
    
    this.turnsBar = this.createResourceBar(
      basePosX, 
      basePosY + (spacing + GameScene.LAYOUT.RESOURCE_HEIGHT) * 4, 
      resourceWidth, 
      this.turnsRemaining, 
      this.config.initialValues.turns, 
      'Turns Remaining', 
      GameScene.COLORS.INFO,
      'Time remaining to complete your project. Game ends when this reaches zero.'
    );
    
    // Title and information area
    this.createSeparator(
      basePosX, 
      this.turnsBar ? this.turnsBar.getY() + this.turnsBar.getHeight() + spacing : basePosY + (spacing + GameScene.LAYOUT.RESOURCE_HEIGHT) * 5, 
      resourceWidth
    );
    
    // Information text area with padding
    const infoTextY = this.turnsBar ? this.turnsBar.getY() + this.turnsBar.getHeight() + spacing * 2 : basePosY + (spacing + GameScene.LAYOUT.RESOURCE_HEIGHT) * 5 + spacing * 2;
    this.infoText = this.createText(
      basePosX, 
      infoTextY,
      `Turn ${this.turn}: Select an action or press Next Turn to continue.`,
      { 
        fontSize: layout.isMobile ? '16px' : '14px',
        color: '#ffffff',
        wordWrap: { width: resourceWidth } 
      }
    );
    
    // Create action buttons
    this.createMainButtons(layout.isLandscape);
    
    // Listen for resize events with debouncing
    const debouncedResize = this.debounceEvent(this.updateUIForResize.bind(this), 250);
    this.scale.on('resize', debouncedResize);
    
    // Ensure this is properly cleaned up when the scene shuts down
    this.events.once('shutdown', () => {
      this.scale.off('resize', debouncedResize);
    });
  }
  
  /**
   * Create the main game action buttons
   * @param _isLandscape Whether the screen is in landscape mode (not directly used but kept for API consistency)
   */
  private createMainButtons(_isLandscape: boolean) {
    // Get layout parameters 
    const layout = this.getLayoutParams();
    const { mainX, mainY, resourceWidth } = layout;
    const spacing = GameScene.LAYOUT.SPACING;
    
    // Calculate button positions
    const buttonAreaY = this.infoText 
      ? this.infoText.y + GameScene.LAYOUT.INFO_HEIGHT 
      : mainY + (GameScene.LAYOUT.RESOURCE_HEIGHT + spacing) * 5 + spacing * 3;
    
    // Create separator above buttons
    this.createSeparator(mainX, buttonAreaY - spacing, resourceWidth);
    
    // First row of buttons
    const buttonsY = buttonAreaY + spacing;
    
    // Create theoretical research button
    this.createButton(
      mainX, 
      buttonsY, 
      'Theoretical Research', 
      this.showTheoreticalResearchOptions.bind(this),
      false, // Not an option button (permanent UI)
      'PRIMARY' // Style preset
    );
    
    // Create practical research button
    this.createButton(
      mainX + GameScene.LAYOUT.BUTTON_WIDTH + spacing, 
      buttonsY, 
      'Practical Research', 
      this.showPracticalResearchOptions.bind(this),
      false, // Not an option button (permanent UI)
      'PRIMARY' // Style preset
    );
    
    // Second row of buttons
    const secondRowY = buttonsY + GameScene.LAYOUT.BUTTON_HEIGHT + spacing;
    
    // Create community engagement button
    this.createButton(
      mainX, 
      secondRowY, 
      'Community Engagement', 
      this.showCommunityEngagementOptions.bind(this),
      false, // Not an option button (permanent UI)
      'PRIMARY' // Style preset
    );
    
    // Create next turn button
    this.createButton(
      mainX + GameScene.LAYOUT.BUTTON_WIDTH + spacing, 
      secondRowY, 
      'Next Turn', 
      this.handleNextTurn.bind(this),
      false, // Not an option button (permanent UI)
      'SUCCESS' // Style preset
    );
    
    // Set up debounced resize handler for all screen sizes
    this.resizeHandler = this.debounceEvent(this.updateUIForResize.bind(this), 250);
    this.scale.on('resize', this.resizeHandler, this);
  }
  
  /**
   * Helper method to update UI elements when screen is resized
   */
  updateUIForResize() {
    // Calculate new layout parameters
    const layout = this.getLayoutParams();
    const { mainX, mainY, resourceWidth } = layout;
    
    // Update resource bar positions and widths
    if (this.moneyBar) {
      this.moneyBar.setPosition(mainX, mainY);
      this.moneyBar.setWidth(resourceWidth);
    }
    
    if (this.riskBar) {
      this.riskBar.setPosition(mainX, mainY + GameScene.LAYOUT.RESOURCE_HEIGHT + GameScene.LAYOUT.SPACING);
      this.riskBar.setWidth(resourceWidth);
    }
    
    if (this.opinionBar) {
      this.opinionBar.setPosition(
        mainX, 
        mainY + (GameScene.LAYOUT.RESOURCE_HEIGHT + GameScene.LAYOUT.SPACING) * 2
      );
      this.opinionBar.setWidth(resourceWidth);
    }
    
    if (this.researchBar) {
      this.researchBar.setPosition(
        mainX, 
        mainY + (GameScene.LAYOUT.RESOURCE_HEIGHT + GameScene.LAYOUT.SPACING) * 3
      );
      this.researchBar.setWidth(resourceWidth);
    }
    
    if (this.turnsBar) {
      this.turnsBar.setPosition(
        mainX, 
        mainY + (GameScene.LAYOUT.RESOURCE_HEIGHT + GameScene.LAYOUT.SPACING) * 4
      );
      this.turnsBar.setWidth(resourceWidth);
    }
    
    // Clear and recreate only the action buttons (not the entire UI)
    this.clearActionOptions();
    this.createMainButtons(layout.isLandscape);
  }

  updateResourceDisplay() {
    // Update resource bar values
    if (this.moneyBar) {
      this.moneyBar.setValue(Math.max(0, this.money));
    }
    
    if (this.riskBar) {
      this.riskBar.setValue(Math.max(0, Math.min(this.risk, this.config.maxValues.risk)));
    }
    
    if (this.opinionBar) {
      this.opinionBar.setValue(Math.max(0, Math.min(this.publicOpinion, this.config.maxValues.opinion)));
    }
    
    if (this.researchBar) {
      this.researchBar.setValue(Math.max(0, Math.min(this.researchPoints, this.config.maxValues.research)));
    }
    
    if (this.turnsBar) {
      this.turnsBar.setValue(Math.max(0, this.turnsRemaining));
    }
  }
  
  /**
   * Set the info text with optional animation and color
   * @param message The message to display
   * @param animate Whether to animate the text change
   * @param style Optional style: 'success', 'warning', 'error'
   */
  setInfoText(message: string, animate: boolean = false, style: string = 'normal') {
    if (!this.infoText) return;
    
    // Set color based on style
    let color = '#ffffff';
    switch (style) {
      case 'success':
        color = '#2ecc71';
        break;
      case 'warning':
        color = '#f39c12';
        break;
      case 'error':
        color = '#e74c3c';
        break;
    }
    
    this.infoText.setColor(color);
    
    if (animate) {
      // Save original scale
      const originalScale = this.infoText.scale;
      
      // Scale up slightly and back down for emphasis
      this.tweens.add({
        targets: this.infoText,
        scale: originalScale * 1.1,
        duration: 150,
        yoyo: true,
        onComplete: () => {
          this.infoText?.setScale(originalScale);
        }
      });
    }
    
    // Update the text
    this.infoText.setText(message);
  }
  
  /**
   * Helper for debouncing events like window resize
   * @param fn Function to debounce
   * @param delay Delay in ms
   * @returns Debounced function
   */
  private debounceEvent(fn: (scene: Phaser.Scene, width: number, height: number) => void, delay: number) {
    return ((scene: Phaser.Scene, width: number, height: number) => {
      if (this.resizeTimeoutId !== null) {
        clearTimeout(this.resizeTimeoutId);
      }
      this.resizeTimeoutId = window.setTimeout(() => {
        fn.call(this, scene, width, height);
        this.resizeTimeoutId = null;
      }, delay);
    });
  }
  
  /**
   * Check if player can afford the action based on money and time
   * @param cost Money cost
   * @param time Time cost in turns
   * @returns Whether the player can afford the action
   */
  private canAffordAction(cost: number, time: number): boolean {
    return this.money >= cost && this.turnsRemaining >= time;
  }
  
  /**
   * Create action options display with consistent layout
   * @param actions Array of action data
   * @param callback Function to call when an option is selected
   */
  createActionOptions<T extends ActionData>(actions: T[], callback: (action: T) => void) {
    // Clear any existing options first
    this.clearActionOptions();
    
    // Get layout parameters
    const layout = this.getLayoutParams();
    
    // Determine layout based on screen size and orientation
    const isHorizontal = layout.isLandscape && !layout.isMobile;
    const optionSpacing = GameScene.LAYOUT.SPACING * 1.5;
    
    // Show a maximum of 3 options at a time
    const maxVisibleOptions = 3;
    const visibleActions = actions.slice(0, maxVisibleOptions);
    
    // Calculate action option positions
    const actionPosX = layout.mainX;
    const actionPosY = this.infoText 
      ? this.infoText.y + GameScene.LAYOUT.INFO_HEIGHT + optionSpacing 
      : layout.mainY + 250;
    
    // Create title
    this.createText(
      actionPosX,
      actionPosY - 30,
      'Select an action:',
      { 
        fontSize: layout.isMobile ? '20px' : '18px',
        fontStyle: 'bold'
      }
    ).setData('isOption', true);
    
    // Loop through actions and create options
    visibleActions.forEach((action, index) => {
      const currentY = actionPosY + (index * (isHorizontal ? 75 : 120));
      const actionOption = new ActionOption(
        this,
        actionPosX,
        currentY,
        action,
        () => callback(action),
        isHorizontal
      );
      
      // Mark for cleanup
      actionOption.setData('isOption', true);
    });
    
    // Return layout info for positioning back button
    return {
      xPos: actionPosX,
      yPos: actionPosY,
      spacing: isHorizontal ? 75 : 120,
      actionCount: visibleActions.length
    };
  }
  
  /**
   * Show action options for the player to select
   * @param options Array of action data
   * @param actionCallback Function to call when an action is selected
   */
  showActionOptions<T extends ActionData>(options: T[], actionCallback: (action: T) => void) {
    // Create option display
    const layout = this.createActionOptions(options, actionCallback);
    
    // Get layout parameters
    const { gameHeight, isMobile } = this.getLayoutParams();
    
    // Make sure back button is accessible and always on screen
    // Use a position that's safely within the viewport
    const backButtonY = Math.min(
      layout.yPos + layout.actionCount * layout.spacing + (isMobile ? 30 : 20),
      gameHeight - 60 // Keep button at least 60px from bottom
    );
    
    // Create back button using our helper method
    this.createButton(
      layout.xPos,
      backButtonY,
      'Back',
      () => {
        // Use a small delay to ensure proper cleanup order
        this.time.delayedCall(10, () => {
          this.clearActionOptions();
        });
      },
      true, // Mark as an option for cleanup
      'BACK' // Use the BACK style preset
    );
  }
  
  /**
   * Show game options of a specific type
   * @param optionType The type of options to show
   */
  showGameOptions(optionType: 'research-theoretical' | 'research-practical' | 'community') {
    let actionData: ActionData[] = [];
    
    // Determine which data to show based on type
    switch (optionType) {
      case 'research-theoretical':
        actionData = researchTheoretical;
        break;
      case 'research-practical':
        actionData = researchPractical;
        break;
      case 'community':
        actionData = communityEngagement;
        break;
    }
    
    // Show options using our generic action handler
    this.showActionOptions(actionData, this.doAction.bind(this));
  }
  
  // Alias methods for backward compatibility with existing bindings
  showTheoreticalResearchOptions = () => this.showGameOptions('research-theoretical');
  showPracticalResearchOptions = () => this.showGameOptions('research-practical');
  showCommunityEngagementOptions = () => this.showGameOptions('community');
  
  /**
   * Clear all temporary UI elements marked with the 'isOption' tag
   * 
   * This method is called to remove action option menus and temporary UI elements
   * when:
   * - The player returns to the main menu
   * - The player selects an action
   * - A new UI state is created that requires clearing previous options
   * - The turn ends and UI is reset
   * 
   * It uses the cleanupGameObjectsByTag method to find and destroy all game objects
   * that have been marked with the 'isOption' data tag, ensuring efficient cleanup
   * of temporary UI components while preserving permanent UI elements.
   */
  clearActionOptions() {
    // Use helper to clean up all options
    this.cleanupGameObjectsByTag('isOption');
    
    // Get layout parameters
    const { isLandscape } = this.getLayoutParams();
    
    // Recreate the main button layout using our reusable component
    this.createMainButtons(isLandscape);
  }
  
  /**
   * Generic method to perform a selected action
   * @param action The action to perform
   */
  private performAction(action: ActionData) {
    // Use our helper to validate resources before proceeding
    if (!this.canAffordAction(action.cost, action.timeRequired)) {
      if (this.money < action.cost) {
        this.setInfoText(`Not enough money: Need $${action.cost}, have $${this.money}.`, false, 'warning');
      } else {
        this.setInfoText(`Not enough time: Need ${action.timeRequired} turns, have ${this.turnsRemaining}.`, false, 'warning');
      }
      return;
    }
    
    /**
     * Destroy any option elements before applying the action effects
     * This direct approach is used here for immediate cleanup during action performance
     * rather than using clearActionOptions() which would also recreate main buttons
     * The 'isOption' tag identifies temporary UI components created during option selection
     */
    this.children.list.forEach(child => {
      if (child.getData('isOption')) {
        child.destroy();
      }
    });
    
    // Apply costs and effects
    this.money -= action.cost;
    this.turnsRemaining -= action.timeRequired;
    
    // Apply all effects with defensive null checks to handle any missing properties
    if (action.effects) {
      // Seismic risk effect (with null/undefined check)
      this.risk += action.effects.seismicRisk !== undefined && action.effects.seismicRisk !== null
        ? action.effects.seismicRisk 
        : 0;
      
      // Public opinion effect (with null/undefined check)
      this.publicOpinion += action.effects.publicOpinion !== undefined && action.effects.publicOpinion !== null
        ? action.effects.publicOpinion 
        : 0;
      
      // Research/knowledge effect (with null/undefined check)
      this.researchPoints += action.effects.knowledge !== undefined && action.effects.knowledge !== null
        ? action.effects.knowledge 
        : 0;
      
      // Money effect (with null/undefined check) - separate from the initial cost
      this.money += action.effects.money !== undefined && action.effects.money !== null
        ? action.effects.money 
        : 0;
    }
    
    // Build feedback message to show important effects using our helper with safe access
    const effectsText = this.buildEffectsMessage({
      knowledge: action.effects && action.effects.knowledge !== undefined ? action.effects.knowledge : null,
      money: action.effects && action.effects.money !== undefined ? action.effects.money : null,
      publicOpinion: action.effects && action.effects.publicOpinion !== undefined ? action.effects.publicOpinion : null,
      seismicRisk: action.effects && action.effects.seismicRisk !== undefined ? action.effects.seismicRisk : null
    });
    this.setInfoText(`Conducted ${action.name.en} this turn.${effectsText}`, false, 'success');
    // Don't call clearActionOptions again since we already destroyed all option items
    this.createMainButtons(this.scale.width > this.scale.height);
    this.endTurn();
  }
  
  /**
   * Perform a research or community action
   * This single method handles all action types
   */
  private doAction(action: ActionData) {
    this.performAction(action);
  }
  
  // Alias methods for backward compatibility with existing button bindings
  doTheoreticalResearch = this.doAction;
  doPracticalResearch = this.doAction;
  doCommunityEngagement = this.doAction;

  /**
   * Handle seismic events with improved pacing
   * This system balances randomness with deliberate pacing to create
   * a more engaging gameplay experience.
   */
  handleSeismicEvents() {
    // Increment turns since last event
    this.turnsSinceLastEvent++;
    
    // Calculate event chance with dynamic pacing factors
    let eventChance = this.config.events.baseChance;
    
    // Add risk-based probability (higher risk = higher chance)
    eventChance += this.risk * this.config.events.riskMultiplier;
    
    // Force event if too many quiet turns
    const forcedEvent = this.consecutiveQuietTurns >= this.config.events.maxConsecutiveQuietTurns;
    
    // Block event if one just happened and we haven't reached minimum turn spacing
    const blockEvent = this.turnsSinceLastEvent < this.config.events.minTurnsBetweenEvents;
    
    // Determine if an event occurs
    const eventOccurs = forcedEvent || (!blockEvent && Math.random() * 100 < eventChance);
    
    if (eventOccurs) {
      // Select events based on the current game state using the weighted algorithm
      let possibleEvents: GameEvent[] = [];
      
      // Calculate event weights based on game state
      const weights = {
        seismic: 1,
        community: 1,
        financial: 1,
        environmental: 1,
        regulatory: 1
      };
      
      // Adjust weights based on risk level
      if (this.risk >= this.config.events.bigEventThreshold) {
        // Significantly increase seismic event probability when risk is high
        weights.seismic = 3;
        weights.regulatory = 2;
      } else if (this.risk >= this.config.effects.highRiskThreshold) {
        // Moderately increase seismic event probability for medium risk
        weights.seismic = 2;
      }
      
      // Adjust weights based on public opinion
      if (this.publicOpinion < 40) {
        // More community events when public opinion is low
        weights.community = 2;
      }
      
      // Adjust weights based on financial situation
      if (this.money < 50) {
        // More financial events when money is low
        weights.financial = 2;
      }
      
      // Get weighted event pool
      possibleEvents = getWeightedEvents(weights);
      
      // Add high-impact events for increased selection probability when risk is high
      if (this.risk >= this.config.events.bigEventThreshold) {
        const highImpactEvents = events.filter(event => 
          (event.effects.publicOpinion && event.effects.publicOpinion < -10) || 
          (event.effects.money && event.effects.money < -30)
        );
        
        // Add high impact events to increase their selection probability
        possibleEvents = [...possibleEvents, ...highImpactEvents];
      }
      
      // Apply filters for player protection
      // Filter out too-punishing events if money/turns are low
      if (this.money < 50) {
        possibleEvents = possibleEvents.filter(event => 
          !event.effects.money || event.effects.money > -20);
      }
      
      if (this.turnsRemaining < 3) {
        possibleEvents = possibleEvents.filter(event => 
          !event.effects.time || event.effects.time === 0);
      }
      
      // If we had an event last turn, favor more moderate events
      // to avoid overwhelming the player with consecutive severe impacts
      if (this.hadEventLastTurn) {
        possibleEvents = possibleEvents.filter(event => 
          event.effects.publicOpinion >= -15 && 
          event.effects.money >= -40
        );
      }
      
      // If no events match the filters, fall back to a safer subset
      if (possibleEvents.length === 0) {
        // Use events with minimal negative impact as a fallback
        possibleEvents = events.filter(event => 
          event.effects.publicOpinion > -10 && 
          event.effects.money > -15 &&
          event.effects.time === 0
        );
        
        // If still empty, use all events as a last resort
        if (possibleEvents.length === 0) {
          possibleEvents = [...events];
        }
      }
      
      // Select a random event from the filtered list
      const eventIndex = Math.floor(Math.random() * possibleEvents.length);
      const randomEvent = possibleEvents[eventIndex];
      
      // Apply the event effects (now using standardized structure)
      this.publicOpinion += randomEvent.effects.publicOpinion;
      this.money += randomEvent.effects.money;
      this.risk += randomEvent.effects.seismicRisk;
      this.turnsRemaining -= randomEvent.effects.time;
      
      // Add context messaging based on pacing state
      let contextMessage = '';
      if (forcedEvent) {
        contextMessage = 'After a period of calm, seismic activity has increased. ';
      } else if (this.risk >= this.config.events.bigEventThreshold) {
        contextMessage = 'High risk levels have led to concerning seismic activity. ';
      }
      
      // Display event information to player
      this.setInfoText(`Event: ${contextMessage}${randomEvent.description.en}`, true, 'warning');
      
      // Reset pacing variables
      this.turnsSinceLastEvent = 0;
      this.consecutiveQuietTurns = 0;
      this.hadEventLastTurn = true;
    } else {
      // No event occurred this turn
      this.consecutiveQuietTurns++;
      this.hadEventLastTurn = false;
      
      // Customize quiet turn message based on risk level
      let quietMessage = 'No significant events this turn.';
      
      if (this.risk > this.config.events.bigEventThreshold) {
        quietMessage = 'No major events, but seismic monitors show concerning activity.';
      } else if (this.risk > this.config.effects.highRiskThreshold) {
        quietMessage = 'No events occurred, but instruments show elevated seismic activity.';
      } else if (this.consecutiveQuietTurns >= this.config.events.maxConsecutiveQuietTurns - 1) {
        quietMessage = 'The extended period of calm is making people uneasy.';
      }
      
      this.setInfoText(quietMessage, true);
    }
    
    // Decrease public opinion slowly if risk is high (people growing concerned even without quakes)
    if (this.risk > this.config.effects.highRiskThreshold) {
      this.publicOpinion -= this.config.effects.highRiskOpinionLoss;
      this.setInfoText(`Public is worried about seismic risk. Opinion -${this.config.effects.highRiskOpinionLoss}.`, true, 'warning');
    }
  }
  
  /**
   * Check if the game is over
   * @returns Whether the game is over
   */
  private checkGameOver(): boolean {
    // Game is over if turns run out
    if (this.turnsRemaining <= 0) {
      return true;
    }
    
    // Game is over if public opinion reaches 0
    if (this.publicOpinion <= 0) {
      return true;
    }
    
    // Game is over if research points reach the win threshold
    if (this.researchPoints >= this.config.winConditions.research) {
      return true;
    }
    
    // Game is over if money runs out
    if (this.money <= 0) {
      return true;
    }
    
    // Game is over if risk gets too high
    if (this.risk >= this.config.winConditions.maxRisk) {
      return true;
    }
    
    return false;
  }
  
  /**
   * Handle end of game and determine win/loss
   */
  private handleGameOver() {
    let result = '';
    let explanation = '';
    
    // Check win conditions
    if (this.researchPoints >= this.config.winConditions.research) {
      result = 'You Win!';
      explanation = `You've successfully developed geothermal energy with ${this.researchPoints} research points!`;
    } 
    // Check loss conditions
    else if (this.publicOpinion <= 0) {
      result = 'Game Over';
      explanation = 'Public opinion has turned against your project. Your funding has been cut.';
    }
    else if (this.money <= 0) {
      result = 'Game Over';
      explanation = 'You\'ve run out of funding for your research.';
    }
    else if (this.risk >= this.config.winConditions.maxRisk) {
      result = 'Game Over';
      explanation = 'Seismic activity has reached dangerous levels. The government has shut down your project.';
    }
    else {
      result = 'Game Over';
      explanation = 'You\'ve run out of time to complete your research.';
    }
    
    // Start the game over scene
    this.scene.start('GameOverScene', { 
      result, 
      explanation,
      stats: {
        turns: this.turn,
        money: this.money,
        publicOpinion: this.publicOpinion,
        risk: this.risk,
        researchPoints: this.researchPoints,
        turnsRemaining: this.turnsRemaining
      }
    });
  }
  
  /**
   * Handle advancing to the next turn
   */
  handleNextTurn() {
    // Apply passive rewards if not already applied this turn
    if (!this.passiveRewardsApplied) {
      this.applyPassiveRewards();
      this.passiveRewardsApplied = true;
    }
    
    // Increment turn counter
    this.turn++;
    
    // Run event chance calculation
    this.handleSeismicEvents();
    
    // Check if the game is over
    if (this.checkGameOver()) {
      this.handleGameOver();
      return;
    }
    
    // Update resource displays
    this.updateResourceDisplay();
    
    // Reset action buttons for next turn
    this.clearActionOptions();
  }

  /**
   * Apply passive rewards at the end of each turn
   * This simulates ongoing background activities like research and funding
   */
  applyPassiveRewards() {
    const rewards = this.config.passiveRewards;
    const effects = {
      money: 0,
      knowledge: 0
    };
    
    // Add base research income
    effects.knowledge += rewards.baseResearchPerTurn;
    
    // Add opinion-based income (higher opinion = more funding)
    const opinionPercent = this.publicOpinion / this.config.maxValues.opinion;
    effects.money += Math.floor(rewards.baseFundingPerTurn * opinionPercent);
    
    // Apply the effects
    this.researchPoints += effects.knowledge;
    this.money += effects.money;
    
    // Create message based on effects
    let message = '';
    if (effects.knowledge > 0 && effects.money > 0) {
      message = `Passive income: Research +${effects.knowledge}, Funding +$${effects.money}.`;
    } else if (effects.knowledge > 0) {
      message = `Ongoing research yielded +${effects.knowledge} knowledge.`;
    } else if (effects.money > 0) {
      message = `Received +$${effects.money} in ongoing funding.`;
    }
    
    if (message) {
      this.setInfoText(message, false, 'success');
    }
    
    // Update UI
    this.updateResourceDisplay();
  }
  
  /**
   * End the current turn and check for game over
   */
  endTurn() {
    // Reset passive rewards tracking for next turn
    this.passiveRewardsApplied = false;
  }
  
  /**
   * Clean up event listeners and other resources when scene is shut down
   * This is called by our scene lifecycle management
   */
  public destroy() {
    // Clean up resize event handler
    if (this.resizeHandler) {
      this.scale.off('resize', this.resizeHandler, this);
      this.resizeHandler = null;
    }
    
    // Clear any pending resize timeout
    if (this.resizeTimeoutId !== null) {
      clearTimeout(this.resizeTimeoutId);
      this.resizeTimeoutId = null;
    }
  }
}