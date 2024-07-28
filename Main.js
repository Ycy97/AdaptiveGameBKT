//Main phaser file which contains the configuration of a Phaser3 Game

let config = {
    type: Phaser.AUTO,
    width: window.innerWidth, 
    height: window.innerHeight,
    scale:{
      mode: Phaser.Scale.RESIZE,
      autoCenter: Phaser.Scale.CENTER_BOTH
    }, 
    physics: {
      default: 'arcade',
      arcade: {
        // debug: true
      }
    },
    scene: [Lounge, Bathroom, Classroom, LoungeMedium]
  
}

let game = new Phaser.Game(config);

// reserve keyboard vars
let keySPACE, keyW, keyA, keyS, keyD, keyE, keyC, keyM;
let key0, key1, key2, key3, key4, key5, key6, key7, key8, key9;   // for code entry

// global vars
let centerX = game.config.width / 2;
let centerY = game.config.height / 2;
let backWall = game.config.height / 4;

window.addEventListener('resize', () =>{
  game.scale.resize(window.innerWidth, window.innerHeight);
})