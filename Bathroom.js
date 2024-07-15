class Bathroom extends Phaser.Scene {

    constructor() {
        super('Bathroom')
    }

// Preload function to load assets
    preload() {

     // Load tileset images
     this.load.image('bathroom', 'assets/themes/3_Bathroom_32x32.png');
     this.load.image('door', 'assets/themes/1_Generic_32x32.png');
     this.load.image('roombuilder', 'assets/themes/Room_Builder_32x32.png');

      // Load the Tiled map JSON file
      this.load.tilemapTiledJSON('bathroomMap', 'assets/bathroom.json');
    }

// Create function to create the map
    create() {

        // Create the map object
        const map = this.make.tilemap({key: 'bathroomMap'});

        // Add tilesets to the map
        const bathroomTiles = map.addTilesetImage('Bathroom', 'bathroom');
        const doorTiles = map.addTilesetImage('Doors', 'door');
        const roombuilderTiles = map.addTilesetImage('RoomBuilder', 'roombuilder');

        // Create layers from the map data
        const layoutLayer = map.createLayer('Layout', [bathroomTiles, doorTiles, roombuilderTiles]);
        const furnitureLayer = map.createLayer('Furniture', [bathroomTiles, doorTiles, roombuilderTiles]);
        const miscLayer = map.createLayer('Misc', [bathroomTiles, doorTiles, roombuilderTiles]);

        keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        // Center the map on the screen
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        const cameraX = centerX - (mapWidth / 2);
        const cameraY = centerY - (mapHeight / 2);
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);
        //this.cameras.main.setPosition(cameraX, cameraY);
    }

    update() {

        if (Phaser.Input.Keyboard.JustDown(keyM)) {

            //this.scene.stop();
            this.scene.start('Classroom');
        }

    }

}
