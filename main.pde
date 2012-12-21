// Runtime game variable
var GameIsRunning = false;
var GameIsOver = false;

// Creating game obstacles
var obstacles;
var bullets;
bullets = [];
obstacles = [];

// Setting the height and width of the canvas element
var stageWidth = 800;
var stageHeight = 600;

var lastObstacleCreation = 0;

// Default number of player lives
var NUM_LIVES = 3;

var obstacleGenerationProperties = {
	timeToSpawn: 200,
	ySpeedAddition_min: 0.1,
	ySpeedAddition_max: 0.5,
	numberSpawned_min: 3,
	numberSpawned_max: 5
};

var obstacleImage = loadImage("images/blueEnemy.png");
var shipImage = loadImage("images/mainShip.png");
var titleImage = loadImage("images/TitleImage.png");
var gameOverImage = loadImage("images/GameOver.png");
var lifeIcon = loadImage("images/live.png");
var backgroundImage = loadImage("images/background.png");

// Player Object containing players attributs
var player = {
	lives: NUM_LIVES,
	x: mouseX,
	y: stageHeight - 50,
	score: 0,
	lastFired: -Infinity,
	lastShield: -Infinity,
	lastCollision: -Infinity,
	image: shipImage
};

// The Setup loop prepares the stage for action!
void setup() {
	size(stageWidth,stageHeight);
	background(0,0,0);
}

// This is what makes the game work. The draw loop constantly refreshes the canvas
void draw() {
	background(0,0,0);
	fill(255,255,255);
	if(GameIsRunning === true) {
		DrawBackground();
		DrawPlayer();
		CreateBullets(mouseX + 11);
		GenerateAllObstacles();
		UpdateObstacles();
		UpdateBullets();
		DrawScore();
		UpdateScore();
		UpdateObstacleSpawnCharateristics();
	} else {
		if(GameIsOver === false) { 
			DrawOpeningScreen();
		} else {
			DrawGameOverScreen();
		}
	}
}


void mousePressed() {
	if(GameIsRunning === false) {
		GameIsRunning = true;
		player.lives = NUM_LIVES;
		player.score = 0;
		obstacles = [];
		bullets = [];
	}
}

var GenerateAllObstacles = function() {
    if (frameCount - lastObstacleCreation < obstacleGenerationProperties.timeToSpawn) {
        return;
    }

	var numObstacles = random(obstacleGenerationProperties.numberSpawned_min, obstacleGenerationProperties.numberSpawned_max);
	for(var i = 0; i < numObstacles; i++) {
		obstacles.push(CreateObstacles());
	}
	lastObstacleCreation = frameCount;
};

var CreateObstacles = function() {
	var obstacle = [];
	obstacle.x = random(50, stageWidth - 50);
	obstacle.y = 40;
	obstacle.ySpeed = 0.1 + random(obstacleGenerationProperties.ySpeedAddition_min, obstacleGenerationProperties.ySpeedAddition_max);
	obstacle.health = 1;
	obstacle.image = obstacleImage;
	return obstacle;
};

var UpdateObstacles = function() {
	for(var i = 0; i < obstacles.length; i++) {
		var obstacle = obstacles[i];
		//rect(obstacle.x, obstacle.y, 30, 30);
		image(obstacle.image, obstacle.x, obstacle.y);
		obstacle.y += obstacle.ySpeed;

		if(obstacle.health <= 0){
			obstacles.splice(i,1);
			player.score++;
		}

		if(obstacle.y >= stageHeight - 80) {
			obstacles.splice(i,1);
			player.lives -= 1;

			if(player.lives <= 0) {
				GameIsOver = true;
				GameIsRunning = false;
			}
		}
	}
};

var DrawOpeningScreen = function() {
	fill(255,255,255);
	
	//Game Title
	image(titleImage, 100, 100);
	
	PFont mediumFont = loadFont("courier");
  	textFont(mediumFont, 16);
    text("OH NOESSS! Our planet is under attack!", 200, 220);
    text("Can you protect planet earth from the alien invaders?", 140, 250);
    text("Move your ship with your mouse", 240, 350);
    text("Click or press a key to shoot", 240, 375);

	PFont smallFont = loadFont("courier");
  	textFont(smallFont, 14);
  	fill(0, 255, 0);
    text("Click to begin your mission", 280, 450);
};

var CreateBullets = function(posX) {
	// Only fire on command
    if (!mousePressed && !keyPressed) {
        return;
    }

    // Wait for the next round to be chambered
    if (frameCount - player.lastFired < 10) {
        return;
    }

	var bullet = [];
	bullet.x = posX;
	bullet.y = stageHeight - 50;
	bullet.ySpeed = 5;
	bullet.damage = 1;

	bullets.push(bullet);

	player.lastFired = frameCount;
};

var UpdateBullets = function() {
	for(var i = 0; i < bullets.length; i++) {
		fill(255,0,0);
		ellipse(bullets[i].x, bullets[i].y, 5, 5);
		bullets[i].y -= bullets[i].ySpeed;

		if(bullets[i].y <= 30) {
			bullets.splice(i,1);
		}
	}
};

var DrawPlayer = function() {
	image(player.image, mouseX, stageHeight - 50);
};

var DrawScore = function() {
	fill(255,255,255);
	PFont mediumFont = loadFont("courier");
	textFont(mediumFont, 16);
	fill(0,255,255);
	text("Number of Lives: ", 50, 30);
	text("Score: " + player.score, 550, 30);
    var spacing = 30;
    for(var i = player.lives; i > 0; i--) {
    	image(lifeIcon, 190 + spacing, 13);
    	spacing += 30;
    }
};

var UpdateScore = function() {
	for(var i = bullets.length - 1; i >= 0; i -= 1) {
		var bullet = bullets[i];

		for(var n = obstacles.length - 1; n >= 0 ; n -= 1) {
			var obstacle = obstacles[n];
			if(bullet.x >= obstacle.x && bullet.x <= obstacle.x + 30 && bullet.y >= obstacle.y &&  bullet.y <= obstacle.y + 30) {
				obstacle.health -= bullet.damage;
				bullets.splice(i,1);
			}
		}	
	}
};

var UpdateObstacleSpawnCharateristics = function() {
	if(player.score > 25 && player.score < 50) {
		obstacleGenerationProperties.ySpeedAddition_min = 0.3;
		obstacleGenerationProperties.ySpeedAddition_max = 0.6;
		obstacleGenerationProperties.numberSpawned_min = 5;
		obstacleGenerationProperties.numberSpawned_max = 6;
	} else if(player.score > 50 && player.score < 75) {
		obstacleGenerationProperties.ySpeedAddition_min = 0.3;
		obstacleGenerationProperties.ySpeedAddition_max = 0.7;
		obstacleGenerationProperties.numberSpawned_min = 5;
		obstacleGenerationProperties.numberSpawned_max = 7;
	} else if(player.score > 75 && player.score < 100) {
		obstacleGenerationProperties.ySpeedAddition_min = 0.4;
		obstacleGenerationProperties.ySpeedAddition_max = 0.8;
		obstacleGenerationProperties.numberSpawned_min = 5;
		obstacleGenerationProperties.numberSpawned_max = 8;
	} else if(player.score > 100 && player.score < 125) {
		obstacleGenerationProperties.ySpeedAddition_min = 0.5;
		obstacleGenerationProperties.ySpeedAddition_max = 0.9;
		obstacleGenerationProperties.numberSpawned_min = 7;
		obstacleGenerationProperties.numberSpawned_max = 9;
	}   else if(player.score > 125 && player.score < 150) {
		obstacleGenerationProperties.ySpeedAddition_min = 0.8;
		obstacleGenerationProperties.ySpeedAddition_max = 1.0;
		obstacleGenerationProperties.numberSpawned_min = 8;
		obstacleGenerationProperties.numberSpawned_max = 10;
	} else if(player.score > 150 && player.score < 175) {
		obstacleGenerationProperties.ySpeedAddition_min = 0.9;
		obstacleGenerationProperties.ySpeedAddition_max = 1.5;
		obstacleGenerationProperties.numberSpawned_min = 9;
		obstacleGenerationProperties.numberSpawned_max = 12;
	} else if(player.score > 200) {
		obstacleGenerationProperties.ySpeedAddition_min = 1.0;
		obstacleGenerationProperties.ySpeedAddition_max = 1.5;
		obstacleGenerationProperties.numberSpawned_min = 12;
		obstacleGenerationProperties.numberSpawned_max = 15;
	}  
};

var DrawGameOverScreen = function() {
	if(player.lives <= 0) {
		
		image(gameOverImage, 240, 150);

		PFont mediumFont = loadFont("calibri");
	  	textFont(mediumFont, 28);
	    text("Final Score: " + player.score, 330, 280);

		PFont smallFont = loadFont("courier");
	  	textFont(smallFont, 14);
	    text("Click to start a new game", 310, 380);

	}
};

var DrawBackground = function() {
	//fill(0,0,0);
    //image(backgroundImage, 800, 600);
    background(backgroundImage)
    //rect(0, 0, stageWidth, stageHeight);
};