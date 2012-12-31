// Gets Animated Frames from the browser
window.requestAnimationFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(callback, element){
                window.setTimeout(callback, 1000 / 60);
              };
})();

var images = {};
var ImageSources = {
	blueEnemy: "images/blueEnemy.png",
	orangeEnemy: "images/orangeEnemy.png",
	redEnemy: "images/redEnemy.png",
	pinkEnemy: "images/pinkEnemy.png",
	greenEnemy: "images/greenEnemy.png",
	shipImage: "images/mainShip.png",
	titleImage: "images/TitleImage.png",
	gameOverImage: "images/GameOver.png",
	lifeIcon: "images/live.png",
	backgroundImage: "images/background.png"
};

var LoadImages = function(sources, callback) {
	var loadedImages = 0;
	var numImages = 0;
    for (var key in sources) {
        if (sources.hasOwnProperty(key)) numImages++;
    }
	
	if(numImages > 0) {
		for(var i in sources) {
			images[i] = new Image();
			images[i].src = sources[i];
			loadedImages++;
		}
	}

	if(numImages == loadedImages) {
		return true;
	} else {
		return false;
	}
};
LoadImages(ImageSources);

var canvas = document.getElementById("mainGameCanvas");
var context = canvas.getContext("2d");

// Setting the height and width of the canvas element
var stageWidth = canvas.width;
var stageHeight = canvas.height;

// Creating game obstacles
var obstacles = [];
var bullets = [];
var explosions = [];

var mouseX = stageWidth/2;
var mouseY = 0;

var NUM_LIVES = 3;

var frameCount = 0;
var lastObstacleCreation = 0;

var gameState = {
	NOT_STARTED: 0,
	PLAYING: 1,
	PAUSED: 2,
	GAME_OVER: 3
};

var currentGameState = gameState.NOT_STARTED;

var player = {
	lives: NUM_LIVES,
	xPos: mouseX,
	yPos: stageHeight - 50,
	width: 30,
	height: 40,
	score: 0,
	lastFired: -Infinity,
	lastFired: -Infinity,
	lastShield: -Infinity,
	lastCollision: -Infinity
};

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

var GetMousePos = function(canvas, event) {
	var rect = canvas.getBoundingClientRect();
    
    return {
    	x: event.clientX - rect.left,
      	y: event.clientY - rect.top
    };
};

//TODO: Remove this listener when gameState is not PLAYING
canvas.addEventListener("mousemove", function(event) {
	var mousePos = GetMousePos(canvas, event);
	mouseX = mousePos.x;
	mouseY = mousePos.y;
});	


canvas.addEventListener("click", function(event) {
	if(currentGameState == gameState.NOT_STARTED) {
		currentGameState = gameState.PLAYING;
		player.lives = NUM_LIVES;
		player.score = 0;
		obstacles = [];
		bullets = [];
	}
});

var mousePressed = 0;
canvas.onmousedown = function() { 
  ++mousePressed;
}
canvas.onmouseup = function() {
  --mousePressed;
}
var obstacleColors = [
						images.blueEnemy, 
					  	images.orangeEnemy, 
					  	images.redEnemy, 
					  	images.pinkEnemy, 
					  	images.greenEnemy
					  ];

//Bullet Object
var Bullet = function(xPosition) {
	this.x = xPosition;
	this.y = stageHeight - 50;
	this.ySpeed = 5;
	this.damage = 1;
};

//Explosion Object
var Explosion = function(xCoordinate, yCoordinate) {
	this.radius = 30;
	this.duration = 5;
	this.x = xCoordinate ;
	this.y = yCoordinate - 10;
};

//Obstacle Object
var Obstacle = function() {
	this.x = random(50, stageWidth - 50);
	this.y = 40;
	this.ySpeed = 0.1 + random(obstacleProperties.MinYSpeedAddition, obstacleProperties.MaxYSpeedAddition);
	this.health = 1;
	this.image = obstacleColors[parseInt(random(0, obstacleColors.length))];
};

function random(min, max) {
  	return Math.random() * (max - min) + min;
}

var DrawBackground = function() {
	context.rect(0, 0, stageWidth, stageHeight);
	context.fillStyle = "#000";
	context.fill();
};

var DrawPlayer = function() {
	player.xPos = mouseX;
	context.beginPath();
	context.drawImage(images.shipImage, player.xPos - player.width/2, player.yPos);
};

var CreateBullets = function(posX) {
	// Only fire on mouse pressed
    if (!mousePressed) {
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
		context.beginPath();
		var bullet = bullets[i];
		context.arc(bullet.x, bullet.y, 2.5, 0, 2 * Math.PI, false);
		context.fillStyle = "#fff";
		context.fill();
		
		bullet.y -= bullet.ySpeed;

		if(bullet.y <= 30) {
			bullets.splice(i,1);
		}
	}
};

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


var UpdateObstacles = function() {
	for(var i = 0; i < obstacles.length; i++) {
		var obstacle = obstacles[i];

		context.drawImage(obstacle.image, obstacle.x, obstacle.y);
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
	obstacleProperties.MinYSpeedAddition = parseFloat(obstacleProperties.DefaultMinYSpeedAddition + (player.score/25) * 0.1);
	obstacleProperties.MaxYSpeedAddition =  parseFloat(obstacleProperties.DefaultMaxYSpeedAddition + (player.score/25) * 0.1);
	obstacleProperties.MinNumberSpawned =  parseInt(Math.floor(obstacleProperties.DefaultMinNumberSpawned + player.score/25));
	obstacleProperties.MaxNumberSpawned =  parseInt(Math.floor(obstacleProperties.DefaultMaxNumberSpawned + player.score/25));

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

var CreateExplosionAnimation = function(xCoord, yCoord) {
	var explosion = new Explosion(xCoord, yCoord);
	explosions.push(explosion);
};

var DrawExplosion = function() {
	for(var i = explosions.length - 1; i >= 0; i -= 1) {
		var explosion = explosions[i];
		explosion.radius = explosion.radius - explosion.duration;
		var alpha =  255 - explosion.duration * 20;
		
		if(explosion.radius <= 0) {
			explosions.splice(i, 1);
		}

		context.arc(explosion.x, explosion.y, explosion.radius/2, 0, 2 * Math.PI, false);
		context.fillStyle =  "rgba(237, 134, 70, " + alpha + ")";
		context.fill();
	}
}


var loop = function() {
	DrawBackground();
	DrawPlayer();
	frameCount++;
	GenerateAllObstacles();
	UpdateObstacles();
	UpdateObstacleSpawnCharateristics();
	UpdateScore();
	CreateBullets(player.xPos - 5);
	UpdateBullets();
	DrawExplosion();
	requestAnimationFrame(loop);
};
if(LoadImages(ImageSources)) {
	loop();
}
