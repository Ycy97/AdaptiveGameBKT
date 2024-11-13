class PreTest extends Phaser.Scene{
    constructor(){
        super('PreTest')
        this.isInteractable = false; // Add a flag to check for interactable state
        this.canInteract = true; // Flag to control interaction cooldown
        this.dialogText = null; // Placeholder for the dialog text object
        this.questions = []; // Store fetched questions
        this.dialogWidth = null;  
        this.dialogHeight = null; 
        this.questionActive = false; // Flag to check if a question is currently active
        this.gptDialogActive = false;
        this.currentQuestionIndex = null;
        this.lastSolvedId = 0; // Start with 0, no puzzle solved
        this.passcodeNumbers = []; // Array to store passcode numbers
        this.hudText = null; // HUD text object
        this.timerText = null;
        this.lifePointsText = null;
        this.lifePointsValue = 5;
        this.initialTime = 10 * 60; // 10 minutes in seconds
        this.student_responses = [];
        this.hintText = [];
        this.hintActive = false;
        this.hintRemaining = 3;
        this.consecutiveWrongAttempts = 0; //if 2 in a row wrong provide cutscene to help, if correct reset
        this.knowledge_state = 0.1;//dynamically grab from database
        this.startTime = null;
        this.endTime = null;
        this.algebraTutorialActive = false;
        this.algebraTutorialAccessed = false;
        this.introductionAccessed = false;
        this.characterExplained = false;
        this.gptAccessed = false;

        this.introductionStep = [
            "Welcome to MathMystery!Please head towards to computer located in the middle of the room and click the SHIFT key!"
        ];
        //Tutorial Session provided here
        this.tutorialStep = [
            "Good Day! My name is Professor Algebrus and i am the director of the academy.",
            "You are a student invited to study at the prestigious Math Academy, a school hidden deep within a different dimensions.",
            "However, upon arrival, you discover something is terribly wrong- the academy's Grand Math Codex, a powerful artifact that maintains the balance of the realm, has been missing!",
            "Without it, the magical barriers protecting the academy will fail, exposing it to dark forces lurking beyond.",
            "There are 3 different types of rooms, each requiring different mathematical skills required to tackle each concept! ",
            "However, before you are transported to each room you will have to go through a small series of challenges in order to gauge your current skill!",
            "But do not fret as you will be guided through the basics of each math concepts before and i will provide additional support through the computer as your AI Assistant!",
            "Try to move your avatar around using the arrow keys and SHIFT key to interact with the pile of books at the left side of the room!"
        ];

        this.algebraStep = [
            "Great job! Now that you've learned how to move around and interact with objects, let's dive into the basics of Algebra. Get ready to tackle these topics step by step!",
            
            "1) Basic Algebra Concept",
            "Algebraic Expressions: " +
            "Terms, Coefficients, and Variables: In 3x + 5, '3x' and '5' are terms, '3' is the coefficient, and 'x' is the variable.\n" +
            "Simplifying Expressions: Combine like terms, e.g., 3x + 2x = 5x.\n",
            
            "Expanding: Distribute terms, e.g., 3(x + 4) = 3x + 12.\n" +
            "Factorizing: Reverse expanding, e.g., 6x + 9 = 3(2x + 3).\n",
            
            "2) Solving Linear Equations\n",
            "One-Step Equations: Solve for x, e.g., x + 5 = 12 → x = 7.\n" +
            "Two-Step Equations: Solve step by step, e.g., 3x + 4 = 16 → x = 4.\n" +
            "Equations with Brackets: Expand and solve, e.g., 2(x + 3) = 14 → x = 4.\n",
            
            "3) Quadratic Equations\n",
            "Solving by Factorization: Factorize and solve, e.g., x^2 + 5x + 6 = 0 → (x + 2)(x + 3) = 0 → x = -2 or x = -3.\n" +
            "Using the Quadratic Formula: For ax^2 + bx + c = 0, use the formula x = (-b ± √(b^2 - 4ac)) / 2a.\n",
            
            "4) Simultaneous Equations\n",
            "Substitution Method: Substitute one equation into another to solve.\n" +
            "Example 2x + 3y = 12 (Equation 1) x - y = 1 (Equation 2)\n",
            "For the first step, solve one of the equations for one variable (using Equation 2) : x = y + 1 " + 
            "Next, substitute the expression x = y + 1 into the Equation 1 : 2x + 3y = 12, 2(y+1) + 3y = 12\n" + 
            "Simplify and solve y and we would obtain y = 2\n",
            "Substitute y = 2 back into the expression to find x and we would obtain x =3",
            "Elimination Method: Add or subtract equations to eliminate a variable.\n",
            "Example : 2x + 3y = 12 (Equation 1) x - y = 1 (Equation 2)\n"+
            "Multiply one or both equations to align the coefficients of one of the variables. In this case we can multiple the second equation by 2 so that the x-terms have the same coefficient:" +
            "2(x-y) = 2(1), becoming 2x - 2y =  2 (Equation 3)\n",
            "Now we have 2x + 3y = 12 and 2x - 2y = 2\n" + 
            "The next step is to subtract Equation 3 from Equation 1 to eliminate x" + 
            "(2x + 3y) - (2x - 2y) = 12 - 2, resulting in y = 2 \n" + 
            "Substitute the obtained y = 2 value into one of the original equations and we would obtain x = 3",
            
            "5) Algebraic Fractions\n",
            "Simplifying: Divide terms, e.g., 4x^2 / 2x = 2x.\n" +
            "Adding and Subtracting: Find the LCM and simplify.\n" +
            "Solving Equations: Clear fractions and solve for the variable.\n",
            
            "Now you're equipped to tackle these challenges! Let's head back to the AI assistant!"
        ];

        this.characterSteps = [
            "Great! Now that you have went through the basics of Algebra, i will provide explanations!",
            "When you are transported into different rooms, you are required to solve each mathematical challenges in order to obtain the passcode to escape the room in order to progress to the final room to obtain the codex!",
            "The details hovered your character shows the time remaining for you to escape the room",
            "The number of lives you are given to represent your chances remaining to attempt each puzzles before you are removed from the room",
            "The obtained passcode are also stored to escape the respective rooms",
            "And finally the Hints remaining represents the chances you have left to seek for assistance from me through the computer located in each rooms!",
            "Lets try and access the Computer again!"
        ];
        
    }

    preload(){
        this.load.image('door', 'assets/themes/1_Generic_32x32.png');
        this.load.image('roombuilder', 'assets/themes/Room_Builder_32x32.png');
        this.load.image('classroom','assets/themes/5_Classroom_and_library_32x32.png');

        this.load.tilemapTiledJSON('preTestMap', 'assets/preTest.json');

        this.load.spritesheet('player', 'assets/player.png', {
            frameWidth: 32,
            frameHeight: 50,
        });
    }

    create(){

        // Define movespeed
        this.movespeed = 120; // Adjust the value as needed

        // Create the map object
        const map = this.make.tilemap({key: 'preTestMap'});

        const doorTiles = map.addTilesetImage('Doors', 'door');
        const roombuilderTiles = map.addTilesetImage('RoomBuilder', 'roombuilder');
        const classroomTiles = map.addTilesetImage('Classroom','classroom');

        const layoutLayer = map.createLayer('Layout', [doorTiles, roombuilderTiles,classroomTiles]);
        const furnitureLayer = map.createLayer('Furniture', [doorTiles, roombuilderTiles,classroomTiles]);

        layoutLayer.setCollisionByProperty({ collision: true });
        furnitureLayer.setCollisionByProperty({ collision: true });

        const mapWidth = map.widthInPixels;
        const mapHeight = map.heightInPixels;
        this.cameras.main.setBounds(0, 0, mapWidth, mapHeight);

        this.player = this.physics.add.sprite(480, 500, 'player');

        this.cameras.main.startFollow(this.player, true);
        this.cameras.main.setZoom(2.0);

        this.physics.add.collider(this.player, layoutLayer);
        this.physics.add.collider(this.player, furnitureLayer);

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

        keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP);
        keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT);
        keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN);
        keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT);
        keySHIFT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT);
        keyM = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.M);

        this.physics.add.overlap(this.player, furnitureLayer, (player, tile) => {
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

            console.log("Status when keydown : " + this.algebraTutorialActive);
            if (!this.canInteract) return; // Exit if interaction is on cooldown

            // Early exit if a question is currently active
            if (this.questionActive) {
                return;
            }

            if(this.gptDialogActive){
                return;
            }
        
            // Check if near the door and if all previous puzzles are solved (new condition after done all the pretest)
            if (this.nearDoor && this.lastSolvedId === 5 && this.passcodeNumbers.length === 5) {
                this.askForPasscode();
                return; // Exit the function after triggering the passcode dialog
            }

            // Handle interactions with other objects
            if (this.isInteractable) {
                const interactableId = this.currentInteractable.properties['id'];
                // if (interactableId <= 5 && interactableId === this.lastSolvedId + 1) {
                //     console.log('Interacting with object:', interactableId);
                //     this.showDialogBox();
                // }
                //pile of books for algebra tutorial
                if(interactableId == 1){
                    if(!this.introductionAccessed){
                        alert("Please interact with the computer first!");
                        return;
                    }
                    this.createTutorialDialogue(this.algebraStep);
                    console.log("Tutorial accessed");
                    this.algebraTutorialAccessed = true;
                } 
                else if(interactableId === -1){
                    console.log("GPT hint accessed");
                    if(!this.introductionAccessed){
                        this.createTutorialDialogue(this.tutorialStep);
                        this.introductionAccessed = true;
                    }
                    else if(!this.algebraTutorialAccessed && this.introductionAccessed){
                        alert("Please access the tutorial first by interacting with the books on the left!");
                    }
                    else if (this.algebraTutorialAccessed && this.introductionAccessed && !this.characterExplained){
                        this.createTutorialDialogue(this.characterSteps);
                        this.characterExplained = true;
                        
                    }
                    else if(this.algebraTutorialAccessed && this.introductionAccessed && this.characterExplained && !this.gptAccessed){
                        this.gptDialog();
                        this.gptAccessed = true;
                    }
                    else{
                        //do the test and using the obtained mastery send them to different rooms
                    }
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

        this.createDialogComponents();

        let timerOffsetX = -50;
        let timerOffsetY = 100;
        let timerX = this.player.x + timerOffsetX; // 380 pixels from the right edge
        let timerY = this.player.y - timerOffsetY ; // 155 pixels from the top

        this.timerText = this.add.text(timerX, timerY, 'Time: 10:00', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setScrollFactor(1); // Keep the timer static on the screen
        this.timerText.setStyle({
            backgroundColor: '#0008', // Semi-transparent black background
            padding: { x: 10, y: 5 }
        });

        let lifepointsX = timerX;
        let lifepointsY = timerY + 20;
        // Initialize the life points text
        this.lifePointsText = this.add.text(lifepointsX, lifepointsY, 'Lives: ' + this.lifePointsValue, {
            fontSize: '16px',
            fill: '#ffffff'
        }).setScrollFactor(1); // Keep the life points static on the screen
        this.lifePointsText.setStyle({
            backgroundColor: '#0008', // Semi-transparent black background
            padding: { x: 10, y: 5 }
        });

        let hudTextX = timerX; 
        let hudTextY = lifepointsY + 20; 

        // Create the HUD text at the specified position
        this.hudText = this.add.text(hudTextX, hudTextY, 'Passcode: ', {
            fontSize: '16px',
            fill: '#ffffff'
        }).setScrollFactor(1);

        this.hudText.setStyle({
            backgroundColor: '#0008', // Semi-transparent black background
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
            backgroundColor: '#0008', // Semi-transparent black background
            padding: { x: 10, y: 5 }
        });

        this.createTutorialDialogue(this.introductionStep);

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
            //test stop audio 
            //this.clockLoop.stop();
            this.scene.start('Lounge');
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

    displayGptResponse(gptResponse) {
        console.log("Entered prompt area");
    
        // Create dialog component
        const gptDialogBoxcx = document.createElement('div');
        gptDialogBoxcx.style.position = 'fixed';
        gptDialogBoxcx.style.top = '50%';
        gptDialogBoxcx.style.left = '50%';
        gptDialogBoxcx.style.transform = 'translate(-50%, -50%)';
        gptDialogBoxcx.style.padding = '20px';
        gptDialogBoxcx.style.backgroundColor = '#f5deb3'; // Backup color (wheat-like)
        gptDialogBoxcx.style.backgroundImage = 'url("path/to/your/parchment.png")'; // Load parchment texture here
        gptDialogBoxcx.style.backgroundSize = 'cover'; // Ensures the texture covers the box
        gptDialogBoxcx.style.color = '#000000';
        gptDialogBoxcx.style.borderRadius = '10px';
        gptDialogBoxcx.style.border = '5px solid #8B4513'; // Brown border
        gptDialogBoxcx.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        gptDialogBoxcx.style.zIndex = '1000';
        gptDialogBoxcx.style.display = 'flex';
        gptDialogBoxcx.style.flexDirection = 'column';
        gptDialogBoxcx.style.justifyContent = 'center';
        gptDialogBoxcx.style.alignItems = 'center';
    
        // Dynamically set the dialog box width based on text length
        const approximateWidth = Math.min(600, Math.max(300, gptResponse.length * 10));
        gptDialogBoxcx.style.width = `${approximateWidth}px`;
        gptDialogBoxcx.style.maxHeight = '600px'; // Max height limit
        gptDialogBoxcx.style.overflowY = 'auto'; // Scroll for overflow content
    
        document.body.appendChild(gptDialogBoxcx);
    
        // Create and append response text
        const gptResponseText = document.createElement('p');
        gptResponseText.innerText = gptResponse;
        gptResponseText.style.textAlign = 'center';
        gptResponseText.style.fontSize = '20px';
        gptResponseText.style.margin = '0';
        gptResponseText.style.fontFamily = '"Press Start 2P", monospace'; // Pixelated font
        gptResponseText.style.imageRendering = 'pixelated'; // Makes the text look pixelated on certain browsers
        
        // Set text color to brown
        gptResponseText.style.color = '#8B4513'; // Brown color
    
        // Increase spacing between words and lines for better aesthetics
        gptResponseText.style.wordSpacing = '5px'; // Space between words
        gptResponseText.style.lineHeight = '1.6'; // Space between lines
        gptResponseText.style.padding = '10px'; // Add padding for better aesthetics
        gptDialogBoxcx.appendChild(gptResponseText);
    
        // Create Close button below the response
        const closeButton = document.createElement('button');
        closeButton.innerHTML = 'Close';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#333';
        closeButton.style.color = '#ffffff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        gptDialogBoxcx.appendChild(closeButton);
    
        // Close button functionality
        closeButton.addEventListener('click', () => {
            document.body.removeChild(gptDialogBoxcx); // Remove dialog box
            this.scene.resume(); // Resume the scene
        });
    }
    
    //tutorial usage
    gptDialog() {
        this.scene.pause();
        this.gptDialogActive = true;

    
        // Create modal view background
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
    
        // Create current clue display
        const clueText = document.createElement('p');
        clueText.innerText = "Try typing solving 3x = 9 in the input area or other similar mathematical functions!";
        clueText.style.position = 'absolute';
        clueText.style.top = '30%'; // Adjusted position
        clueText.style.left = '50%';
        clueText.style.transform = 'translate(-50%, -50%)'; // Centers the text
        clueText.style.fontSize = '35px';
        clueText.style.color = '#8B4513'; // Brown text color
        clueText.style.width = '1200px'; // Set a specific width
        clueText.style.backgroundColor = '#f5deb3'; // Wheat-like background
        clueText.style.fontFamily = '"Press Start 2P", monospace'; // Pixelated font
        clueText.style.imageRendering = 'pixelated'; // Makes the text look pixelated on certain browsers
        clueText.style.wordSpacing = '5px'; // Increase spacing between words
        clueText.style.lineHeight = '1.6'; // Increase line height for better aesthetics
        clueText.style.padding = '10px'; // Add padding for better aesthetics
        clueText.style.textAlign = 'center'; // Center-align text within the paragraph

    
        // Create an HTML input element overlay
        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.style.position = 'absolute';
        inputElement.style.top = '60%'; // Increased position for more spacing
        inputElement.style.left = '50%';
        inputElement.style.transform = 'translate(-50%, -50%)';
        inputElement.style.fontSize = '30px'; // Big enough to match your game's style
        inputElement.style.width = '1200px'; // Set a specific width
        inputElement.style.height = '100px'; // Set a specific height
        inputElement.placeholder = "3x = 9";
    
        // Create Close button
        const closeBtn = document.createElement('button');
        closeBtn.innerText = "Close"; // Button text
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '75%'; // Adjusted position for more spacing
        closeBtn.style.left = '50%';
        closeBtn.style.transform = 'translate(-50%, -50%)';
        closeBtn.style.fontSize = '24px'; // Adjust the font size for the button
        closeBtn.style.padding = '10px 20px'; // Button padding
        closeBtn.style.cursor = 'pointer'; // Change cursor on hover
    
        // Close button functionality
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(modalBackground); // Remove the dialog box
            this.scene.resume(); // Resume the scene
            this.gptDialogActive = false;
        });
    
        document.body.appendChild(modalBackground);
        modalBackground.appendChild(clueText);
        modalBackground.appendChild(inputElement);
        modalBackground.appendChild(closeBtn);
        inputElement.focus(); // Automatically focus the input field
    
        // Handle the input submission
        inputElement.addEventListener('keydown', event => {
            if (event.key === 'Enter') {
                // Pass the question as a prompt to the GPT API and get a response back before scene resume
                let prompt = inputElement.value;
                const data = { prompt };
                console.log(JSON.stringify(data));
                document.body.removeChild(modalBackground);
    
                // API to call BKT and get student mastery
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
                    // Access the value obtained
                    let fetchResponse = data.response;
                    console.log('fetchedResponse', fetchResponse);
                    // Display the response on the game
                    this.displayGptResponse(fetchResponse);
                    this.gptDialogActive = false;  
                })
                .catch(error => {
                    console.error('There was a problem with the fetch operation:', error);
                });
            }
        });
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
        
        this.closeButton.on('pointerdown', () => {
            this.closeDialogBox(); // Corrected the function call
        });
        
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
        const correctAnswer = this.currentQuestion.correct_answer;
    
        // Check if the selected answer is correct
        const isCorrect = selected === correctAnswer;
        const resultText = isCorrect ? 'Correct!' : 'Incorrect!';
    
        // Prepare the result lines
        let resultLines = [
            `Selected Answer: ${selected}`,
            resultText
        ];

        let currentTime = this.getCurrentDateTimeForSQL();
        
        //need to add logic here to log all response and save into a data structure before being processed into SQL -CY
        //what i need is to log student id, skill id/name, correctness, question ID [[]]
        if (isCorrect) {

            //reset consecutiveWrongAttempts to 0
            this.consecutiveWrongAttempts = 0;
            let sessionUser = sessionStorage.getItem("username");
            this.recordResponse(sessionUser, this.currentQuestionIndex, 1, "Algebra", this.knowledge_state, currentTime);
            console.log("saved correct response");

            //call the BKT API new & update the knowledge state
            this.getMastery(this.knowledge_state, 1, 'easy', 0.8);
            console.log("Knowledge state updated : ", this.knowledge_state)

            // Get the correct hint for the next object ID
            const nextId = this.lastSolvedId + 1;
            const hintMessage = this.hints[nextId] || "You've solved all the challenges!";
            this.currentClueMessage = hintMessage;
    
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
            //get current value and + 1 for consecutiveWrongAttempts

            let consecutiveWrongAttemptsVal = parseInt(this.consecutiveWrongAttempts, 10) + 1;
            this.consecutiveWrongAttempts = consecutiveWrongAttemptsVal;
            console.log("Current consecutive wrong attempts : " + this.consecutiveWrongAttempts);

            let sessionUser = sessionStorage.getItem("username");
            this.recordResponse(sessionUser, this.currentQuestionIndex, 0, "Algebra", this.knowledge_state, currentTime);
            console.log("saved wrong response");
            //call the BKT API new & update the knowledge state
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
    
        // You can adjust styling here if needed
        this.questionText.setStyle({
            fontSize: '16px',
            color: '#fff',
            backgroundColor: '#0008', // Semi-transparent black background
            padding: { x: 10, y: 5 },
            align: 'center',
            wordWrap: { width: this.dialogWidth * 0.8 } // Wrap text within 80% of dialog width
        });
        
        // Set the question text to visible and position it correctly
        this.questionText.setVisible(true);
        this.questionText.setOrigin(0.5);
        this.questionText.setPosition(this.dialogBox.x, this.dialogBox.y - this.dialogHeight / 4);
    
        // Set the question as answered
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
                    this.clockLoop.stop();
                    this.endTime = this.getCurrentDateTimeForSQL();
                    // Correct passcode
                    //adaptiveMoment
                    let sessionUser = sessionStorage.getItem("username");
                    let user_id = sessionUser;
                    let skill = 'Algebra';
                    let mastery = this.knowledge_state;
                    let timeTaken = this.calculateTimeTaken(this.startTime, this.endTime);
                    let hints_used = 3 - parseInt(this.hintRemaining, 10);
                    let life_remain = parseInt(this.lifePointsValue, 10);
                    let created_at = this.endTime;
                    this.saveLearnerProgress(user_id, skill, mastery, timeTaken, hints_used, life_remain, created_at);
                    //Post-Game summary - hardcoded for video purposes for reccomendation engine
                    this.createPostGameSummary({
                        topic: 'Algebra',
                        difficulty: 'Easy',
                        status: 'Level Completed',
                        mastery: this.knowledge_state,
                        timeTaken: timeTaken,
                        hintsUsed: hints_used,
                        lifeRemaining: life_remain,
                        remark: 'Good Job!',
                        resources: [
                            { name: 'Khan Academy Video: Basic Algebra - Combining Like Terms', link: 'https://www.youtube.com/watch?v=CLWpkv6ccpA' },
                            { name: 'IGCSE Basic Algebra : Introduction', link: 'assets/tutorial/IGCSE_Basic_Algebra_Introduction.pdf' },
                            { name: 'Math is Fun: Algebra Basics', link: 'https://www.mathisfun.com/algebra/' },
                            { name: 'Khan Academy: Algebra Practice Exercises', link: 'https://www.khanacademy.org/math/algebra' }
                        ]
                    });
                    //this.scene.start('LoungeMedium');
                } else {
                    // Incorrect passcode
                    this.showPopupMessage('Incorrect passcode.', 3000);
                }
            }
        });
    }

    recordResponse(user_id, question_id, correctness, skill, mastery, created_at){
        const data = {
            user_id,
            question_id,
            correctness,
            skill,
            mastery,
            created_at
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

    //function to save learner progress to learner model
    saveLearnerProgress(user_id, skill, mastery, timeTaken, hints_used, life_remain, created_at){
        const data = {
            user_id,
            skill,
            mastery,
            timeTaken,
            hints_used,
            life_remain,
            created_at
        };
        
        console.log(JSON.stringify(data));
        fetch('http://127.0.0.1:5000/save_learner_model', {
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

    //function to get current time
    getCurrentDateTimeForSQL() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so add 1
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
    
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    
    calculateTimeTaken(startTime, endTime) {
        
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);
    
        // Calculate the difference in milliseconds
        const differenceInMilliseconds = endDate - startDate;
    
        // Convert milliseconds to seconds, minutes, and hours
        const totalSeconds = Math.floor(differenceInMilliseconds / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        let timeTaken = hours + " hours" + minutes + " minutes" + seconds + " seconds"

        return timeTaken;
    }

    createPostGameSummary(performanceData) {
        // Pause the current scene
        this.scene.pause();
    
        // Create dialog component for the post-game summary
        const summaryDialogBox = document.createElement('div');
        summaryDialogBox.style.position = 'fixed';
        summaryDialogBox.style.top = '50%';
        summaryDialogBox.style.left = '50%';
        summaryDialogBox.style.transform = 'translate(-50%, -50%)';
        summaryDialogBox.style.padding = '20px';
        summaryDialogBox.style.backgroundColor = '#f5deb3'; // Wheat-like color
        summaryDialogBox.style.backgroundSize = 'cover';
        summaryDialogBox.style.color = '#000000';
        summaryDialogBox.style.borderRadius = '10px';
        summaryDialogBox.style.border = '5px solid #8B4513'; // Brown border
        summaryDialogBox.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        summaryDialogBox.style.zIndex = '1000';
        summaryDialogBox.style.display = 'flex';
        summaryDialogBox.style.flexDirection = 'column';
        summaryDialogBox.style.justifyContent = 'center';
        summaryDialogBox.style.alignItems = 'center';
        summaryDialogBox.style.width = '80%';
        summaryDialogBox.style.maxWidth = '900px';
        summaryDialogBox.style.maxHeight = '600px';
        summaryDialogBox.style.overflowY = 'auto';
    
        document.body.appendChild(summaryDialogBox);
    
        // Create and append title text
        const titleText = document.createElement('h2');
        titleText.innerText = 'Post-Game Summary';
        titleText.style.textAlign = 'center';
        titleText.style.color = '#8B4513'; // Brown color
        titleText.style.fontFamily = '"Press Start 2P", monospace';
        summaryDialogBox.appendChild(titleText);
    
        // Create and append performance data
        const performanceDetails = [
            `Topic: ${performanceData.topic}`,
            `Difficulty: ${performanceData.difficulty}`,
            `Status: ${performanceData.status}`,
            `Mastery: ${performanceData.mastery.toFixed(2)}`,
            `Time Taken: ${performanceData.timeTaken}`,
            `Hints Used: ${performanceData.hintsUsed}`,
            `Life Remaining: ${performanceData.lifeRemaining}`,
            `Remark: ${performanceData.remark}`
        ];
    
        performanceDetails.forEach(detail => {
            const detailText = document.createElement('p');
            detailText.innerText = detail;
            detailText.style.fontSize = '16px';
            detailText.style.margin = '5px 0';
            detailText.style.fontFamily = '"Press Start 2P", monospace';
            detailText.style.textAlign = 'left';
            summaryDialogBox.appendChild(detailText);
        });
    
        // Create and append recommended resources section
        const resourceTitle = document.createElement('h3');
        resourceTitle.innerText = 'Recommended Resources';
        resourceTitle.style.marginTop = '20px';
        resourceTitle.style.color = '#8B4513';
        resourceTitle.style.fontFamily = '"Press Start 2P", monospace';
        summaryDialogBox.appendChild(resourceTitle);
    
        const resourcesList = document.createElement('ul');
        resourcesList.style.listStyleType = 'none';
        resourcesList.style.padding = '0';
    
        performanceData.resources.forEach(resource => {
            const resourceItem = document.createElement('li');
            const resourceLink = document.createElement('a');
            resourceLink.href = resource.link;
            resourceLink.target = '_blank';
            resourceLink.innerText = resource.name;
            resourceLink.style.color = '#0073e6'; // Link color
            resourceLink.style.fontFamily = '"Press Start 2P", monospace';
            resourceItem.appendChild(resourceLink);
            resourcesList.appendChild(resourceItem);
        });
    
        summaryDialogBox.appendChild(resourcesList);
    
        // Create Close button
        const closeButton = document.createElement('button');
        closeButton.innerHTML = 'Close';
        closeButton.style.marginTop = '20px';
        closeButton.style.padding = '10px 20px';
        closeButton.style.backgroundColor = '#333';
        closeButton.style.color = '#ffffff';
        closeButton.style.border = 'none';
        closeButton.style.borderRadius = '5px';
        closeButton.style.cursor = 'pointer';
        summaryDialogBox.appendChild(closeButton);
    
        // Close button functionality
        closeButton.addEventListener('click', () => {
            document.body.removeChild(summaryDialogBox); // Remove dialog box
            this.scene.start("LoungeMedium");
        });
    }

    createTutorialDialogue(tutorialSteps) {

        this.algebraTutorialActive = true;
        let currentStep = 0;
    
        // Pause the current scene
        this.scene.pause();
    
        // Create dialog component for the tutorial
        const tutorialDialogBox = document.createElement('div');
        Object.assign(tutorialDialogBox.style, {
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '20px',
            backgroundColor: '#f5deb3',
            color: '#000000',
            borderRadius: '10px',
            border: '5px solid #8B4513',
            boxShadow: '0 0 10px rgba(0, 0, 0, 0.5)',
            zIndex: '1000',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            animation: 'fadeIn 0.5s ease',
            width: '600px',
            maxHeight: '400px',
            overflowY: 'auto'
        });
    
        document.body.appendChild(tutorialDialogBox);
    
        // Add NPC Portrait and Title
        const npcTitle = document.createElement('h2');
        npcTitle.innerText = "Professor Algebrus";
        Object.assign(npcTitle.style, {
            fontSize: '24px',
            marginBottom: '10px',
            fontFamily: '"Press Start 2P", monospace',
            color: '#8B4513'
        });
        tutorialDialogBox.appendChild(npcTitle);
    
        // Create the content container for tutorial steps
        const tutorialContent = document.createElement('div');
        Object.assign(tutorialContent.style, {
            textAlign: 'center',
            fontSize: '18px',
            fontFamily: '"Press Start 2P", monospace',
            lineHeight: '1.6',
            color: '#4B0082', // Indigo for variety
            padding: '10px'
        });
        tutorialDialogBox.appendChild(tutorialContent);
    
        // Add navigation buttons
        const buttonContainer = document.createElement('div');
        Object.assign(buttonContainer.style, {
            display: 'flex',
            justifyContent: 'space-between',
            width: '100%',
            marginTop: '20px'
        });
    
        const prevButton = document.createElement('button');
        prevButton.innerText = 'Previous';
        Object.assign(prevButton.style, {
            padding: '10px 20px',
            backgroundColor: '#333',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontFamily: '"Press Start 2P", monospace',
            visibility: 'hidden' // Initially hidden
        });
    
        const nextButton = document.createElement('button');
        nextButton.innerText = 'Next';
        Object.assign(nextButton.style, {
            padding: '10px 20px',
            backgroundColor: '#333',
            color: '#ffffff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '16px',
            fontFamily: '"Press Start 2P", monospace'
        });
    
        buttonContainer.appendChild(prevButton);
        buttonContainer.appendChild(nextButton);
        tutorialDialogBox.appendChild(buttonContainer);
    
        // Function to update tutorial content
        const updateTutorialStep = () => {
            tutorialContent.innerHTML = tutorialSteps[currentStep];
    
            prevButton.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
            nextButton.innerText = currentStep === tutorialSteps.length - 1 ? 'Finish' : 'Next';
        };
    
        // Add event listeners for navigation buttons
        prevButton.addEventListener('click', () => {
            if (currentStep > 0) {
                currentStep--;
                updateTutorialStep();
            }
        });
    
        nextButton.addEventListener('click', () => {
            if (currentStep < tutorialSteps.length - 1) {
                currentStep++;
                updateTutorialStep();
            } else {
                // Close the tutorial on the last step
                document.body.removeChild(tutorialDialogBox);
                this.scene.resume();
                this.canInteract = false; // Disable further interactions
                this.time.delayedCall(2000, () => { // Re-enable interactions after 3seconds
                    console.log("Status when finish : " + this.algebraTutorialActive);
                    this.algebraTutorialActive = false;
                    this.canInteract = true;
                });
            }
        });
    
        // Initialize the first step
        updateTutorialStep();
    }
    
}