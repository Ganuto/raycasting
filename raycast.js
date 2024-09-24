const TILE_SIZE = 64;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 1;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE; 
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222");
                fill(tileColor);
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE);
            }
        }
    }
    hasWallAt(x, y){
        if(x < 0 || x > WINDOW_WIDTH || y < 0 || y > WINDOW_HEIGHT){
            return true;
        }
        var mapGridIndexX = Math.floor(x / TILE_SIZE);
        var mapGridIndexY = Math.floor(y / TILE_SIZE);
        return this.grid[mapGridIndexY][mapGridIndexX] != 0;
    }
}

class Player{
    constructor(){
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2; 
        this.radius = 3;
        this.turnDirection = 0;
        this.walkDirection = 0;
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.turnSpeed = 2 * (Math.PI / 180);
    } 
    update(){
        this.rotationAngle += this.turnDirection * this.turnSpeed;
        var moveStep = this.walkDirection * this.moveSpeed;
        this.newPlayerY = this.y + Math.sin(this.rotationAngle) * moveStep;
        this.newPlayerX = this.x + Math.cos(this.rotationAngle) * moveStep;
        if(!grid.hasWallAt(this.newPlayerX, this.newPlayerY)){
            this.y = this.newPlayerY;
            this.x = this.newPlayerX;
        }
    }
    render(){
        noStroke();
        fill("red");
        circle(this.x, this.y, this.radius);
    }
}

class Ray {
    constructor(rayAngle){
        this.rayAngle = normalizeAngle(rayAngle);
        this.wallHitX = 0;
        this.wallHitY = 0;
        this.distance = 0;
        this.wasHitVertical = 0;

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = this.rayAngle < 0 || this.rayAngle > Math.PI;

        this.isRayFacingRight = this.rayAngle < (0.5 * Math.PI) || this.rayAngle > (1.5 * Math.PI);
        this.isRayFacingLeft = this.rayAngle > (Math.PI * 0.5) && this.rayAngle < (Math.PI * 1.5);
    }
    cast(columnId){
        var xIntercept, yIntercept;
        var xStep, yStep;
        //////////////////////////////////////////////////////
        // HORIZONTAL RAY-GRID INTERSECTION
        //////////////////////////////////////////////////////
        var horizontalWallHit = false;
        var horizontalWallHitX = 0;
        var horizontalWallHitY = 0;
        // Find Y coord of the closest horizontal intersection
        yIntercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yIntercept += this.isRayFacingDown ? TILE_SIZE : 0;

        // Find X coord of the closest horizontal intersection
        xIntercept = player.x + (yIntercept - player.y) / Math.tan(this.rayAngle);

        // Find the increment xStep and Ystep
        yStep = TILE_SIZE;
        yStep *= this.isRayFacingUp ? -1 : 1;

        xStep = TILE_SIZE / Math.tan(this.rayAngle);
        xStep *= (this.isRayFacingLeft && xStep > 0) ? -1 : 1;
        xStep *= (this.isRayFacingRight && xStep < 0) ? -1 : 1;

        var nextHorizontalTouchX = xIntercept;
        var nextHorizontalTouchY = yIntercept;

        if(this.isRayFacingUp)
            nextHorizontalTouchY--;

        // Increment xStep and yStep until hit a wall
        while(nextHorizontalTouchX >= 0 && nextHorizontalTouchX <= WINDOW_WIDTH && 
            nextHorizontalTouchY >= 0 && nextHorizontalTouchY <= WINDOW_HEIGHT
        ){
            if(grid.hasWallAt(nextHorizontalTouchX, nextHorizontalTouchY)){
                horizontalWallHit = true;
                horizontalWallHitX = nextHorizontalTouchX;
                horizontalWallHitY = nextHorizontalTouchY;
                break;
            } else {
                nextHorizontalTouchX += xStep;
                nextHorizontalTouchY += yStep;
            }
        }


        //////////////////////////////////////////////////////
        // VERTICAL RAY-GRID INTERSECTION
        //////////////////////////////////////////////////////
        var verticalWallHit = false;
        var verticalWallHitX = 0;
        var verticalWallHitY = 0;
        // Find X coord of the closest vertical intersection
        xIntercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xIntercept += this.isRayFacingRight ? TILE_SIZE : 0;

        // Find X coord of the closest vertical intersection
        yIntercept = player.y + (xIntercept - player.x) * Math.tan(this.rayAngle);

        // Find the increment xStep and Ystep
        xStep = TILE_SIZE;
        xStep *= this.isRayFacingLeft ? -1 : 1;

        yStep = TILE_SIZE * Math.tan(this.rayAngle);
        yStep *= (this.isRayFacingUp && yStep > 0) ? -1 : 1;
        yStep *= (this.isRayFacingDown && yStep < 0) ? -1 : 1;

        var nextVerticalTouchX = xIntercept;
        var nextVerticalTouchY = yIntercept;

        if(this.isRayFacingLeft)
            nextVerticalTouchX--;

        // Increment xStep and yStep until hit a wall
        while(nextVerticalTouchX >= 0 && nextVerticalTouchX <= WINDOW_WIDTH && 
            nextVerticalTouchY >= 0 && nextVerticalTouchY <= WINDOW_HEIGHT
        ){
            if(grid.hasWallAt(nextVerticalTouchX, nextVerticalTouchY)){
                verticalWallHit = true;
                verticalWallHitX = nextVerticalTouchX;
                verticalWallHitY = nextVerticalTouchY;
                break;
            } else {
                nextVerticalTouchX += xStep;
                nextVerticalTouchY += yStep;
            }
        }

        // Calculate both horizontal and vertical distances and choose the smallest
        var horizontalHitDistance = horizontalWallHit ? distanceBetween(player.x, player.y, horizontalWallHitX, horizontalWallHitY) : Number.MAX_VALUE;
        var verticalHitDistance = verticalWallHit ? distanceBetween(player.x, player.y, verticalWallHitX, verticalWallHitY) : Number.MAX_VALUE;

        // Only keep the smallest of the distances
        this.wallHitX = (horizontalHitDistance < verticalHitDistance) ? horizontalWallHitX : verticalWallHitX;
        this.wallHitY = (horizontalHitDistance < verticalHitDistance) ? horizontalWallHitY : verticalWallHitY;
        this.distance = (horizontalHitDistance < verticalHitDistance) ? horizontalHitDistance : verticalHitDistance;
        this.wasHitVertical = verticalHitDistance < horizontalHitDistance;

    }
    render(){
        stroke("rgba(255, 0, 0, 0.3)");
        line(player.x, player.y, this.wallHitX, this.wallHitY);
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function castAllRays(){
    var columnId = 0;

    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    for(var i = 0; i < NUM_RAYS; i++){
    // for(var i = 0; i < 1; i++){
        var ray = new Ray(rayAngle);
        ray.cast(columnId);
        rays.push(ray);
        rayAngle += FOV_ANGLE / NUM_RAYS;
        columnId++;
    }
}

function keyPressed(){
    if(keyCode == UP_ARROW){
        player.walkDirection = +1;
    }
    if(keyCode == DOWN_ARROW){
        player.walkDirection = -1;
    }
    if(keyCode == RIGHT_ARROW){
        player.turnDirection = +1;
    }
    if(keyCode == LEFT_ARROW){
        player.turnDirection = -1;
    }
}

function keyReleased(){
    if(keyCode == UP_ARROW){
        player.walkDirection = 0;
    }
    if(keyCode == DOWN_ARROW){
        player.walkDirection = 0;
    }
    if(keyCode == RIGHT_ARROW){
        player.turnDirection = 0;
    }
    if(keyCode == LEFT_ARROW){
        player.turnDirection = 0;
    }
}

function normalizeAngle(angle){
    angle = angle % (2 * Math.PI);
    if(angle < 0){
        angle = (2 * Math.PI) + angle;
    }
    return angle;
}

function distanceBetween(playerX, playerY, distanceX, distanceY){
    return Math.sqrt((distanceX - playerX) * (distanceX - playerX) + (distanceY - playerY) * (distanceY - playerY))
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);
}

function update() {
    player.update();
    castAllRays();
}

function draw() {
    update();
    
    grid.render();
    for(ray of rays){
        ray.render(); 
    }
    player.render();
}
