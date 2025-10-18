let bgImage;
let sunX, sunY;
let sunWidth, sunHeight;

/* load images here */
function prepareInteraction() {
  bgImage = loadImage('/images/background.png');
  sunImage = loadImage('/images/sun.png');
  planeImage = loadImage('/images/plane.png');
}

let face;

function drawInteraction(faces, hands) {

  // draw background first
  image(bgImage, 0, 0, width, height);

  if (faces.length > 0) {
    face = faces[0];

    let faceCenterX = face.faceOval.centerX;
    let faceCenterY = face.faceOval.centerY;
    let faceWidth = face.faceOval.width;
    let faceHeight = face.faceOval.height;


    sunWidth = faceWidth * 1.5;
    sunHeight = faceHeight * 1.5;
    sunX = faceCenterX - sunWidth / 2;
    sunY = faceCenterY - sunHeight / 2;


    // draw sun
    image(sunImage, sunX, sunY, sunWidth, sunHeight);

    // draw sun face
    fill(255);
    ellipse(face.leftEye.centerX, face.leftEye.centerY, 20, 20);
    ellipse(face.rightEye.centerX, face.rightEye.centerY, 20, 20);
    fill(0);
    ellipse(face.leftEye.centerX, face.leftEye.centerY, 8, 8);
    ellipse(face.rightEye.centerX, face.rightEye.centerY, 8, 8);
    drawPoints(face.lips, "#ff0000", 10);
  }
  // hands part
  // for loop to capture if there is more than one hand on the screen. This applies the same process to all hands.
  for (let i = 0; i < hands.length; i++) {
    // this means that the program will only act when its quite sure what it sees is a hand. 
    let hand = hands[i];
    // console.log(hand);
    let indexFingerTipX = hand.index_finger_tip.x;
    let indexFingerTipY = hand.index_finger_tip.y;
    let topLeftX = indexFingerTipX - planeImage.width / 2;
    let topLeftY = indexFingerTipY - planeImage.height / 2;

    image(planeImage, topLeftX, topLeftY)
  }

  if (showKeypoints) {
    drawPoints(face)
  }
  //------------------------------------------------------
  // You can make addtional elements here, but keep the face drawing inside the for loop. 
}

// This function draw's a dot on all the keypoints. It can be passed a whole face, or part of one. 
function drawPoints(feature, color = "#00ff00", size = 5) {
  push()
  for (let i = 0; i < feature.keypoints.length; i++) {
    let element = feature.keypoints[i];
    noStroke();
    fill(color);
    circle(element.x, element.y, size);
  }
  pop()
}