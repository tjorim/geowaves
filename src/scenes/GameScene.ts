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
  private static readonly INITIAL_MONEY = 100;
  private static readonly INITIAL_TURNS = 10;
  private static readonly INITIAL_OPINION = 100;
  private static readonly INITIAL_RISK = 0;
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

  constructor() { super('GameScene'); }
  
  /**
   * Creates a styled action button with consistent appearance
   * @param y The y position for the button
   * @param text The button text
   * @param callback The function to call when the button is clicked
   * @returns The created button as a Phaser.GameObjects.Text object
   */
  private createActionButton(y: number, text: string, callback: () => void): Phaser.GameObjects.Text {
    return this.add.text(20, y, text, {
      backgroundColor: '#444',
      color: '#fff',
      padding: { left: 5, right: 5, top: 5, bottom: 5 }
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', callback);
  }

  create() {
    // Create resource bars
    const barWidth = 150;
    const barHeight = 15;
    const startY = 20;
    const spacing = 25;

    this.moneyBar = new ResourceBar(this, 20, startY, barWidth, barHeight, GameScene.INITIAL_MONEY, this.money, 'Money', 0x00ff00);
    this.turnsBar = new ResourceBar(this, 20, startY + spacing, barWidth, barHeight, GameScene.INITIAL_TURNS, this.turnsRemaining, 'Turns', 0x00ffff);
    this.opinionBar = new ResourceBar(this, 20, startY + spacing * 2, barWidth, barHeight, GameScene.INITIAL_OPINION, this.publicOpinion, 'Opinion', 0xffff00);
    this.riskBar = new ResourceBar(this, 20, startY + spacing * 3, barWidth, barHeight, GameScene.MAX_RISK, this.risk, 'Risk', 0xff0000);
    this.researchBar = new ResourceBar(this, 20, startY + spacing * 4, barWidth, barHeight, GameScene.RESEARCH_NEEDED, this.researchPoints, 'Research', 0x00ffff);

    // Instructions / status text
    this.infoText = this.add.text(20, startY + spacing * 6, 'Choose an action for this turn.', { fontSize: '16px' });

    // Create container for action buttons and descriptions
    this.actionsContainer = this.add.container(0, 0);

    // Calculate button positions based on resource bar spacing
    const buttonStartY = startY + spacing * 8;

    // Action buttons using helper method
    this.createActionButton(buttonStartY, 'Theoretical Research', () => this.showTheoreticalResearchOptions());
    this.createActionButton(buttonStartY + 30, 'Practical Research', () => this.showPracticalResearchOptions());
    this.createActionButton(buttonStartY + 60, 'Public Engagement', () => this.showCommunityEngagementOptions());
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
    
    // Create option buttons for each theoretical research
    const yPos = 350;
    const spacing = 80;
    
    researchTheoretical.forEach((research, index) => {
      const button = this.createActionButton(yPos + index * spacing, research.name.en, () => {
        if (this.money >= research.cost && this.turnsRemaining >= research.timeRequired) {
          this.doTheoreticalResearch(research);
        } else {
          this.infoText.setText('Not enough resources for this action.');
        }
      });
      
      // Add description text
      const desc = this.add.text(180, yPos + index * spacing, 
        `Cost: $${research.cost}, Time: ${research.timeRequired} turns
        Risk: ${research.effects.seismicRisk || 0}, Knowledge: +${research.effects.knowledge || 0}
        ${research.description.en}`, 
        { fontSize: '12px', wordWrap: { width: 400 } }
      );
      
      this.actionsContainer.add([button, desc]);
    });
    
    // Add back button
    const backButton = this.createActionButton(yPos + researchTheoretical.length * spacing, 'Back', () => {
      this.clearActionOptions();
    });
    this.actionsContainer.add(backButton);
  }
  
  /**
   * Display practical research options for the player to select
   */
  showPracticalResearchOptions() {
    // Clear any existing options first
    this.clearActionOptions();
    
    // Create option buttons for each practical research
    const yPos = 350;
    const spacing = 80;
    
    researchPractical.forEach((research, index) => {
      const button = this.createActionButton(yPos + index * spacing, research.name.en, () => {
        if (this.money >= research.cost && this.turnsRemaining >= research.timeRequired) {
          this.doPracticalResearch(research);
        } else {
          this.infoText.setText('Not enough resources for this action.');
        }
      });
      
      // Add description text
      const desc = this.add.text(180, yPos + index * spacing, 
        `Cost: $${research.cost}, Time: ${research.timeRequired} turns
        Risk: ${research.effects.seismicRisk || 0}, Knowledge: +${research.effects.knowledge || 0}
        ${research.description.en}`, 
        { fontSize: '12px', wordWrap: { width: 400 } }
      );
      
      this.actionsContainer.add([button, desc]);
    });
    
    // Add back button
    const backButton = this.createActionButton(yPos + researchPractical.length * spacing, 'Back', () => {
      this.clearActionOptions();
    });
    this.actionsContainer.add(backButton);
  }
  
  /**
   * Display community engagement options for the player to select
   */
  showCommunityEngagementOptions() {
    // Clear any existing options first
    this.clearActionOptions();
    
    // Create option buttons for each community engagement
    const yPos = 350;
    const spacing = 80;
    
    communityEngagement.forEach((action, index) => {
      const button = this.createActionButton(yPos + index * spacing, action.name.en, () => {
        if (this.money >= action.cost && this.turnsRemaining >= action.timeRequired) {
          this.doCommunityEngagement(action);
        } else {
          this.infoText.setText('Not enough resources for this action.');
        }
      });
      
      // Add description text
      const desc = this.add.text(180, yPos + index * spacing, 
        `Cost: $${action.cost}, Time: ${action.timeRequired} turns
        Opinion: +${action.effects.publicOpinion || 0}
        ${action.description.en}`, 
        { fontSize: '12px', wordWrap: { width: 400 } }
      );
      
      this.actionsContainer.add([button, desc]);
    });
    
    // Add back button
    const backButton = this.createActionButton(yPos + communityEngagement.length * spacing, 'Back', () => {
      this.clearActionOptions();
    });
    this.actionsContainer.add(backButton);
  }
  
  /**
   * Clear all action option buttons and text
   */
  clearActionOptions() {
    this.actionsContainer.removeAll(true);
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
    // Check if a random event occurs based on risk level
    if (Math.random() * 100 < this.risk) {  // risk is a percentage chance
      // Select a random event from the events array
      const eventIndex = Math.floor(Math.random() * events.length);
      const randomEvent = events[eventIndex];
      
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