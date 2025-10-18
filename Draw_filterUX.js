// ----=  HANDS  =----
let halo;
let rightHorn;
let leftHorn;

let angel = true;

function prepareInteraction() {
  halo = loadImage('/images/Gemini_halo.png');
  rightHorn = loadImage('/images/Gemini_horn1.png');
  leftHorn = loadImage('/images/Gemini_horn2.png');
}

function drawInteraction(faces, hands) {

  // hands part
  // USING THE GESTURE DETECTORS (check their values in the debug menu)
  // detectHandGesture(hand) returns "Pinch", "Peace", "Thumbs Up", "Pointing", "Open Palm", or "Fist"

  // for loop to capture if there is more than one hand on the screen. This applies the same process to all hands.
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    if (showKeypoints) {
      drawPoints(hand)
      drawConnections(hand)
    }
    // console.log(hand);
    /*
    Start drawing on the hands here
    */

    let whatGesture = detectHandGesture(hand)
    if (whatGesture == "Thumbs Up") {
      angel = true;
    }
    if (whatGesture == "Open Palm") {
      angel = false;
    }

    /*
    Stop drawing on the hands here
    */
  }

  //------------------------------------------------------------
  //facePart
  // for loop to capture if there is more than one face on the screen. This applies the same process to all faces. 
  for (let i = 0; i < faces.length; i++) {
    let face = faces[i]; // face holds all the keypoints of the face
    if (showKeypoints) {
      drawPoints(face)
    }
    // console.log(face);
    /*
    Once this program has a face, it knows some things about it.
    This includes how to draw a box around the face, and an oval. 
    It also knows where the key points of the following parts are:
     face.leftEye
     face.leftEyebrow
     face.lips
     face.rightEye
     face.rightEyebrow
    */
    /*
    Start drawing on the face here
    */

    let faceWidth = face.faceOval.width;
    let faceheight = face.faceOval.height;
    let faceCenterX = face.faceOval.centerX;
    let faceCenterY = face.faceOval.centerY;


    let hornWidth = faceWidth / 3;
    let hornHeight = faceheight;

    let hornXOffset = faceWidth * 0.6;
    let hornYOffset = faceheight * 1.5;

    if (angel) {
      image(halo, face.keypoints[103].x, face.keypoints[103].y - 200)
    } else {
      image(rightHorn, faceCenterX - hornXOffset, faceCenterY - hornYOffset, hornWidth, hornHeight) // imageName, x, y, imageWidth, imageHight
      image(leftHorn, faceCenterX + hornXOffset - leftHorn.width, faceCenterY - hornYOffset, hornWidth, hornHeight) // imageName, x, y, imageWidth, imageHight

    }
    /*
    Stop drawing on the face here
    */

  }
  //------------------------------------------------------
  // You can make addtional elements here, but keep the face drawing inside the for loop. 
}


function drawConnections(hand) {
  // Draw the skeletal connections
  push()
  for (let j = 0; j < connections.length; j++) {
    let pointAIndex = connections[j][0];
    let pointBIndex = connections[j][1];
    let pointA = hand.keypoints[pointAIndex];
    let pointB = hand.keypoints[pointBIndex];
    stroke(255, 0, 0);
    strokeWeight(2);
    line(pointA.x, pointA.y, pointB.x, pointB.y);
  }
  pop()
}

// This function draw's a dot on all the keypoints. It can be passed a whole face, or part of one. 
function drawPoints(feature) {

  push()
  for (let i = 0; i < feature.keypoints.length; i++) {
    let element = feature.keypoints[i];
    noStroke();
    fill(0, 255, 0);
    circle(element.x, element.y, 5);
  }
  pop()

}