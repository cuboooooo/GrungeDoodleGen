# GrungeDoodleGen
another little p5 sketch to test my data structures and computational geometry/algebra skills

i make this little doodle all the time where you draw a bunch of lines
then in all the polygons you create, you create a circle and fill in the outside
or you add curves between all the line angles
however you wanna think about it.
its actually fairly complex to do algorithmically, because the human brain's computer vision does most of the work.
after 5-6 total restart iterations (genuinely) i finally settled on an easy approach
store as line segments and vertices, where the vertices are associated with the lines they are a part of
then you could loop through each vertex, and loop through all the angles of which it is the vertex of
and add a curve. at the end, you will get the visual that we created blobby circles inside each polygon, but really its just angle-by-angle



### known issues

* when creating a vast grid of lines and then putting a diagonal through it, some dissapear. there seems to be some line creation edgecase bugs still.

* when a new line lays on the endpoint of an existing line, the existing line can dissapear sometimes.

* if a line shares an endpoint with another line or two, the old lines get deleted.

* the sliders do not move.

These are easy fixes, but this was meant to be a quick 2-5 hour coding challenge, not a production quality product. 

### If i come back, what will I add

* make a fork where all lines are rays

* make a fork allowing for curved line inputs

* make a way to import/export an "artwork" as text (for sharing and debugging)

### What you can change in the console

look through sketch.js. Or just change debugDraw to true, rounding from 0-50, or curveScalar from -inf to inf. ( i like 20 and -6 as presets )
