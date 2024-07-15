class Lose extends Phaser.Scene {
    constructor() {
        super("loseScene");
    }

    preload() {
        this.load.image('gameover', './assets/GameOver.png');

    }

    create() {
        this.add.image(0, 0, 'gameover').setOrigin(0);
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        
    }

    update() {
        if (Phaser.Input.Keyboard.JustDown(keySPACE)) {

            this.scene.stop();
            this.scene.start('Lounge');
        }
    }
}