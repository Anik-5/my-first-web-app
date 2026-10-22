
let snake = [];
let food;
let direction;
let nextDirection;
let score = 0;
let gridSize = 20;
let cols, rows;
let gameOver = false;
let started = false;
let lastMove = 0;
let moveDelay = 110;
let restartButton;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textFont("sans-serif");
  frameRate(60);

  cols = floor(width / gridSize);
  rows = floor(height / gridSize);

  restartButton = createButton("RESTART GAME");
  restartButton.position(16, 16);
  restartButton.style("padding", "10px 18px");
  restartButton.style("background", "#7c3aed");
  restartButton.style("color", "white");
  restartButton.style("border", "none");
  restartButton.style("border-radius", "10px");
  restartButton.style("font-size", "14px");
  restartButton.style("font-weight", "bold");
  restartButton.style("cursor", "pointer");
  restartButton.mousePressed(resetGame);

  resetGame();

  let canvasElement = document.querySelector("canvas");
  canvasElement.style.touchAction = "none";
  canvasElement.style.display = "block";
}

function resetGame() {
  cols = floor(width / gridSize);
  rows = floor(height / gridSize);

  snake = [
    { x: floor(cols / 2), y: floor(rows / 2) },
    { x: floor(cols / 2) - 1, y: floor(rows / 2) },
    { x: floor(cols / 2) - 2, y: floor(rows / 2) }
  ];

  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };

  score = 0;
  gameOver = false;
  started = false;
  lastMove = millis();

  placeFood();
}

function placeFood() {
  let attempts = 0;

  do {
    food = {
      x: floor(random(cols)),
      y: floor(random(rows))
    };
    attempts++;
  } while (
    snake.some(part => part.x === food.x && part.y === food.y) &&
    attempts < 1000
  );
}

function draw() {
  background(13, 18, 32);

  drawGrid();
  drawFood();
  drawSnake();
  drawHUD();

  if (!started && !gameOver) {
    drawMessage("MOVE YOUR MOUSE TO START", "Guide the snake toward the food!");
  }

  if (gameOver) {
    drawMessage("GAME OVER!", "Final score: " + score + "  |  Click Restart");
  }

  if (started && !gameOver && millis() - lastMove > moveDelay) {
    moveSnake();
    lastMove = millis();
  }
}

function drawGrid() {
  stroke(255, 255, 255, 9);
  strokeWeight(1);

  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      noFill();
      rect(
        x * gridSize,
        y * gridSize,
        gridSize,
        gridSize
      );
    }
  }

  noStroke();
}

function drawFood() {
  if (!food) return;

  let x = food.x * gridSize + gridSize / 2;
  let y = food.y * gridSize + gridSize / 2;

  // Glowing food
  noStroke();
  fill(0, 100, 100, 25);
  circle(x, y, gridSize * 2.1);

  fill(340, 85, 100);
  circle(x, y, gridSize * 0.78);

  fill(0, 0, 100);
  circle(x - 3, y - 3, gridSize * 0.2);

  // Small green leaf
  push();
  translate(x + 3, y - 7);
  rotate(-0.6);
  fill(120, 80, 90);
  ellipse(0, 0, 7, 4);
  pop();
}

function drawSnake() {
  noStroke();

  for (let i = snake.length - 1; i >= 0; i--) {
    let part = snake[i];

    let x = part.x * gridSize + gridSize / 2;
    let y = part.y * gridSize + gridSize / 2;

    if (i === 0) {
      // Head
      fill(155, 90, 100);
      circle(x, y, gridSize * 0.95);

      // Eyes
      fill(0, 0, 100);
      let eyeOffsetX = direction.x * 4;
      let eyeOffsetY = direction.y * 4;

      circle(x + eyeOffsetX - direction.y * 4,
             y + eyeOffsetY + direction.x * 4, 4);

      circle(x + eyeOffsetX + direction.y * 4,
             y + eyeOffsetY - direction.x * 4, 4);
    } else {
      let green = map(i, 1, snake.length, 130, 175);
      fill(green, 80, 90);
      circle(x, y, gridSize * 0.82);
    }
  }
}

function drawHUD() {
  noStroke();

  fill(255, 255, 255, 230);
  textAlign(LEFT, CENTER);
  textSize(19);
  text("Score: " + score, 18, 60);

  textSize(12);
  fill(180, 25, 90);
  text("Move your mouse to steer", 18, 83);
}

function drawMessage(title, subtitle) {
  // Centered overlay
  noStroke();
  fill(220, 35, 12, 225);
  rectMode(CENTER);
  rect(width / 2, height / 2, min(width - 30, 390), 110, 18);
  rectMode(CORNER);

  textAlign(CENTER, CENTER);
  fill(150, 85, 100);
  textSize(23);
  text(title, width / 2, height / 2 - 18);

  fill(0, 0, 100);
  textSize(13);
  text(subtitle, width / 2, height / 2 + 18);
}

function moveSnake() {
  direction = { x: nextDirection.x, y: nextDirection.y };

  let head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y
  };

  // Wall collision
  if (
    head.x < 0 || head.x >= cols ||
    head.y < 0 || head.y >= rows
  ) {
    gameOver = true;
    return;
  }

  let eating = head.x === food.x && head.y === food.y;

  // The tail moves away unless the snake eats food
  let bodyToCheck = eating ? snake : snake.slice(0, -1);

  if (bodyToCheck.some(part => part.x === head.x && part.y === head.y)) {
    gameOver = true;
    return;
  }

  snake.unshift(head);

  if (eating) {
    score += 10;
    placeFood();

    // Gradually increase the speed
    moveDelay = max(55, 110 - score * 0.4);

    // Win if the board is completely filled
    if (snake.length >= cols * rows) {
      gameOver = true;
    }
  } else {
    snake.pop();
  }
}

function mouseMoved() {
  steerWithPointer(mouseX, mouseY);
}

function mouseDragged() {
  steerWithPointer(mouseX, mouseY);
}

function touchMoved() {
  if (touches.length > 0) {
    steerWithPointer(touches[0].x, touches[0].y);
  }
  return false;
}

function steerWithPointer(px, py) {
  if (gameOver) return;

  let head = snake[0];
  let headX = head.x * gridSize + gridSize / 2;
  let headY = head.y * gridSize + gridSize / 2;

  let dx = px - headX;
  let dy = py - headY;

  if (!started) {
    started = true;
  }

  // Choose the strongest direction toward the pointer
  if (abs(dx) > abs(dy)) {
    if (dx > 0 && direction.x !== -1) {
      nextDirection = { x: 1, y: 0 };
    } else if (dx < 0 && direction.x !== 1) {
      nextDirection = { x: -1, y: 0 };
    }
  } else {
    if (dy > 0 && direction.y !== -1) {
      nextDirection = { x: 0, y: 1 };
    } else if (dy < 0 && direction.y !== 1) {
      nextDirection = { x: 0, y: -1 };
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  resetGame();
}
