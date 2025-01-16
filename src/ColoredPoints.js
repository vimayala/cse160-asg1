// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program


// Ideas for add ons:
//  Save color presets
//  Shape rotation
//  Make page...pretty
// Only display HTML CIRCLES if circles selected (maybe, not sure bc not drop down, would be on click and might get annoying if not saved)
// adjust sliders (CSS?)

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
let g_selectedColor = [1.0, 1.0, 1.0, 1.0]
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 12;


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

    birthdayCake();
}

var g_shapesList = [];

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

    // createShapes(point);

    point.position = [x, y];
    point.color = [g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]];
    point.size = g_selectedSize;
    point.segments = g_selectedSegments;
    g_shapesList.push(point);

  // Draw all the set of shapes needed for the canvas
  renderAllShapes();
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

    document.getElementById('pointButton').onclick = function () {g_selectedType = POINT};
    document.getElementById('triButton').onclick = function () {g_selectedType = TRIANGLE};
    document.getElementById('circleButton').onclick = function () {g_selectedType = CIRCLE};


    // Color Slider Events
    document.getElementById('redSlider').addEventListener('mouseup', function () { g_selectedColor[0] = this.value / 100; });
    document.getElementById('greenSlider').addEventListener('mouseup', function () { g_selectedColor[1] = this.value / 100; });
    document.getElementById('blueSlider').addEventListener('mouseup', function () { g_selectedColor[2] = this.value / 100; });

    // Size + Segments Slider Events
    document.getElementById('sizeSlider').addEventListener('mouseup', function() { g_selectedSize =  this.value; });
    document.getElementById('segSlider').addEventListener('mouseup', function() { g_selectedSegments =  this.value; });


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


// function birthdayCake() {
//     // Define the base of the cake as a series of layers
//     let cakeColor = [0.8, 0.6, 0.3, 1.0]; // Brownish for the cake
//     let layerHeight = 0.15; // Height of each layer
//     let layerWidth = 0.5; // Width of each layer
//     let positionX = 0.0; // Centered horizontally
//     let positionY = -0.7; // Starting position at the bottom
    
//     // Create cake layers (3 layers in this example)
//     for (let i = 0; i < 3; i++) {
//         let triangle1 = new Triangle();
//         triangle1.position = [positionX - layerWidth / 2, positionY];
//         triangle1.size = layerWidth * 200;
//         triangle1.color = cakeColor;
//         triangle1.right = 0;

//         let triangle2 = new Triangle();
//         triangle2.position = [positionX + layerWidth / 2, positionY];
//         triangle2.size = layerWidth * 200;
//         triangle2.color = cakeColor;

//         g_shapesList.push(triangle1);
//         g_shapesList.push(triangle2);

//         // Update position for the next layer
//         positionY += layerHeight;
//         layerWidth -= 0.1; // Decrease width for the next layer
//     }

//     // Add candles on top
//     let candleColor = [1.0, 1.0, 0.0, 1.0]; // Yellow for candles
//     let candleSize = 0.05; // Size of the candles
//     let numCandles = 3; // Number of candles
//     let candleSpacing = 0.2;

//     for (let i = 0; i < numCandles; i++) {
//         let candle = new Triangle();
//         candle.position = [
//             positionX - (candleSpacing * (numCandles - 1)) / 2 + i * candleSpacing,
//             positionY
//         ];
//         candle.size = candleSize * 200;
//         candle.color = candleColor;

//         g_shapesList.push(candle);
//     }

//     // Render the entire shapes list
//     renderAllShapes();
// }

// function birthdayCake(){
//     let cakeSize = 50 / 200;


//     // bottom left, bottom right, top left
//     // let cakeBody1 = [-0.75, -0.55,    0.55, -0.55,     -0.75, -0.25];
//     let cakeHeight = 0.55;


//     let cakeBody1 = [-0.75, 0 - cakeHeight,         -0.75, 0.55 - cakeHeight,           0.75, 0.0 -cakeHeight];
//     let cakeBody2 = [0.75, 0,    0.75, -0.55,     -0.75, 0.0];

//     let cakeFrostingPos1 = [0.55, 0,    0.55, -0.15,     0.75, 0.0];
//     let cakeFrostingPos2 = [-0.55, 0,    -0.55, -0.15,     -0.75, 0.0];



//     cakeColor = [0.8, 0.6, 0.3, 1.0];

//     let cakeMain1 = new Triangle;
//     createCake(cakeMain1, cakeBody1, cakeColor, cakeSize);

//     let cakeMain2 = new Triangle;
//     createCake(cakeMain2, cakeBody2, [0.8, 0.4, 0.3, 1.0], cakeSize);

//     let cakeFrosting1 = new Triangle;
//     createCake(cakeFrosting1, cakeFrostingPos1, [1.0, 0.6, 1.0, 1.0], cakeSize);

//     let cakeFrosting2 = new Triangle;
//     createCake(cakeFrosting2, cakeFrostingPos2, [1.0, 0.6, 1.0, 1.0], cakeSize);


    


//     renderAllShapes();

//     // let cakeBody2 = [0.375, 0.05,    0.185, -0.25,     -0.285, -0.195];


    

//     //                       ,                               - cake  to flip y, - cake to flip x 
//     // drawTriangle( [cakeBody1[0], cakeBody1[1],    cakeBody1[0] + cakeSize, cakeBody1[1],   cakeBody1[0], cakeBody1[1] + cakeSize]);

//     // drawTriangle( [cakeBody1[0], cakeBody1[1],    cakeBody1[2] + cakeSize, cakeBody1[3],   cakeBody1[4], cakeBody1[5] + cakeSize]);
//     // drawTriangle( [cakeBody2[0], cakeBody2[1],    cakeBody2[2] + cakeSize, cakeBody2[3],   cakeBody2[4], cakeBody2[5] + cakeSize]);




//     // drawTriangle( [cakeBody2[0], cakeBody2[1],    cakeBody2[2] + cakeSize, cakeBody2[3],   cakeBody2[4], cakeBody2[5] + cakeSize]);

//     // let cake = new Triangle();

//     // cake.position = [-0.285, -0.195];

//     // createShapes(cake);

//     // point.position = [x, y];
//     // point.color = [g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], g_selectedColor[3]];
//     // point.size = g_selectedSize;
//     // point.segments = g_selectedSegments;
//     // g_shapesList.push(point);
// }


function birthdayCake() {
    // Define cake size
    // let cakeSize = 0.25;

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

        for (let x = startX; x < endX; x += topFrostingWidth) {
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
        }


    // Create bottom frosting 
    let bottomFrostingHeight =  0.55;

    startX = -cakeWidth / 2 - 0.075; // Starting x-coordinate
    endX = cakeWidth / 2;   // Ending x-coordinate

    for (let x = startX; x < endX; x += topFrostingWidth) {
        if (Math.round((x - startX) / topFrostingWidth) % 2 === 0) {
            // Left-Oriented Triangle
            let leftTriangle = [
                x, 0.0 - bottomFrostingHeight,                              
                x, topFrostingHeight  - bottomFrostingHeight,               
                x + topFrostingWidth, 0.0 - bottomFrostingHeight            
            ];
            let frostingLeft = new Triangle();
            createCake(frostingLeft, leftTriangle, frostingColor);
        } else {
            // Right-Oriented Triangle
            let rightTriangle = [
                x, 0.0  - bottomFrostingHeight,                              
                x + topFrostingWidth, 0.0  - bottomFrostingHeight,            
                x + topFrostingWidth, topFrostingHeight  - bottomFrostingHeight
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
        
        for (let i = 0; i < numSprinkles; i++) {
            // Alternate y positions for the zigzag pattern
            let x = startX + (i * sprinkleSize * 2.75); // Horizontal spacing between sprinkles
            let y = startY + (i % 2 === 0 ? sprinkleSize * 2.25 * Math.random() : -sprinkleSize * 2.25 * Math.random()); // Alternate up and down
        
            // Toroidal color pick for each sprinkle
            let color = sprinkleColors[i % sprinkleColors.length];
        
            // Create a small triangle for the sprinkle
            let sprinkle = [
                (( i % 2 === 0 ? x - 0.02: x - 0.05)) , y + 0.01,
                x + sprinkleSize / 2 - 0.1, (( i % 2 === 0 ? y + sprinkleSize: y + sprinkleSize + 0.005)),

                // x + sprinkleSize / 2 , y + sprinkleSize + 0.02, // bottom-right corner

                // (( i % 2 === 0 ? y + sprinkleSize: y + sprinkleSize + 0.02))
                x - sprinkleSize / 2, y + sprinkleSize  // bottom-left corner
            ];
        
            let sprinkleTriangle = new Triangle();
            createCake(sprinkleTriangle, sprinkle, color);
        }

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