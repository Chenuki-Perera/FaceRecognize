//keyboard shortcuts 
// ! = save screenshot
// h = show UI
// 1 = handmode
// 2 = facemode 
// 3 = both 
// d = show debug
// c = "clear painting"

// GESTURE/ EXPRESSION DETECTOR INFO (defined here but a useful tool for you to use elsewhere.):
// detectHandGesture(hand) returns "Pinch", "Peace", "Thumbs Up", "Pointing", "Open Palm", or "Fist"

// 4:3 webcam dimensions:
// 640 x 480
// 800 x 600
// 1024 x 768
// 1280 x 960 (default)
// 1440 x 1080
// 1600 x 1200
// 1920 x 1440

// If using video file use these dimentions: 
const CaptureWidth = 1280;
const CaptureHeight = 720;

// const CaptureWidth = 640;
// const CaptureHeight = 360;

// If using Webcam use these dimentions
// const CaptureWidth = 1280;
// const CaptureHeight = 960;

// const CaptureWidth = 1024;
// const CaptureHeight = 768;

// program Mode
const webCam = false; // set to false to use video
const videoFile = "FaceAndHands.mov" // update this to match the video file you want to load
const flipVideo = true; // changes from mirror mode to standard video mode

// global variables
let uiVisible = false;
let currentMode = 'both';// 'hands', 'face', or 'both'
let showDebugInfo = false;
let showKeypoints = false;

// What is the program looking for
const numberOfFaces = 1;
const numberOfHands = 2; 

const threshold = 0.9 // only change if you're having hand detection issues

const performanceMode = 'high'; // 'low', 'balanced', 'high'

// MUSTACHE FILTER VARIABLES - ADD THESE
let mustacheFilter = false;
let flameParticles = [];
let isMouthOpen = false;
let geminiHalo, geminiHorn1, geminiHorn2;

/*This code is adapted from, and highly derivative from the tutorial found on the ml5.js website. 
 * 👋 Hello! This is an ml5.js example made and shared with ❤️.
 * Learn more about the ml5.js project: https://ml5js.org/
 * ml5.js license and Code of Conduct: https://github.com/ml5js/ml5-next-gen/blob/main/LICENSE.md
 *
 * This example demonstrates face tracking on live video through ml5.faceMesh.
 */

let handPose, faceMesh;
let video, painting, connections;
let hands = [];
let faces = [];
let options = {
  maxFaces: numberOfFaces,
  refineLandmarks: false,
  flipHorizontal: flipVideo
};
let fern;

function preload() {
  // Load the ML5 models
  faceMesh = ml5.faceMesh(options);
  handPose = ml5.handPose({
    maxHands: numberOfHands,
    flipped: flipVideo
  });
  
  // LOAD MUSTACHE FILTER IMAGES - ADD THIS
  geminiHalo = loadImage('images/Gemini_halo.png');
  geminiHorn1 = loadImage('images/Gemini_horn1.png');
  geminiHorn2 = loadImage('images/Gemini_horn2.png');
  
  if (typeof prepareInteraction === 'function') {
    // prepareInteraction exists and is a function
    prepareInteraction(); // You can safely call the function here
  }
}

function setup() {
  createCanvas(CaptureWidth, CaptureHeight);
  frameRate(performancePresets[performanceMode].targetFPS);

  // Show initial loading screen
  loadingScreen();
  // Initialize video capture and UI
  initializeVideo();
  setupUI();
}

function draw() {
  if (!checks()) {
    return;
  }
  detectionFrame++;
  let confidentlyHands = []
  for (let i = 0; i < hands.length; i++) {
    if (hands[i].confidence > threshold) {
      confidentlyHands.push(hands[i])
    }
  }
  // Draw interaction between faces and hands
  drawInteraction(faces, confidentlyHands);

  // Draw painting overlay
  image(painting, 0, 0);

  drawUI();
}

// MUSTACHE FILTER FUNCTIONS - ADD ALL THESE NEW FUNCTIONS

function checkIfMouthOpen(face) {
  if (!face || !face.keypoints) return false;
  
  let upperLip = face.keypoints[13];
  let lowerLip = face.keypoints[14];
  
  if (upperLip && lowerLip) {
    let d = dist(upperLip.x, upperLip.y, lowerLip.x, lowerLip.y);
    if (d < 10) {
      isMouthOpen = false;
    } else {
      isMouthOpen = true;
    }
  }
  return false;
}

function drawMustacheWithFlames(face) {
  if (!face || !face.keypoints) return;
  
  push();
  
  // Get lip positions for mustache placement
  let lipsCenterX = face.lips.centerX;
  let lipsCenterY = face.lips.centerY;
  let lipsWidth = face.lips.width;
  let lipsHeight = face.lips.height;
  
  // Draw mustache above lips
  fill(80, 50, 30); // Brown color
  noStroke();
  
  // Main mustache body
  let mustacheWidth = lipsWidth * 1.5;
  let mustacheHeight = lipsHeight * 0.4;
  let mustacheY = lipsCenterY - lipsHeight * 0.3;
  
  ellipse(lipsCenterX, mustacheY, mustacheWidth, mustacheHeight);
  
  // Mustache curls
  let curlSize = mustacheHeight * 1.2;
  ellipse(lipsCenterX - mustacheWidth * 0.3, mustacheY, curlSize, curlSize);
  ellipse(lipsCenterX + mustacheWidth * 0.3, mustacheY, curlSize, curlSize);
  
  // Create flames when mouth is open
  if (isMouthOpen) {
    createFlameParticles(face);
  }
  
  pop();
}

function drawGeminiAccessories(face) {
  if (!geminiHalo || !geminiHorn1 || !geminiHorn2) return;
  
  push();
  
  let faceCenterX = face.faceOval.centerX;
  let faceCenterY = face.faceOval.centerY;
  let faceWidth = face.faceOval.width;
  let faceHeight = face.faceOval.height;
  
  // Draw halo above head
  let haloSize = faceWidth * 1.8;
  image(geminiHalo, faceCenterX - haloSize/2, faceCenterY - faceHeight - haloSize/3, haloSize, haloSize);
  
  // Draw horns on sides of head
  let hornWidth = faceWidth * 0.4;
  let hornHeight = faceHeight * 0.6;
  
  // Left horn
  image(geminiHorn1, faceCenterX - faceWidth * 0.8, faceCenterY - faceHeight * 0.8, hornWidth, hornHeight);
  
  // Right horn  
  image(geminiHorn2, faceCenterX + faceWidth * 0.4, faceCenterY - faceHeight * 0.8, hornWidth, hornHeight);
  
  pop();
}

function createFlameParticles(face) {
  if (!face || !face.keypoints) return;
  
  // Use mouth bottom keypoint for flame origin
  const mouthBottom = face.keypoints[14];
  
  for (let i = 0; i < 2; i++) {
    flameParticles.push({
      x: mouthBottom.x + random(-8, 8),
      y: mouthBottom.y,
      size: random(8, 20),
      speed: random(3, 6),
      life: 255,
      maxLife: 255
    });
  }
}

function updateFlameParticles() {
  for (let i = flameParticles.length - 1; i >= 0; i--) {
    let p = flameParticles[i];
    
    // Update particle position
    p.y -= p.speed;
    p.x += random(-1.5, 1.5);
    p.life -= 6;
    
    // Remove dead particles
    if (p.life <= 0) {
      flameParticles.splice(i, 1);
      continue;
    }
    
    // Draw flame particle
    push();
    let alpha = map(p.life, 0, p.maxLife, 0, 255);
    
    fill(255, 165, 0, alpha); // Orange
    noStroke();
    ellipse(p.x, p.y, p.size);
    
    fill(255, 255, 0, alpha * 0.7); // Yellow
    ellipse(p.x, p.y, p.size * 0.6);
    
    pop();
  }
}

function setupFilterUI() {
  buttonY += 40;
  drawButton("Toggle Mustache Filter", UI_PADDING + 15, buttonY, 170, 35, false, toggleMustacheFilter);
}

function toggleMustacheFilter() {
  mustacheFilter = !mustacheFilter;
  flameParticles = [];
  console.log("Mustache filter:", mustacheFilter ? "ON" : "OFF");
}

// REPLACE YOUR drawInteraction FUNCTION WITH THIS:
function drawInteraction(faces, hands) {
  // for loop to capture if there is more than one face on the screen
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i];
    
    if (showKeypoints) {
      drawPoints(face);
    }

    // Check if mouth is open
    checkIfMouthOpen(face);
    
    // Draw mustache filter when enabled
    if (mustacheFilter) {
      drawMustacheWithFlames(face);
      drawGeminiAccessories(face);
    }

    // Your existing face drawing code can stay here
  }
  
  // Update flame particles
  updateFlameParticles();
}

// In drawUI() function, add this after the clear painting button:
buttonY += 40;
drawButton("Capture Photo", UI_PADDING + 15, buttonY, 170, 35, false, capturePhoto);

// Add this function to capture photos
function capturePhoto() {
  // Create a graphics buffer to capture current frame
  let photo = createGraphics(width, height);
  photo.image(video, 0, 0, width, height);
  
  // Draw current ML5 overlays
  if (showKeypoints) {
    if (currentMode === 'hands' || currentMode === 'both') {
      for (let hand of hands) {
        if (hand.confidence > threshold) {
          drawHandOnGraphics(hand, photo);
        }
      }
    }
    if (currentMode === 'face' || currentMode === 'both') {
      for (let face of faces) {
        drawFaceOnGraphics(face, photo);
      }
    }
  }
  
  capturedPhotos.push(photo);
  console.log("Photo captured! Total photos:", capturedPhotos.length);
}

// Helper function to draw hand on graphics buffer
function drawHandOnGraphics(hand, g) {
  g.push();
  g.stroke(0, 255, 0);
  g.strokeWeight(3);
  g.noFill();
  
  for (let keypoint of hand.keypoints) {
    if (keypoint.score > threshold) {
      g.point(keypoint.x, keypoint.y);
    }
  }
  g.pop();
}

// Helper function to draw face on graphics buffer
function drawFaceOnGraphics(face, g) {
  g.push();
  g.stroke(255, 0, 255);
  g.strokeWeight(2);
  g.noFill();
  
  // Draw face oval
  g.beginShape();
  for (let point of face.faceOval) {
    g.vertex(point.x, point.y);
  }
  g.endShape(g.CLOSE);
  g.pop();
}

// Add this to drawUI() to display captured photos
function drawCapturedPhotos() {
  if (!showCapturedPhotos || capturedPhotos.length === 0) return;
  
  push();
  let photoSize = 100;
  let startX = width - (capturedPhotos.length * (photoSize + 10)) - 10;
  let y = height - photoSize - 10;
  
  for (let i = 0; i < capturedPhotos.length; i++) {
    image(capturedPhotos[i], startX + i * (photoSize + 10), y, photoSize, photoSize);
    
    // Add photo number
    fill(255);
    noStroke();
    textAlign(CENTER, TOP);
    textSize(12);
    text(i + 1, startX + i * (photoSize + 10) + photoSize/2, y + photoSize + 5);
  }
  pop();
}

// Call this in your main draw function
// Add this to your drawUI() function after the main UI
function drawPhotoGallery() {
  if (capturedPhotos.length > 0) {
    drawCapturedPhotos();
  }
}