// TODO: multi-intersection line handling
// TODO: point handling on intersections 😰


// global vars
let makingLine = false
let tempLinePt;

// lines: a set of objects(x1,y1,x2,y2)
let lines = new Set()

// points: a set of objects(x,y, set of objects(lines))
let points = new Set()

let debugFlag = true;


function setup(){
    createCanvas(500, 500);
}

function draw(){
    background(161,135,101);
    // apply grain texture?

    // draw current line as gray
    if(makingLine){
        push()
        stroke(50)
        line(tempLinePt.x, tempLinePt.y, mouseX, mouseY)
        pop()
    }

    debugTests()

    drawLinesAndPoints()
    

    noStroke()
    fill(0)
    text(mouseX, 0,10)
    text(mouseY, 0,20)


}

function drawLinesAndPoints(){
    push()
    for (l of lines){
      noFill()
      stroke(0)
      strokeWeight(1)
      line(l.x1, l.y1, l.x2, l.y2)

      strokeWeight(6)
      stroke("red")
      // use alpha channels so that you can see duplicates?
      point(l.x1,l.y1)
      point(l.x2, l.y2)
    }

    if (debugFlag){
        strokeWeight(5)
        stroke("#0f0")
        for (p of points){
            point(p.x, p.y)
        }
    }
    pop()
}

function mousePressed(){
    makingLine = true;
    tempLinePt = {x:mouseX, y:mouseY}
}

function mouseReleased(){
    makingLine = false;

    // add line logic
    addLine(tempLinePt.x, tempLinePt.y, mouseX, mouseY)
}

function addLine(x1,y1,x2,y2){
    let newLine = arrayToLine(x1,y1,x2,y2)
    if (x1 != x2 || y1 != y2){
        // aight
        let linesToAdd = new Set()
        let pointsToAdd = new Set()

        linesToAdd.add(newLine)
        pointsToAdd.add({x:x1,y:y1,lines: new Set([newLine])})
        pointsToAdd.add({x:x2,y:y2,lines: new Set([newLine])})

        handleIntersections(linesToAdd, pointsToAdd, newLine) // mutable reference.
    }
}

function handleIntersections(linesToAdd, pointsToAdd, newLine){
    // we will always need to add the 2 points from newline and associate them with newLine
    // TODO: if either of those points lay on another line, associate.
    pointsToAdd.add({x:newLine.x1,y:newLine.y1,lines:new Set([newLine])})
    pointsToAdd.add({x:newLine.x2,y:newLine.y2,lines:new Set([newLine])})

    let intersections = [] // list of locations along newLine that there are intersects 

    // for each line that exists, check if the new line intersects that line.
    for (l of lines){
        intersection = intersect(newLine, l)
        if (intersection[0]) { // true if intersect!
            // split up l into 2 parts from newline
            
            //newLine = null; 
            //l = null;
            // so this somehow doesn't set all references of newLine to null. but since theyre still EQUAL, we can use the set's delete method
            linesToAdd.delete(newLine)
            lines.delete(l)
            // now add the 4 new lines.

            // a line cant intersect another more than once, 
            // and since the direction doesnt matter we can just 
            // arbitrarily do p1-int p2-int
            lsub1 = arrayToLine(l.x1,l.y1,intersection[1],intersection[2])
            lsub2 = arrayToLine(l.x2,l.y2,intersection[1],intersection[2])
            linesToAdd.add(lsub1)
            linesToAdd.add(lsub2)

            // TODO: dont add newLine. we literally just deleted that.
            // we need to add the parts it gets chopped into in the next if statement.
            pointsToAdd.add({x:intersection[1], y:intersection[2], lines: new Set([newLine, lsub1, lsub2])})
            // either we can find a way to replace every mention of newLine into its parts... no.
            // or we can simply create a duplicate point in the next step, 
            // and then combine them at the end of the function.
            
            intersections.push([intersection[1],intersection[2]])
            // TODO:
            // we need to add a point to pointsToAdd that is associated with the 2 new lines this makes.
            // if that point already exists, we need to add those 2 new lines to the associations.
            // i BELIEVE as long as we DELETE lines when we remove them, it should remove all references to it???

        }
    }
    if (intersections.length > 1) {
        // split up newLine into parts.

        // somewhere in this block of code, its deleting the LAST line we added
        // last time it was run....

        // were going to use a parametric function that 
        // allows us to cut up the newLine in ORDER of
        // the intersections.

        pStart = [newLine.x1, newLine.y1]
        pEnd = [newLine.x2, newLine.y2]
        dx = pEnd[0] - pStart[0]
        dy = pEnd[1] - pStart[1]
        magSquared = dx*dx + dy*dy

        // custom sort to get the ORDER of the points.
        intersections.sort((a,b )=> {
        ta = ((a[0] - pStart[0]) * dx + (a[1] - pStart[1])*dy)/magSquared
        tb = ((b[0] - pStart[0]) * dx + (b[1] - pStart[1])*dy)/magSquared
        return ta-tb;
        });
        
        // now the segments will be pStart-int[0], int[0]-int[1] ...

        segments = [pStart,...intersections,pEnd]
        // pstart and pend are already in points.
        // we need to add every other point, and associate it with 
        for (let seg = 0; seg < segments.length-1; seg+=1){
        linesToAdd.add(arrayToLine(...segments[seg],...segments[seg+1]))
        }
        
    } else if (intersections.length == 1) {
        // newLine already removed
        linesToAdd.add(arrayToLine(newLine.x1,newLine.y1,...intersections[0]))
        linesToAdd.add(arrayToLine(newLine.x2,newLine.y2,...intersections[0]))
    }
    lines = lines.union(linesToAdd) // TODO check for reversed duplicates?
    // TODO: go through all points, and if any share the same x and y, combine them and their assoc lines.
    // right now there isn't support for greater than 4 intersection points.
    points = points.union(pointsToAdd)

    console.log("ok so done processing new line", lines, points)

}

// DOES NOT CATCH REVERSED REPEATS
function lineObjEqual(l1, l2){
    return (l1.x1==l2.x1 && l1.x2==l2.x2 && l1.y1==l2.y1 && l1.y2==l2.y2) ||
           (l1.x1==l2.x2 && l1.x2==l2.x1 && l1.y1==l2.y2 && l1.y2==l2.y1) // true if pairs are reversed... this may fuck me later.
}
function pointObjEqual(p1,p2){
    p1.lines.size() == p2.lines.size() ? console.log("yo somethings fucked with your point lines sets") : pass;
    return p1.x == p2.x && p1.y == p2.y
}
function arrayToLine(x1,y1,x2,y2){
    return {x1:x1, y1:y1, x2:x2, y2:y2}
}

function debugTests() {
    // ignore my profanity

    // this must be called from the draw() function
    // im going to create an intersected line, and 
    // attempt to draw the corners manually, to fine tune
    push()
    stroke(0)
    let line1 = [150, 100, 250, 300]
    let line2 = [300, 100, 100, 250]


    line(...line1)
    line(...line2)
    // 5 vertices
    strokeWeight(5)
    stroke("red")

    point(150, 100)
    point(250, 300)
    point(300, 100)
    point(100, 250)

    let intr = intersect(arrayToLine(...line1),arrayToLine(...line2))
    intr[0] ? point(intr[1], intr[2]) : pass;
    let intpt = [intr[1], intr[2]]

    stroke("blue")
    let nl1 = [line1[0],line1[1],...intpt]
    let nl2 = [line1[2],line1[3],...intpt]
    let nl3 = [line2[0],line2[1],...intpt]
    let nl4 = [line2[2],line2[3],...intpt]
    nl1l = lineLength(...nl1)
    nl2l = lineLength(...nl2)
    nl3l = lineLength(...nl3)
    nl4l = lineLength(...nl4)
    nl1mp = midpoint(...nl1)
    nl2mp = midpoint(...nl2)
    nl3mp = midpoint(...nl3)
    nl4mp = midpoint(...nl4)
    point(...nl1mp)
    point(...nl2mp)
    point(...nl3mp)
    point(...nl4mp)
    stroke("#0f0")
    nl1mpex1 = movePointAlongLine(...nl1mp, ...intpt, nl1l/20)
    nl1mpex2 = movePointAlongLine(...nl1mp, nl1[0], nl1[1], nl1l/20)
    point(...nl1mpex1)
    point(...nl1mpex2)
    nl2mpex1 = movePointAlongLine(...nl2mp, ...intpt, nl2l/20)
    nl2mpex2 = movePointAlongLine(...nl2mp, nl2[0], nl2[1], nl2l/20)
    point(...nl2mpex1)
    point(...nl2mpex2)
    nl3mpex1 = movePointAlongLine(...nl3mp, ...intpt, nl3l/20)
    nl3mpex2 = movePointAlongLine(...nl3mp, nl3[0], nl3[1], nl3l/20)
    point(...nl3mpex1)
    point(...nl3mpex2)
    nl4mpex1 = movePointAlongLine(...nl4mp, ...intpt, nl4l/20)
    nl4mpex2 = movePointAlongLine(...nl4mp, nl4[0], nl4[1], nl4l/20)
    point(...nl4mpex1)
    point(...nl4mpex2)

    push()
    fill(0)
    noStroke()


    beginShape()
    vertex(...nl1mpex1)
    quadraticVertex( ...intpt, ...nl3mpex1)
    vertex(...nl3mpex1)
    vertex(...intpt)
    endShape()


    pop()



    pop()
    noLoop()


    // object equivalence / reference test
    let s1 = new Set() 
    let l1 = {x1:0, y1:0, x2:100, y2:100}
    let l2 = {x1:0, y1:0, x2:100, y2:100} // ≠ l1 or p1.lines[0]
    s1.add(l1) // passes a reference to l1 specifically.
    let s2 = new Set()
    let p1 = {x:0, y:0, lines: new Set()}
    p1.lines.add(l1) // passes a reference to l1 specifically.
    s2.add(p1)
    console.log(s1)
    console.log(s2)
    for (p of s2){
        for (l of p.lines) {
            console.log(l==l1) // true
            console.log(l===l1) // true
            console.log(l==l2) // false
            console.log(l===l2) // false
        }
    }

    // global object deletion test
    for (l of s1) {
        l = undefined;
    }
    for (p of s2){
        console.log(p.lines) // no null value in p1...
    }
    for (l of s1) {
        console.log(l)
    }
    // seems legit, idk what happens if we dont 
    // have access to l1 when adding it to p1.lines
    // or if there are more optimal ways to store these things.
    // i wanted to store references to the lines in points.lines 
    // but no pointers in js

}

// helper functions

// return[0] is if it found one. 1 and 2 are the coords if found
function intersect(line1,line2){
  p0_x=line1.x1;p0_y=line1.y1
  p1_x=line1.x2;p1_y=line1.y2
  p2_x=line2.x1;p2_y=line2.y1
  p3_x=line2.x2;p3_y=line2.y2
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
      i_x = Math.round(p0_x + (t * s1_x));
      i_y = Math.round(p0_y + (t * s1_y));
      return [true,i_x,i_y]
  }
  return [false]

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
    console.log(xt,yt)
    return [xt,yt]

}