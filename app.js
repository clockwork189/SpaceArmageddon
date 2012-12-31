// Gets Animated Frames from the browser
window.requestAnimationFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(/* function */ callback, /* DOMElement */ element){
                window.setTimeout(callback, 1000 / 60);
              };
})();


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


canvas.addEventListener("mouseclick", function(event) {
	if(currentGameState == gameState.NOT_STARTED) {
		currentGameState = gameState.PLAYING;
	}
});

var mousePressed = 0;
canvas.onmousedown = function() { 
  ++mousePressed;
}
canvas.onmouseup = function() {
  --mousePressed;
}

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
	//this.image = obstacleColors[parseInt(random(0, obstacleColors.length))];
};


var DrawBackground = function() {
	context.rect(0, 0, stageWidth, stageHeight);
	context.fillStyle = "#000";
	context.fill();
};

var DrawPlayer = function() {
	player.xPos = mouseX;
	context.beginPath();
	context.rect(player.xPos - player.width/2, player.yPos , player.width, player.height);
	context.fillStyle = "#fff";
	context.fill();
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
		console.log(bullet.x);
		context.arc(bullet.x, bullet.y, 2.5, 0, 2 * Math.PI, false);
		context.fillStyle = "#fff";
		context.fill();
		
		bullet.y -= bullet.ySpeed;

		if(bullet.y <= 30) {
			bullets.splice(i,1);
		}
	}
};

var loop = function() {
	DrawBackground();
	DrawPlayer();
	frameCount++;
	CreateBullets(player.xPos);
	UpdateBullets();
	requestAnimationFrame(loop);
};
loop();
