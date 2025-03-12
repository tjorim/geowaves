import Phaser from 'phaser';
import { ResourceBar } from '../ui/ResourceBar';
import { events } from '../data/events';
import { communityEngagement } from '../data/community';
import { researchTheoretical } from '../data/researchTheoretical';
import { researchPractical } from '../data/researchPractical';

// Define interfaces for data structures
interface ResearchAction {
  id: string;
  name: { [key: string]: string };
  description: { [key: string]: string };
  cost: number;
  timeRequired: number;
  effects: { 
    seismicRisk?: number; 
    publicOpinion?: number; 
    knowledge?: number;
    money?: number;
  };
}

interface CommunityAction {
  id: string;
  name: { [key: string]: string };
  description: { [key: string]: string };
  cost: number;
  timeRequired: number;
  effects: { 
    publicOpinion?: number; 
    money?: number;
    knowledge?: number;
  };
}

export class GameScene extends Phaser.Scene {
  // Game constants for initial values
  private static readonly INITIAL_MONEY = 200; // Increased from 100
  private static readonly INITIAL_TURNS = 15; // Increased from 10
  private static readonly INITIAL_OPINION = 100;
  private static readonly INITIAL_RISK = 10; // Increased from 0 to create more events
  private static readonly INITIAL_RESEARCH = 0;
  private static readonly RESEARCH_NEEDED = 50;
  private static readonly MAX_RISK = 100;

  // Game constants for passive effects
  private static readonly HIGH_RISK_THRESHOLD = 50; // Risk above this causes passive opinion loss
  private static readonly HIGH_RISK_OPINION_LOSS = 5;

  // Game variables
  private money = GameScene.INITIAL_MONEY;
  private turnsRemaining = GameScene.INITIAL_TURNS;
  private publicOpinion = GameScene.INITIAL_OPINION;
  private risk = GameScene.INITIAL_RISK;
  private turn = 1;
  private researchPoints = GameScene.INITIAL_RESEARCH;
  
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
  private buttonStyleMain: any;
  private buttonStyleOption: any;
  private textStyleInfo: any;
  private textStyleDesc: any;

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
    
    // Define default styles for text and buttons that we'll use throughout the game
    // This ensures consistency across all UI elements
    this.buttonStyleMain = {
      backgroundColor: '#444',
      color: '#fff',
      padding: { left: 20, right: 20, top: 15, bottom: 15 },
      fontSize: isMobile ? '24px' : '16px',
      fontStyle: 'bold'
    };
    
    this.buttonStyleOption = {
      backgroundColor: '#666',
      color: '#fff',
      padding: { left: 20, right: 20, top: 15, bottom: 15 },
      fontSize: isMobile ? '24px' : '16px',
      fontStyle: 'bold'
    };
    
    this.textStyleInfo = {
      fontSize: isMobile ? '20px' : '16px',
      color: '#fff',
      wordWrap: { width: gameWidth * 0.9 }
    };
    
    this.textStyleDesc = {
      fontSize: isMobile ? '18px' : '14px',
      color: '#ccc',
      wordWrap: { width: gameWidth * 0.9 },
      lineSpacing: isMobile ? 8 : 0
    };
    
    // Adjust sizes based on screen dimensions and orientation
    const barWidth = isMobile ? Math.min(150, gameWidth * 0.4) : 150;
    const barHeight = 15;
    const startY = 20;
    const spacing = isMobile ? 20 : 25;

    // Create resource bars - adjust position if on mobile
    const barX = isMobile ? gameWidth * 0.05 : 20;
    this.moneyBar = new ResourceBar(this, barX, startY, barWidth, barHeight, GameScene.INITIAL_MONEY, this.money, 'Money', 0x00ff00);
    this.turnsBar = new ResourceBar(this, barX, startY + spacing, barWidth, barHeight, GameScene.INITIAL_TURNS, this.turnsRemaining, 'Turns', 0x00ffff);
    this.opinionBar = new ResourceBar(this, barX, startY + spacing * 2, barWidth, barHeight, GameScene.INITIAL_OPINION, this.publicOpinion, 'Opinion', 0xffff00);
    this.riskBar = new ResourceBar(this, barX, startY + spacing * 3, barWidth, barHeight, GameScene.MAX_RISK, this.risk, 'Risk', 0xff0000);
    this.researchBar = new ResourceBar(this, barX, startY + spacing * 4, barWidth, barHeight, GameScene.RESEARCH_NEEDED, this.researchPoints, 'Research', 0x00ffff);

    // Instructions / status text
    this.infoText = this.add.text(
      barX, 
      startY + spacing * 6, 
      'Choose an action for this turn.', 
      this.textStyleInfo
    );

    // Calculate button positions based on resource bar spacing and screen size
    // Different layouts for portrait vs landscape on mobile
    let buttonSpacing;
    let buttonStartY;
    
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
      
      this.add.text(rightSideX, buttonStartY, 'Theoretical Research', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showTheoreticalResearchOptions());
        
      this.add.text(rightSideX, buttonStartY + buttonSpacing, 'Practical Research', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showPracticalResearchOptions());
        
      this.add.text(rightSideX, buttonStartY + buttonSpacing * 2, 'Public Engagement', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showCommunityEngagementOptions());
    } else {
      // Portrait or desktop layout: buttons stacked vertically
      this.add.text(barX, buttonStartY, 'Theoretical Research', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showTheoreticalResearchOptions());
        
      this.add.text(barX, buttonStartY + buttonSpacing, 'Practical Research', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showPracticalResearchOptions());
        
      this.add.text(barX, buttonStartY + buttonSpacing * 2, 'Public Engagement', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showCommunityEngagementOptions());
    }
    
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
   * Display theoretical research options for the player to select
   */
  showTheoreticalResearchOptions() {
    // Clear any existing options first
    this.clearActionOptions();
    
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    const isLandscape = gameWidth > gameHeight;
    
    // Determine layout based on screen size and orientation
    let yPos, xPos, spacing, descX, descWidth;
    
    if (isMobile) {
      if (isLandscape) {
        // Landscape mobile layout
        yPos = 120;
        xPos = 20;
        spacing = 90; // Larger touch targets for mobile
        descX = gameWidth * 0.35;
        descWidth = gameWidth * 0.6;
      } else {
        // Portrait mobile layout
        yPos = 220;
        xPos = 20;
        spacing = 100; // Larger spacing for portrait
        descX = xPos;
        descWidth = gameWidth * 0.9;
      }
    } else {
      // Desktop layout
      yPos = 350;
      xPos = 20;
      spacing = 80;
      descX = 180;
      descWidth = 400;
    }
    
    researchTheoretical.forEach((research, index) => {
      // Create button with larger size on mobile
      this.add.text(xPos, yPos + index * spacing, research.name.en, this.buttonStyleOption)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (this.money >= research.cost && this.turnsRemaining >= research.timeRequired) {
            this.doTheoreticalResearch(research);
          } else {
            this.infoText.setText('Not enough resources for this action.');
          }
        })
        .setData('isOption', true); // Mark as option button for cleanup
      
      // Add description text - layout depends on orientation for mobile
      let descY;
      if (isMobile && !isLandscape) {
        // On portrait mobile, place description below button
        descY = yPos + index * spacing + 40;
      } else {
        // On landscape or desktop, place beside button
        descY = yPos + index * spacing;
      }
      
      this.add.text(descX, descY, 
        `Cost: $${research.cost}, Time: ${research.timeRequired} turns
        Risk: ${research.effects.seismicRisk || 0}, Knowledge: +${research.effects.knowledge || 0}
        ${research.description.en}`, 
        this.textStyleDesc
      ).setData('isOption', true); // Mark as option for cleanup
    });
    
    // Add back button at the bottom
    const backButtonY = yPos + researchTheoretical.length * spacing + (isMobile ? 20 : 0);
    
    this.add.text(xPos, backButtonY, 'Back', this.buttonStyleMain)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.clearActionOptions())
      .setData('isOption', true); // Mark as option for cleanup
  }
  
  /**
   * Display practical research options for the player to select
   */
  showPracticalResearchOptions() {
    // Clear any existing options first
    this.clearActionOptions();
    
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    const isLandscape = gameWidth > gameHeight;
    
    // Determine layout based on screen size and orientation
    let yPos, xPos, spacing, descX, descWidth;
    
    if (isMobile) {
      if (isLandscape) {
        // Landscape mobile layout
        yPos = 120;
        xPos = 20;
        spacing = 90; // Larger touch targets for mobile
        descX = gameWidth * 0.35;
        descWidth = gameWidth * 0.6;
      } else {
        // Portrait mobile layout
        yPos = 220;
        xPos = 20;
        spacing = 100; // Larger spacing for portrait
        descX = xPos;
        descWidth = gameWidth * 0.9;
      }
    } else {
      // Desktop layout
      yPos = 350;
      xPos = 20;
      spacing = 80;
      descX = 180;
      descWidth = 400;
    }
    
    researchPractical.forEach((research, index) => {
      // Create button with larger size on mobile
      this.add.text(xPos, yPos + index * spacing, research.name.en, this.buttonStyleOption)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (this.money >= research.cost && this.turnsRemaining >= research.timeRequired) {
            this.doPracticalResearch(research);
          } else {
            this.infoText.setText('Not enough resources for this action.');
          }
        })
        .setData('isOption', true); // Mark as option button for cleanup
      
      // Add description text - layout depends on orientation for mobile
      let descY;
      if (isMobile && !isLandscape) {
        // On portrait mobile, place description below button
        descY = yPos + index * spacing + 40;
      } else {
        // On landscape or desktop, place beside button
        descY = yPos + index * spacing;
      }
      
      this.add.text(descX, descY, 
        `Cost: $${research.cost}, Time: ${research.timeRequired} turns
        Risk: ${research.effects.seismicRisk || 0}, Knowledge: +${research.effects.knowledge || 0}
        ${research.description.en}`, 
        this.textStyleDesc
      ).setData('isOption', true); // Mark as option for cleanup
    });
    
    // Add back button at the bottom
    const backButtonY = yPos + researchPractical.length * spacing + (isMobile ? 20 : 0);
    
    this.add.text(xPos, backButtonY, 'Back', this.buttonStyleMain)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.clearActionOptions())
      .setData('isOption', true); // Mark as option for cleanup
  }
  
  /**
   * Display community engagement options for the player to select
   */
  showCommunityEngagementOptions() {
    // Clear any existing options first
    this.clearActionOptions();
    
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    const isLandscape = gameWidth > gameHeight;
    
    // Determine layout based on screen size and orientation
    let yPos, xPos, spacing, descX, descWidth;
    
    if (isMobile) {
      if (isLandscape) {
        // Landscape mobile layout
        yPos = 120;
        xPos = 20;
        spacing = 90; // Larger touch targets for mobile
        descX = gameWidth * 0.35;
        descWidth = gameWidth * 0.6;
      } else {
        // Portrait mobile layout
        yPos = 220;
        xPos = 20;
        spacing = 100; // Larger spacing for portrait
        descX = xPos;
        descWidth = gameWidth * 0.9;
      }
    } else {
      // Desktop layout
      yPos = 350;
      xPos = 20;
      spacing = 80;
      descX = 180;
      descWidth = 400;
    }
    
    communityEngagement.forEach((action, index) => {
      // Create button with larger size on mobile
      this.add.text(xPos, yPos + index * spacing, action.name.en, this.buttonStyleOption)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
          if (this.money >= action.cost && this.turnsRemaining >= action.timeRequired) {
            this.doCommunityEngagement(action);
          } else {
            this.infoText.setText('Not enough resources for this action.');
          }
        })
        .setData('isOption', true); // Mark as option button for cleanup
      
      // Add description text - layout depends on orientation for mobile
      let descY;
      if (isMobile && !isLandscape) {
        // On portrait mobile, place description below button
        descY = yPos + index * spacing + 40;
      } else {
        // On landscape or desktop, place beside button
        descY = yPos + index * spacing;
      }
      
      // Format money effect differently based on whether it's positive or negative
      const moneyEffect = action.effects.money 
        ? (action.effects.money > 0 ? `+${action.effects.money}` : action.effects.money)
        : 0;
      
      this.add.text(descX, descY, 
        `Cost: $${action.cost}, Time: ${action.timeRequired} turns
        Opinion: +${action.effects.publicOpinion || 0}${action.effects.money ? `, Money: ${moneyEffect}` : ''}
        ${action.description.en}`, 
        this.textStyleDesc
      ).setData('isOption', true); // Mark as option for cleanup
    });
    
    // Add back button at the bottom
    const backButtonY = yPos + communityEngagement.length * spacing + (isMobile ? 20 : 0);
    
    this.add.text(xPos, backButtonY, 'Back', this.buttonStyleMain)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.clearActionOptions())
      .setData('isOption', true); // Mark as option for cleanup
  }
  
  /**
   * Clear all action option buttons and text
   */
  clearActionOptions() {
    // Destroy any existing option buttons
    this.children.list.forEach(child => {
      // Check if it's a button created for options (not our main action buttons)
      if (child.getData('isOption')) {
        child.destroy();
      }
    });
    
    // Recreate the main button layout
    // Get screen dimensions for responsive layout
    const gameWidth = this.scale.width;
    const gameHeight = this.scale.height;
    const isMobile = gameWidth < 768;
    const isLandscape = gameWidth > gameHeight;
    
    // Calculate button positions and spacing
    let buttonSpacing;
    let buttonStartY;
    const startY = 20;
    const spacing = isMobile ? 20 : 25;
    const barX = isMobile ? gameWidth * 0.05 : 20;
    
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
    
    // Create action buttons with optimized layout for orientation
    if (isMobile && isLandscape) {
      // Landscape layout: buttons on right side
      const rightSideX = gameWidth * 0.6;
      
      this.add.text(rightSideX, buttonStartY, 'Theoretical Research', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showTheoreticalResearchOptions());
        
      this.add.text(rightSideX, buttonStartY + buttonSpacing, 'Practical Research', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showPracticalResearchOptions());
        
      this.add.text(rightSideX, buttonStartY + buttonSpacing * 2, 'Public Engagement', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showCommunityEngagementOptions());
    } else {
      // Portrait or desktop layout: buttons stacked vertically
      this.add.text(barX, buttonStartY, 'Theoretical Research', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showTheoreticalResearchOptions());
        
      this.add.text(barX, buttonStartY + buttonSpacing, 'Practical Research', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showPracticalResearchOptions());
        
      this.add.text(barX, buttonStartY + buttonSpacing * 2, 'Public Engagement', this.buttonStyleMain)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => this.showCommunityEngagementOptions());
    }
  }
  
  /**
   * Perform selected theoretical research action
   */
  doTheoreticalResearch(research: ResearchAction) {
    this.money -= research.cost;
    this.turnsRemaining -= research.timeRequired;
    
    if (research.effects.seismicRisk) this.risk += research.effects.seismicRisk;
    if (research.effects.publicOpinion) this.publicOpinion += research.effects.publicOpinion;
    if (research.effects.knowledge) this.researchPoints += research.effects.knowledge;
    
    this.infoText.setText(`Conducted ${research.name.en} this turn.`);
    this.clearActionOptions();
    this.endTurn();
  }
  
  /**
   * Perform selected practical research action
   */
  doPracticalResearch(research: ResearchAction) {
    this.money -= research.cost;
    this.turnsRemaining -= research.timeRequired;
    
    if (research.effects.seismicRisk) this.risk += research.effects.seismicRisk;
    if (research.effects.publicOpinion) this.publicOpinion += research.effects.publicOpinion;
    if (research.effects.knowledge) this.researchPoints += research.effects.knowledge;
    
    this.infoText.setText(`Conducted ${research.name.en} this turn.`);
    this.clearActionOptions();
    this.endTurn();
  }
  
  /**
   * Perform selected community engagement action
   */
  doCommunityEngagement(action: CommunityAction) {
    this.money -= action.cost;
    this.turnsRemaining -= action.timeRequired;
    
    if (action.effects.publicOpinion) this.publicOpinion += action.effects.publicOpinion;
    if (action.effects.money) this.money += action.effects.money;
    if (action.effects.knowledge) this.researchPoints += action.effects.knowledge;
    
    this.infoText.setText(`Conducted ${action.name.en} this turn.`);
    this.clearActionOptions();
    this.endTurn();
  }

  handleSeismicEvents() {
    // Ensure events happen consistently by having a minimum event chance
    const eventChance = Math.max(20, this.risk); // At least 20% chance of event
    
    // Check if a random event occurs
    if (Math.random() * 100 < eventChance) {
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
      
      // If no events match the filters, use the full list
      if (possibleEvents.length === 0) {
        possibleEvents = [...events];
      }
      
      // Select a random event from the filtered list
      const eventIndex = Math.floor(Math.random() * possibleEvents.length);
      const randomEvent = possibleEvents[eventIndex];
      
      // Apply the event effects
      if (randomEvent.effects.publicOpinion) this.publicOpinion += randomEvent.effects.publicOpinion;
      if (randomEvent.effects.money) this.money += randomEvent.effects.money;
      if (randomEvent.effects.seismicRisk) this.risk += randomEvent.effects.seismicRisk;
      if (randomEvent.effects.time) this.turnsRemaining -= randomEvent.effects.time;
      
      // Display event information to player
      this.infoText.setText(`${this.infoText.text}\nEvent: ${randomEvent.description.en}`);
    } else {
      // No event occurred this turn
      this.infoText.setText(`${this.infoText.text}\nNo significant events this turn.`);
    }
    
    // Decrease public opinion slowly if risk is high (people growing concerned even without quakes)
    if (this.risk > GameScene.HIGH_RISK_THRESHOLD) {
      this.publicOpinion -= GameScene.HIGH_RISK_OPINION_LOSS;
      this.infoText.setText(`${this.infoText.text}\nPublic is worried about seismic risk. Opinion -${GameScene.HIGH_RISK_OPINION_LOSS}.`);
    }
  }

  checkGameConditions() {
    // Check loss conditions
    if (this.publicOpinion <= 0) {
      this.scene.start('GameOverScene', { outcome: 'lose', reason: 'Public opposition has shut down your project.' });
      return true;
    }
    if (this.money <= 0) {
      this.scene.start('GameOverScene', { outcome: 'lose', reason: 'You ran out of funding.' });
      return true;
    }
    if (this.turnsRemaining <= 0) {
      // Turns up: determine if project was completed or not
      this.scene.start('GameOverScene', {
        outcome: (this.researchPoints >= GameScene.RESEARCH_NEEDED) ? 'win' : 'lose',
        reason: 'Project deadline reached.'
      });
      return true;
    }
    return false;
  }

  /**
   * Process the end of turn actions and check win/lose conditions
   */
  endTurn() {
    // Handle seismic events and their effects
    this.handleSeismicEvents();

    // Clamp values to reasonable ranges
    this.publicOpinion = Phaser.Math.Clamp(this.publicOpinion, 0, GameScene.INITIAL_OPINION);
    this.money = Phaser.Math.Clamp(this.money, 0, Infinity);
    this.risk = Phaser.Math.Clamp(this.risk, 0, GameScene.MAX_RISK);

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