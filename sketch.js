const GRID_WIDTH = 28;
const GRID_HEIGHT = 28;
const cell_size = 30;

const X = 0;
const Y = 1;

let freeze = false;
let grid = []

function gridToScreen(x, y){
  return [(x - GRID_WIDTH/2)*cell_size + windowWidth/2, (y - GRID_HEIGHT/2)*cell_size + windowHeight/2]
}

function createGrid(){
  let aux = [];
  for (let i = 0; i < GRID_WIDTH; i++){
    aux.push(0);
  }
  for (let i = 0; i < GRID_HEIGHT; i++){
    grid.push([].concat(aux));
  }
}

function setup() {
  randomSeed();
  createGrid();
  createCanvas(windowWidth*0.99, windowHeight*0.99);
}

function drawCell(grid_x, grid_y, empty) {
  push();
  if (empty){
    fill(0);
  }else{
    fill(100);
  }

  strokeWeight(0.3);
  stroke(100);
  let point = gridToScreen(grid_x, grid_y)
  square(point[X], point[Y], cell_size);
  pop();
}

function drawGrid(){
  for(var j = 0; j < GRID_HEIGHT; j++){
    for (var i = 0; i < GRID_WIDTH; i++){
      drawCell(i,j, grid[j][i] == 0);
    }
  }
}

function draw() {
  background(20);
  drawGrid();
}



function endGame(){
  draw();
  freeze = true;
  fill(250,250,255);
  textStyle(BOLD);
  textSize(windowWidth/20);
  textAlign(CENTER);
  text("GAME OVER", windowWidth/2, windowHeight/2);
  frameRate(0);
}