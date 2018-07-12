/**
 * Created by liyanjun on 2016/9/14.
 */


var gl;

function initGL(canvas) {
    try {
        gl = canvas.getContext("webgl", {preserveDrawingBuffer: true});
        //gl.webGLContextAttributes.preserveDrawingBuffer=true;
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
        //console.log(e);
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}

var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
    gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);

    shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
    shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}

var mvMatrix = mat4.create();
var mvMatrixStack = [];
var pMatrix = mat4.create();

function mvPushMatrix() {
    var copy = mat4.create();
    mat4.set(mvMatrix, copy);
    mvMatrixStack.push(copy);
}

function mvPopMatrix() {
    if (mvMatrixStack.length == 0) {
        throw "Invalid popMatrix!";
    }
    mvMatrix = mvMatrixStack.pop();
}

function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix);
}

var stemSegment;
var stemSegmetColorBuffer;
var squareVertexPositionBuffer;
var squareVertexColorBuffer;
var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var circleVertexPositionBuffer;

var lsStep = 0;
var rSquare = 0;
var mainAngle = 0;
var lastTime = 0;
var rotYvel = 0.1;
var rotYAngle = 0;
var plantScale = 0.35;

function initBuffers() {

    squareVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
    vertices = [
        1.0, 1.0, 0.0,
        -1.0, 1.0, 0.0,
        1.0, -1.0, 0.0,
        -1.0, -1.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    squareVertexPositionBuffer.itemSize = 3;
    squareVertexPositionBuffer.numItems = 4;

    squareVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
    colors = []
    for (var i = 0; i < 4; i++) {
        colors = colors.concat([R, G, B, 1.5 - 0.125 * i]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    squareVertexColorBuffer.itemSize = 4;
    squareVertexColorBuffer.numItems = 4;

    stemSegment = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, stemSegment);
    vertices = [
        0.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 2.0, 0.0
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    stemSegment.itemSize = 3;
    stemSegment.numItems = 2;

    stemSegmetColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, stemSegmetColorBuffer);
    colors = [
        1.0, 1.0, 1.0, 1.0,
        stemColor.R, stemColor.G, stemColor.B, 1.0

    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    stemSegmetColorBuffer.itemSize = 4;
    stemSegmetColorBuffer.numItems = 2;

    // Cube
    circleVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
    vertices = [
        // Front face
        -1.0, -1.0, 1.0,
        1.0, -1.0, 1.0,
        1.0, 1.0, 1.0,
        -1.0, 1.0, 1.0,

        // Back face
        -1.0, -1.0, -1.0,
        -1.0, 1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, -1.0, -1.0,

        // Top face
        -1.0, 1.0, -1.0,
        -1.0, 1.0, 1.0,
        1.0, 1.0, 1.0,
        1.0, 1.0, -1.0,

        // Bottom face
        -1.0, -1.0, -1.0,
        1.0, -1.0, -1.0,
        1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0,

        // Right face
        1.0, -1.0, -1.0,
        1.0, 1.0, -1.0,
        1.0, 1.0, 1.0,
        1.0, -1.0, 1.0,

        // Left face
        -1.0, -1.0, -1.0,
        -1.0, -1.0, 1.0,
        -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0
    ];
    var numCircleVertices = 12;
    vertices = getCircleVertices(numCircleVertices);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    circleVertexPositionBuffer.itemSize = 3;
    circleVertexPositionBuffer.numItems = 12;

    cubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    colors = []
    for (var i = 0; i < 2 * 12; i++) {
        colors = colors.concat([0.95 + 0.01 * (i % 4), 0.15, 0.15, 0.75]);
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    cubeVertexColorBuffer.itemSize = 4;
    cubeVertexColorBuffer.numItems = 12;

}

var timeNow = 0;
var timeStart = 0;

var R = .3, G = .3, B = .2;
var stemColor = {R: 0.0, G: 0.6, B: 0.2};
var formula = {};
var curForm = 'A';
var curFormIndex = 0;
var maxPC = 4;

// Growth
var gspeed = 4.0;
var genabled = false;

function initFormula() {
    formula ['A'] = "E.";
    formula ['E'] = "EsF*[+EF][-EF]/>E.";
}

function setFormula(ruleId, rule) {

    formula [ruleId] = rule + ".";
}

function renderLsystem() {
    for (i = 0; i < 5; i++) {
        var c = String.fromCharCode(65 + i);
        setFormula(c, document.getElementById("rule" + c).value);
    }

    var ngspeed = parseFloat(document.getElementById("growthSpeed").value);
    var ngenabled = document.getElementById("engrowth").checked;

    if (( ngenabled != genabled)) {
        timeStart = timeNow;
        genabled = ngenabled;
    }

    gspeed = ngspeed;

    var glstlen = mvMatrixStack.length;

    var timeSinceStart = timeNow - timeStart;
    if (timeSinceStart < 0)
        timeSinceStart = 0;

    var lsrulesstack = [];
    var lsstatestack = [];

    maxPC = document.getElementById("lsmaxDepth").value;
    maxSegments = document.getElementById("maxSegments").value;

    curForm = 'A';
    curFormIndex = 0;
    curPC = 0;
    var numseg = 0;
    var parent = -1;
    var height = 0;
    var maxheight = 0;
    var loopflag = true;

    while (loopflag) {
        var c = formula[curForm].charAt(curFormIndex);

        switch (c) {
            case '.':
            case "":
                if (lsrulesstack.length > 0) {
                    var ar = lsrulesstack.pop();
                    curForm = ar[0];
                    curFormIndex = ar[1];
                }
                else
                    loopflag = false;
                break;
            case '[':
                mvPushMatrix();
                lsstatestack.push(height);
                break;
            case ']':
                if (glstlen < mvMatrixStack.length) {
                    mvPopMatrix();
                    height = lsstatestack.pop();
                }
                else
                    loopflag = false;
                break;

            case 'A':
            case 'B':
            case 'C':
            case 'D':
            case 'E':

                if (lsrulesstack.length < maxPC) {
                    lsrulesstack.push([curForm, curFormIndex]);
                    curFormIndex = 0;
                    curForm = c;
                }
                break;

            case 'F':
                gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
                gl.disable(gl.DEPTH_TEST);
                gl.enable(gl.BLEND);
                gl.bindBuffer(gl.ARRAY_BUFFER, circleVertexPositionBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, circleVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
                gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
                gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);
                mvPushMatrix();

                mat4.scale(mvMatrix, [0.1, 0.1, 0.1]);

                setMatrixUniforms();

                gl.drawArrays(gl.LINE_LOOP, 0, circleVertexPositionBuffer.numItems);
                mvPopMatrix();
                mat4.translate(mvMatrix, [0, 0.1, 0]);
                numseg++;

                break;

            case 'L':
                gl.enable(gl.DEPTH_TEST);
                gl.disable(gl.BLEND);

                gl.bindBuffer(gl.ARRAY_BUFFER, stemSegment);
                gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, stemSegment.itemSize, gl.FLOAT, false, 0, 0);

                gl.bindBuffer(gl.ARRAY_BUFFER, stemSegmetColorBuffer);
                /*    var colors = [
                 1.0,1.0,1.0,1.0,
                 0.0, 1.0, 0.0, 1.0
                 ];
                 gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
                 */

                gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, stemSegmetColorBuffer.itemSize, gl.FLOAT, false, 0, 0);


                if (genabled == true) {
                    var dt = (height + 4) - timeSinceStart * 0.001;
                    dt /= gspeed;

                    if (dt > 0) {
                        dt *= 0.25;
                        if (dt > 1) dt = 1;
                        dt = 1 - dt;
                        mat4.scale(mvMatrix, [dt, dt, dt]);
                    }
                }

                setMatrixUniforms();

                gl.drawArrays(gl.LINES, 0, stemSegment.numItems);

                mat4.translate(mvMatrix, [0, 1, 0]);
                parent = numseg;
                numseg++;
                height++;


                //if (height>maxheight)
                //	maxheight = height;

                if (numseg > maxSegments) {
                    loopflag = false;
                }
                break;

            case 's':
                mat4.scale(mvMatrix, [0.8, 0.8, 0.8]);
                break;
            case 'S':
                mat4.scale(mvMatrix, [1.0 / 0.8, 1.0 / 0.8, 1.0 / 0.8]);
                break;

            case '+':
                mat4.rotate(mvMatrix, lsStep, [0, 0, 1]);
                break;

            case '-':
                mat4.rotate(mvMatrix, -lsStep, [0, 0, 1]);
                break;

            case '<':
                mat4.rotate(mvMatrix, lsStep, [0, 1, 0]);
                break;

            case '>':
                mat4.rotate(mvMatrix, -lsStep, [0, 1, 0]);
                break;

            case '*':
                mat4.rotate(mvMatrix, lsStep, [1, 0, 0]);
                break;

            case '/':
                mat4.rotate(mvMatrix, -lsStep, [1, 0, 0]);
                break;
        }

        curFormIndex++;
    }

    /*	if (numseg>maxSegments)
     document.getElementById("maxSegments").style.color = "red";
     else
     document.getElementById("maxSegments").style.color  = "green";
     */
}


function getCircleVertices(numberPoints) {
//      var numTris = 100;
    var vertices = [
        0.0, 0.0, 0.0,
        1.0, 0.0, 0.0
    ];
    var pointsToAdd = numberPoints - 2;
    var degPerTri = (2 * Math.PI) / pointsToAdd;
    for (var i = 0; i < pointsToAdd; i++) {
        var index = 2 * 3 + i * 3;
        var angle = degPerTri * (i + 1);
        vertices[index] = Math.cos(angle);
        vertices[index + 1] = Math.sin(angle);
        vertices[index + 2] = 0;
    }
    return vertices
}

function drawScene() {
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(R, G, B, 1.0);
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0, pMatrix);

    mat4.identity(mvMatrix);
    mat4.translate(mvMatrix, [-2.25, -1.75, -5.0]);

    mvPushMatrix();

    var scale = 0.9;

    mat4.scale(mvMatrix, [scale, scale, scale]);

    //gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    /*
     for (i=0;i<3;i++)
     for (j=0;j<3;j++)
     {
     mvPushMatrix();
     mat4.translate(mvMatrix, [i*2, j*2, 0.0]);

     mat4.rotate(mvMatrix, (20* Math.PI / 180*Math.cos(rSquare*0.01+0.4*(i+2*j))), [0, 0, 1]);

     gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexPositionBuffer);
     gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, squareVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

     gl.bindBuffer(gl.ARRAY_BUFFER, squareVertexColorBuffer);
     gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, squareVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

     setMatrixUniforms();
     gl.drawArrays(gl.TRIANGLE_STRIP, 0, squareVertexPositionBuffer.numItems);

     mvPopMatrix();
     }
     */
    mvPopMatrix();

    mvPushMatrix();
    mat4.translate(mvMatrix, [1.75, 0.85, 2]);

    mat4.scale(mvMatrix, [plantScale, plantScale, plantScale]);
    mat4.rotate(mvMatrix, rotYAngle, [0, 1, 0]);

    renderLsystem();
    mvPopMatrix();
}


var velAngle;
var minAngle;
var maxAngle;

function animate() {
    rotYvel = parseFloat(document.getElementById("rotYVel").value);
    plantScale = parseFloat(document.getElementById("plantScale").value);
    velAngle = parseFloat(document.getElementById("velAngle").value);
    minAngle = parseFloat(document.getElementById("minAngle").value);
    maxAngle = parseFloat(document.getElementById("maxAngle").value);

    var rA = (maxAngle - minAngle) / 2;
    var medA = (maxAngle + minAngle) / 2;
    timeNow = new Date().getTime();

    if (lastTime == 0) {
        var elapsed = timeNow - lastTime;

        mainAngle += elapsed * 0.01 * velAngle;
        rotYAngle += elapsed * 0.01 * rotYvel;

        lsStep = medA + Math.sin(mainAngle) * rA;
        rSquare += 0.075 * elapsed;
    }
    lastTime = timeNow;

    /*	console.log("Gen Tree");
     tree = genTree(8);
     console.log(tree);
     console.log("Log Tree");
     console.log(genTreeToString(tree));

     */
}

function tick() {
    requestAnimFrame(tick);
    drawScene();
    animate();
}


function webGLStart() {
    var canvas = document.getElementById("lsys-canvas");
    initGL(canvas);
    initShaders()
    initBuffers();
    initFormula();
    setPreset(4);
    tick();
}


function setRes(w, h) {
    var canvas = document.getElementById("lsys-canvas");
    canvas.width = w;
    canvas.height = h;
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
}


function mutation() {
    var genSymbols = [["A", 1], ["+", 1], ["-", 1], [">", 1], ["<", 1], ["s", 1], ["S", 1], ["F", 1], ["E", 1], ["L", 1]];

    var f0 = formula['E'];
    var r = Math.floor(Math.random() * genSymbols.length);
    var r1 = Math.floor(Math.random() * genSymbols.length);
    console.log(r, r1);
    var f1 = f0.replace(genSymbols[r1][0], genSymbols[r][0]);

    console.log(f1);
    document.getElementById("ruleE").value = f1;

}


function restartGrowth() {
    timeStart = new Date().getTime(); //+1000*gspeed;

}

function setPreset(presetId) {

    var i;
    for (i = 0; i < 5; i++) {
        var c = String.fromCharCode(65 + i);
        formula[c] = ".";
    }

    rotYVel = 0.03;

    timeStart = new Date().getTime();

    switch (presetId) {
        default:
        case 1:
            setFormula('A', "ASLss*[+AL][-AL]///>");
            plantScale = 0.45;
            velAngle = 0.1;
            maxAngle = 0.6;
            minAngle = 0.5;
            maxPC = 6;
            genabled = true;
            gspeed = 1.5;
            if (maxSegments < 2048) maxSegments = 2048;
            break;

        case 2:
            setFormula('A', "E");
            setFormula('E', "E>sL[+ELF][-ELF]");
            velAngle = 0.2;
            maxAngle = 0.65;
            minAngle = 0.5;
            maxPC = 7;
            if (maxSegments < 1024) maxSegments = 1024;
            plantScale = 0.45;
            genabled = true;
            break;

        case 3:
            setFormula('A', "LE");
            setFormula('E', "LE+LE--LE+LE");
            rotYVel = 0.0;
            rotYAngle = 0.0;
            plantScale = 0.01;
            velAngle = 0.14;
            maxAngle = 1.56;
            minAngle = 1.18;
            maxPC = 7;

            if (maxSegments < 4096) maxSegments = 4096;
            genabled = false;
            break;
        case 4:
            setFormula('A', "E");
            setFormula('E', "FE>sL[+EL][-ELF]");
            rotYVel = 0.02;
            //	rotYAngle = 0.0;
            plantScale = 0.45;
            velAngle = 0.04;
            maxAngle = 0.8;
            minAngle = 0.45;
            maxPC = 7;
            gspeed = 5;
            if (maxSegments < 4096) maxSegments = 4096;
            genabled = true;
            break;
    }

    document.getElementById("rotYVel").value = rotYVel;
    document.getElementById("plantScale").value = plantScale;
    document.getElementById("velAngle").value = velAngle;
    document.getElementById("minAngle").value = minAngle;
    document.getElementById("maxAngle").value = maxAngle;
    document.getElementById("lsmaxDepth").value = maxPC;
    document.getElementById("maxSegments").value = maxSegments;
    document.getElementById("engrowth").checked = genabled;
    document.getElementById("growthSpeed").value = gspeed;

    for (i = 0; i < 5; i++) {
        var c = String.fromCharCode(65 + i);
        document.getElementById("rule" + c).value = formula[c];
    }

}

function genRules() {
    var t = genTree(8);
    document.getElementById("ruleE").value = genTreeToString(t);
}


// TODO:
// - Colors => #RGB ou #+RGB #-RGB
// - lsystem.js
// - Doc
// Mutations/Random Symboles: A B C D E   L F s S > < * + + - []

function genTree(hmax) {
    var genSymbols = [["A", 1], ["+", 1], ["-", 1], [">", 1], ["<", 1], ["s", 1], ["S", 1], ["F", 1], ["E", 1], ["L", 1], ["[]", 2]];
    res = [];

    if (hmax <= 0) {
        res = [];
    }
    else {
        var r = Math.floor(Math.random() * genSymbols.length);
        var sym = genSymbols [r];

        ar = sym[1];
        sstr = sym[0];

        if (ar >= 2) {
            var t1 = genTree(hmax);
            var t2 = genTree(hmax);
            res = [sstr, [t1, t2]];
        }
        else {
            if (ar >= 1) {
                res = [sstr, [genTree(hmax - 1)]];
            }
            else
                res = [sstr, []];
        }

    }
//console.log(res);
    return res;

}


function genTreeToString(tree) {
    res = " ";
    try {
        if (tree.length > 0) {
            sstr = tree[0];
            sub = tree[1];

            if (sstr == "[]") {
                if (sub.length > 1)
                    res = "[" + genTreeToString(sub[0]) + "]" + genTreeToString(sub[1]);
            }
            else {
                res = sstr;
                if (sub.length > 0)
                    res += genTreeToString(sub[0]);
            }
        }
    } catch (e) {
        console.log(e);
        console.log(tree);
    }

    return res;
}


