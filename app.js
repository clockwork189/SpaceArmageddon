/*jslint browser: true*/

// Gets Animated Frames from the browser
(function () {
    var requestAnimationFrame = window.requestAnimationFrame ||
                              window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame ||
                              window.oRequestAnimationFrame ||
                              window.msRequestAnimationFrame ||
            function (callback, element) {
                window.setTimeout(callback, 1000 / 60);
            }
  window.requestAnimationFrame = requestAnimationFrame;
})();

var images = {};
var ImageSources = {
    blueEnemy: "images/blueEnemy.png",
    orangeEnemy: "images/orangeEnemy.png",
    redEnemy: "images/redEnemy.png",
    pinkEnemy: "images/pinkEnemy.png",
    greenEnemy: "images/greenEnemy.png",
    shipImage: "images/mainShip.png",
    gameOverImage: "images/GameOver.png",
    lifeIcon: "images/live.png",
    backgroundImage: "images/background.png"
};

var loadImages = function (sources) {
    var loadedImages = 0, numImages = 0, key, i;
    for (key in sources) {
        if (sources.hasOwnProperty(key)) {
            numImages += 1;
        }
    }
    if (numImages > 0) {
        for (i in sources) {
            if (sources.hasOwnProperty(i)) {
                images[i] = new Image();
                images[i].src = sources[i];
                loadedImages += 1;
            }
        }
    }
    if (numImages === loadedImages) {
        return true;
    }
    return false;
};
loadImages(ImageSources);

var obstacleColors = [images.blueEnemy, images.orangeEnemy, images.redEnemy, images.pinkEnemy, images.greenEnemy];

var canvas = document.getElementById("mainGameCanvas");
var context = canvas.getContext("2d");

// Setting the height and width of the canvas element
var stageWidth = canvas.width;
var stageHeight = canvas.height;

// Creating game obstacles
var obstacles = [];
var bullets = [];
var explosions = [];

var mouseX = stageWidth / 2;
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

var getMousePos = function (canvas, event) {
    var rect = canvas.getBoundingClientRect();
    return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
    };
};

//TODO: Remove this listener when gameState is not PLAYING
canvas.addEventListener("mousemove", function (event) {
    var mousePos = getMousePos(canvas, event);
    mouseX = mousePos.x;
    mouseY = mousePos.y;
});

var mousePressed = 0;
document.body.onmousedown = function () {
    mousePressed += 1;
};
document.body.onmouseup = function () {
    mousePressed -= 1;
};


//A simple random generator
var random = function (min, max) {
    return Math.random() * (max - min) + min;
};

//Bullet Object
var Bullet = function (xPosition) {
    this.x = xPosition;
    this.y = stageHeight - 50;
    this.ySpeed = 5;
    this.damage = 1;
};

//Explosion Object
var Explosion = function (xCoordinate, yCoordinate) {
    this.radius = 30;
    this.duration = 5;
    this.x = xCoordinate;
    this.y = yCoordinate - 10;
};

//Obstacle Object
var Obstacle = function () {
    this.x = random(50, stageWidth - 50);
    this.y = 40;
    this.ySpeed = 0.1 + random(obstacleProperties.MinYSpeedAddition, obstacleProperties.MaxYSpeedAddition);
    this.health = 1;
    this.image = obstacleColors[parseInt(random(0, obstacleColors.length), 10)];
};


var drawBackground = function () {
    //context.rect(0, 0, stageWidth, stageHeight);
    context.drawImage(images.backgroundImage, 0, 0);
};

var drawPlayer = function () {
    player.xPos = mouseX;
    context.beginPath();
    context.drawImage(images.shipImage, player.xPos - player.width / 2, player.yPos);
};

var createBullets = function (posX) {
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


var updateBullets = function () {
    var i, bullet;
    for (i = 0; i < bullets.length; i += 1) {
        context.beginPath();
        bullet = bullets[i];
        context.arc(bullet.x, bullet.y, 2.5, 0, 2 * Math.PI, false);
        context.fillStyle = "#fff";
        context.fill();
        bullet.y -= bullet.ySpeed;

        if (bullet.y <= 30) {
            bullets.splice(i, 1);
        }
    }
};

var generateAllObstacles = function () {
    if (frameCount - lastObstacleCreation < obstacleProperties.timeToSpawn) {
        return;
    }
    var i, numObstacles, obstacle;
    numObstacles  = random(obstacleProperties.MinNumberSpawned, obstacleProperties.MaxNumberSpawned);
    for (i = 0; i < numObstacles; i += 1) {
        obstacle = new Obstacle();
        obstacles.push(obstacle);
    }
    lastObstacleCreation = frameCount;
};

var createExplosionAnimation = function (xCoord, yCoord) {
    var explosion = new Explosion(xCoord, yCoord);
    explosions.push(explosion);
};

var drawExplosion = function () {
    var i, alpha, explosion;
    for (i = explosions.length - 1; i >= 0; i -= 1) {
        explosion = explosions[i];
        explosion.radius = explosion.radius - explosion.duration;
        alpha =  255 - explosion.duration * 20;
        if (explosion.radius <= 0) {
            explosions.splice(i, 1);
        }

        context.arc(explosion.x, explosion.y, explosion.radius / 2, 0, 2 * Math.PI, false);
        context.fillStyle =  "rgba(237, 134, 70, " + alpha + ")";
        context.fill();
    }
};

var updateObstacles = function () {
    var i, obstacle;
    for (i = 0; i < obstacles.length; i += 1) {
        obstacle = obstacles[i];
        context.drawImage(obstacle.image, obstacle.x, obstacle.y);
        obstacle.y += obstacle.ySpeed;

        if (obstacle.health <= 0) {
            obstacles.splice(i, 1);
            player.score += 1;
        }

        if (obstacle.y >= stageHeight - 80) {
            createExplosionAnimation(obstacle.x, obstacle.y);
            obstacles.splice(i, 1);
            player.lives -= 1;
        }
    }
};

var updateObstacleSpawnCharateristics = function () {
    obstacleProperties.MinYSpeedAddition = parseFloat(obstacleProperties.DefaultMinYSpeedAddition + (player.score / 25) * 0.1);
    obstacleProperties.MaxYSpeedAddition =  parseFloat(obstacleProperties.DefaultMaxYSpeedAddition + (player.score / 25) * 0.1);
    obstacleProperties.MinNumberSpawned =  parseInt(Math.floor(obstacleProperties.DefaultMinNumberSpawned + player.score / 25), 10);
    obstacleProperties.MaxNumberSpawned =  parseInt(Math.floor(obstacleProperties.DefaultMaxNumberSpawned + player.score / 25), 10);

};

var drawScore = function () {
    var i, spacing = 30;
    context.font = '16px courier';
    context.fillStyle = "#00ffff";
    context.fillText("Number of Lives: ", 50, 30);
    context.fillText("Score: " + player.score, 550, 30);
    for (i = player.lives; i > 0; i -= 1) {
        context.drawImage(images.lifeIcon, 190 + spacing, 13);
        spacing += 30;
    }
};

var updateScore = function () {
    var i, bullet, n, obstacle;
    for (i = bullets.length - 1; i >= 0; i -= 1) {
        bullet = bullets[i];

        for (n = obstacles.length - 1; n >= 0; n -= 1) {
            obstacle = obstacles[n];
            if (bullet.x >= obstacle.x && bullet.x <= obstacle.x + 30 && bullet.y >= obstacle.y &&  bullet.y <= obstacle.y + 30) {
                obstacle.health -= bullet.damage;
                createExplosionAnimation(bullet.x, bullet.y);
                bullets.splice(i, 1);
            }
        }
    }
};


var drawOpeningScreen = function () {
    context.rect(0, 0, stageWidth, stageHeight);
    context.fillStyle = "#000";
    context.fill();

    context.font = '56px Verdana';
    context.fillStyle = "#00ff00";
    context.fillText("SPACE ARMEGEDDON", 100, 100);

    context.font = '16px courier';
    context.fillStyle = "#ffffff";
    context.fillText("OH NOESSS! Our planet is under attack!", 200, 220);
    context.fillText("Can you protect planet earth from the alien invaders?", 140, 250);
    context.fillText("Move your ship with your mouse", 240, 350);
    context.fillText("Click or press a key to shoot", 245, 375);
    context.fillStyle = "#00ff00";
    context.fillText("Click to begin your mission", 255, 450);
};

var drawGameOverScreen = function () {
    context.rect(0, 0, stageWidth, stageHeight);
    context.fillStyle = "#000";
    context.fill();

    context.font = '56px Verdana';
    context.fillStyle = "#00ff00";
    context.fillText("GAME OVER", 240, 150);

    context.font = '28px calibri';
    context.fillStyle = "#ffffff";
    context.fillText("Final Score: " + player.score, 330, 280);

    context.font = '14px courier';
    context.fillText("Click to start a new game", 310, 380);
};

var checkGameState = function () {
    if (mousePressed) {
        if (currentGameState === gameState.NOT_STARTED) {
            currentGameState = gameState.PLAYING;
            player.lives = NUM_LIVES;
            player.score = 0;
            obstacles = [];
            bullets = [];
        } else if (currentGameState === gameState.GAME_OVER) {
            currentGameState = gameState.PLAYING;
            player.lives = NUM_LIVES;
            player.score = 0;
            obstacles = [];
            bullets = [];
        }
    }

    if (player.lives <= 0) {
        currentGameState = gameState.GAME_OVER;
    }
};

var loop = function () {
    checkGameState();
    if (currentGameState === gameState.NOT_STARTED) {
        drawOpeningScreen();
    } else if (currentGameState === gameState.PLAYING) {
        frameCount += 1;
        drawBackground();
        drawPlayer();
        generateAllObstacles();
        updateObstacles();
        updateObstacleSpawnCharateristics();
        drawScore();
        updateScore();
        createBullets(player.xPos - 5);
        updateBullets();
        drawExplosion();
    } else if (currentGameState === gameState.GAME_OVER) {
        drawGameOverScreen();
    }
    requestAnimationFrame(loop);
};
loop();