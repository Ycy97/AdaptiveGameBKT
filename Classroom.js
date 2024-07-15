class Classroom extends Phaser.Scene {

    constructor() {
        super("Classroom")
        this.isInteractable = false; // Add a flag to check for interactable state
        this.canInteract = true; // Flag to control interaction cooldown
        this.dialogText = null; // Placeholder for the dialog text object
        this.questions = []; // Store fetched questions
        this.npcDialogBox = null; // Separate dialog box for NPC interactions
        this.dialogWidth = null;  
        this.dialogHeight = null; 
        this.questionActive = false; // Flag to check if a question is currently active
        this.currentQuestionIndex = null;
        this.lastSolvedId = 0; // Start with 0, no puzzle solved
        this.passcodeNumbers = []; // Array to store passcode numbers
        this.hudText = null; // HUD text object
        this.timerText = null;
        this.initialTime = 10 * 60; // 10 minutes in seconds

        this.hints = {
            1: 'Grab a paddle and lets play ping-pong!',
            2: 'Lets get some food from the picnic basket.',
            3: 'Grab a pool stick and lets play pool!',
            4: 'Lets sit on the couch and watch some TV',
            5: 'That was fun! Lets go to the next room!',
            // ... more hints
          };
    }

// Preload function to load assets
    preload() {

        // Load tileset images
        this.load.image('classroom', 'assets/themes/5_Classroom_and_library_32x32.png');
        this.load.image('door', 'assets/themes/1_Generic_32x32.png');
        this.load.image('roombuilder', 'assets/themes/Room_Builder_32x32.png');

        // Load the Tiled map JSON file
        this.load.tilemapTiledJSON('classroomMap', 'assets/classroom.json');

        this.load.spritesheet('player', 'assets/player.png', {

            frameWidth: 32,
            frameHeight: 50,
        });
    }

// Create function to create the map
    create() {

        // Define movespeed
        this.movespeed = 120; // Adjust the value as needed

        // Create the map object
        const map = this.make.tilemap({key: 'classroomMap'});

        // Add tilesets to the map
        const classroomTiles = map.addTilesetImage('Classroom', 'classroom');
        const doorTiles = map.addTilesetImage('Doors', 'door');
        const roombuilderTiles = map.addTilesetImage('RoomBuilder', 'roombuilder');

        // Create layers from the map data
        const layoutLayer = map.createLayer('Layout', [classroomTiles, doorTiles, roombuilderTiles]);
        const furnitureLayer = map.createLayer('Furniture', [classroomTiles, doorTiles, roombuilderTiles]);
        const miscLayer = map.createLayer('Misc', [classroomTiles, doorTiles, roombuilderTiles]);

        // Center the map on the screen
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        const cameraX = centerX - (mapWidth / 2);
        const cameraY = centerY - (mapHeight / 2);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

        this.player = this.physics.add.sprite(432, 500, 'player');

        // Set camera properties
        this.cameras.main.startFollow(this.player, true); // Make the camera follow the player
        this.cameras.main.setZoom(2.2); // Zoom in x2

        // player animations (walking)
        this.anims.create({
            key: 'down',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('player', { start: 18, end: 23 }),
        });
        this.anims.create({
            key: 'up',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('player', { start: 6, end: 11 }),
        });
        this.anims.create({
            key: 'left',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('player', { start: 12, end: 17 }),
        });
        this.anims.create({
            key: 'right',
            frameRate: 8,
            repeat: -1,
            frames: this.anims.generateFrameNumbers('player', { start: 0, end: 5 }),
        });

        // define keys
        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
        keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);


    }

    update() {

        // Reset velocity
        this.player.body.setVelocity(0);

        // Horizontal movement
        if (keyA.isDown) {
            this.player.body.setVelocityX(-this.movespeed);
            this.player.direction = "left";
        } else if (keyD.isDown) {
            this.player.body.setVelocityX(this.movespeed);
            this.player.direction = "right";
        }

        // Vertical movement
        if (keyW.isDown) {
            this.player.body.setVelocityY(-this.movespeed);
            this.player.direction = "up";
        } else if (keyS.isDown) {
            this.player.body.setVelocityY(this.movespeed);
            this.player.direction = "down";
        }

        // Play animations
        if (keyW.isDown || keyS.isDown || keyA.isDown || keyD.isDown) {
            this.player.anims.play(`${this.player.direction}`, true);
        } else {
            this.player.anims.stop();
        }

        if (Phaser.Input.Keyboard.JustDown(keyM)) {
            this.scene.start('Lounge', { reset: true });
        }

    }

}