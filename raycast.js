const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);
const WALL_STRIP_WIDTH = 30;
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
        var mapGridIndeX = Math.floor(x / TILE_SIZE);
        var mapGridIndeY = Math.floor(y / TILE_SIZE);
        return this.grid[mapGridIndeY][mapGridIndeX] != 0;
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
        stroke("red");
        line(this.x, this.y, this.x + Math.cos(this.rotationAngle) * 30, this.y + Math.sin(this.rotationAngle) * 30);
    }
}

class Ray {
    constructor(rayAngle){
        this.rayAngle = rayAngle;
    }
    render(){
        stroke("rgba(255, 0, 0, 1)");
        line(player.x, player.y, player.x + Math.cos(this.rayAngle) * 30, player.y + Math.sin(this.rayAngle) * 30);
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

function castAllRays(){
    var columnId = 0;

    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);

    rays = [];

    // for(var i = 0; i < NUM_RAYS; i++){
    for(var i = 0; i < 1; i++){
        var ray = new Ray(rayAngle); 
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
