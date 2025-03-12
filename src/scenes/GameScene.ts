import Phaser from 'phaser';
import { ResourceBar } from '../ui/ResourceBar';

export class GameScene extends Phaser.Scene {
  // Game constants for initial values
  private static readonly INITIAL_MONEY = 100;
  private static readonly INITIAL_TURNS = 10;
  private static readonly INITIAL_OPINION = 100;
  private static readonly INITIAL_RISK = 0;
  private static readonly INITIAL_RESEARCH = 0;
  private static readonly RESEARCH_NEEDED = 50;
  private static readonly MAX_RISK = 100;

  // Game constants for action costs
  private static readonly THEORY_MONEY_COST = 10;
  private static readonly THEORY_TURNS_COST = 2;
  private static readonly THEORY_RESEARCH_GAIN = 5;
  private static readonly THEORY_RISK_INCREASE = 0;

  private static readonly PRACTICAL_MONEY_COST = 25;
  private static readonly PRACTICAL_TURNS_COST = 1;
  private static readonly PRACTICAL_RISK_INCREASE = 5;
  private static readonly PRACTICAL_RESEARCH_GAIN = 8;

  private static readonly ENGAGEMENT_MONEY_COST = 5;
  private static readonly ENGAGEMENT_TURNS_COST = 1;
  private static readonly ENGAGEMENT_OPINION_GAIN = 10;

  // Game constants for events
  private static readonly MINOR_EVENT_THRESHOLD = 50; // Risk below this is a minor event
  private static readonly MINOR_EVENT_OPINION_LOSS = 10;
  private static readonly MAJOR_EVENT_OPINION_LOSS = 30;
  private static readonly MAJOR_EVENT_TURNS_LOSS = 1;

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

    // Calculate button positions based on resource bar spacing
    const buttonStartY = startY + spacing * 8;

    // Action buttons using helper method
    this.createActionButton(buttonStartY, 'Theoretical Research', () => this.doResearch('theory'));
    this.createActionButton(buttonStartY + 30, 'Practical Research', () => this.doResearch('practical'));
    this.createActionButton(buttonStartY + 60, 'Public Engagement', () => this.doEngagement());
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
   * Perform research action based on the selected type
   * @param type The type of research to perform (theory or practical)
   */
  doResearch(type: 'theory' | 'practical') {
    if (type === 'theory') {
      this.money -= GameScene.THEORY_MONEY_COST;
      this.turnsRemaining -= GameScene.THEORY_TURNS_COST;
      this.risk += GameScene.THEORY_RISK_INCREASE;
      this.researchPoints += GameScene.THEORY_RESEARCH_GAIN;
      this.infoText.setText('Conducted theoretical studies this turn.');
    } else if (type === 'practical') {
      this.money -= GameScene.PRACTICAL_MONEY_COST;
      this.turnsRemaining -= GameScene.PRACTICAL_TURNS_COST;
      this.risk += GameScene.PRACTICAL_RISK_INCREASE;
      this.researchPoints += GameScene.PRACTICAL_RESEARCH_GAIN;
      this.infoText.setText('Performed practical field tests this turn.');
    }
    this.endTurn();
  }

  /**
   * Perform public engagement action to improve public opinion
   */
  doEngagement() {
    this.money -= GameScene.ENGAGEMENT_MONEY_COST;
    this.turnsRemaining -= GameScene.ENGAGEMENT_TURNS_COST;
    this.publicOpinion += GameScene.ENGAGEMENT_OPINION_GAIN;
    this.infoText.setText('Held a community engagement session this turn.');
    this.endTurn();
  }

  handleSeismicEvents() {
    // Apply a random seismic event based on risk
    if (Math.random() * 100 < this.risk) {  // risk is a percentage chance
      // An event occurs
      if (this.risk < GameScene.MINOR_EVENT_THRESHOLD) {
        // minor event
        this.publicOpinion -= GameScene.MINOR_EVENT_OPINION_LOSS;
        this.infoText.setText(`${this.infoText.text}\nA minor quake occurred! Public Opinion -${GameScene.MINOR_EVENT_OPINION_LOSS}.`);
      } else {
        // major event
        this.publicOpinion -= GameScene.MAJOR_EVENT_OPINION_LOSS;
        this.turnsRemaining -= GameScene.MAJOR_EVENT_TURNS_LOSS;
        this.infoText.setText(
          `${this.infoText.text}\nMajor earthquake! Public Opinion -${GameScene.MAJOR_EVENT_OPINION_LOSS}, Turns -${GameScene.MAJOR_EVENT_TURNS_LOSS}.`
        );
      }
    } else {
      // no event
      this.infoText.setText(`${this.infoText.text}\nNo significant events this turn.`);
    }
    // AI-driven public opinion drift: if no engagement for many turns, opinion might drop slightly
    // (For MVP, we could simulate this by dropping opinion by 2 if an engagement action wasn't done, etc. 
    // For simplicity, not implemented in this snippet.)

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