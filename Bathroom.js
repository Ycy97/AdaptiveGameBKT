class Bathroom extends Phaser.Scene {

    constructor() {
        super('Bathroom')
        this.isInteractable = false;
        this.canInteract = true;
        this.dialogText = null;
        this.questions = [];
        this.npcDialogBox = null;
        this.dialogWidth = null;  
        this.dialogHeight = null; 
        this.questionActive = false;
        this.currentQuestionIndex = null;
        this.lastSolvedId = 0;
        this.passcodeNumbers = [];
        this.hudText = null;
        this.timerText = null;
        this.lifePointsText = null;
        this.lifePointsValue = 105;
        this.initialTime = 10 * 60;
        this.student_responses = [];
        this.knowledge_state = 0.1;
        this.hintText = [];
        this.hintActive = false;
        this.hintRemaining = 3;

        this.hints = {
            1: 'That rubber duck seems oddly suspicious?',
            2: 'What is in the basket?',
            3: 'Find the plunger!',
            4: 'Try looking for the kitchen towel!',
            5: 'That was fun! Lets go to the next room!',
          };
    }

    preload() {

     // Load tileset images
     this.load.image('classroom', 'assets/themes/5_Classroom_and_library_32x32.png');
     this.load.image('bathroom', 'assets/themes/3_Bathroom_32x32.png');
     this.load.image('door', 'assets/themes/1_Generic_32x32.png');
     this.load.image('roombuilder', 'assets/themes/Room_Builder_32x32.png');

      // Load the Tiled map JSON file
      this.load.tilemapTiledJSON('bathroomMap', 'assets/bathroom.json');

      this.load.spritesheet('player', 'assets/player.png', {

            frameWidth: 32,
            frameHeight: 50,
        });

        this.load.audio('clockLoop','assets/audio/clock_loop.wav');
    }

    create() {

        this.fetchQuestions().then(() => {
            console.log('Questions loaded:', this.questions);
            this.createDialogComponents();
            // Proceed with other setup tasks that depend on questions
        }).catch(error => {
            console.error('Failed to load questions:', error);
        });

        this.movespeed = 120;

        // Create the map object
        const map = this.make.tilemap({key: 'bathroomMap'});

        // Add tilesets to the map
        const classroomTiles = map.addTilesetImage('Classroom', 'classroom');
        const bathroomTiles = map.addTilesetImage('Bathroom', 'bathroom');
        const doorTiles = map.addTilesetImage('Doors', 'door');
        const roombuilderTiles = map.addTilesetImage('RoomBuilder', 'roombuilder');

        // Create layers from the map data
        const layoutLayer = map.createLayer('Layout', [bathroomTiles, doorTiles, roombuilderTiles,classroomTiles]);
        const furnitureLayer = map.createLayer('Furniture', [bathroomTiles, doorTiles, roombuilderTiles,classroomTiles]);
        const miscLayer = map.createLayer('Misc', [bathroomTiles, doorTiles, roombuilderTiles,classroomTiles]);

        // Set collision for tiles with custom property "collision"
        layoutLayer.setCollisionByProperty({ collision: true });
        furnitureLayer.setCollisionByProperty({ collision: true });
        miscLayer.setCollisionByProperty({ collision: true });

        // Center the map on the screen
        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

        this.player = this.physics.add.sprite(550, 445, 'player');

        // Set camera properties
        this.cameras.main.startFollow(this.player, true); // Make the camera follow the player
        this.cameras.main.setZoom(2.2); // Zoom in x2

        // Enable collisions between the player and the map layers
        this.physics.add.collider(this.player, layoutLayer);
        this.physics.add.collider(this.player, furnitureLayer);
        this.physics.add.collider(this.player, miscLayer);

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

        this.clockLoop = this.sound.add('clockLoop', { loop: true});
        this.clockLoop.play({ rate: 1.5, volume: 0.5})

        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keySHIFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        // Overlap check for interactable objects in furnitureLayer
        this.physics.add.overlap(this.player, furnitureLayer, (player, tile) => {
            if (tile.properties.interactable) {
                this.isInteractable = true;
                this.currentInteractable = tile;
            }
        }, null, this);

        // Overlap check for interactable objects in miscLayer
        this.physics.add.overlap(this.player, miscLayer, (player, tile) => {
            if (tile.properties.interactable) {
                this.isInteractable = true;
                this.currentInteractable = tile;
            }
        }, null, this);

        // Overlap check for interactable objects in layoutLayer
        this.physics.add.overlap(this.player, layoutLayer, (player, tile) => {
            if (tile.properties.door) {
                //console.log('Player is near the door');
                this.nearDoor = true;
                this.doorTile = tile;
            }
        }, null, this);

        keySHIFT.on('down', () => {
            if (!this.canInteract) return; // Exit if interaction is on cooldown

            // Early exit if a question is currently active
            if (this.questionActive) {
                return;
            }
        
            // Check if near the door and if all previous puzzles are solved
            if (this.nearDoor && this.lastSolvedId === 5 && this.passcodeNumbers.length === 5) {
                this.askForPasscode();
                return; // Exit the function after triggering the passcode dialog
            }

            // Handle interactions with other objects
            if (this.isInteractable) {
                const interactableId = this.currentInteractable.properties['id'];
                if (interactableId <= 5 && interactableId === this.lastSolvedId + 1) {
                    console.log('Interacting with object:', interactableId);
                    this.showDialogBox();
                } 
                else if(interactableId === -1){
                    console.log("GPT hint accessed");
                    //dialog for GPT prompt and response
                    this.gptDialog();
                }
                else {
                    //this.showPopupMessage('Please solve the previous challenge first.', 3000);
                    console.log('No interactable objects in range')
                }
                return; // Exit the function after triggering the object interaction
            } 

            this.canInteract = false; // Disable further interactions
            this.time.delayedCall(500, () => { // Re-enable interactions after 500ms
                this.canInteract = true;
            });
        
            // If the code execution reaches this point, the player is not interacting with any object or door
            console.log('No interactable object in range.');
        });
        
        // Call the function to create UI components for the dialog box
        this.createDialogComponents();

        let timerOffsetX = -50;
        let timerOffsetY = 100;
        let timerX = this.player.x + timerOffsetX;
        let timerY = this.player.y - timerOffsetY ;

        this.timerText = this.add.text(timerX, timerY, 'Time: 10:00', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setScrollFactor(1);
        this.timerText.setStyle({
            backgroundColor: '#0008',
            padding: { x: 10, y: 5 }
        });


        let lifepointsX = timerX;
        let lifepointsY = timerY + 20;

        this.lifePointsText = this.add.text(lifepointsX, lifepointsY, 'Lives: ' + this.lifePointsValue, {
            fontSize: '16px',
            fill: '#ffffff'
        }).setScrollFactor(1);
        this.lifePointsText.setStyle({
            backgroundColor: '#0008',
            padding: { x: 10, y: 5 }
        });

        let hudTextX = timerX; 
        let hudTextY = lifepointsY + 20; 

        this.hudText = this.add.text(hudTextX, hudTextY, 'Passcode: ', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setScrollFactor(1);

        this.hudText.setStyle({
            backgroundColor: '#0008',
            padding: { x: 10, y: 5 }
        });

        
        //hint button
        let hintX  = timerX;
        let hintY = hudTextY + 20;
        this.hintText = this.add.text(hintX,hintY, 'Hints Remaining:' + this.hintRemaining, {
            fontSize: '16px',
            fill: '#ffffff'
        }).setScrollFactor(1);
        this.hintText.setStyle({
            backgroundColor: '#0008',
            padding: { x: 10, y: 5 }
        });

        // Now create the welcome message
        this.createWelcomeMessage();
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

        // Check if 'M' is pressed and switch to Classroom scene
        if (Phaser.Input.Keyboard.JustDown(keyM)) {
            this.clockLoop.stop();
            this.scene.start('BathroomMedium');
        }

        let timerOffsetX = -50;
        let timerOffsetY = 100;
        let timerX = this.player.x + timerOffsetX; // 380 pixels from the right edge
        let timerY = this.player.y - timerOffsetY ; // 155 pixels from the top

        this.timerText.setPosition(timerX, timerY);

        let lifepointsX = timerX;
        let lifepointsY = timerY + 20;
        this.lifePointsText.setPosition(lifepointsX,lifepointsY);

        let hudTextX = timerX; 
        let hudTextY = lifepointsY + 20;
        this.hudText.setText(`Passcode: ${this.passcodeNumbers.join('')}`).setPosition(hudTextX,hudTextY);

        let hintX  = timerX;
        let hintY = hudTextY + 20;
        
        this.hintText.setPosition(hintX,hintY);

        // Reset the interactable state if not overlapping
        if (!this.player.body.touching.none) {
            this.isInteractable = false;
            this.dialogText.setVisible(false); // Hide the dialog when not interacting
        }

        // Use this.dialogWidth and this.dialogHeight here
        const camCenterX = this.cameras.main.scrollX + this.cameras.main.width / 2;
        const camCenterY = this.cameras.main.scrollY + this.cameras.main.height / 2;
        
        // Adjust these lines to use the class properties
        this.dialogBox.setPosition(camCenterX, camCenterY);
        this.questionText.setPosition(camCenterX, camCenterY - this.dialogHeight / 4); 
        this.closeButton.setPosition(camCenterX, camCenterY + this.dialogHeight / 4); 

        // Calculate the positions for the answer buttons
        const baseY = this.questionText.getBottomCenter().y + 10; // 10 pixels below the question text
        const totalButtonHeight = this.answerButtons.reduce((sum, btn) => sum + btn.height, 0);
        const totalSpacing = (this.closeButton.getTopCenter().y - baseY - totalButtonHeight);
        const buttonSpacing = totalSpacing / (this.answerButtons.length + 1);

        let currentY = baseY + buttonSpacing;
        this.answerButtons.forEach((button, index) => {
            button.setPosition(this.dialogBox.x, currentY);
            currentY += button.height + buttonSpacing;
        });
    }

    displayGptResponse(gptResponse){
        console.log("Entered prompt area");
        //create a dialog component
        const gptDialogBoxcx = document.createElement('div');
        gptDialogBoxcx.style.position = 'fixed';
        gptDialogBoxcx.style.top = '50%';
        gptDialogBoxcx.style.left = '50%';
        gptDialogBoxcx.style.transform = 'translate(-50%, -50%)';
        gptDialogBoxcx.style.width = '1000px';
        gptDialogBoxcx.style.height = '600px';
        gptDialogBoxcx.style.padding = '20px';
        gptDialogBoxcx.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        gptDialogBoxcx.style.color = '#ffffff';
        gptDialogBoxcx.style.borderRadius = '10px';
        gptDialogBoxcx.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        gptDialogBoxcx.style.zIndex = '1000'; // Ensure it's above other elements
        gptDialogBoxcx.style.display = 'flex';
        gptDialogBoxcx.style.flexDirection = 'column'; // Stack elements vertically
        gptDialogBoxcx.style.justifyContent = 'center'; // Center vertically
        gptDialogBoxcx.style.alignItems = 'center'; // Center horizontally
        document.body.appendChild(gptDialogBoxcx);

        const closeButton = document.createElement('button');
        closeButton.innerHTML = '✖'; // Close icon
        closeButton.style.position = 'absolute';
        closeButton.style.top = '10px';
        closeButton.style.right = '10px';
        closeButton.style.background = 'none';
        closeButton.style.border = 'none';
        closeButton.style.color = '#ffffff';
        closeButton.style.fontSize = '20px';
        closeButton.style.cursor = 'pointer';
        gptDialogBoxcx.appendChild(closeButton);

        const gptResponseText = document.createElement('p');
        gptResponseText.innerText = gptResponse;
        gptResponseText.style.textAlign = 'center';
        gptResponseText.style.fontSize = '24px';
        gptDialogBoxcx.appendChild(gptResponseText);

        closeButton.addEventListener('click', () => {
            document.body.removeChild(gptDialogBoxcx); // Remove the dialog box
            this.scene.resume(); // Resume the scene
        });
    }

    gptDialog(){
        this.scene.pause();

        let hintLeft = parseInt(this.hintRemaining, 10);
        if(hintLeft < 1){
            this.scene.resume();
            return;
        }
        //Create modal view background
        const modalBackground = document.createElement('div');
        modalBackground.style.position = 'fixed';
        modalBackground.style.top = '0';
        modalBackground.style.left = '0';
        modalBackground.style.width = '100%';
        modalBackground.style.height = '100%';
        modalBackground.style.backgroundColor = 'rgba(0, 0, 0, 0.5)'; // Grey background
        modalBackground.style.display = 'flex';
        modalBackground.style.justifyContent = 'center';
        modalBackground.style.alignItems = 'center';
        modalBackground.style.zIndex = '999'; // Ensure it's on top


        // Create an HTML input element overlay
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.style.position = 'absolute';
        inputElement.style.top = '50%'; // Center on screen
        inputElement.style.left = '50%';
        inputElement.style.transform = 'translate(-50%, -50%)';
        inputElement.style.fontSize = '30px'; // Big enough to match your game's style
        inputElement.style.width = '1200px'; // Set a specific width
        inputElement.style.height = '100px'; // Set a specific height
        inputElement.placeholder = "Enter your question prompt to access the hints";
    
        document.body.appendChild(modalBackground);
        modalBackground.appendChild(inputElement);
        inputElement.focus(); // Automatically focus the input field


        // Handle the input submission
        inputElement.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                //pass the question as form of prompt to gpt api and get a response back before scene resume
                let prompt = inputElement.value;
                const data = {
                   prompt
                };
                console.log(JSON.stringify(data));
                document.body.removeChild(modalBackground);
                //reduce hint usage
                let hintLeft = parseInt(this.hintRemaining, 10) - 1; // Subtract 1 from the current life points
                // Update hint remaining
                this.hintText.setText('Hints Remaining: ' + hintLeft);
                this.hintRemaining = hintLeft.toString();
                //API to call BKT and get student mastery
                fetch('http://127.0.0.1:5000/chatgpt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(data)
                })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok ' + response.statusText);
                    }
                    return response.json();
                })
                .then(data => {
                    console.log('ChatGPT response', data);
                    //access the value obtained
                    let fetchResponse = data.response;
                    console.log('fetchedResponse', fetchResponse)
                    //display the response on the game
                    this.displayGptResponse(fetchResponse);
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
            }
        });

    }

    createWelcomeMessage() {
        // Calculate the center of the camera view
        const cameraCenterX = this.cameras.main.scrollX + this.cameras.main.width / 2;
        const cameraCenterY = this.cameras.main.scrollY + this.cameras.main.height / 2;
        
        // The text of the welcome message
        const welcomeText = "Welcome to the first Maths Escape Bath Room!\n\n"+
            "Your first clue is: \n\n" +
            "Mirror mirror not on the wall, who is the fairest of them all?"
        
        // Create the text object for the welcome message
        const message = this.add.text(cameraCenterX, cameraCenterY, welcomeText, {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#000000bb', // semi-transparent black background
            align: 'center',
            padding: { x: 20, y: 10 },
            wordWrap: { width: this.cameras.main.width * 0.8 / this.cameras.main.zoom }
        }).setOrigin(0.5).setScrollFactor(0); // The message should not scroll with the camera
    
        // Create the close button below the message
        const closeButton = this.add.text(cameraCenterX, message.y + message.height / 2 + 20, 'Close', {
            fontSize: '16px',
            fill: '#ffffff',
            backgroundColor: '#666',
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5).setInteractive().setScrollFactor(0); // The button should not scroll with the camera
    
        // When the close button is clicked, hide the message and the button
        closeButton.on('pointerdown', () => {
            message.setVisible(false);
            closeButton.setVisible(false);

            // Start the countdown
            this.time.addEvent({
                delay: 1000, // 1000ms = 1 second
                callback: this.updateTimer,
                callbackScope: this, // Corrected the typo here
                loop: true
            });
        });
    
        // Make the welcome message and close button visible
        message.setVisible(true);
        closeButton.setVisible(true);
    }
    
    

    updateTimer() {
        this.initialTime -= 1; // Decrease the timer by one second
    
        // Calculate minutes and seconds from the initialTime
        var minutes = Math.floor(this.initialTime / 60);
        var seconds = this.initialTime % 60;
        
        // Format the time to fit 00:00
        var formattedTime = this.zeroPad(minutes, 2) + ':' + this.zeroPad(seconds, 2);
    
        this.timerText.setText('Time: ' + formattedTime);
    
        // If the timer reaches zero, end the game
        if(this.initialTime <= 0) {
            this.timeExpired();
        }
    }

    zeroPad(number, size) {
        var stringNumber = String(number);
        while (stringNumber.length < (size || 2)) {
            stringNumber = "0" + stringNumber;
        }
        return stringNumber;
    }

    timeExpired() {
        // Stop all timers
        this.time.removeAllEvents();
    
        // Display the message to the player
        this.showPopupMessage('Times up! You failed to escape.\n Game will restart in 10 seconds.', 10000);
    
        // When the countdown ends, the game will reload in 10 seconds
        this.time.delayedCall(10000, () => {
            window.location.reload()
        });
    }
    
    async fetchQuestions() {
        try {
            const response = await fetch('http://127.0.0.1:5000/probabilityandstatisticsEasy');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            this.questions = await response.json();
        } catch (error) {
            console.error('Error fetching probability and statistics questions:', error);
            throw error; // rethrow to handle it in the calling context if needed
        }
    }


    showPopupMessage(message, duration) {
        // Activate the dialog box
        this.dialogBox.setVisible(true);
    
        // Set the text for the dialog box to the message
        this.questionText.setText(message);
        this.questionText.setVisible(true);
    
        // Hide the answer buttons and the close button as they are not needed for this popup
        this.answerButtons.forEach(button => button.setVisible(false));
        this.closeButton.setVisible(false);
    
        // After 'duration' milliseconds, hide the dialog box and the message
        this.time.delayedCall(duration, () => {
            this.dialogBox.setVisible(false);
            this.questionText.setVisible(false);
        });
    }
    
    
    createDialogComponents() {
        // Calculate scaled dimensions
        this.dialogWidth = this.cameras.main.width / this.cameras.main.zoom; // Class property
        this.dialogHeight = this.cameras.main.height / this.cameras.main.zoom; // Class property
    
        // Use these scaled dimensions for your dialog components
        this.dialogBox = this.add.rectangle(0, 0, this.dialogWidth, this.dialogHeight, 0x000000);
        this.dialogBox.setOrigin(0.5);
        this.dialogBox.setStrokeStyle(2, 0xffffff);
        this.dialogBox.setAlpha(0.8);
        this.dialogBox.setVisible(false);
      
        // Question text
        const centerX = this.cameras.main.width / 2;
        const centerY = this.cameras.main.height / 2;
        this.questionText = this.add.text(centerX, centerY - 80, '', { 
          fontSize: '16px', 
          color: '#fff',
          align: 'center',
          wordWrap: { width: 280, useAdvancedWrap: true }
        }).setOrigin(0.5);
        this.questionText.setVisible(false);
    

        // Define the starting Y position of the first answer button.
        // It should be somewhere below the question text.
        let answerButtonY = centerY + 20; // adjust this value as needed

        // Define the spacing between the answer buttons.
        let buttonSpacing = 5; // adjust this value as needed

        // Create answer buttons
        this.answerButtons = [];
        for (let i = 0; i < 4; i++) {
            let button = this.add.text(centerX, answerButtonY, '', { 
                fontSize: '16px', 
                color: '#fff',
                backgroundColor: '#666',
                padding: { x: 10, y: 5 },
                align: 'center', // Add this line
                fixedWidth: 220, // adjust this width as needed
                fixedHeight: 20, // adjust this height as needed
            }).setOrigin(0.5).setInteractive();
  
            button.on('pointerdown', () => this.selectAnswer(button.text));
            button.setVisible(false);
            this.answerButtons.push(button);

            // Update the Y position for the next button.
            answerButtonY += button.height + buttonSpacing;
        }
    
        this.closeButton = this.add.text(centerX, centerY + 80, 'Close', { 
            fontSize: '16px', 
            color: '#fff',
            backgroundColor: '#666',
            padding: { x: 10, y: 5 },
        }).setOrigin(0.5).setInteractive();
        
        this.closeButton.on('pointerdown', () => this.closeDialogBox());
        this.closeButton.setVisible(false);
    }


    showDialogBox() {

        console.log('Question Opened');
        // Only generate a new question if one isn't already active.
        if (this.currentQuestionIndex === null) {
            this.currentQuestionIndex = Phaser.Math.Between(0, this.questions.length - 1);
        }
    
        const question = this.questions[this.currentQuestionIndex];

        this.questionActive = true; // Set the flag to true when a question is shown
        this.currentQuestion = question;
        this.questionText.setText(question.question);
        this.questionText.setVisible(true);
    
        this.questionText.setY(this.dialogBox.y - this.dialogHeight / 4);
        const answers = [question.answer1, question.answer2, question.answer3, question.answer4];
        Phaser.Utils.Array.Shuffle(answers);
    
        // Assuming the dialog box is centered and visible
        let startY = this.questionText.getBottomCenter().y + 20;
        let totalHeight = startY;
    
        // Calculate the total space needed for all buttons
        for (let i = 0; i < this.answerButtons.length; i++) {
            totalHeight += this.answerButtons[i].height + 10; // 10 is the spacing between buttons
        }
    
        let endY = this.closeButton.getTopCenter().y - 20; // 20 pixels above the close button
        let availableSpace = endY - startY;
        let spacing = (availableSpace - totalHeight) / (this.answerButtons.length + 1);
    
        for (let i = 0; i < this.answerButtons.length; i++) {
            let button = this.answerButtons[i];
            button.setText(answers[i]);
            button.setY(startY + (button.height + spacing) * i);
            button.setVisible(true);
            button.setData('isCorrect', answers[i] === question.correct_answer);
        }
    
        this.dialogBox.setVisible(true);
        this.closeButton.setVisible(true);

    }

    selectAnswer(selected) {
        // Hide the answer buttons
        this.answerButtons.forEach(button => button.setVisible(false));
    
        // Get the correct answer for the current question
        const correctAnswer = this.currentQuestion.correct_answer.toString();
        console.log("The correct answer is : ", correctAnswer);
        console.log("The correct answer type is ", typeof(correctAnswer));

        // Check if the selected answer is correct
        const isCorrect = selected === correctAnswer;
        console.log("The selected answer is ", selected);
        console.log("The selected answer type is ", typeof(selected));
        const resultText = isCorrect ? 'Correct!' : 'Incorrect!';
        console.log("The response : ", resultText);
    
        // Prepare the result lines
        let resultLines = [
            `Selected Answer: ${selected}`,
            resultText
        ];
        
        if (isCorrect) {
            let sessionUser = sessionStorage.getItem("username");
            this.recordResponse(sessionUser, this.currentQuestionIndex, 1, "ProbabilityEasy");
            console.log("saved correct response");

            //call the BKT API new & update the knowledge state
            this.getMastery(this.knowledge_state, 1, 'easy', 0.8);
            console.log("Knowledge state updated : ", this.knowledge_state)

            // Get the correct hint for the next object ID
            const nextId = this.lastSolvedId + 1;
            const hintMessage = this.hints[nextId] || "You've solved all the challenges!";
    
            // Generate a random number for the passcode
            const passcodeNumber = Phaser.Math.Between(0, 9);
        
            // Add the number to the array of collected numbers
            this.passcodeNumbers.push(passcodeNumber);
    
            // Update the HUD text
            this.hudText.setText(`Passcode: ${this.passcodeNumbers.join('')}`);
    
            // Display the number along with the hint
            resultLines.push(`\nNumber collected for passcode: ${passcodeNumber}`);
            resultLines.push('', hintMessage); // Add the unique hint for the next object
            this.currentQuestionIndex = null;
            this.lastSolvedId = this.currentInteractable.properties['id'];
        }
        else{
            let sessionUser = sessionStorage.getItem("username");
            this.recordResponse(sessionUser, this.currentQuestionIndex, 0, "NumProbabilitybers");
            console.log("saved wrong response");
            this.getMastery(this.knowledge_state, 0, 'easy', 0.8);
            console.log("Knowledge state updated : ", this.knowledge_state)
            console.log("LifePoints value before: ", this.lifePointsValue);
            let updateLife = parseInt(this.lifePointsValue, 10) - 1; // Subtract 1 from the current life points
            console.log("updateLife value before: ", updateLife);

            // Update the life points text
            this.lifePointsText.setText('Lives: ' + updateLife);

            //if life reaches 0, losing screen etc
            if (updateLife < 1){
                this.showPopupMessage('No more lives!\n You will be redirected to the main menu screen in 5 seconds', 5000);
                // When the countdown ends, the game will reload in 10 seconds
                this.time.delayedCall(5000, () => {
                    window.location.href = "mainMenu.html";
                });
            }

            // Update the life points value
            this.lifePointsValue = updateLife.toString(); // Convert it back to string for consistency
        }
        
        // Update the question text to show the result and hint if applicable
        this.questionText.setText(resultLines.join('\n'));
        this.questionText.setStyle({
            fontSize: '16px',
            color: '#fff',
            backgroundColor: '#0008', // Semi-transparent black background
            padding: { x: 10, y: 5 },
            align: 'center',
            wordWrap: { width: this.dialogWidth * 0.8 } // Wrap text within 80% of dialog width
        });
        this.questionText.setVisible(true);
        this.questionText.setOrigin(0.5);
        this.questionText.setPosition(this.dialogBox.x, this.dialogBox.y - this.dialogHeight / 4);
        this.questionActive = false;
    }
     
    closeDialogBox() {
        // Hide the question text and dialog box
        this.questionText.setVisible(false);
        this.dialogBox.setVisible(false);
      
        // Hide all answer buttons
        this.answerButtons.forEach(button => {
          button.setVisible(false);
        });

        this.questionActive = false; // Dialog is closed, reset flag
      
        // Reset interactable state
        this.isInteractable = false;

        this.closeButton.setVisible(false);

        this.questionActive = false; // Dialog is closed, reset flag

    }

    askForPasscode() {
        // Create an HTML input element overlay
        const element = document.createElement('input');
        element.type = 'text';
        element.style.position = 'absolute';
        element.style.top = '50%'; // Center on screen
        element.style.left = '50%';
        element.style.transform = 'translate(-50%, -50%)';
        element.style.fontSize = '20px'; // Big enough to match your game's style
        element.maxLength = 5; // Limit to 5 characters
        element.id = 'user-passcode-input';
    
        document.body.appendChild(element);
        element.focus(); // Automatically focus the input field
    
        // Handle the input submission
        element.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                let userPasscode = element.value;
                document.body.removeChild(element); // Remove the input field from the document
    
                if (userPasscode === this.passcodeNumbers.join('')) {
                    // Correct passcode
                    this.clockLoop.stop();
                    this.scene.start('BathroomMedium');
                } else {
                    // Incorrect passcode
                    this.showPopupMessage('Incorrect passcode.', 3000);
                }
            }
        });
    }


    //added function to record student interaction with questions
    recordResponse(user_id, question_id, correctness, skill){
        const data = {
            user_id,
            question_id,
            correctness,
            skill
        };
        
        console.log(JSON.stringify(data));
        //call the API here to save response
        fetch('http://127.0.0.1:5000/save_response', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Success:', data);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

    //function to call bkt api
    getMastery(state, correct, difficulty, response_time){
        const data = {
            state,
            correct,
            difficulty,
            response_time
        };
        console.log(JSON.stringify(data));
        //API to call BKT and get student mastery
        fetch('http://127.0.0.1:5000/getStudentMastery', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            console.log('Data from flask', data);
            //access the value obtained
            let fetchedMastery = data.mastery;
            console.log('fetchedMastery', fetchedMastery)
            this.knowledge_state = fetchedMastery
            console.log('Updated knowledge state', this.knowledge_state);
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
    }

}
