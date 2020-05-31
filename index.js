
// get DOM elements
const canvas = document.getElementById('canvas');
// const ctx = canvas.getContext('2d');

// register DOM events
window.addEventListener('resize', draw, false);

canvas.addEventListener('mousedown', canvasMouseDown, false);
canvas.addEventListener('mousemove', canvasMouseMove, false);
canvas.addEventListener('mouseup', canvasMouseUp, false);
canvas.addEventListener('wheel', canvasWheel);

// settings
const maxIterations = 80;

let complexPlane = {
    start: {
        re: -2.1,
        im: -2.1
    },
    end: {
        re: 2.1,
        im: 2.1
    }
}

const standardPlane = {
    start: {
        re: -2.1,
        im: -2.1
    },
    end: {
        re: 2.1,
        im: 2.1
    }
}

/**
 * Determines how much each click zooms in/out.
 */
const zoomFactor = 0.5;

let zoomPoint = { x: 0, y: 0 };

/**
 * The current zoom level.
 */
let zoomLevel = 1; // 1 = 100%

/**
 * Determines the amount of decimal places for UI output of coordinates.
 */
const decimalPlaces = 3;

const axisThickness = 2;

let pDragStart;

// unit tests
console.log(mandelbrot({ re: 1 / 8, im: 0 })); // true
console.log(mandelbrot({ re: 1, im: 0 })); // false
console.log(mandelbrot({ re: -1, im: 0 })); // true
console.log(mandelbrot({ re: -1, im: 0.5 })); // false

let p = { x: 15, y: 15 };
console.log(p);
console.log(complexPlaneToCanvas(canvasToComplexPlane(p)));

// Event handler

function main() {
    const gl = canvas.getContext("webgl");

    if (gl === null) {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    // Set clear color to black, fully opaque
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear the color buffer with specified clear color
    gl.clear(gl.COLOR_BUFFER_BIT);
}

/**
 * Handles the `wheel` event of the canvas.
 * @param {*} event 
 */
function canvasWheel(event) {

    // prevent scroll, I guess?
    event.preventDefault();

    // let p = { x: event.offsetX, y: offsetY };

    // pointZoom(complexPlaneCenter(), event.deltaY * 0.01);
}

function canvasMouseDown(event) {
    pDragStart = { x: event.offsetX, y: event.offsetY };
}

function canvasMouseMove(event) {
    pDragMove = { x: event.offsetX, y: event.offsetY };

    // draw zoom rectangle
}

function pointZoom(newCenterP, zoomFactor) {
    // get complex plane center
    let newCenterC = canvasToComplexPlane(newCenterP);

    // half lenghts of the axes of the current complex plane
    let reAxisHalf = (complexPlane.end.re - complexPlane.start.re) / 2;
    let imAxisHalf = (complexPlane.end.im - complexPlane.start.im) / 2

    // Is this the right way to do it? What does percentage zoom even mean?
    let reAxisHalfNew = reAxisHalf * (1 - zoomFactor);
    let imAxisHalfNew = imAxisHalf * (1 - zoomFactor);

    let newStartC = {
        re: newCenterC.re - reAxisHalfNew,
        im: newCenterC.im - imAxisHalfNew
    }

    let newEndC = {
        re: newCenterC.re + reAxisHalfNew,
        im: newCenterC.im + imAxisHalfNew
    }

    complexPlane.start = newStartC;
    complexPlane.end = newEndC;

    logComplexPlane();

    draw();
}

function canvasMouseUp(event) {
    let pDragEnd = { x: event.offsetX, y: event.offsetY };

    if (pDragStart.x === pDragEnd.x && pDragStart.y === pDragEnd.y) {
        const c = canvasToComplexPlane(pDragEnd);
        let string = '(' + pDragEnd.x + ', ' + pDragEnd.y + ') <-> (' + round(c.re) + ', ' + round(c.im) + ')';
        console.log(string);

        pointZoom(pDragEnd, zoomFactor);

        return;
    }

    // let cStart = canvasToComplexPlane(pDragStart);
    // let cEnd = canvasToComplexPlane(pDragEnd);

    // complexPlane.start = cStart;
    // complexPlane.end = cEnd;

    // pDragStart = null;

    // logComplexPlane();

    // draw();
}

/**
 * Returns the center of the complex plane (in complex coordinates).
 */
function complexPlaneCenter() {
    return {
        re: complexPlane.start.re + ((complexPlane.end.re - complexPlane.start.re) / 2),
        im: complexPlane.start.im + ((complexPlane.end.im - complexPlane.start.im) / 2)
    }
}

/**
 * Prints the current complex plane coordintes to the console.
 */
function logComplexPlane() {
    let sr = round(complexPlane.start.re);
    let si = round(complexPlane.start.im);
    let er = round(complexPlane.end.re);
    let ei = round(complexPlane.end.im);
    console.log('Complex plane: ((' + sr + ', ' + si + '), (' + er + ', ' + ei + '))');
}

/**
 * The main draw function.
 */
function draw() {
    // show loading div
    // loadingDiv.style.display = "block";

    // update canvas dimensions
    let w = window.innerWidth, h = window.innerHeight;
    canvas.width = w > h ? h : w;
    canvas.height = w > h ? h : w;


    // draw mandelbrot set
    drawMandelbrot();

    // drawAxes();

    // drawNumberLines();

    // draw rect from (-2, 1) to (-1.9, 0,9)

    // hide loading div
    // loadingDiv.style.display = "none";
}

function canvasScroll(event) {
    console.log('scroll');
}

// https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
function round(num) {
    let factor = Math.pow(10, decimalPlaces);
    return Math.round((num + Number.EPSILON) * factor) / factor;
}

// Local methods

/**
 * Draws the mandelbrot set in the local complex plane.
 */
function drawMandelbrot() {

    let t0 = performance.now();

    let imageData = ctx.createImageData(canvas.width, canvas.height);

    for (let x = 0; x < canvas.width; x++) {
        for (let y = 0; y < canvas.height; y++) {



            let p = { x: x, y: y };

            // transform canvas coordinates to plot window coordinate system
            let c = canvasToComplexPlane(p);

            // draw point black or white
            // ctx.fillStyle = mb ? 'black' : 'white';
            // ctx.lineWidth=1;
            // ctx.fillRect(x,y,1,1);

            let rgb = mandelbrot(c) ? 0 : 255;

            let pixelIndex = (y * canvas.width + x) * 4;

            imageData.data[pixelIndex] = rgb;
            imageData.data[pixelIndex + 1] = rgb;
            imageData.data[pixelIndex + 2] = rgb;
            imageData.data[pixelIndex + 3] = 255;

        }
    }

    ctx.putImageData(imageData, 0, 0);

    let t1 = performance.now();

    console.log('Draw time: ' + (t1 - t0) + 'ms');
}

/**
 * Draws coordinate axes.
 */
function drawAxes() {

    // draw setup
    ctx.lineWidth = axisThickness;
    ctx.strokeStyle = 'grey';

    // draw x-axis
    let yMid = canvas.height / 2;
    ctx.beginPath();
    ctx.moveTo(0, yMid);
    ctx.lineTo(canvas.width, yMid);
    ctx.stroke();

    // draw y-axis
    let xMid = canvas.width / 2;
    ctx.beginPath();
    ctx.moveTo(xMid, 0);
    ctx.lineTo(xMid, canvas.height);
    ctx.stroke();
}

function drawNumberLines() {

    // setup
    ctx.lineWidth = axisThickness;
    ctx.strokeStyle = 'grey';

    const lineRadius = 6;

    // draw x-lines

    let rangeRe = integerRange(complexPlane.start.re, complexPlane.end.re, true);

    for (let i = 0; i < rangeRe.length; i++) {
        const yMid = canvas.height / 2;
        let x = complexPlaneToCanvas({ re: rangeRe[i] }).x;
        ctx.beginPath();
        ctx.moveTo(x, yMid - lineRadius);
        ctx.lineTo(x, yMid + lineRadius);
        ctx.stroke();
    }

    // draw y-lines

    let rangeIm = integerRange(complexPlane.start.im, complexPlane.end.im, true);

    for (let i = 0; i < rangeIm.length; i++) {
        const xMid = canvas.width / 2;
        let y = complexPlaneToCanvas({ im: rangeIm[i] }).y;
        ctx.beginPath();
        ctx.moveTo(xMid - lineRadius, y);
        ctx.lineTo(xMid + lineRadius, y);
        ctx.stroke();
    }
}

function integerRange(start, end, skipZero) {
    start = Math.trunc(start);
    end = Math.trunc(end);
    let range = [];
    for (let i = start; i <= end; i++) {
        if (!(i == 0 && skipZero)) range.push(i);
    }
    return range;
}

/**
 * Transforms canvas coordinates to complex plane coordinates
 * @param {*} p Point in canvas coordinates
 * @returns 
 */
function canvasToComplexPlane(p) {

    let reRange = complexPlane.end.re - complexPlane.start.re;
    let imRange = complexPlane.end.im - complexPlane.start.im;

    let re = complexPlane.start.re + (p.x / canvas.width) * reRange;
    // end.im and - to flip the coordinate system
    let im = complexPlane.end.im - (p.y / canvas.height) * imRange;

    return {
        re: re,
        im: im
    }
}

/**
 * Transforms complex plane coordinates to canvas coordinates
 * @param {*} c Complex number in complex plane
 * @returns Point in canvas
 */
function complexPlaneToCanvas(c) {

    let reRange = complexPlane.end.re - complexPlane.start.re;
    let imRange = complexPlane.end.im - complexPlane.start.im;

    // reverse engineer equation from canvasToComplexPlane
    let x = (c.re - complexPlane.start.re) / reRange * canvas.width;
    let y = (c.im - complexPlane.end.im) / -imRange * canvas.height;

    return {
        x: x,
        y: y
    }
}

/**
 * Returns whether the given complex number is included in the Mandelbrot set.
 * @param {*} c The complex number to check.
 */
function mandelbrot(c) {
    var z = { re: 0, im: 0 };
    var n = 0;
    while (complexModulus(z) <= 2 && n < maxIterations) {
        z = complexAdd(complexMultiply(z, z), c);
        n += 1;
    }
    return complexModulus(z) <= 2 && n == maxIterations;
}

function complexModulus(c) {
    return Math.sqrt(Math.pow(c.re, 2) + Math.pow(c.im, 2));
}

/**
 * Multiplies two complex numbers.
 * @param {*} c1 The first complex number
 * @param {*} c2 The second complex number
 */
// https://www.youtube.com/watch?v=ZzvIVKDXovs
function complexMultiply(c1, c2) {
    return {
        re: c1.re * c2.re - c1.im * c2.im,
        im: c1.re * c2.im + c1.im * c2.re
    };
}

/**
 * Adds two complex numbers.
 * @param {*} c1 The first complex number
 * @param {*} c2 The second complex number
 */
function complexAdd(c1, c2) {
    return {
        re: c1.re + c2.re,
        im: c1.im + c2.im
    };
}

window.onload = main;