// Runtime game variable
var GameIsRunning = false;
var GameIsOver = false;

// Creating game obstacles
var obstacles = [];
var bullets = [];
var explosions = [];


// Setting the height and width of the canvas element
var stageWidth = 800;
var stageHeight = 600;

var lastObstacleCreation = 0;

// Default number of player lives
var NUM_LIVES = 3;

var obstacleProperties = {
	timeToSpawn: 200,
	DefaultMinYSpeedAddition: 0.1,
	DefaultMaxYSpeedAddition: 0.5,
	DefaultMinNumberSpawned: 3,
	DefaultMaxNumberSpawned: 5,
	MinYSpeedAddition: 0.1,
	MaxYSpeedAddition: 0.5,
	MinNumberSpawned: 3,
	MaxNumberSpawned: 5
};

var blueEnemy = loadImage("images/blueEnemy.png");
var orangeEnemy = loadImage("images/orangeEnemy.png");
var redEnemy = loadImage("images/redEnemy.png");
var pinkEnemy = loadImage("images/pinkEnemy.png");
var greenEnemy = loadImage("images/greenEnemy.png");

var obstacleColors = [blueEnemy, orangeEnemy, redEnemy, pinkEnemy, greenEnemy];

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
		DrawExplosion();
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
    if (frameCount - lastObstacleCreation < obstacleProperties.timeToSpawn) {
        return;
    }

	var numObstacles = random(obstacleProperties.MinNumberSpawned, obstacleProperties.MaxNumberSpawned);
	for(var i = 0; i < numObstacles; i++) {
		var obstacle = new Obstacle();
		obstacles.push(obstacle);
	}
	lastObstacleCreation = frameCount;
};

var Obstacle = function() {
	this.x = random(50, stageWidth - 50);
	this.y = 40;
	this.ySpeed = 0.1 + random(obstacleProperties.MinYSpeedAddition, obstacleProperties.MaxYSpeedAddition);
	this.health = 1;
	this.image = obstacleColors[parseInt(random(0, obstacleColors.length))];
}

var UpdateObstacles = function() {
	for(var i = 0; i < obstacles.length; i++) {
		var obstacle = obstacles[i];

		image(obstacle.image, obstacle.x, obstacle.y);
		obstacle.y += obstacle.ySpeed;

		if(obstacle.health <= 0){
			obstacles.splice(i,1);
			player.score++;
		}

		if(obstacle.y >= stageHeight - 80) {
			CreateExplosionAnimation(obstacle.x, obstacle.y);
			obstacles.splice(i,1);			
			player.lives -= 1;

			if(player.lives <= 0) {
				GameIsOver = true;
				GameIsRunning = false;
			}
		}
	}
};

var UpdateObstacleSpawnCharateristics = function() {
	obstacleProperties.MinYSpeedAddition = obstacleProperties.DefaultMinYSpeedAddition + (player.score/25) * 0.1;
	obstacleProperties.MaxYSpeedAddition =  obstacleProperties.DefaultMaxYSpeedAddition + (player.score/25) * 0.1;
	obstacleProperties.MinNumberSpawned =  parseInt(floor(obstacleProperties.DefaultMinNumberSpawned + player.score/25));
	obstacleProperties.MaxNumberSpawned =  parseInt(floor(obstacleProperties.DefaultMaxNumberSpawned + player.score/25));

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

// Creating a bullet Object
var Bullet = function(xPosition) {
	this.x = xPosition;
	this.y = stageHeight - 50;
	this.ySpeed = 5;
	this.damage = 1;
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

	var bullet = new Bullet(posX);
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
				
				CreateExplosionAnimation(bullet.x, bullet.y);
				bullets.splice(i,1);
			}
		}	
	}
};

var Explosion = function(xCoordinate, yCoordinate) {
	this.radius = 30;
	this.duration = 5;
	this.x = xCoordinate ;
	this.y = yCoordinate - 10;
};

var CreateExplosionAnimation = function(xCoord, yCoord) {
	var explosion = new Explosion(xCoord, yCoord);
	explosions.push(explosion);
};

var DrawExplosion = function() {
	for(var i = explosions.length - 1; i >= 0; i -= 1) {
		var explosion = explosions[i];

		explosion.radius = explosion.radius - explosion.duration;
		
		fill(237, 134, 70, 255 - explosion.duration * 20);
		
		if(explosion.radius <= 0) {
			explosions.splice(i, 1);
		}

		ellipse(explosion.x, explosion.y, explosion.radius, explosion.radius);
	}
}

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
