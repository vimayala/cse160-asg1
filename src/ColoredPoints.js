// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program


// Ideas for add ons:
//    Save color presets
//    Shape rotation

var VSHADER_SOURCE =`
    attribute vec4 a_Position;
    uniform float u_Size;
    void main(){
        gl_Position = a_Position;
        // gl_PointSize = 10.0;
        gl_PointSize = u_Size;
    }`;

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

// Defining global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;


// Global variables for HTML action
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5;

function main() {
    setUpWebGL();
    connectVariablesToWebGL();

    addActionForHTMLUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = handleClicks;
    canvas.onmousemove = function(ev) { if(ev.buttons === 1){ handleClicks(ev); } };


    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function handleClicks(ev) {

    // Get x,y coords and return it to WebGL coordinates
    [x,y] = convertCoordinatesToGL(ev);

    // Create and store new point with position, color, and size set
    let point = new Triangle();
    point.position = [x, y];
    point.color = [g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]];
    point.size = g_selectedSize;
    g_shapesList.push(point);

  // Draw all the set of shapes needed for the canvas
  renderAllShapes();
}

function setUpWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');
  
    // Get the rendering context for WebGL
    //   gl = getWebGLContext(canvas);
    // Line below didn't work
    // gl = getWebGLContext("webGl",  {preserveDrawingBuffer: true} );
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
``
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}
function connectVariablesToWebGL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}

function addActionForHTMLUI(){
    // Button Events
    document.getElementById('green').onclick = function () { g_selectedColor = [0.0, 1.0, 0.0, 1.0]; };
    document.getElementById('red').onclick = function () { g_selectedColor = [1.0, 0.0, 0.0, 1.0]; };
    document.getElementById('clear').onclick = function () { 
        g_shapesList = []; 
        renderAllShapes(); 
    };

    // Color Slider Events
    document.getElementById('redSlider').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; });
    document.getElementById('greenSlider').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; });
    document.getElementById('blueSlider').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; });

    // Size Slider Events
    document.getElementById('sizeSlider').addEventListener('mouseup', function() { g_selectedSize =  this.value; });

}

function convertCoordinatesToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y]);
}

function renderAllShapes(){

    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();

  }

  var duration = performance.now() - startTime;
  sendTextToHTML("numdot :" + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration) / 10, "numdot");

  
}

// Send text to HTML, used for duration of renderAllShapes in this files 
function sendTextToHTML(text, htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.error("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElm.innerHTML = text;
}
