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

// Player Object containing players attributs
var player = {
	lives: NUM_LIVES,
	x: mouseX,
	y: stageHeight - 50,
	score: 0,
	lastFired: -Infinity,
	lastShield: -Infinity,
	lastCollision: -Infinity
};

var obstacleGenerationProperties = {
	timeToSpawn: 200,
	ySpeedAddition_min: 0.1,
	ySpeedAddition_max: 0.5,
	numberSpawned: 5
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
		DrawPlayer();
		CreateBullets(mouseX + 25);
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


	var numObstacles = random(obstacleGenerationProperties.numberSpawned);
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

	return obstacle;
};

var UpdateObstacles = function() {
	for(var i = 0; i < obstacles.length; i++) {
		var obstacle = obstacles[i];
		rect(obstacle.x, obstacle.y, 30, 30);
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
	PFont largeFont = loadFont("calibri");
  	textFont(largeFont, 90);
	text("Game Title", 200, 250);

	PFont smallFont = loadFont("courier");
  	textFont(smallFont, 14);
    text("Click to start the game", 300, 320);
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
	rect(mouseX, stageHeight - 50, 50, 10);
};

var DrawScore = function() {
	fill(255,255,255);
    text("Score: " + player.score, 550, 30);
    text("Number of Lives: " + player.lives, 50, 30);
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
	if(player.score > 50 && player.score < 100) {
		obstacleGenerationProperties.ySpeedAddition_min = 0.3;
		obstacleGenerationProperties.ySpeedAddition_max = 0.6;
		obstacleGenerationProperties.numberSpawned = 6;
	} else if(player.score > 100 && player.score < 150) {
		obstacleGenerationProperties.ySpeedAddition_min = 0.3;
		obstacleGenerationProperties.ySpeedAddition_max = 0.7;
		obstacleGenerationProperties.numberSpawned = 7;
	} else if(player.score > 150 && player.score < 200) {
		//obstacleGenerationProperties.timeToSpawn = 250;
		obstacleGenerationProperties.ySpeedAddition_min = 0.4;
		obstacleGenerationProperties.ySpeedAddition_max = 0.8;
		obstacleGenerationProperties.numberSpawned = 8;
	} else if(player.score > 200) {
		//obstacleGenerationProperties.timeToSpawn = 200;
		obstacleGenerationProperties.ySpeedAddition_min = 0.5;
		obstacleGenerationProperties.ySpeedAddition_max = 0.9;
		obstacleGenerationProperties.numberSpawned = 9;
	}  
}

var DrawGameOverScreen = function() {
	if(player.lives <= 0) {
		
		//Game Title
		PFont largeFont = loadFont("calibri");
	  	textFont(largeFont, 90);
		text("Game Over", 200, 250);

		PFont mediumFont = loadFont("calibri");
	  	textFont(mediumFont, 28);
	    text("Final Score: " + player.score, 330, 320);

		PFont smallFont = loadFont("courier");
	  	textFont(smallFont, 14);
	    text("Click to start a new game", 310, 380);

	}
}