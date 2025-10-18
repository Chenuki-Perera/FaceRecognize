// ----=  HANDS  =----
// USING THE GESTURE DETECTORS (check their values in the debug menu)
// detectHandGesture(hand) returns "Pinch", "Peace", "Thumbs Up", "Pointing", "Open Palm", or "Fist"

/* load images here */
function prepareInteraction() {
  //bgImage = loadImage('/images/background.png');
}

let px = 0;
let py = 0;
let colors = [];
let selectedColor;
let Yvalue = 0


function drawInteraction(faces, hands) {
  colors = [
    color(255, 18, 18), // red 
    color(38, 18, 255), // blue 
    color(42, 255, 18), // green
    color(255, 176, 18), // orange

  ];

  selectedColor = colors[int(map(Yvalue, 0, height, 0, colors.length))]

  fill(selectedColor)
  ellipse(width / 2, 100, 50) // shows current colour

  // hands part
  // for loop to capture if there is more than one hand on the screen. This applies the same process to all hands.
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    // console.log(hand);
    if (showKeypoints) {
      drawConnections(hand)
    }
    /*
    Start drawing on the hands here
    */
    if (hand.handedness === "Left") {
      Yvalue = hand.index_finger_tip.y; // this will stay as zer untill the program sees a left hand 
    }


    if (hand.handedness === "Right") { // draw when pinching right hand 
      let indexFingerTipX = hand.index_finger_tip.x;
      let indexFingerTipY = hand.index_finger_tip.y;
      let thumbTipX = hand.thumb_tip.x;
      let thumbTipY = hand.thumb_tip.y;

      let x = (indexFingerTipX + thumbTipX) * 0.5; // find half way between the index and thumn
      let y = (indexFingerTipY + thumbTipY) * 0.5;

      let d = dist(indexFingerTipX, indexFingerTipY, thumbTipX, thumbTipY);

      fill(selectedColor)
      ellipse(x, y, 50)

      if (d < 50) {
        painting.stroke(selectedColor);
        painting.strokeWeight(16);
        painting.line(px, py, x, y);
      }
      px = x;
      py = y;
    }
    /*
    Stop drawing on the hands here
    */
  }
  // You can make addtional elements here, but keep the hand drawing inside the for loop. 
  //------------------------------------------------------



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
    circle(element.x, element.y, 10);
  }
  pop()

}