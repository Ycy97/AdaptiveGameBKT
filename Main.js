// Adaptive Environment magic -> Pick a topic -> Get the mastery level of the topic -> Dynamically adjust the gameplay

// Define MainScene first
class MainScene extends Phaser.Scene {
  constructor() {
      super('MainScene');
  }

  preload() {
      // Load the background image
      this.load.image('background', 'assets/escapeRoomSelectionBg.jpg');
  }

  create() {
      // Create the background
      this.add.image(0, 0, 'background').setOrigin(0, 0).setScale(this.scale.width / this.textures.get('background').getSourceImage().width, this.scale.height / this.textures.get('background').getSourceImage().height);
  }
}

// Phaser game configuration
let config = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  scale: {
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
  },
  physics: {
      default: 'arcade',
      arcade: {
          // debug: true
      }
  },
  // Make sure MainScene is the first scene to be loaded
  scene: [MainScene, Bathroom, Lounge, Classroom, LoungeMedium, LoungeHard, ClassroomMedium, ClassroomHard, BathroomMedium, BathroomHard]
};

// Create the Phaser game instance
let game = new Phaser.Game(config);

// Reserve keyboard vars
let keySPACE, keyW, keyA, keyS, keyD, keyE, keyC, keyM, keySHIFT;
let key0, key1, key2, key3, key4, key5, key6, key7, key8, key9;   // for code entry

// Global vars
let centerX = game.config.width / 2;
let centerY = game.config.height / 2;
let backWall = game.config.height / 4;

// Handle resize event
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

// Dynamically start a scene based on student knowledge level
function adaptiveScene(sceneName) {
  // Remove the menu from the DOM once a selection is made
  document.getElementById('menu').style.display = 'none';

  game.scene.stop('MainScene');

  // Start the corresponding Phaser Scene
  game.scene.start(sceneName);
}

// Button event listeners
document.getElementById('algebra-btn').addEventListener('click', () => adaptiveScene('Lounge'));
document.getElementById('numbers-btn').addEventListener('click', () => adaptiveScene('Classroom'));
document.getElementById('probability-btn').addEventListener('click', () => adaptiveScene('Bathroom'));
