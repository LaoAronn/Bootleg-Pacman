"use strict";
let ctx;

// Global Variables for options
let colors = ['red','green','blue','purple','yellow','orange','pink'];
let rand_x = new Array(10);
let rand_y = new Array(10);

// Global Variables for positions
let pac_pos = [25, 45];
let ghost_pos = new Array(3);
let ice_pos = new Array(2);
let wall_pos = new Array(); // 2D Array
let bomb_pos = new Array();

// Global Variable Counters
let pac_mouth = 1;
let wall_counter = 0;


// Global Variables for results / Checking
let ice_eaten = 0;
let gameLost = false;
let isfixedWalls = false;
let israndWalls = false;
let ghost_movement = false;
let gridx_min = 25;
let gridy_min = 45;
let gridx_max = 475;
let gridy_max = 495; 

// Part 2 [Timer + Ghost movement]
let timer = 0;
let EnemyMoveMode, direction;
let moveOption = [];
let goOtherway = true;

function startTime(mode){     
    if(timer == 0){
        timer = 1;
        timer = setInterval(EnemyMove, 1000);
    }

    EnemyMoveMode = mode;
    ghost_movement = true;
}

function EnemyMove(){

    if (gameLost === false & ghost_movement === true){
        // Moving Vertically
        if (EnemyMoveMode == 1){
            if (ghost_pos[1] - 50 < gridy_min || isBoxFull(ghost_pos[0], ghost_pos[1] - 50) === 1){ // If ghost at the highest point
                goOtherway = false;
            }

            if (ghost_pos[1] + 50 > gridy_max || isBoxFull(ghost_pos[0], ghost_pos[1] + 50) === 1){ // If ghost at the lowest point
                goOtherway = true;
            }

            if (goOtherway === true){
                ghost_pos[1] -= 50;
            } else if (goOtherway === false){
                ghost_pos[1] += 50;
            }

            draw(); // Update canvas
        }

        // Moving Horizontally
        if (EnemyMoveMode == 2){ 
            if (ghost_pos[0] - 50 < gridx_min || isBoxFull(ghost_pos[0] - 50, ghost_pos[1]) === 1){ // If ghost at the highest point
                goOtherway = false;
            }

            if (ghost_pos[0] + 50 > gridx_max || isBoxFull(ghost_pos[0] + 50, ghost_pos[1]) === 1){ // If ghost at the lowest point
                goOtherway = true;
            }

            if (goOtherway === true){
                ghost_pos[0] -= 50;
            } else if (goOtherway === false){
                ghost_pos[0] += 50;
            }

            draw(); // Update canvas
        }

        // Random
        if (EnemyMoveMode == 3){ 
            // Options for movement
            if (ghost_pos[1]-50 >= gridy_min && isBoxFull(ghost_pos[0], ghost_pos[1]-50) !== 1){ // Up
                moveOption.push('up');
            }
            if (ghost_pos[1]+50 <= gridy_max && isBoxFull(ghost_pos[0], ghost_pos[1]+50) !== 1) { // Down
                moveOption.push('down');
            }
            if (ghost_pos[0]-50 >= gridx_min && isBoxFull(ghost_pos[0]-50, ghost_pos[1]) !== 1) { // Left
                moveOption.push('left');
            }
            if (ghost_pos[0]+50 <= gridx_max && isBoxFull(ghost_pos[0]+50, ghost_pos[1]) !== 1) { // Right
                moveOption.push('right');
            }

            direction = randomInteger(0, moveOption.length - 1);

            switch (moveOption[direction]){
                case 'up':
                    ghost_pos[1] -= 50;
                    break;
                case 'down':
                    ghost_pos[1] += 50;
                    break;
                case 'left':
                    ghost_pos[0] -= 50;
                    break;
                case 'right':
                    ghost_pos[0] += 50;
                    break;
            }

            draw(); // Update canvas
            moveOption = []; // Reset
        }
    }

}

function setup() {
	ctx = document.getElementById("surface").getContext("2d");

    // To fill all the possible x and y coordinates
    for (let i = 0; i < 10; i++){
        rand_x[i] = 25 + (50 * (i));
        rand_y[i] = 45 + (50 * (i));
    }

	draw();
}

function draw() {
    drawGrid();

    // Creating the Ice Cream
	if (ice_pos[0] == undefined && ice_pos[1] == undefined){
        newPosition('icecream');
	}

    // Creating the Ghost
	if (ghost_pos[0] == undefined && ghost_pos[1] == undefined){
        newPosition('ghost');
	} 


    // Drawing the walls
    if (israndWalls){
        for (let i = 0; i < wall_counter; i++){ // Drawing all walls
            drawWall(wall_pos[i][0], wall_pos[i][1]);
        }

    } else if (isfixedWalls){
        for (let i = 0; i < wall_counter; i++){
            drawWall(wall_pos[i][0], wall_pos[i][1]);

            // Prevent from Walling
            if (wall_pos[i][0] == pac_pos[0] && wall_pos[i][1] == pac_pos[1]){
                // Reset Position
                pac_pos[0] = 25;
                pac_pos[1] = 45;
            } else if (wall_pos[i][0] == ice_pos[0] && wall_pos[i][1] == ice_pos[1]){
                newPosition('icecream');
            } else if (wall_pos[i][0] == ghost_pos[0] && wall_pos[i][1] == ghost_pos[1]){ 
                newPosition('ghost');
            }

        }
    }
    

	// Pacman or Ghost reaching ice cream
	if (distance_f(pac_pos[0], pac_pos[1], ice_pos[0], ice_pos[1]) === 0){
		newPosition('icecream'); // New Ice Cream Position
        ice_eaten += 100;
	} else if (distance_f(ghost_pos[0], ghost_pos[1], ice_pos[0], ice_pos[1]) === 0){
        newPosition('icecream'); // New Ice Cream Position
        ice_eaten -= 100;
    }

    drawIceCream(ice_pos[0], ice_pos[1]);
    
    // If ghost hits bomb & not with pacman
    if (distance_f(bomb_pos[0], bomb_pos[1], pac_pos[0], pac_pos[1]) !== 0 && distance_f(bomb_pos[0], bomb_pos[1], ghost_pos[0], ghost_pos[1]) === 0){
        ice_eaten += 10;
        bomb_pos = [];
        newPosition('ghost');
    }
    
    if (distance_f(pac_pos[0], pac_pos[1], ghost_pos[0], ghost_pos[1]) === 0) { // Pacman reaches to ghost and if ghost reaches bomb and pacman
        gameLost = true; // Notify code that game is over
        drawGrid();
        ghost_pos[0] = -100;
        ghost_pos[1] = -100;
    }

    drawGhost(ghost_pos[0], ghost_pos[1], ghost_pos[2]);

    if (bomb_pos[0] != undefined && bomb_pos[1] != undefined){
        drawBomb(bomb_pos[0], bomb_pos[1]);
    }
    

    document.getElementById("user_score").innerHTML = "Score: " + ice_eaten;
    drawPacMan(pac_pos[0], pac_pos[1]);

    if (gameLost){ // If Game is lost
        drawGameOver();
        timer = 0;
    }
    
}

// Grids 
function drawGrid(){
    // Background
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 600, 600);

    // Drawing the grid
    ctx.strokeStyle = "#006bb3";
    ctx.strokeRect(0, 0, 600, 600);
    ctx.beginPath();
    ctx.fillStyle = "#006bb3";
    ctx.lineWidth = 3;

    // Variables for loop to make grids
    let x_grid = 50;
    let y_grid = 50;

    for(let i = 0; i < 10; i++){ // Making Vertical Grids
        ctx.moveTo(x_grid, 0);
        ctx.lineTo(x_grid, 600);
        x_grid += 50; // Next Vertical Line
    }
    
    for(let j = 0; j < 10; j++){
        ctx.moveTo(0, y_grid);
        ctx.lineTo(600, y_grid);
        y_grid += 50; // Next Horizontal Line
    }
    
    ctx.stroke();
}


// Keystrokes
function keyPressed(e){
	let key = e.key; // Getting user input
    let pac_x = pac_pos[0];
    let pac_y = pac_pos[1];

	// Cases for pac man to move
    if (!gameLost){ // Check if game is continuing

        if (key == 'ArrowUp'){

            // If not Top left or right corner, and not hitting Wall
            if ( (isBoxFull(pac_x, pac_y - 50) == 2 || isBoxFull(pac_x, pac_y - 50) == 3 || isBoxFull(pac_x, pac_y - 50) == 0) && ((pac_x != gridx_min && pac_y != gridy_min) || (pac_x != gridx_max && pac_y != gridy_min)) ){
                pac_pos[1] -= 50;
                pac_mouth++; // To next animation
            }

        }

        if (key == 'ArrowDown'){

            // If not bottom left or right corner, and not hitting Wall
            if ( (isBoxFull(pac_x, pac_y + 50) == 2 || isBoxFull(pac_x, pac_y + 50) == 3 || isBoxFull(pac_x, pac_y + 50) == 0) && ((pac_x != gridx_min && pac_y != gridy_max) || (pac_x != gridx_max && pac_y != gridy_max)) ){ 
                pac_pos[1] += 50;
                pac_mouth++; // To next animation
            }
            
        }

        if (key == 'ArrowLeft'){

            // If not top left or bottom left, and not Hitting wall
            if ( (isBoxFull(pac_x - 50, pac_y) == 2 || isBoxFull(pac_x - 50, pac_y) == 3 || isBoxFull(pac_x - 50, pac_y) == 0) && ((pac_x != gridx_min && pac_y != gridy_min) || (pac_x != gridx_min && pac_y != gridy_max)) ){
                pac_pos[0] -= 50;
                pac_mouth++; // To next animation
            }
            
        }

        if (key == 'ArrowRight'){

            // If not top right or bottom right, and not Hitting wall
            if (( isBoxFull(pac_x + 50, pac_y) == 2 || isBoxFull(pac_x + 50, pac_y) == 3 || isBoxFull(pac_x + 50, pac_y) == 0) && ((pac_x != gridx_max && pac_y != gridy_min) || (pac_x != gridx_max && pac_y != gridy_max)) ){
                pac_pos[0] += 50;
                pac_mouth++; // To next animation
            }
            
        }

        if (key == ' '){
            bomb_pos[0] = pac_pos[0];
            bomb_pos[1] = pac_pos[1];
        }

        // Update Canvas
        draw();
        
    }

}

// Random Integer
function randomInteger(low, high){
	let range = (high - low) + 1; // Obtain the range of number
	let random_num = Math.floor(Math.random() * range) + low; // Saving & Generating Number
	return random_num; // Returning Number
}

// Distance formula function
function distance_f(x1, y1, x2, y2){
	// Calculation
	let x_bracket = (x1 - x2) * (x1 - x2);
	let y_bracket = (y1 - y2) * (y1 - y2);
	let final = Math.sqrt( x_bracket + y_bracket);

	return final;
}

// Reset Ice Cream
function newPosition(character){
    let isOccupied = true;
    let positionX, positionY;

    if (character === 'icecream'){

        while (isOccupied === true){
            // Random Coordinates for Ice Cream
            positionX = rand_x[randomInteger(0, 9)];
            positionY = rand_y[randomInteger(0, 9)];

            if (isBoxFull(positionX, positionY) === 0){
                ice_pos[0] = positionX;
                ice_pos[1] = positionY;
                isOccupied = false;
            }
        }
    }

    if (character === 'ghost'){

        while (isOccupied === true){
            // Random Coordinates for Ice Cream
            positionX = rand_x[randomInteger(0, 9)];
            positionY = rand_y[randomInteger(0, 9)];

            if (isBoxFull(positionX, positionY) === 0){
                ghost_pos[0] = positionX;
                ghost_pos[1] = positionY;
                ghost_pos[2] = colors[randomInteger(0, 6)];
                isOccupied = false;
            }
        }
        
    }

    if (character === 'random_wall'){

        while (isOccupied === true){
            // Random Coordinates for Ice Cream
            positionX = rand_x[randomInteger(0, 9)];
            positionY = rand_y[randomInteger(0, 9)];

            if (isBoxFull(positionX, positionY) === 0){
                wall_pos[wall_counter] = [positionX, positionY];
                wall_counter += 1; // Next wall
                isOccupied = false;
            }
        }
        
    }

}

// Function to check if box is occupied
function isBoxFull(x, y){
    let final = 0;

    if(bomb_pos[0] == x && bomb_pos[1] == y){
        final = 5; // 5 Represents Bomb
    } else if (pac_pos[0] == x && pac_pos[1] == y){
        final = 4; // 4 Represents Pacman
    } else if (ice_pos[0] == x && ice_pos[1] == y){
        final = 3; // 3 Represents Ice Cream
    } else if (ghost_pos[0] == x && ghost_pos[1] == y){
        final = 2; // 2 Represents Ghost
    } else if (isfixedWalls == true || israndWalls == true){
        if (wall_counter == 0){ // If there is no box yet
            final = 0; // 0 represents free box
        } else {
            for (let i = 0; i < wall_counter; i++){
                if (wall_pos[i][0] == x && wall_pos[i][1] == y){
                    final = 1; // 1 Represents Box
                }
            }
        }

    } else { 
        final = 0; // 0 Represents free box
    }

    return final; 
}

// Random Walls
function randWalls(){

    if (isfixedWalls == false){
        if (israndWalls == false){
            
            israndWalls = true; 
            for(let a = 0; a < randomInteger(3, 12); a++){ // For loop to get random walls
                newPosition("random_wall");
            }
            
        }
    } else {
        alert("Fixed Walls are already in-use. Please reset to use the other");
    }

    // Update Canvas
    draw();
}

// Fixed walls
function fixedWalls(){
    
    if (israndWalls == false){
        if (isfixedWalls == false){
            isfixedWalls = true;
    
            let box_x, box_y;
            let horizontal_box = 6;
            let vertical_box = 4;

            // Top and bottom boxes
            box_y = 95;
            for (let j = 0; j < 2; j++){
                
                for (let k = 0; k < horizontal_box; k++){
                    box_x = 125 + (50 * k);
                    wall_pos[wall_counter] = [box_x, box_y]; 
                    wall_counter += 1;
                }

                box_y = 445; // To the bottom box
            }

            // Side Boxes
            box_x = 75; // Set to vertical box position
            for (let l = 0; l < 2; l++){

                for (let m = 0; m < vertical_box; m++){
                    box_y = 145 + (50 * (m + 1));
                    wall_pos[wall_counter] = [box_x, box_y];
                    wall_counter += 1;
                }

                box_x = 425; // To the right side
            }

        }
    } else {
        alert("Random Walls are already in-use. Please reset to use the other");
    }

    // Update Canvas
    draw();
}

// Game Reset
function resetGame(){
    // Resetting all variables to default for new game
    // Positions
    pac_pos = [25, 45];
    ice_pos = [];
    ghost_pos = [];
    wall_pos = [];
    bomb_pos = [];

    // Game Stats
    ice_eaten = 0;
    document.getElementById("user_score").innerHTML = "Ice Cream Eaten: ";

    // Game Status
    EnemyMoveMode = undefined;
    gameLost = false;
    israndWalls = false;
    isfixedWalls = false;
    pac_mouth = 1;
    wall_counter = 0;

    // Reset Moving Ghost
    clearInterval(timer);
    timer = 0;
    ghost_movement = false;
    

    // Updating the canvas
    draw();
}


// Image 1 (Ice Cream) [drawIceCream(25, 45);] + 50
function drawIceCream(x, y) {

    ctx.beginPath();
    ctx.save();
    ctx.translate(x, y);

    // The Cone's Triangle Part
    ctx.fillStyle = '#ffb366';
    ctx.moveTo(0, 0);
    ctx.lineTo(-10, -15);
    ctx.lineTo(10, -15);
    ctx.fill();
    
    // The Top Cone
    ctx.beginPath();
	ctx.rect(-10, -15, 20, 5);
	ctx.fill();


    // The Ice Cream
    ctx.fillStyle = 'pink';
    ctx.beginPath();
    ctx.arc(0, -15, 11, 180 * Math.PI/180, 360 * Math.PI/180);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(0, -25, 10, 0 * Math.PI/180, 360 * Math.PI/180);
    ctx.fill();
    
    // Reset
    ctx.restore();
}

// Image 2 Pac Man
function drawPacMan(x, y){

    ctx.beginPath();
    ctx.save();
    ctx.translate(x, y - 20); // Positioning to middle of boxes

    // The body
    ctx.fillStyle = 'yellow';

    // Animated movement
    if(pac_mouth % 2 == 0){
        // Pac man animation
        ctx.arc(0, 0, 20, 0, 2 * Math.PI);
        ctx.fill();

        // The mouth
        ctx.beginPath();
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.moveTo(0,0);
        ctx.lineTo(20, 0);
        ctx.stroke();

    } else if (pac_mouth % 2 == 1){
        // Pac man animation
        ctx.arc(0, 0, 20, 0.25 * Math.PI, 1.75 * Math.PI);
        ctx.lineTo(0, 0);
        ctx.fill();

    }
    

    // Eyes
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;
    if (gameLost){ // Dead or Alive
        ctx.moveTo(0, -5);
        ctx.lineTo(-5, -15);
        ctx.moveTo(-5, -5);
        ctx.lineTo(0, -15)
        ctx.stroke();
    } else {
        ctx.arc(0, -10, 3, 0 * Math.PI/180, 360 * Math.PI/180);
    }
    
    ctx.fill();

    ctx.restore();
}

// Image 3 Colorful Ghost
function drawGhost(x, y, fill_color){
    ctx.save();
    ctx.translate(x, y - 20);

    ctx.beginPath();
    ctx.fillStyle = fill_color;

    ctx.arc(0, 0, 20, 180 * Math.PI/180, 360 * Math.PI/180); // Head
    ctx.rect(-20, 0, 40, 5); // Body
    // Left and Right Legs
    ctx.moveTo(-20, 5); 
    ctx.lineTo(-20, 20);
    ctx.lineTo(0, 5);
    ctx.lineTo(20, 20);
    ctx.lineTo(20, 5);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-10, 5);
    ctx.lineTo(0, 20);
    ctx.lineTo(10, 5);

    ctx.fill();

    // Eyes
    ctx.beginPath();
    ctx.fillStyle = 'black';
    ctx.rect(-5, -5, 2.5, 7); // left eye
    ctx.rect(10, -5, 2.5, 7); // right eye

    ctx.fill();

    ctx.restore();
}

// Image 4 Walls
function drawWall(x, y){
    ctx.save();
    ctx.translate(x, y - 20);

    ctx.beginPath();
    ctx.strokeStyle = "#006bb3";
    ctx.rect(-20, -20, 40, 40); // Box

    // Cross
    ctx.moveTo(-20, -20);
    ctx.lineTo(20, 20);
    ctx.moveTo(-20, 20);
    ctx.lineTo(20, -20);
    ctx.stroke();

    ctx.restore();

}

// Image 5 Bombs
function drawBomb(x, y){
    ctx.save();
    ctx.translate(x, y - 20);

    ctx.beginPath();
    ctx.fillStyle = "grey";
    ctx.arc(-1, 5, 16, 0, 2 * Math.PI);
    ctx.rect(-10, -14, 18, 15);
    ctx.fill();

    ctx.beginPath();
    ctx.strokeStyle = "red";
    ctx.moveTo(-10, -5);
    ctx.lineTo(8, 15);
    ctx.moveTo(8, -5);
    ctx.lineTo(-10, 15)
    ctx.stroke();

    ctx.restore();
}

// Game Over sign
function drawGameOver(){
    ctx.beginPath();
    ctx.font = "70px Arial";
    ctx.strokeStyle = "red";
    ctx.strokeText("GAME OVER", 50, 230);
    ctx.font = "50px Arial";
    ctx.strokeText("Final Score: " + ice_eaten, 80, 280);
}