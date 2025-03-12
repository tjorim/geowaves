import Phaser from 'phaser';
import { ResourceBar } from '../ui/ResourceBar';
import { Button } from '../ui/Button';
import { ActionOption, ActionData } from '../ui/ActionOption';
import { events } from '../data/events';
import { communityEngagement } from '../data/community';
import { researchTheoretical } from '../data/researchTheoretical';
import { researchPractical } from '../data/researchPractical';

// Game configuration constants
interface GameConfig {
  initialValues: {
    money: number;
    turns: number;
    opinion: number;
    risk: number;
    research: number;
  };
  limits: {
    researchNeeded: number;
    maxRisk: number;
  };
  effects: {
    highRiskThreshold: number;
    highRiskOpinionLoss: number;
  };
  events: {
    baseChance: number;         // Base chance of an event (percentage)
    minTurnsBetweenEvents: number; // Minimum turns between events for pacing
    maxConsecutiveQuietTurns: number; // Max turns without events before forcing one
    riskMultiplier: number;     // How much risk impacts event chance
    bigEventThreshold: number;  // Risk threshold for major events
  };
}

// Centralized game configuration - can be easily moved to external file
const DEFAULT_GAME_CONFIG: GameConfig = {
  initialValues: {
    money: 200,       // Starting funds (increased from 100)
    turns: 15,        // Available turns (increased from 10)
    opinion: 100,     // Initial public opinion
    risk: 10,         // Initial seismic risk (increased from 0 to create more events)
    research: 0       // Starting research points
  },
  limits: {
    researchNeeded: 50, // Research points needed to win
    maxRisk: 100        // Maximum possible risk level
  },
  effects: {
    highRiskThreshold: 50, // Risk above this causes passive opinion loss
    highRiskOpinionLoss: 5 // Amount of opinion lost per turn when risk is high
  },
  events: {
    baseChance: 15,       // 15% base chance of event regardless of risk
    minTurnsBetweenEvents: 2, // At least 2 turns between events for gameplay pacing
    maxConsecutiveQuietTurns: 3, // Force event after 3 quiet turns
    riskMultiplier: 0.7,   // Each point of risk adds 0.7% to event chance
    bigEventThreshold: 70  // Risk above 70 enables major event types
  }
};

export class GameScene extends Phaser.Scene {
  // Reference to game configuration for easy access
  private config: GameConfig = DEFAULT_GAME_CONFIG;

  // Game variables
  private money = this.config.initialValues.money;
  private turnsRemaining = this.config.initialValues.turns;
  private publicOpinion = this.config.initialValues.opinion;
  private risk = this.config.initialValues.risk;
  private turn = 1;
  private researchPoints = this.config.initialValues.research;
  
  // Event pacing variables
  private turnsSinceLastEvent = 0;
  private consecutiveQuietTurns = 0;
  private hadEventLastTurn = false;
  
  // UI container for action buttons and descriptions
  private actionsContainer!: Phaser.GameObjects.Container;

  // Resource bars
  private moneyBar!: ResourceBar;
  private turnsBar!: ResourceBar;
  private opinionBar!: ResourceBar;
  private riskBar!: ResourceBar;
  private researchBar!: ResourceBar;

  // Info text
  private infoText!: Phaser.GameObjects.Text;
  
  // Common UI styles
  private textStyleInfo!: Phaser.Types.GameObjects.Text.TextStyle;

  constructor() { super('GameScene'); }
  
  // We no longer use this method since we're creating buttons directly in the UI methods

  create() {
    // Initialize the UI immediately
    this.initUI();
    
    // Listen for resize events
    this.scale.on('resize', this.handleResize, this);
  }
  
  /**
   * Initialize UI elements based on current screen size
   */
  initUI() {
    // Clear existing UI if present (important for resize handling)
    if (this.actionsContainer) {
      this.actionsContainer.destroy();
    }
    
    if (this.moneyBar) {
      this.moneyBar.destroy();
      this.turnsBar.destroy();
      this.opinionBar.destroy();
      this.riskBar.destroy();
      this.researchBar.destroy();
    }
    
    if (this.infoText) {
      this.infoText.destroy();
    }
    
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    
    // Detect orientation for mobile
    const isLandscape = gameWidth > gameHeight;
    
    // Define text style for info text
    this.textStyleInfo = {
      fontSize: isMobile ? '20px' : '16px',
      color: '#fff',
      wordWrap: { width: gameWidth * 0.9 }
    };
    
    // Adjust sizes based on screen dimensions and orientation
    const barWidth = isMobile ? Math.min(150, gameWidth * 0.4) : 150;
    const barHeight = 15;
    const startY = 20;
    const spacing = isMobile ? 20 : 25;

    // Create resource bars - adjust position if on mobile
    const barX = isMobile ? gameWidth * 0.05 : Math.max(50, gameWidth * 0.1); // Match button spacing
    this.moneyBar = new ResourceBar(this, barX, startY, barWidth, barHeight, this.config.initialValues.money, this.money, 'Money', 0x00ff00);
    this.turnsBar = new ResourceBar(this, barX, startY + spacing, barWidth, barHeight, this.config.initialValues.turns, this.turnsRemaining, 'Turns', 0x00ffff);
    this.opinionBar = new ResourceBar(this, barX, startY + spacing * 2, barWidth, barHeight, this.config.initialValues.opinion, this.publicOpinion, 'Opinion', 0xffff00);
    this.riskBar = new ResourceBar(this, barX, startY + spacing * 3, barWidth, barHeight, this.config.limits.maxRisk, this.risk, 'Risk', 0xff0000);
    this.researchBar = new ResourceBar(this, barX, startY + spacing * 4, barWidth, barHeight, this.config.limits.researchNeeded, this.researchPoints, 'Research', 0x00ffff);

    // Instructions / status text
    this.infoText = this.add.text(
      barX, 
      startY + spacing * 6, 
      '', // Initialize with empty text
      this.textStyleInfo
    );
    
    // Set initial instruction message
    this.setInfoText('Choose an action for this turn.');

    // Create main action buttons using our reusable component
    this.createMainButtons(isLandscape);
    
    // Update resource displays
    this.updateResourceDisplay();
  }
  
  /**
   * Handle window resize events
   */
  handleResize() {
    // Stop all tweens and input events
    this.tweens.killAll();
    
    // Clean up all elements
    this.children.list.forEach(child => {
      if (child.destroy) {
        child.destroy();
      }
    });
    
    // Small delay to ensure clean rebuild
    this.time.delayedCall(50, () => {
      // Reinitialize UI components with new dimensions
      this.initUI();
    });
  }

  updateResourceDisplay() {
    // Update resource bar values
    this.moneyBar.setValue(this.money);
    this.turnsBar.setValue(this.turnsRemaining);
    this.opinionBar.setValue(this.publicOpinion);
    this.riskBar.setValue(this.risk);
    this.researchBar.setValue(this.researchPoints);
  }
  
  /**
   * Centralized helper for managing info text updates
   * @param message Primary message to display
   * @param append Whether to append or replace existing text
   * @param type Optional message type for styling (normal, warning, success)
   */
  setInfoText(message: string, append: boolean = false, type: 'normal' | 'warning' | 'success' = 'normal') {
    // Apply any styling based on message type
    let coloredMessage = message;
    switch (type) {
      case 'warning':
        coloredMessage = `💢 ${message}`; // Visual indicator for warnings
        break;
      case 'success':
        coloredMessage = `✅ ${message}`; // Visual indicator for success
        break;
      default:
        break;
    }
    
    // Either append or replace text based on the append parameter
    if (append && this.infoText.text) {
      this.infoText.setText(`${this.infoText.text}\n${coloredMessage}`);
    } else {
      this.infoText.setText(coloredMessage);
    }
  }
  
  /**
   * Helper to check if an action is affordable
   * @param cost Money cost of the action
   * @param timeRequired Time/turns required for the action
   * @returns Boolean indicating whether the action can be afforded
   */
  canAffordAction(cost: number, timeRequired: number): boolean {
    return this.money >= cost && this.turnsRemaining >= timeRequired;
  }
  
  /**
   * Create main action buttons using the Button component
   * @param isLandscape Whether the layout is landscape or portrait
   */
  createMainButtons(isLandscape: boolean) {
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    
    // Calculate button positions
    let buttonStartY, buttonSpacing;
    const startY = 20;
    const spacing = isMobile ? 20 : 25;
    const barX = isMobile ? gameWidth * 0.05 : Math.max(50, gameWidth * 0.1); // Match action option spacing
    
    if (isMobile) {
      if (isLandscape) {
        // Landscape mobile: buttons on right side
        buttonStartY = startY;
        buttonSpacing = 80; // Larger touch targets
      } else {
        // Portrait mobile: buttons at bottom
        buttonStartY = Math.min(startY + spacing * 8, gameHeight * 0.6);
        buttonSpacing = 90; // Even larger touch targets for portrait mode
      }
    } else {
      // Desktop layout
      buttonStartY = startY + spacing * 8;
      buttonSpacing = 50;
    }
    
    // Add a separator line above the buttons for visual clarity
    this.add.graphics()
      .lineStyle(2, 0x666666, 0.8)
      .lineBetween(barX, buttonStartY - 20, barX + gameWidth * 0.8, buttonStartY - 20);
    
    // Create action buttons with optimized layout for orientation
    if (isMobile && isLandscape) {
      // Landscape layout: buttons on right side
      const rightSideX = gameWidth * 0.6;
      
      // Use our reusable Button component
      new Button(
        this,
        rightSideX,
        buttonStartY,
        'Theoretical Research',
        () => this.showTheoreticalResearchOptions()
      );
      
      new Button(
        this,
        rightSideX,
        buttonStartY + buttonSpacing,
        'Practical Research',
        () => this.showPracticalResearchOptions()
      );
      
      new Button(
        this,
        rightSideX,
        buttonStartY + buttonSpacing * 2,
        'Public Engagement',
        () => this.showCommunityEngagementOptions()
      );
    } else {
      // Portrait or desktop layout: buttons stacked vertically
      new Button(
        this,
        barX,
        buttonStartY,
        'Theoretical Research',
        () => this.showTheoreticalResearchOptions()
      );
      
      new Button(
        this,
        barX,
        buttonStartY + buttonSpacing,
        'Practical Research',
        () => this.showPracticalResearchOptions()
      );
      
      new Button(
        this,
        barX,
        buttonStartY + buttonSpacing * 2,
        'Public Engagement',
        () => this.showCommunityEngagementOptions()
      );
    }
  }

  /**
   * Create action options with the ActionOption component
   * @param actions Array of action data
   * @param callback Function to call when an action is selected
   * @returns Object with layout data for back button positioning
   */
  createActionOptions<T extends ActionData>(actions: T[], callback: (action: T) => void) {
    // Clear any existing options first
    this.clearActionOptions();
    
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    const isLandscape = gameWidth > gameHeight;
    
    // Determine layout based on screen size and orientation
    let yPos, xPos, spacing;
    
    if (isMobile) {
      if (isLandscape) {
        // Landscape mobile layout
        yPos = 120;
        xPos = Math.max(30, gameWidth * 0.05);
        spacing = 80; // Larger touch targets for mobile
      } else {
        // Portrait mobile layout
        yPos = 200;
        // Ensure there's enough space from the left edge
        xPos = Math.max(30, gameWidth * 0.1); 
        spacing = 110; // Even larger spacing for portrait
      }
    } else {
      // Desktop layout
      yPos = 250;
      xPos = Math.max(50, gameWidth * 0.1); // Increase margin on desktop
      spacing = 80;
    }
    
    // Ensure options don't go off-screen by setting a reasonable margin
    // Keep at least 10% margin from screen edges
    
    // Create action options for each action, limiting to 3 visible at a time if there are many
    // This prevents off-screen options
    const maxVisibleOptions = 3; // Limits scrolling somewhat
    const displayActions = actions.slice(0, maxVisibleOptions);
    
    displayActions.forEach((action, index) => {
      // Create the ActionOption component with proper positioning
      const actionOption = new ActionOption(
        this,
        xPos,
        yPos + index * spacing,
        action,
        () => {
          // Let the action method handle validation
          callback(action);
        },
        isLandscape // Use horizontal layout in landscape mode
      );
      
      // Ensure it's properly marked for cleanup - sometimes the container mark isn't visible to all cleanup
      actionOption.setData('isOption', true);
    });
    
    // Return layout data for back button positioning
    return {
      xPos,
      yPos,
      spacing,
      actionCount: Math.min(displayActions.length, maxVisibleOptions)
    };
  }

  /**
   * Generic method to display action options for the player to select
   * @param options Array of action options to display
   * @param actionCallback Callback function when an option is selected
   */
  private showActionOptions<T extends ActionData>(
    options: T[],
    actionCallback: (option: T) => void
  ) {
    // Create options using our reusable component
    const layout = this.createActionOptions(options, actionCallback);
    
    // Get screen dimensions
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    
    // Make sure back button is accessible and always on screen
    // Use a position that's safely within the viewport
    const backButtonY = Math.min(
      layout.yPos + layout.actionCount * layout.spacing + (isMobile ? 30 : 20),
      gameHeight - 60 // Keep button at least 60px from bottom
    );
    
    // Create back button using Button component
    const backButton = new Button(
      this,
      layout.xPos,
      backButtonY,
      'Back',
      () => {
        // Use a small delay to ensure proper cleanup order
        this.time.delayedCall(10, () => {
          this.clearActionOptions();
        });
      },
      { 
        backgroundColor: 0x333333, // Darker to stand out
        padding: { left: 20, right: 20, top: 10, bottom: 10 } // Smaller padding
      }
    );
    
    // Explicitly mark for cleanup
    backButton.setData('isOption', true);
  }
  
  /**
   * Display theoretical research options for the player to select
   */
  showTheoreticalResearchOptions() {
    this.showActionOptions(researchTheoretical, this.doTheoreticalResearch.bind(this));
  }
  
  /**
   * Display practical research options for the player to select
   */
  showPracticalResearchOptions() {
    this.showActionOptions(researchPractical, this.doPracticalResearch.bind(this));
  }
  
  /**
   * Display community engagement options for the player to select
   */
  showCommunityEngagementOptions() {
    this.showActionOptions(communityEngagement, this.doCommunityEngagement.bind(this));
  }
  
  /**
   * Clear all action option buttons and text
   */
  clearActionOptions() {
    // Create a copy of the children list to avoid modification during iteration
    const childrenToCheck = [...this.children.list];
    
    // Destroy any existing option buttons
    childrenToCheck.forEach(child => {
      // Check if it's a button created for options (not our main action buttons)
      if (child.getData && child.getData('isOption')) {
        child.destroy();
      }
    });
    
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isLandscape = gameWidth > gameHeight;
    
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
    
    // Destroy any option elements before moving on
    this.children.list.forEach(child => {
      if (child.getData('isOption')) {
        child.destroy();
      }
    });
    
    // Apply costs and effects
    this.money -= action.cost;
    this.turnsRemaining -= action.timeRequired;
    
    // Apply all effects - now all properties exist on all actions
    this.risk += action.effects.seismicRisk;
    this.publicOpinion += action.effects.publicOpinion;
    this.researchPoints += action.effects.knowledge;
    this.money += action.effects.money;
    
    this.setInfoText(`Conducted ${action.name.en} this turn.`, false, 'success');
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
      // Select a random event from the events array based on game state
      let possibleEvents = [...events];
      
      // Filter events that would be too punishing if money/turns are low
      if (this.money < 50) {
        possibleEvents = possibleEvents.filter(event => 
          !event.effects.money || event.effects.money > -20);
      }
      
      if (this.turnsRemaining < 3) {
        possibleEvents = possibleEvents.filter(event => 
          !event.effects.time || event.effects.time === 0);
      }
      
      // Enable more severe events when risk is very high
      if (this.risk >= this.config.events.bigEventThreshold) {
        // Add weight to more impactful events by doubling their chance of selection
        const highImpactEvents = possibleEvents.filter(event => 
          (event.effects.publicOpinion && event.effects.publicOpinion < -10) || 
          (event.effects.money && event.effects.money < -30)
        );
        
        // Add high impact events again to increase their selection probability
        possibleEvents = [...possibleEvents, ...highImpactEvents];
      }
      
      // If we had an event last turn, slightly favor more moderate events
      // to avoid overwhelming the player with consecutive severe impacts
      if (this.hadEventLastTurn) {
        // Remove the most severe events from the pool (using standardized structure)
        possibleEvents = possibleEvents.filter(event => 
          event.effects.publicOpinion >= -15 && 
          event.effects.money >= -40
        );
      }
      
      // If no events match the filters, use the full list
      if (possibleEvents.length === 0) {
        possibleEvents = [...events];
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
   * Calculate a score based on remaining resources and achievements
   * This creates a more nuanced outcome than simple win/lose
   * @returns A score object with total and breakdown
   */
  calculateGameScore() {
    // Base scoring components
    const researchScore = Math.floor((this.researchPoints / this.config.limits.researchNeeded) * 100);
    const opinionScore = Math.floor((this.publicOpinion / this.config.initialValues.opinion) * 50);
    const riskScore = Math.max(0, 30 - Math.floor((this.risk / this.config.limits.maxRisk) * 30));
    const moneyScore = Math.min(30, Math.floor((this.money / this.config.initialValues.money) * 30));
    const timeScore = this.turnsRemaining > 0 ? Math.min(20, this.turnsRemaining * 3) : 0;
    
    // Research progress bonuses (even for losses)
    let bonusScore = 0;
    const researchProgress = this.researchPoints / this.config.limits.researchNeeded;
    
    // Research progress thresholds
    if (researchProgress >= 0.25) bonusScore += 5;  // 25% complete
    if (researchProgress >= 0.5) bonusScore += 10;  // 50% complete
    if (researchProgress >= 0.75) bonusScore += 15; // 75% complete
    if (researchProgress >= 1) bonusScore += 25;    // 100% complete (major bonus)
    
    // Calculate total score
    const totalScore = researchScore + opinionScore + riskScore + moneyScore + timeScore + bonusScore;
    
    // Return score breakdown for display
    return {
      total: totalScore,
      research: researchScore,
      opinion: opinionScore,
      risk: riskScore,
      money: moneyScore,
      time: timeScore,
      bonus: bonusScore,
      maxPossible: 255 // 100+50+30+30+20+25
    };
  }
  
  /**
   * Determine outcome category based on score and game state
   * @param score The calculated game score
   * @returns An outcome object with type, title, description and rating
   */
  determineGameOutcome(score: { 
    total: number,
    maxPossible: number,
    research: number,
    opinion: number,
    risk: number,
    money: number,
    time: number,
    bonus: number
  }) {
    // Basic parameters
    const researchComplete = this.researchPoints >= this.config.limits.researchNeeded;
    const scorePercent = Math.floor((score.total / score.maxPossible) * 100);
    
    // Outcome categories with descriptions
    const outcome = {
      type: 'neutral',      // win, lose, partial, special
      title: '',            // Short heading
      description: '',      // Longer explanation
      rating: '',           // A-F or special rating
      score: score.total,   // Numeric score
      scorePercent         // Percentage score
    };
    
    // Determine rating based on score percentage
    if (scorePercent >= 90) outcome.rating = 'A+';
    else if (scorePercent >= 80) outcome.rating = 'A';
    else if (scorePercent >= 70) outcome.rating = 'B';
    else if (scorePercent >= 60) outcome.rating = 'C';
    else if (scorePercent >= 50) outcome.rating = 'D';
    else outcome.rating = 'F';
    
    // Special failure conditions
    if (this.publicOpinion <= 0) {
      outcome.type = 'lose';
      outcome.title = 'Project Cancelled';
      outcome.description = 'Public opposition has shut down your project. Your failure to maintain public support led to protests and eventual cancellation.';
      outcome.rating = 'Public Relations Disaster';
      return outcome;
    }
    
    if (this.money <= 0) {
      outcome.type = 'lose';
      outcome.title = 'Bankruptcy';
      outcome.description = 'You ran out of funding and the project has been abandoned. Investors have lost confidence in your management.';
      outcome.rating = 'Financial Failure';
      return outcome;
    }
    
    // Time-based outcomes (normal end of game)
    if (this.turnsRemaining <= 0) {
      if (researchComplete) {
        // Research completed successfully
        if (scorePercent >= 80) {
          outcome.type = 'win';
          outcome.title = 'Groundbreaking Success';
          outcome.description = 'Your research has revolutionized geothermal technologies while maintaining excellent public support and financial management.';
        } else if (scorePercent >= 60) {
          outcome.type = 'win';
          outcome.title = 'Successful Project';
          outcome.description = 'You completed the research with reasonable efficiency, though there was room for improvement in resource management.';
        } else {
          outcome.type = 'partial';
          outcome.title = 'Pyrrhic Victory';
          outcome.description = 'The research is complete, but at what cost? Your project barely scraped by with serious compromises.';
        }
      } else {
        // Research incomplete
        const progressPercent = Math.floor((this.researchPoints / this.config.limits.researchNeeded) * 100);
        
        if (progressPercent >= 75) {
          outcome.type = 'partial';
          outcome.title = 'Promising Results';
          outcome.description = `You achieved ${progressPercent}% of your research goals. With a bit more time, success was within reach.`;
        } else if (progressPercent >= 50) {
          outcome.type = 'lose';
          outcome.title = 'Incomplete Project';
          outcome.description = `You only completed ${progressPercent}% of the necessary research. The project's future is uncertain.`;
        } else {
          outcome.type = 'lose';
          outcome.title = 'Research Failure';
          outcome.description = `With only ${progressPercent}% of research completed, the project is considered a failure.`;
        }
      }
      return outcome;
    }
    
    // This should not be reached in normal gameplay
    return outcome;
  }
  
  /**
   * Check game win/lose conditions with enhanced outcomes
   */
  checkGameConditions() {
    // Return early if game should continue
    if (this.publicOpinion > 0 && this.money > 0 && this.turnsRemaining > 0) {
      return false;
    }
    
    // Calculate final score
    const score = this.calculateGameScore();
    
    // Determine detailed outcome
    const outcome = this.determineGameOutcome(score);
    
    // Start game over scene with detailed outcome information
    this.scene.start('GameOverScene', {
      outcome: outcome.type,
      title: outcome.title,
      description: outcome.description,
      rating: outcome.rating,
      score: score.total,
      scorePercent: outcome.scorePercent,
      scoreBreakdown: {
        research: score.research,
        opinion: score.opinion,
        risk: score.risk,
        money: score.money,
        time: score.time,
        bonus: score.bonus
      }
    });
    
    return true;
  }

  /**
   * Process the end of turn actions and check win/lose conditions
   */
  endTurn() {
    // Handle seismic events and their effects
    this.handleSeismicEvents();

    // Clamp values to reasonable ranges
    this.publicOpinion = Phaser.Math.Clamp(this.publicOpinion, 0, this.config.initialValues.opinion);
    this.money = Phaser.Math.Clamp(this.money, 0, Infinity);
    this.risk = Phaser.Math.Clamp(this.risk, 0, this.config.limits.maxRisk);

    // Update resource display for new turn
    this.updateResourceDisplay();

    // Check win/loss conditions
    if (this.checkGameConditions()) {
      return;
    }
    
    // Otherwise, increment turn and await next player action
    this.turn += 1;
    
    // Reset action buttons for next turn
    this.clearActionOptions();
  }

  /**
   * Cleanup resources when scene is shut down
   */
  shutdown() {
    // Destroy resource bars to prevent memory leaks
    this.moneyBar.destroy();
    this.turnsBar.destroy();
    this.opinionBar.destroy();
    this.riskBar.destroy();
    this.researchBar.destroy();
  }
}