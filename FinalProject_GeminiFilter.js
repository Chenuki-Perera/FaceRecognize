let geminiHalo, geminiHorn1, geminiHorn2;
let particles = [];
let starField = [];

function prepareInteraction() {
  geminiHalo = loadImage('/images/Gemini_halo.png');
  geminiHorn1 = loadImage('/images/Gemini_horn1.png');
  geminiHorn2 = loadImage('/images/Gemini_horn2.png');

  for (let i = 0; i < 100; i++) {
    starField.push({
      x: random(width),
      y: random(height),
      size: random(1, 3),
      brightness: random(150, 255),
      twinkleSpeed: random(0.02, 0.05)
    });
  }
}

function drawInteraction(faces, hands) {
  drawStarField();

  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];

    let faceCenterX = face.faceOval.centerX;
    let faceCenterY = face.faceOval.centerY;
    let faceWidth = face.faceOval.width;
    let faceHeight = face.faceOval.height;

    let leftEyeCenterX = face.leftEye.centerX;
    let leftEyeCenterY = face.leftEye.centerY;
    let rightEyeCenterX = face.rightEye.centerX;
    let rightEyeCenterY = face.rightEye.centerY;

    let foreheadX = faceCenterX;
    let foreheadY = face.keypoints[10].y;

    let leftTempleX = face.keypoints[251].x;
    let leftTempleY = face.keypoints[251].y;
    let rightTempleX = face.keypoints[21].x;
    let rightTempleY = face.keypoints[21].y;

    let faceAngle = atan2(rightEyeCenterY - leftEyeCenterY, rightEyeCenterX - leftEyeCenterX);

    let haloSize = faceWidth * 2.2;
    let haloX = faceCenterX;
    let haloY = faceCenterY - faceHeight * 0.3;

    push();
    translate(haloX, haloY);
    rotate(faceAngle);
    tint(255, 255, 255, 200);
    imageMode(CENTER);
    image(geminiHalo, 0, 0, haloSize, haloSize);
    pop();

    let hornSize = faceWidth * 0.45;

    push();
    translate(leftTempleX, leftTempleY);
    rotate(faceAngle - 0.3);
    tint(255, 255, 255, 220);
    imageMode(CENTER);
    image(geminiHorn1, 0, -hornSize * 0.3, hornSize, hornSize);
    pop();

    push();
    translate(rightTempleX, rightTempleY);
    rotate(faceAngle + 0.3);
    scale(-1, 1);
    tint(255, 255, 255, 220);
    imageMode(CENTER);
    image(geminiHorn2, 0, -hornSize * 0.3, hornSize, hornSize);
    pop();

    drawMysticEyes(face);

    let mouthOpen = face.lips.height / face.lips.width > 0.35;
    if (mouthOpen) {
      createMagicParticles(face.lips.centerX, face.lips.centerY);
    }
  }

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let gesture = detectHandGesture(hand);

    if (gesture === "Peace" || gesture === "Open Palm") {
      let palmX = hand.wrist.x;
      let palmY = hand.wrist.y;
      createMagicParticles(palmX, palmY);
    }

    if (showKeypoints) {
      drawConnections(hand);
    }
  }

  updateAndDrawParticles();
}

function drawStarField() {
  push();
  for (let star of starField) {
    star.brightness += sin(frameCount * star.twinkleSpeed) * 2;
    star.brightness = constrain(star.brightness, 100, 255);

    noStroke();
    fill(255, 255, 200, star.brightness);
    circle(star.x, star.y, star.size);
  }
  pop();
}

function drawMysticEyes(face) {
  push();

  let leftEyeCenterX = face.leftEye.centerX;
  let leftEyeCenterY = face.leftEye.centerY;
  let leftEyeWidth = face.leftEye.width;
  let leftEyeHeight = face.leftEye.height;

  let rightEyeCenterX = face.rightEye.centerX;
  let rightEyeCenterY = face.rightEye.centerY;
  let rightEyeWidth = face.rightEye.width;
  let rightEyeHeight = face.rightEye.height;

  let glowSize = max(leftEyeWidth, leftEyeHeight) * 1.5;

  drawingContext.shadowBlur = 20;
  drawingContext.shadowColor = 'rgba(150, 200, 255, 0.8)';

  fill(150, 200, 255, 80);
  noStroke();
  ellipse(leftEyeCenterX, leftEyeCenterY, glowSize, glowSize);
  ellipse(rightEyeCenterX, rightEyeCenterY, glowSize, glowSize);

  drawingContext.shadowBlur = 0;

  fill(255, 255, 255, 150);
  ellipse(leftEyeCenterX, leftEyeCenterY, leftEyeWidth * 0.8, leftEyeHeight * 0.8);
  ellipse(rightEyeCenterX, rightEyeCenterY, rightEyeWidth * 0.8, rightEyeHeight * 0.8);

  fill(100, 150, 255, 200);
  ellipse(leftEyeCenterX, leftEyeCenterY, leftEyeWidth * 0.4, leftEyeHeight * 0.4);
  ellipse(rightEyeCenterX, rightEyeCenterY, rightEyeWidth * 0.4, rightEyeHeight * 0.4);

  fill(255, 255, 255, 250);
  ellipse(leftEyeCenterX - 3, leftEyeCenterY - 3, leftEyeWidth * 0.15, leftEyeHeight * 0.15);
  ellipse(rightEyeCenterX - 3, rightEyeCenterY - 3, rightEyeWidth * 0.15, rightEyeHeight * 0.15);

  pop();
}

function createMagicParticles(x, y) {
  if (frameCount % 3 === 0) {
    particles.push({
      x: x + random(-20, 20),
      y: y + random(-20, 20),
      vx: random(-2, 2),
      vy: random(-3, -1),
      life: 255,
      size: random(3, 8),
      color: color(random(100, 255), random(150, 255), random(200, 255))
    });
  }
}

function updateAndDrawParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.1;
    p.life -= 5;

    push();
    noStroke();
    fill(red(p.color), green(p.color), blue(p.color), p.life);
    circle(p.x, p.y, p.size);
    pop();

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function drawConnections(hand) {
  push();
  for (let j = 0; j < connections.length; j++) {
    let pointAIndex = connections[j][0];
    let pointBIndex = connections[j][1];
    let pointA = hand.keypoints[pointAIndex];
    let pointB = hand.keypoints[pointBIndex];
    stroke(150, 200, 255, 150);
    strokeWeight(2);
    line(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  pop();
}

function drawPoints(feature) {
  push();
  for (let i = 0; i < feature.keypoints.length; i++) {
    let element = feature.keypoints[i];
    noStroke();
    fill(100, 200, 255, 180);
    circle(element.x, element.y, 5);
  }
  pop();
}
