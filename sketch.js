const GRID_WIDTH = 28;
const GRID_HEIGHT = 28;
const CELL_SIZE = 30;

const BOMB_NUMBER = GRID_HEIGHT*GRID_WIDTH*0.12;

const X = 0;
const Y = 1;

let show_bombs = false;

function gridToScreen(x, y){
  return [(x - GRID_WIDTH/2)*CELL_SIZE + windowWidth/2, (y - GRID_HEIGHT/2)*CELL_SIZE + windowHeight/2]
}

function screenToGrid(x, y){
  return [Math.floor((x - windowWidth/2)/CELL_SIZE) + GRID_WIDTH/2, Math.floor((y - windowHeight/2)/CELL_SIZE) + GRID_HEIGHT/2]
}

const cell_flags = {
  NONE: 0,
  BOMB: 1 << 0,
  HIDDEN: 1 << 1,
  FLAGGED: 1 << 2
} 

const SQRT_OF_THREE = Math.sqrt(3);

const line_length = CELL_SIZE * 2/3;
const triangle_height = CELL_SIZE * 3 / 7;

const triangle_side = triangle_height*2/SQRT_OF_THREE;

function drawFlag(center){
  push();
  strokeWeight(1.5);
  stroke(0);
  line(center[X] - triangle_height/2, center[Y] - line_length/2, center[X] - triangle_height/2, center[Y] + line_length/2);
  noStroke();
  fill(255, 10, 0);
  triangle(center[X] - triangle_height/2, center[Y] - line_length/2, center[X] - triangle_height/2, center[Y] - line_length/2 + triangle_side, center[X] + triangle_height/2, center[Y] - line_length/2 + triangle_side/2);
  pop();
}

function floodReveal(point){
  let stack = [];
  let current;
  stack.push(point);
  while(stack != 0){
    let point = stack.pop();
    current = grid[point[Y]][point[X]];
    current.flags = 0;
    if (current.bombs_around != 0) continue;

    let x = point[X];
    let y = point[Y];

    for (let i = -1; i < 2; i++){
      for (let j = -1; j < 2; j++){
        if (!(i == 0 && j == 0) && x + i >= 0 && x + i < GRID_WIDTH && y + j >= 0 && y + j < GRID_HEIGHT){
          if (grid[y+j][x+i].flags & cell_flags.HIDDEN){
            stack.push([x+i, y+j]);
          }
        }
      }
    }
  }
}

const TEXT_COLORS = [[10,10,10], [100, 100, 0], [140, 140, 2], [238, 100, 10], [255, 10, 15], [210, 0, 0], [140, 0, 30], [130, 0, 10]];
class cell {
  constructor(x, y){
    this.grid_point = [x, y];
    this.point = gridToScreen(x, y);
    this.bombs_around = 0;
    this.flags = cell_flags.NONE;
    this.flags |= cell_flags.HIDDEN; 
  }

  draw(){
    push();
    if ((this.flags & cell_flags.HIDDEN) != 0){
      fill(150);
    }else{
      fill(200);
    }

    strokeWeight(0.5);
    stroke(100);
    square(this.point[X], this.point[Y], CELL_SIZE);

    if (this.flags & cell_flags.FLAGGED){
      drawFlag(this.point.map((a) => a + CELL_SIZE/2));
    }

    if ((this.flags & cell_flags.BOMB) && show_bombs){
      push();
      fill(5);
      let point = this.point.map((a) => a + CELL_SIZE/2);
      circle(point[X], point[Y], CELL_SIZE * 2/3);
      pop();
    }
    
    if (!(this.flags & cell_flags.HIDDEN)){
      if (this.bombs_around != 0){
        push();
        noStroke();
        fill(TEXT_COLORS[this.bombs_around - 1]);
        textSize(24);
        textStyle(BOLD);
        textAlign(CENTER, CENTER);
        let point = this.point.map((a) => a + CELL_SIZE/2);
        text(this.bombs_around,point[X], point[Y]);
        pop();
      }
    }

    pop();
  }

  reveal(){
    if (this.flags & cell_flags.FLAGGED) return;
    if (this.flags & cell_flags.BOMB != 0){
      endGame();
    }else{
      this.flags = 0;
      if (this.bombs_around == 0){
        floodReveal(this.grid_point);
      }
    }
  }

  flag(){
    if (this.flags & cell_flags.HIDDEN)
      this.flags ^= cell_flags.FLAGGED;
  }
  setAsBomb(){
    this.flags |= cell_flags.BOMB;
  }
}

function checkBombs(x, y){
  let n = 0;
  for (let i = -1; i < 2; i++){
    for (let j = -1; j < 2; j++){
      if (!(i == 0 && j == 0) && x + i >= 0 && x + i < GRID_WIDTH && y + j >= 0 && y + j < GRID_HEIGHT){
        if (grid[y+j][x+i].flags & cell_flags.BOMB){
          n++;
        }
      }
    }
  }
  return n;
}

let freeze = false;
let grid = []

function createGrid(){
  let aux = [];
  for (let j = 0; j < GRID_HEIGHT; j++){
    aux = [];
    for (let i = 0; i < GRID_WIDTH; i++){
      aux.push(new cell(i,j));
    }
    grid.push([].concat(aux));
  }

  // Place bombs
  let i = 0;
  while(i < BOMB_NUMBER){
    let point = [Math.floor(random(GRID_WIDTH)), Math.floor(random(GRID_HEIGHT))];
    if (grid[point[Y]][point[X]].flags & cell_flags.BOMB){continue;}
    else{
      grid[point[Y]][point[X]].flags |= cell_flags.BOMB;
      i++;
    }
  }

  for (let i = 0; i < GRID_WIDTH; i++){
    for (let j = 0; j < GRID_HEIGHT; j++){
      grid[j][i].bombs_around = checkBombs(i, j);
    }
  }
  
}

function setup() {
  randomSeed();
  createGrid();
  createCanvas(windowWidth*0.99, windowHeight*0.99);
}

function drawGrid(){
  for(var j = 0; j < GRID_HEIGHT; j++){
    for (var i = 0; i < GRID_WIDTH; i++){
      grid[j][i].draw();
    }
  }
}

function clickCell(mouse_x, mouse_y, func){
  let point = screenToGrid(mouse_x, mouse_y);
  func(grid[point[Y]][point[X]]);
}

function mousePressed(event) {
  if (freeze){
    return;
  }
  if (event.button == 0){
    clickCell(event.layerX, event.layerY, (cell) => cell.reveal())
  }else if (event.button == 2){
    clickCell(event.layerX, event.layerY, (cell) => cell.flag())
  }
          
  return false;
}

function draw() {
  background(20);
  drawGrid();
}

function endGame(){
  show_bombs = true;
  draw();
  freeze = true;
  fill(255);
  stroke(0);
  strokeWeight(6);
  textStyle(BOLD);
  textSize(windowWidth/20);
  textAlign(CENTER);
  text("GAME OVER", windowWidth/2, windowHeight/2);
  frameRate(0);
}