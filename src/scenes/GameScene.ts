import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private money = 100;
  private timeRemaining = 10;
  private publicOpinion = 100;
  private risk = 0;
  private turn = 1;
  private researchPoints = 0;
  private readonly RESEARCH_NEEDED = 50;  // Amount of research needed to complete the project

  // Text objects for resources
  private infoText!: Phaser.GameObjects.Text;
  private moneyText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private opinionText!: Phaser.GameObjects.Text;
  private riskText!: Phaser.GameObjects.Text;
  private researchText!: Phaser.GameObjects.Text;

  constructor() { super('GameScene'); }

  create() {
    // Create resource display text objects
    this.moneyText = this.add.text(20, 20, '', { color: '#0f0' });
    this.timeText = this.add.text(20, 40, '', { color: '#0ff' });
    this.opinionText = this.add.text(20, 60, '', { color: '#ff0' });
    this.riskText = this.add.text(20, 80, '', { color: '#f00' });

    // Update the display with initial values
    this.updateResourceDisplay();

    // Instructions / status text
    this.infoText = this.add.text(20, 150, 'Choose an action for this turn.', { fontSize: '16px' });

    // Action buttons
    this.add.text(20, 200, 'Theoretical Research', {
      backgroundColor: '#444',
      color: '#fff',
      padding: { left: 5, right: 5, top: 5, bottom: 5 }
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doResearch('theory'));

    this.add.text(20, 230, 'Practical Research', {
      backgroundColor: '#444',
      color: '#fff',
      padding: { left: 5, right: 5, top: 5, bottom: 5 }
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doResearch('practical'));

    this.add.text(20, 260, 'Public Engagement', {
      backgroundColor: '#444',
      color: '#fff',
      padding: { left: 5, right: 5, top: 5, bottom: 5 }
    })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doEngagement());
  }

  updateResourceDisplay() {
    // Update text content of existing resource text objects
    this.moneyText.setText(`Money: $${this.money}`);
    this.timeText.setText(`Time: ${this.timeRemaining} turns left`);
    this.opinionText.setText(`Public Opinion: ${this.publicOpinion}%`);
    this.riskText.setText(`Seismic Risk: ${this.risk}%`);
    // Add research progress information
    if (!this.researchText) {
      this.researchText = this.add.text(20, 100, '', { color: '#0ff' });
    }
    this.researchText.setText(`Research Progress: ${this.researchPoints}/${this.RESEARCH_NEEDED}`);
  }

  /**
   * Perform research action based on the selected type
   * @param type The type of research to perform (theory or practical)
   */
  doResearch(type: 'theory' | 'practical') {
    if (type === 'theory') {
      this.money -= 10;      // costs less money
      this.timeRemaining -= 2;        // uses more time
      this.risk += 0;        // no immediate risk increase
      this.researchPoints += 5;  // Theoretical research contributes to completion
      this.infoText.setText('Conducted theoretical studies this turn.');
    } else if (type === 'practical') {
      this.money -= 25;      // high cost
      this.timeRemaining -= 1;        // faster
      this.risk += 5;        // increases seismic risk
      this.researchPoints += 8;  // Practical research contributes more to completion
      this.infoText.setText('Performed practical field tests this turn.');
    }
    this.endTurn();
  }

  /**
   * Perform public engagement action to improve public opinion
   */
  doEngagement() {
    this.money -= 5;
    this.timeRemaining -= 1;
    this.publicOpinion += 10;
    this.infoText.setText('Held a community engagement session this turn.');
    this.endTurn();
  }

  handleSeismicEvents() {
    // Apply a random seismic event based on risk
    if (Math.random() * 100 < this.risk) {  // e.g., risk is a percentage chance
      // An event occurs
      if (this.risk < 50) {
        // minor event
        this.publicOpinion -= 10;
        this.infoText.setText(this.infoText.text + '\nA minor quake occurred! Public Opinion -10.');
      } else {
        // major event
        this.publicOpinion -= 30;
        this.timeRemaining -= 1;
        this.infoText.setText(this.infoText.text + '\nMajor earthquake! Public Opinion -30, Time -1.');
      }
    } else {
      // no event
      this.infoText.setText(this.infoText.text + '\nNo significant events this turn.');
    }
    // AI-driven public opinion drift: if no engagement for many turns, opinion might drop slightly
    // (For MVP, we could simulate this by dropping opinion by 2 if an engagement action wasn't done, etc. 
    // For simplicity, not implemented in this snippet.)

    // Decrease public opinion slowly if risk is high (people growing concerned even without quakes)
    if (this.risk > 50) {
      this.publicOpinion -= 5;
      this.infoText.setText(this.infoText.text + '\nPublic is worried about seismic risk.');
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
    if (this.timeRemaining <= 0) {
      // Time up: determine if project was completed or not
      this.scene.start('GameOverScene', {
        outcome: (this.researchPoints >= this.RESEARCH_NEEDED) ? 'win' : 'lose',
        reason: 'Project deadline reached.'
      });
      return true;
    }
    // Check win condition (e.g., if we've done enough research)
    // For MVP, perhaps a simple condition: after 10 turns assume project is complete successfully
    if (this.turn >= 10) {
      this.scene.start('GameOverScene', { outcome: 'win' });
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
    this.publicOpinion = Phaser.Math.Clamp(this.publicOpinion, 0, 100);
    this.money = Math.max(this.money, 0);

    // Update resource display for new turn
    this.updateResourceDisplay();

    // Check win/loss conditions
    if (this.checkGameConditions()) {
      return;
    }
    // Otherwise, increment turn and await next player action
    this.turn += 1;
  }

}