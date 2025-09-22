// yuh yuh yuh lets go

// i make this little doodle all the time where you draw a bunch of lines
// then in all the polygons you create, you create a circle and fill in the outside
// or you add curves between all the line angles
// however you wanna think about it.
// its actually fairly complex to do algorithmically, because the human brain's computer vision does most of the work.
// after 5-6 total restart iterations (genuinely) i finally settled on an easy approach
// store as line segments and vertices, where the vertices are associated with the lines they are a part of
// then you could loop through each vertex, and loop through all the angles of which it is the vertex of
// and add a curve. at the end, you will get the visual that we created blobby circles inside each polygon, but really its just angle-by-angle


// TODO 
// TODO : make all lines rays? like extend?
//       I'm going to get it working fully with segments and then ill make it work with rays. I'll probably just add 4 lines along the border
// TODO : more than 4 lines coming through a single point, an extra "point" line is made.
//        nothing breaks cuz i stopped it from being added, its just odd that its called.
// TODO : Add curved lines? makes it look cooler irl, but probably very hard to impliment
//        you'd need to define the curve as a parametric function so that you could find the midpoint and move back and forth on it... and drawing the curves would be far more difficult.
// TODO : you could add a way to backup an artpiece as text (also easier for debugging)
// TODO : add grain texture

// TOFIX
// TODO TOFIX: create a ton of lines. some will dissapear. debug that. could be the below issie
// TODO TOFIX: if two lines share an endpoint, the old one dissapears.
// TODO TOFIX: if a newline lays on the endpoint of an existing line, the existing line gets deleted.

// data structures designs:
// vertices."x+y" = set{keys to line objs, ...} 
//  * makes it easier to determine if theres already an existing point, and hopefully just add to the reference ? 
// lines."x1,y1,x2,y2" = [x1,y1,x2,y2]
//  * still iterable, but creates "pointers" to certain lines that we can use in vertices.



/////////////////////
// Global Variables
/////////////////////
lines = Object()
vertices = Object()
makingLine = false
lineStart = []
lineEnd = []
let csSlider;
let rSlider;


/////////////////////
// Debug Variables
/////////////////////
debugDraw = false 
debugLog = false
debugLogSetting = false

/////////////////////
// Stylistic Variables
/////////////////////
// how many pixels apart 2 points have to be to be considered different.
// (0, infinity)
rounding = 5 // px
// how far the curve goes along the line 
// (-infinity, 0)U(0, infinity)
// 20 for skinny, -5 for thick
curveScalar = -6
// line thickness. its on the tin
lineThickness = 2



console.clear()

function setup() {
    createCanvas(400, 400);


//  // basic X
    // mouseX = 100
    // mouseY = 100
    // mousePressed()
    // mouseX = 300
    // mouseY = 300
    // mouseReleased()
    // mouseX = 300
    // mouseY= 100
    // mousePressed()
    // mouseX = 100
    // mouseY = 300
    // mouseReleased()

//  // basic +
    // mouseX = 200
    // mouseY = 100
    // mousePressed()
    // mouseX = 200
    // mouseY = 300
    // mouseReleased()

    // mouseX = 100
    // mouseY = 200
    // mousePressed()
    // mouseX = 300
    // mouseY = 200
    // mouseReleased()

// // basic star *
    // mouseX = 100
    // mouseY = 100
    // mousePressed()
    // mouseX = 300
    // mouseY = 300
    // mouseReleased()
    // mouseX = 300
    // mouseY= 100
    // mousePressed()
    // mouseX = 100
    // mouseY = 300
    // mouseReleased()
    // console.log('adding the third ---------------------')
    // mouseX = 200
    // mouseY = 100
    // mousePressed()
    // mouseX = 200
    // mouseY = 300
    // mouseReleased()]

// // two lines that lay on each other.
    // mouseX = 100
    // mouseY = 100
    // mousePressed()
    // mouseX = 300
    // mouseY = 300
    // mouseReleased()
    // mouseX = 50
    // mouseY= 50
    // mousePressed()
    // mouseX = 350
    // mouseY = 350
    // mouseReleased()

    csSlider = createSlider(-10,40, curveScalar)
    csSlider.id("cs")
    rSlider = createSlider(0,width/10,rounding)
    rSlider.size(200)


}
  
function draw() {
  rounding = rSlider.value();
  curveScalar = csSlider.value();


  background(161,135,101);
  // apply noise ??

  // just draw the lines
  
  for (key in lines){
      let l = lines[key];
      noFill()
      stroke(0)
      strokeWeight(lineThickness)
      line(...l)
  }

  if (makingLine){
    noFill()
      stroke(0)
      strokeWeight(lineThickness)
    line(...lineStart, ...lineEnd)
    strokeWeight(5)
    stroke("red")
    point(...lineStart)
    point(...lineEnd)
    slope = -(lineEnd[1]-lineStart[1])/(lineEnd[0]-lineStart[0])

    // can be Infintity, NaN, and 0
    // it might be easier to just test if the line intercepts the 4 edges.

    noStroke()
  fill(0)
    text(slope, 0, 30)
  }

  noStroke()
  fill(0)
  text(mouseX, 0,10)
  text(mouseY, 0,20)
  // line drawing done

  /* Here's the fun part. so we need to iterate through each vertex
  *  and then sort the lines clockwise from the first one (arbitrary)
  *  then begin to fill them in using our quad fill.
  */
  for (v in vertices) {
    // v is an string key to a set of lines. ( also a string of coords )
    // vcoords is a split array of the vertices coords.
    let vcoords = v.split(",").map(Number)
    // vset is a set of strings that lead to lines.
    let vset = vertices[v];
    vlist = [...vset];
    if (vlist.length < 2) {
      // dont waste ya time
      continue
    }
    // now we need to sort this list by clockwise relation to the first
    // and also, it would probably be handy if we made the vertex the first coord in each lineList
    // im going to convert to vectors becuse thats what i know how to do.
    // atan2(x,y) can find the angle between the vector and the x+ axis


    for (let i = 0; i < vlist.length; i++) { // iterate through the lines 
      // vlist[i]  string "x1,y1,x2,y2"
      let coords = vlist[i].split(",")
      coords = coords.map(Number)

      coords[0] -= vcoords[0]
      coords[2] -= vcoords[0] // now coords is either vec(0, v) or vec(v, 0)
      coords[1] -= vcoords[1]
      coords[3] -= vcoords[1]
      // now if we remove the 0's we should have the correct vector.
      // NO! some vectors (horiz and vert) will have 0s.

      if (coords[0] == 0 && coords[1] == 0) {
        coords = [coords[2], coords[3]]
      } else {
        coords = [coords[0], coords[1]]
      }
      // elegant, but wrong. // coords = coords.filter(num => num!=0)

      vlist[i] = coords
    }
    // vlist now contains all the lines as vectors starting at the vertex. 

    vlist = vlist.sort((a,b) => atan2(...a) - atan2(...b))
    // this is sorting them in like... hourglass order.
    // like 1 3 2 4.

    // now vlist contains all the vectors in clockwise order. 
    vlist.push(vlist[0]) // for iterating in consecutive pairs
    for (let i = 0; i < vlist.length-1; i++) {
      drawPair(vcoords, vlist[i], vlist[i+1])
    }

  }
    strokeWeight(5)
    stroke("red") 
     if (debugDraw) {
      for (key in lines){
      let l = lines[key];  
      point(l[0],l[1])
      point(l[2],l[3])
      }
  }

  debugLog = false;
  // only log once per line creation
}


function drawPair(origin, vector1, vector2){
  
  
  // in order to reuse my old code, id like to convert the lines into x1,y1,x2,y2.
  nl1 = [origin[0], origin[1], origin[0]+vector1[0], origin[1]+vector1[1]] // basic vector addition
  nl2 = [origin[0], origin[1], origin[0]+vector2[0], origin[1]+vector2[1]]
  //("drawinf pair", nl1, nl2)
  push()
  stroke(0)

  stroke("blue")
  
  nl1l = lineLength(...nl1)
  nl2l = lineLength(...nl2)
  nl1mp = midpoint(...nl1)
  nl2mp = midpoint(...nl2)
  debugDraw && point(...nl1mp)
  debugDraw && point(...nl2mp)
  stroke("#0f0")
  nl1mpex1 = movePointAlongLine(...nl1mp, ...origin, nl1l/curveScalar)
  nl1mpex2 = movePointAlongLine(...nl1mp, nl1[2], nl1[3], nl1l/curveScalar)
  debugDraw && point(...nl1mpex1)
  debugDraw && point(...nl1mpex2)
  nl2mpex1 = movePointAlongLine(...nl2mp, ...origin, nl2l/curveScalar)
  nl2mpex2 = movePointAlongLine(...nl2mp, nl2[2], nl2[3], nl2l/curveScalar)
  debugDraw && point(...nl2mpex1)
  debugDraw && point(...nl2mpex2)
  push()
  fill(0)
  noStroke()

  // ok so the first and third pairs arent being drawn in this output
  beginShape()
  vertex(...nl1mpex1)
  quadraticVertex( ...origin, ...nl2mpex1)
  vertex(...nl2mpex1)
  vertex(...origin)
  endShape()

  
  debugLog && console.log("shape start")
  debugLog && console.log(...nl1mpex1)
  debugLog && console.log(...origin, ...nl2mpex1)
  debugLog && console.log(...nl2mpex1)
  debugLog && console.log(...origin)
  debugLog && console.log("shape end")





  pop()



  pop()
}

// returns length of line in pixels
function lineLength(x1,y1,x2,y2){
    return Math.sqrt( Math.pow((x1-x2),2) + Math.pow((y1-y2),2) )
}

function midpoint(x1,y1,x2,y2){
    return [(x1+x2)/2, (y1+y2)/2]
}

// from (x0,y0) to (x1,y1), move dt distance
function movePointAlongLine(x0,y0,x1,y1,dt){
    let d = lineLength(x0,y0,x1,y1)
    let t = (dt/d)
    let xt = ((1-t)*x0 + t*x1)
    let yt = ((1-t)*y0 + t*y1)
    return [xt,yt]

}


function mousePressed(){
  if (mouseX > width || mouseX < 0 || mouseY < 0 || mouseY > height){
    lineStart = null;
    return false
  }
  lineStart = [mouseX, mouseY]
}

function mouseDragged(){
  // if you START dragging outside 
  if (mouseX > width || mouseX < 0 || mouseY < 0 || mouseY > height){
    makingLine = false
    return false
  }
  if (lineStart != null){
  makingLine = true;
  lineEnd = [mouseX, mouseY]
  }
}

function mouseReleased(){
  if (mouseX > width || mouseX < 0 || mouseY < 0 || mouseY > height || lineStart == null){
    makingLine = false;
    return false
  }
  // log this line
  debugLog = debugLogSetting && true;
  debugLog && console.log("--------------- NEW LINE --------------")
  lineEnd = [mouseX, mouseY]
  makingLine = false;

  if (lineStart[0] != lineEnd[0] || lineStart[1] != lineEnd[1]){
    // youd think this would improve things but it largely breaks them.
    // it does prevent point "lines" from being made tho

  makingLine = false;
  newLine=[...lineStart,...lineEnd]

  // create the 2 vertices and attach the newline to it
  addToVertices(newLine[0], newLine[1], newLine)
  addToVertices(newLine[2], newLine[3], newLine)
  // vertices can never be removed, so this is fine to do now.

  // when the new line is made, calculate all intersections

    // this contains all the poitns to break up newline on.
    intersections=[] // needs order
    //check if new line intersects any existing lines.
    toRemove = new Set()
    toAdd = new Set()
    toAdd.add(newLine)

    for (let key in lines){
      l = lines[key]
      inters=intersect(newLine,l)
      debugLog && console.log(inters)

      if (inters[0]){ // if they intersect
        // they either intersect (split both lines)
        // or one of the lines endpoints lays on the other line (only split the other line.)
        linesLayResult = linesLay(newLine, l)
        if (linesLayResult == -1){ 
         // they intersect! split the iterated line 
         // save the point so we can split the new line later ...
         toRemove.add(l) 
         // a line cant intersect another more than once, 
         // and since the direction doesnt matter we can just 
         // arbitrarily do p1-int p2-int
         toAdd.add([l[0],l[1],inters[1],inters[2]])
         toAdd.add([l[2],l[3],inters[1],inters[2]])

         intersections.push([inters[1],inters[2]])
         // we'd want to add the intersection point to vertices,
         // but since its IN the line we created, there is no need.
            } else {
              debugLog && console.log("We got a line lay!")
              // A LINE LAYS ON ANOTHER LINE!
              // 1 is newline0 on l
              // 2 is newline1 on l
              // 3 is l0 on newline
              // 4 is l1 on newline
              switch (linesLayResult){
                case 1:
                  // split l. l0-newline0, newline0-l1
                  toRemove.add(l)
                  toAdd.add([l[0],l[1],newLine[0],newLine[1]])
                  toAdd.add([newLine[0],newLine[1],l[2],l[3]])
                  break;
                case 2:
                  // split l. l0-newline1, newline1-l1
                  toRemove.add(l)
                  toAdd.add([l[0],l[1],newLine[2],newLine[3]])
                  toAdd.add([newLine[2],newLine[3],l[2],l[3]])
                  break;
                case 3:
                  // split newline. newline-l0, l0-newline
                  toRemove.add(newLine)
                  toAdd.add([newLine[0],newLine[1],l[0],l[1]])
                  toAdd.add([l[0],l[1],newLine[2],newLine[3]])
                  intersections.push([l[0],l[1]])
                  break;
                case 4:
                  // split newline. newline-l1, l1-newline
                  toRemove.add(newLine)
                  toAdd.add([newLine[0],newLine[1],l[2],l[3]])
                  toAdd.add([l[2],l[3],newLine[2],newLine[3]])
                  intersections.push([l[2],l[3]])
                  break;
                default:
                  debugLog && console.log("WOAH WOAH WOAH")
                  debugLog && console.log(linesLayResult)
              }



            }
      }
    }

    if (intersections.length > 1){
    // ok we cut up the lines that newLine touched
    // lets cut up new line.
    pStart = [newLine[0], newLine[1]]
    pEnd = [newLine[2], newLine[3]]
    dx = pEnd[0] - pStart[0]
    dy = pEnd[1] - pStart[1]
    magSquared = dx*dx+dy*dy

    // custom sort to get the ORDER of the points.
    intersections.sort((a,b )=> {
      ta = ((a[0] - pStart[0]) * dx + (a[1] - pStart[1])*dy)/magSquared
      tb = ((b[0] - pStart[0]) * dx + (b[1] - pStart[1])*dy)/magSquared
      return ta-tb;
    });

    // now the segments will be pStart-int[0], int[0]-int[1]
    toRemove.add(newLine)
    segments = [pStart,...intersections,pEnd]
    for (let seg = 0; seg < segments.length-1; seg+=1){
      toAdd.add([...segments[seg],...segments[seg+1]])
    }


  } else if (intersections.length == 1) {
    toRemove.add(newLine)
    toAdd.add([newLine[0],newLine[1],...intersections[0]])
    toAdd.add([...intersections[0],newLine[2],newLine[3]])

  }

  toAdd = toAdd.difference(toRemove); // remove any redundancies.

  // we need to add each line to lines
  for (let line of toAdd) {
    addToLines(...line)
  }
  // we need to add each point from those lines, 
  //    and if the poitn exists, ADD the line to its references.
  for (let line of toAdd){
      p1 = [line[0], line[1]]
      p2 = [line[2], line[3]]
      addToVertices(...p1, line)
      addToVertices(...p2, line)
  }
  
  // remove the line from lines
  for (let line of toRemove){
    delete lines[lineToKey(...line)];
  }
  // we need to remove every instance of each line to remove from the associated vertices.
  // toRemove is full of line arrays.
  // we need to convert it to a set of lineStrings, so we can quickly do set math
  let lineStrings = new Set();
  for (let line of toRemove){
    lineStrings.add(lineToKey(...line))
  }
  for (let key in vertices) {
      vertices[key] = vertices[key].difference(lineStrings);
  }

  } // end if line isnt a point

}

function keyPressed(){
  if (key == "r"){
    // empty the lines and vertices? is that all
    lines = Object()
    vertices = Object()
    makingLine = false
    lineStart = []
    lineEnd = []
  }
}

// returns false if no intersection
// returns the coords if there is one
function intersect(line1,line2){
  p0_x=line1[0];p0_y=line1[1]
  p1_x=line1[2];p1_y=line1[3]
  p2_x=line2[0];p2_y=line2[1]
  p3_x=line2[2];p3_y=line2[3]
  //c1 = (x2-x1)(y3-y1)-(y2-y1)(x3-x1)
  //c2 = (x2-x1)(y4-y1)-(y2-y1)(x4-x1)
  //c3 = (x4-x3)(y1-y3)-(y4-y3)(x1-x3)
  //c4 = (x4-x3)(y2-y3)-(y4-y3)(x2-x3)
  s1_x = p1_x - p0_x;     s1_y = p1_y - p0_y;
  s2_x = p3_x - p2_x;     s2_y = p3_y - p2_y;
  s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
  t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
  if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
  {
      // Collision detected
      i_x = p0_x + (t * s1_x);
      i_y = p0_y + (t * s1_y);
      return [true,i_x,i_y]
  }
  return [false]

}

function pointToKey(x,y){
  return `${x},${y}`
}

function keyToPoint(key){
  return key.split(',').map(Number);
}

function lineToKey(x1,y1,x2,y2){
  return `${x1},${y1},${x2},${y2}`
}

function keyToLine(key){
  return key.split(',').map(Number);
}

/*
*  Adds a vertex to vertices, and associates it with 1 line.
*  Run it twice with another line to add a line to its references.
*/
function addToVertices(x,y, line){
  if (line[0]==x && line[1]==y && line[2]==x && line[3]==y){
    debugLog && console.log("POINT LINE BEING ADDED??? x,y = [x,y,x,y]")
    return false;
  }
  // round to nearest 5, catches close duplicates.
  x = Math.round(x / rounding) * rounding
  y = Math.round(y / rounding) * rounding

  line[0] = Math.round(line[0] / rounding) * rounding
  line[1] = Math.round(line[1] / rounding) * rounding
  line[2] = Math.round(line[2] / rounding) * rounding
  line[3] = Math.round(line[3] / rounding) * rounding

  // also its adding each character of the string to the set.

  let key = pointToKey(x,y)
  if (key in vertices){
    vertices[key].add(lineToKey(...line))
  } else {
    vertices[key] = new Set([lineToKey(...line)])
  }
}

function addToLines(x1,y1,x2,y2){
  x1 = Math.round(x1 / rounding) * rounding
  y1 = Math.round(y1 / rounding) * rounding
  x2 = Math.round(x2 / rounding) * rounding
  y2 = Math.round(y2 / rounding) * rounding
  // round to closest 5.
  let key = lineToKey(x1,y1,x2,y2)
  lines[key] = [x1,y1,x2,y2];
}

function pointLaysOnLine(point, line){
  // find the distance of point P from both ends of the line AB
  // if AB = AP+PB, then P lies on the segment AB.
  let x = point[0]
  let y = point[1]
  let x1 = line[0]
  let y1 = line[1]
  let x2 = line[2]
  let y2 = line[3]
  let AB = sqrt((x2-x1)*(x2-x1)+(y2-y1)*(y2-y1));
  let AP = sqrt((x-x1)*(x-x1)+(y-y1)*(y-y1));
  let PB = sqrt((x2-x)*(x2-x)+(y2-y)*(y2-y));
  if(AB == AP + PB)
    return true;
  return false;
}

function linesLay(l1, l2){
  if (pointLaysOnLine([l1[0], l1[1]], l2)) return 1;
  if (pointLaysOnLine([l1[2], l1[3]], l2)) return 2;
  if (pointLaysOnLine([l2[0], l2[1]], l1)) return 3;
  if (pointLaysOnLine([l2[2], l2[3]], l1)) return 4;
  return -1;
}
