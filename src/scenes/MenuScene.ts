// src/scenes/MenuScene.ts
export class MenuScene extends Phaser.Scene {
    constructor() { super('MenuScene'); }
    create() {
      this.add.text(400, 200, 'GeoWaves: The Heat is On!', { 
        fontSize: '32px', color: '#ffffff' 
      }).setOrigin(0.5);
      const startBtn = this.add.text(400, 300, 'Start Project', { backgroundColor: '#000', padding: 10 })
        .setOrigin(0.5).setInteractive({ useHandCursor: true });
      startBtn.on('pointerdown', () => {
        this.scene.start('GameScene');  // switch to main game
      });
    }
  }
  