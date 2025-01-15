// Triangle.js
// Defines the Triangle class
// Defines position, color, and size of a triangle

class Triangle{
    constructor(){
        this.type = 'triangle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
    }

    render(){
        var xy = this.position;
        var rgba = this.color;
        var size = this.size;

        // // Pass the position of a point to a_Position variable
        // gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    
        // Pass the color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
        // Pass the size of a point to u_Size variable
        gl.uniform1f(u_Size, size);
    
        // Call drawTriangle with the x, y and offsets
        drawTriangle( [xy[0], xy[1], xy[0] + 0.1, xy[1], xy[0], xy[1] + 0.1]);
    }
}


// // HelloTriangle.js (c) 2012 matsuda
// // Vertex shader program
// var VSHADER_SOURCE =
//     'attribute vec4 a_Position;\n' +
//     'void main() {\n' +
//     '  gl_Position = a_Position;\n' +
//     '}\n';

// // Fragment shader program
// var FSHADER_SOURCE =
//     'void main() {\n' +
//     '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
//     '}\n';

// function main() {
//     // Retrieve <canvas> element
//     var canvas = document.getElementById('webgl');

//     // Get the rendering context for WebGL
//     gl = getWebGLContext(canvas);
//     if (!gl) {
//         console.log('Failed to get the rendering context for WebGL');
//         return;
//     }

//     // Initialize shaders
//     if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
//         console.log('Failed to intialize shaders.');
//         return;
//     }

//     // // Write the positions of vertices to a vertex shader
//     // var n = initVertexBuffers(gl);
//     // if (n < 0) {
//     //     console.log('Failed to set the positions of the vertices');
//     //     return;
//     // }

//     // Specify the color for clearing <canvas>
//     gl.clearColor(0, 0, 0, 1);

//     // Clear <canvas>
//     gl.clear(gl.COLOR_BUFFER_BIT);

//     // // Draw the rectangle
//     // gl.drawArrays(gl.TRIANGLES, 0, n);
//     // Draw the triangles
//     drawTriangle([0, 0.5,   -0.5, -0.5,     0.5, -0.5]);

// }

function drawTriangle(vertices) {
    
    // // Have vertices array on CPU
    // var vertices = new Float32Array([
    //     0, 0.5,   -0.5, -0.5,   0.5, -0.5
    // ]);
    var n = 3; // The number of vertices

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    
    // Write date into the buffer object, sending verticies to GPU
    // gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);


    // We have this in ColoredPoints.js
    // var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    // if (a_Position < 0) {
    //     console.log('Failed to get the storage location of a_Position');
    // return -1;
    // }

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    gl.drawArrays(gl.TRIANGLES, 0, n);

    // return n;
}
