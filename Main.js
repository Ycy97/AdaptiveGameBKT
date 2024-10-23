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

let latestMastery = null;
let skill = null;

// Handle resize event
window.addEventListener('resize', () => {
  game.scale.resize(window.innerWidth, window.innerHeight);
});

// Dynamically start a scene based on student knowledge level
function adaptiveScene(skill) {
  // Remove the menu from the DOM once a selection is made
  document.getElementById('menu').style.display = 'none';

  game.scene.stop('MainScene');
  let sessionUser = sessionStorage.getItem("username");
  let user_id = sessionUser;

  // Wait for the learner profile to be fetched
  getLearnerProfile(user_id, skill).then(() => {
      // Now you can safely check the latestMastery
      if (skill === "Algebra") {
          if (latestMastery < 0.5) {
              game.scene.start('Lounge');
          } else if (latestMastery < 0.75) {
              game.scene.start('LoungeMedium');
          } else {
              game.scene.start('LoungeHard');
          }
      } else if (skill === "Numbers") {
        if (latestMastery < 0.5) {
            game.scene.start('Classroom');
        } else if (latestMastery < 0.75) {
            game.scene.start('ClassroomMedium');
        } else {
            game.scene.start('ClassroomHard');
        }
      } else if (skill === "Probability") {
        if (latestMastery < 0.5) {
            game.scene.start('Bathroom');
        } else if (latestMastery < 0.75) {
            game.scene.start('BathroomMedium');
        } else {
            game.scene.start('BathroomHard');
        }
      }
  });
}

function getLearnerProfile(user_id, skill) {
  // Return the promise so that the calling function can wait for it
  return fetch('http://127.0.0.1:5000/getLatestProfile', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          user_id: user_id,
          skill: skill
      }),
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Network response was not ok');
      }
      return response.json(); // Return the JSON data
  })
  .then(data => {
      // Handle the data received from the server
      console.log('Learner Profile:', data);
      latestMastery = data.mastery; // Make sure 'data' has 'mastery' property
      skill = data.skill; // Make sure 'data' has 'skill' property
      console.log("Latest Mastery: " + latestMastery);
      console.log("Skill: " + skill);
  })
  .catch(error => {
      console.error('There has been a problem with your fetch operation:', error);
  });
}

// Button event listeners
document.getElementById('algebra-btn').addEventListener('click', () => adaptiveScene('Algebra'));
document.getElementById('numbers-btn').addEventListener('click', () => adaptiveScene('Numbers'));
document.getElementById('probability-btn').addEventListener('click', () => adaptiveScene('Probability'));
