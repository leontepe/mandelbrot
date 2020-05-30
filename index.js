(function() {
    // get DOM elements
    const canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');

    // const loadingDiv = document.getElementById('loadingDiv');

    // register DOM events
    window.addEventListener('resize', resizeWindow, false);
    window.addEventListener('scroll', handleScroll, false);

    // canvas.addEventListener('click', canvasClick, false);
    canvas.addEventListener('mousedown', canvasDragStart, false);
    canvas.addEventListener('mouseup', canvasDragEnd, false);

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

    /**
     * Determines how much each click zooms in.
     */
    const zoomFactor = 0.2;
    
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
    console.log(mandelbrot({re: 1/8, im: 0})); // true
    console.log(mandelbrot({re: 1, im: 0})); // false
    console.log(mandelbrot({re: -1, im: 0})); // true
    console.log(mandelbrot({re: -1, im: 0.5})); // false

    let p = {x:15, y:15};
    console.log(p);
    console.log(complexPlaneToCanvas(canvasToComplexPlane(p)));

    // Event listeners

    function canvasDragStart(event) {
        pDragStart = {x: event.offsetX, y: event.offsetY};
    }

    function canvasDragEnd(event) {
        let pDragEnd = {x: event.offsetX, y: event.offsetY};

        if (pDragStart.x === pDragEnd.x && pDragStart.y === pDragEnd.y) {
            const c = canvasToComplexPlane(pDragEnd);
            let string = '(' + pDragEnd.x + ', ' + pDragEnd.y + ') <-> (' + round(c.re) + ', ' + round(c.im) + ')';
            console.log(string);
            // alert(string);
            return;
        }

        let cStart = canvasToComplexPlane(pDragStart);
        let cEnd = canvasToComplexPlane(pDragEnd);

        complexPlane.start = cStart;
        complexPlane.end = cEnd;

        pDragStart = null;

        logComplexPlane();
        
        resizeWindow();
    }

    function logComplexPlane() {
        let sr = round(complexPlane.start.re);
        let si = round(complexPlane.start.im);
        let er = round(complexPlane.end.re);
        let ei = round(complexPlane.end.im);
        console.log('((' + sr + ', ' + si + '), (' + er + ', ' + ei + '))');
    }

    function resizeWindow() {
        // show loading div
        // loadingDiv.style.display = "block";

        // update canvas dimensions
        let w = window.innerWidth, h = window.innerHeight;
        canvas.width = w > h ? h : w;
        canvas.height = w > h ? h : w;
        

        // draw mandelbrot set
        drawMandelbrot();

        drawAxes();

        drawNumberLines();

        // draw rect from (-2, 1) to (-1.9, 0,9)

        // hide loading div
        // loadingDiv.style.display = "none";
    }

    function handleScroll(event) {
        console.log('scroll');
    }

    function canvasClick(event) {
        const x = event.pageX - (canvas.offsetLeft + canvas.clientLeft);
        const y = event.pageY - (canvas.offsetLeft + canvas.clientLeft);

        const p = { x: x, y: y };
        const c = canvasToComplexPlane(p);

        let string = '(' + p.x + ', ' + p.y + ') <-> (' + round(c.re) + ', ' + round(c.im) + ')';
        console.log(string);
        alert(string);

    }

    // https://stackoverflow.com/questions/11832914/round-to-at-most-2-decimal-places-only-if-necessary
    function round(num) {
        let factor = Math.pow(10, decimalPlaces);
        return Math.round((num + Number.EPSILON) * factor) / factor; 
    }

    // Local methods

    /**
     * Draws the mandelbrot set in the local plot window.
     */
    function drawMandelbrot() {
        for(let x = 0; x < canvas.width; x++) {
            for(let y = 0; y < canvas.height; y++) {

                let p = { x: x, y: y };

                // transform canvas coordinates to plot window coordinate system
                let c = canvasToComplexPlane(p);

                // draw point black or white
                let mb = mandelbrot(c);
                ctx.fillStyle = mb ? 'black' : 'white';
                ctx.lineWidth=1;
                ctx.fillRect(x,y,1,1);
            }
        }
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
            let x = complexPlaneToCanvas({re: rangeRe[i]}).x;
            ctx.beginPath();
            ctx.moveTo(x, yMid - lineRadius);
            ctx.lineTo(x, yMid + lineRadius);
            ctx.stroke();
        }

        // draw y-lines

        let rangeIm = integerRange(complexPlane.start.im, complexPlane.end.im, true);

        for (let i = 0; i < rangeIm.length; i++) {
            const xMid = canvas.width / 2;
            let y = complexPlaneToCanvas({im: rangeIm[i]}).y;
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
            if(!(i == 0 && skipZero)) range.push(i);
        }
        return range;
    }

    /**
     * Transforms canvas coordinates to complex plane coordinates
     * @param {*} p Point in canvas coordinates
     * @returns 
     */
    function canvasToComplexPlane(p) {
        return {
            re: p.x / canvas.width * (complexPlane.end.re - complexPlane.start.re) + complexPlane.start.re,
            im: -p.y / canvas.height * (complexPlane.end.im - complexPlane.start.im) - complexPlane.start.im
        }
    }

    /**
     * Transforms complex plane coordinates to canvas coordinates
     * @param {*} c Point (number) in complex plane
     */
    function complexPlaneToCanvas(c) {
        return {
            x: (c.re - complexPlane.start.re) * canvas.width / (complexPlane.end.re - complexPlane.start.re),
            y: - (c.im + complexPlane.start.im) * canvas.height / (complexPlane.end.im - complexPlane.start.im)
        }
    }

    /**
     * Returns whether the given complex number is included in the Mandelbrot set.
     * @param {*} c The complex number to check.
     */
    function mandelbrot(c) {
        var z = { re: 0, im: 0 };
        var n = 0;
        while(complexModulus(z) <= 2 && n < maxIterations) {
            z = complexAdd(complexMultiply(z, z), c);
            n += 1;
        }
        return complexModulus(z) <= 2 && n == maxIterations;
    }

    function complexModulus(c) {
        return Math.sqrt(Math.pow(c.re,2) + Math.pow(c.im,2));
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

    // Make initial drawing call
    resizeWindow();
})();