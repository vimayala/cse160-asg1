// asg1.js
// Sourced from ColoredPoint.js (c) 2012 matsuda with CSE 160 Additional functionality
// Vertex shader program

// Ideas for add ons:
//  Last 5 used colors
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


// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Defining global variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

// Global variables for HTML action
let g_clearColorR = 0.0;
let g_clearColorG = 0.0;
let g_clearColorB = 0.0;
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 12;

var g_shapesList = [];


function main() {
    setUpWebGL();
    connectVariablesToGLSL();
    addActionForHTMLUI();

    // Register function (event handler) to be called on a mouse press and allows clicking and dragging on the canvas
    canvas.onmousedown = handleClicks;
    canvas.onmousemove = function(ev) { if(ev.buttons === 1){ handleClicks(ev); } };

    clearCanvas();
    updateColorPreview();
}

function handleClicks(ev) {

    // Get x,y coords and return it to WebGL coordinates
    [x,y ,x,y, x,y] = convertCoordinatesToGL(ev);

    // Create and store new point with position, color, and size set
    let point;

    // Create new shape through button feedback
    if(g_selectedType == POINT){
        point = new Point;
    }
    else if (g_selectedType == TRIANGLE){
        point = new Triangle;
    }
    else{
        point = new Circle;
    }

    point.position = [x, y];
    point.color = [g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]];
    point.size = g_selectedSize;
    point.segments = g_selectedSegments;
    g_shapesList.push(point);

    // Draw all the set of shapes needed for the canvas
    renderAllShapes();
}

function clearCanvas(){
    // Specify the color for clearing <canvas>
    gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

function setUpWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
    ``
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // Used to add transparency
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

}

function connectVariablesToGLSL(){
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

    // Canvas Color + Clear Button Events
    document.getElementById('clear').onclick = function () { 
        g_shapesList = []; 
        renderAllShapes(); 
    };
    document.getElementById('whiteCanvas').onclick = function () { 
        g_clearColorR = 1.0;
        g_clearColorG = 1.0
        g_clearColorB = 1.0;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderAllShapes(); 

    };
    document.getElementById('creamCanvas').onclick = function () { 
        g_clearColorR = 0.88;
        g_clearColorG = 0.85;
        g_clearColorB = 0.82;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderAllShapes(); 

    };
    document.getElementById('blackCanvas').onclick = function () { 
        g_clearColorR = 0.0;
        g_clearColorG = 0.0
        g_clearColorB = 0.0;
        gl.clearColor(g_clearColorR, g_clearColorG, g_clearColorB, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderAllShapes(); 
    };

    // Cake Preview Button Events
    document.getElementById('cakeToggle').onclick = function () { birthdayCake(); };
    // document.getElementById('cakeToggle').onclick = function () { birthdayCake(); };

    // Shape Button Events
    document.getElementById('pointButton').onclick = function () {g_selectedType = POINT};
    document.getElementById('triButton').onclick = function () {g_selectedType = TRIANGLE};
    document.getElementById('circleButton').onclick = function () {g_selectedType = CIRCLE};

    // Color Slider Events
    const colorPreview = document.getElementById('colorPreview');
    const redSlider = document.getElementById('redSlider').addEventListener('input', updateColorPreview);
    const greenSlider = document.getElementById('greenSlider').addEventListener('input', updateColorPreview);
    const blueSlider = document.getElementById('blueSlider').addEventListener('input', updateColorPreview);
    const alphaSlider = document.getElementById('alphaSlider').addEventListener('input', updateColorPreview);

    // Size + Segments Slider Events
    document.getElementById('sizeSlider').addEventListener('mouseup', function() { g_selectedSize =  this.value; });
    document.getElementById('segSlider').addEventListener('mouseup', function() { g_selectedSegments =  this.value; });
}

function updateColorPreview() {
    const red = redSlider.value / 100;
    const green = greenSlider.value / 100;
    const blue = blueSlider.value / 100;
    const alpha = alphaSlider.value / 100;

    // Update global selected color
    g_selectedColor[0] = red;
    g_selectedColor[1] = green;
    g_selectedColor[2] = blue;
    g_selectedColor[3] = alpha;

    colorPreview.style.backgroundColor = `rgba(${red * 255}, ${green * 255}, ${blue * 255}, ${alpha})`;
}

function convertCoordinatesToGL(ev){
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();
  
    x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
    y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

    return([x,y, x,y, x,y]);
}

function renderAllShapes(){
    // var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    var len = g_shapesList.length;

    for(var i = 0; i < len; i++) {
        g_shapesList[i].render();

  }

    // var duration = performance.now() - startTime;
    // sendTextToHTML("numdot :" + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration) / 10, "numdot");
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

function birthdayCake() {
    // Define cake colors
    let cakeColor = [0.8, 0.6, 0.3, 1.0];
    let frostingColor = [0.9, 0.3, 0.4, 1.0];
    let candleColor = [0.5, 0.2, 1.0, 1.0];
    let flameColor = [1.0, 0.5, 0.0, 1.0]; 

    // Defining cake variables for height and width
    let cakeHeight = 0.55;
    let cakeWidth = 1.35; // Total width of the cake

    let topFrostingWidth = 0.15;
    let topFrostingHeight = 0.125;

    // Defining position arrays
    let cakeBody1 = [
        -0.75, 0 - cakeHeight, 
        -0.75, 0.55 - cakeHeight, 
        0.75, 0.0 - cakeHeight];
    let cakeBody2 = [
        0.75, 0, 
        0.75, -0.555, 
        -0.75, 0.0];

    // Create cake body
    let cakeMain1 = new Triangle();
    createCake(cakeMain1, cakeBody1, cakeColor);

    let cakeMain2 = new Triangle();
    createCake(cakeMain2, cakeBody2, cakeColor);

    // Here, I used ChatGPT to help me figure out how to loop to create left and right triangle iteratons when I got stuck
        // Create top frosting 
        let startX = -cakeWidth / 2 - 0.075; // Starting x-coordinate
        let endX = cakeWidth / 2;   // Ending x-coordinate

        for (let x = startX; x < endX; x += topFrostingWidth) {     // - Here is where I used ChatGPT for guidance- - - - - - - - - - - - - - - - - - - - - - - - - -
            if (Math.round((x - startX) / topFrostingWidth) % 2 === 0) {
                let leftTriangle = [
                    x, 0.0,                              
                    x, -topFrostingHeight,               
                    x + topFrostingWidth, 0.0            
                ];
                let frostingLeft = new Triangle();
                createCake(frostingLeft, leftTriangle, frostingColor);
            } else {
                let rightTriangle = [
                    x, 0.0,                              
                    x + topFrostingWidth, 0.0,            
                    x + topFrostingWidth, -topFrostingHeight 
                ];
                let frostingRight = new Triangle();
                createCake(frostingRight, rightTriangle, frostingColor);
            }
        }                                                           // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

    // Create bottom frosting 
    let bottomFrostingHeight =  0.55;

    startX = -cakeWidth / 2 - 0.075; // Starting x-coordinate
    endX = cakeWidth / 2 - 0.05;   // Ending x-coordinate

    let bottomFrostingWidth = 0.1875;
    for (let x = startX; x < endX; x += bottomFrostingWidth) {
        if (Math.round((x - startX) / bottomFrostingWidth) % 2 === 0) {
            // Left-Oriented Triangle
            let leftTriangle = [
                x, 0.0 - bottomFrostingHeight,                              
                x, topFrostingHeight  - bottomFrostingHeight,               
                x + bottomFrostingWidth, 0.0 - bottomFrostingHeight            
            ];
            let frostingLeft = new Triangle();
            createCake(frostingLeft, leftTriangle, frostingColor);
        } else {
            // Right-Oriented Triangle
            let rightTriangle = [
                x, 0.0  - bottomFrostingHeight,                              
                x + bottomFrostingWidth, 0.0  - bottomFrostingHeight,            
                x + bottomFrostingWidth, topFrostingHeight  - bottomFrostingHeight
            ];
            let frostingRight = new Triangle();
            createCake(frostingRight, rightTriangle, frostingColor);
        }
    }

    let candleWidth = 0.0625; // Thin rectangle width
    let candleHeight = 0.3; // Height of the candle
  
    // Compute candle vertices
    let cakeCandlePos1 = [
        -candleWidth / 2, 0, 
        candleWidth / 2, 0, 
        -candleWidth / 2, candleHeight
    ];
    
    let cakeCandlePos2 = [
        candleWidth / 2, 0,
        candleWidth / 2, candleHeight,
        -candleWidth / 2, candleHeight
    ];
    
    // Create the candle
    let candleTriangle1 = new Triangle();
    createCake(candleTriangle1, cakeCandlePos1, candleColor);
    
    let candleTriangle2 = new Triangle();
    createCake(candleTriangle2, cakeCandlePos2, candleColor);
    

    let flameWidth = candleWidth * 1.5;
    let topFlameHeight = 0.225;
    let topFlameOffset = 0.075

    let topFlamePos = [
        0, candleHeight + topFlameHeight, 
        -flameWidth / 2, candleHeight + topFlameOffset, 
        flameWidth / 2, candleHeight + topFlameOffset 
    ];

    // Create the bottom flame
    let flameTriangle = new Triangle();
    createCake(flameTriangle, topFlamePos, flameColor);

    let bottomflamePos = [
        0, candleHeight +0.0125, 
        -flameWidth / 2, candleHeight + topFlameOffset, 
        flameWidth / 2, candleHeight + topFlameOffset 
    ];

    // Create the flame
    let bottomFlameTriangle = new Triangle();
    createCake(bottomFlameTriangle, bottomflamePos, flameColor);


    let numSprinkles = 10;   // Total number of sprinkles
    let sprinkleSize = 0.05; // Size of each sprinkle
    let sprinkleColors = [
        [1.0, 0.0, 0.0, 1.0], // Red
        [0.0, 1.0, 0.0, 1.0], // Green
        [0.0, 0.0, 1.0, 1.0], // Blue
        [1.0, 1.0, 0.0, 1.0], // Yellow
        [1.0, 0.5, 0.0, 1.0]  // Orange
    ];
    // Bit of this were also done with help from ChatGPT
    //      Specifically, fixing the loop and setting positions (let sprink part)
        
        // Starting positions for the first sprinkle in the zigzag pattern
        startX = -cakeWidth / 2 + sprinkleSize;
        startY = -cakeHeight + 0.6 / 2 - sprinkleSize; // Start at the top of the cake
        
        for (let i = 0; i < numSprinkles; i++) {      // - Here is where I used ChatGPT for guidance- - - - - - - - - - - - - - - - - - - - - - - - - -
            // Alternate y positions for the zigzag pattern
            let x = startX + (i * sprinkleSize * 2.75); // Horizontal spacing between sprinkles
            let y = startY + (i % 2 === 0 ? sprinkleSize * 2.25 * Math.random() : -sprinkleSize * 2.25 * Math.random()); // Alternate up and down
        
            // Toroidal color pick for each sprinkle
            let color = sprinkleColors[i % sprinkleColors.length];
        
            // Create a small triangle for the sprinkle
            let sprinkle = [
                (( i % 2 === 0 ? x - 0.02: x - 0.05)) , y + 0.01,
                x + sprinkleSize / 2 - 0.1, (( i % 2 === 0 ? y + sprinkleSize: y + sprinkleSize + 0.005)),
                x - sprinkleSize / 2, y + sprinkleSize  // bottom-left corner
            ];
        
            let sprinkleTriangle = new Triangle();
            createCake(sprinkleTriangle, sprinkle, color);
        }                                           // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

    // Render all shapes
    renderAllShapes();
}

function createCake(point, position, color, size){
    point.position = position;
    point.color = color;
    point.size = 0.25;
    point.right = 0;
    g_shapesList.push(point);
}