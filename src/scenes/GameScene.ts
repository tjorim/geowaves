import Phaser from 'phaser';

export class GameScene extends Phaser.Scene {
  private money = 100;
  private time = 10;
  private publicOpinion = 100;
  private risk = 0;
  private turn = 1;
  private infoText!: Phaser.GameObjects.Text;

  // Text objects for resources
  private moneyText!: Phaser.GameObjects.Text;
  private timeText!: Phaser.GameObjects.Text;
  private opinionText!: Phaser.GameObjects.Text;
  private riskText!: Phaser.GameObjects.Text;

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
    const theoryBtn = this.add.text(20, 200, 'Theoretical Research', { backgroundColor: '#444', color: '#fff', padding: 5 })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doResearch('theory'));
    const practicalBtn = this.add.text(20, 230, 'Practical Research', { backgroundColor: '#444', color: '#fff', padding: 5 })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doResearch('practical'));
    const engageBtn = this.add.text(20, 260, 'Public Engagement', { backgroundColor: '#444', color: '#fff', padding: 5 })
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.doEngagement());
  }

  updateResourceDisplay() {
    // Update text content of existing resource text objects
    this.moneyText.setText(`Money: $${this.money}`);
    this.timeText.setText(`Time: ${this.time} turns left`);
    this.opinionText.setText(`Public Opinion: ${this.publicOpinion}%`);
    this.riskText.setText(`Seismic Risk: ${this.risk}%`);
  }
  // ... (methods for actions below)
}

doResearch(type: 'theory' | 'practical') {
  if (type === 'theory') {
    this.money -= 10;      // costs less money
    this.time -= 2;        // uses more time
    this.risk += 0;        // no immediate risk increase
    // perhaps accumulate some progress points toward completion...
    this.infoText.setText('Conducted theoretical studies this turn.');
  } else if (type === 'practical') {
    this.money -= 25;      // high cost
    this.time -= 1;        // faster
    this.risk += 5;        // increases seismic risk
    this.infoText.setText('Performed practical field tests this turn.');
  }
  this.endTurn();
}

doEngagement() {
  this.money -= 5;
  this.time -= 1;
  this.publicOpinion += 10;
  this.infoText.setText('Held a community engagement session this turn.');
  this.endTurn();
}

endTurn() {
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
      this.time -= 1;
      this.infoText.setText(this.infoText.text + '\nMajor earthquake! Public Opinion -30, Time -1.');
    }
  } else {
    // no event
    this.infoText.setText(this.infoText.text + '\nNo significant events this turn.');
  }
  // AI-driven public opinion drift: if no engagement for many turns, opinion might drop slightly
  // (For MVP, we could simulate this by dropping opinion by 2 if an engagement action wasn’t done, etc. 
  // For simplicity, not implemented in this snippet.)

  // Decrease public opinion slowly if risk is high (people growing concerned even without quakes)
  if (this.risk > 50) {
    this.publicOpinion -= 5;
    this.infoText.setText(this.infoText.text + '\nPublic is worried about seismic risk.');
  }

  // Clamp values to reasonable ranges
  this.publicOpinion = Phaser.Math.Clamp(this.publicOpinion, 0, 100);
  this.money = Math.max(this.money, 0);

  // Update resource display for new turn
  this.updateResourceDisplay();

  // Check loss conditions
  if (this.publicOpinion <= 0) {
    this.scene.start('GameOverScene', { outcome: 'lose', reason: 'Public opposition has shut down your project.' });
    return;
  }
  if (this.money <= 0) {
    this.scene.start('GameOverScene', { outcome: 'lose', reason: 'You ran out of funding.' });
    return;
  }
  if (this.time <= 0) {
    // Time up: determine if project was completed or not
    this.scene.start('GameOverScene', { outcome: (/*projectComplete*/false) ? 'win' : 'lose', reason: 'Project deadline reached.' });
    return;
  }
  // Check win condition (e.g., if we've done enough research)
  // For MVP, perhaps a simple condition: after 10 turns assume project is complete successfully
  if (this.turn >= 10) {
    this.scene.start('GameOverScene', { outcome: 'win' });
    return;
  }
  // Otherwise, increment turn and await next player action
  this.turn += 1;
}
