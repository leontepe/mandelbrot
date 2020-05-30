(function() {
    const canvas = document.getElementById('canvas'), ctx = canvas.getContext('2d');

    window.addEventListener('resize', resizeCanvas, false);

    const maxIterations = 80;

    const plotWindow = {
        startRe: -2,
        startIm: -1,
        endRe: 1,
        endIm: 1
    }

    // unit tests
    console.log(mandelbrot({re: 1/8, im: 0})); // true
    console.log(mandelbrot({re: 1, im: 0})); // false
    console.log(mandelbrot({re: -1, im: 0})); // true
    console.log(mandelbrot({re: -1, im: 0.5})); // false

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        drawMandelbrot();
        console.log('finished drawing');
    }

    function draw() {
        ctx.lineWidth = 30;
        ctx.strokeStyle = 'black';
        ctx.strokeRect(0,0,canvas.width,canvas.height);
        ctx.lineWidth=15;
        ctx.strokeStyle='white';
        ctx.strokeRect(0,0,canvas.width,canvas.height);
    }

    function drawMandelbrot() {
        for(x = 0; x < canvas.width; x++) {
            for(y = 0; y < canvas.height; y++) {
                let transform = {
                    re: x / canvas.width * (plotWindow.endRe - plotWindow.startRe) + plotWindow.startRe,
                    im: y / canvas.height * (plotWindow.endIm - plotWindow.startIm) + plotWindow.startIm
                }
                let mb = mandelbrot(transform);
                ctx.fillStyle = mb ? 'black' : 'white';
                ctx.lineWidth=1;
                ctx.fillRect(x,y,1,1);
            }
        }
    }

    /**
     * Returns whether the given complex number is included in the Mandelbrot set (true/false).
     * @param {*} c An object with a `re` and `im` property, representing the real and imaginary parts of the complex number `c`.
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

    // https://www.youtube.com/watch?v=ZzvIVKDXovs
    function complexMultiply(c1, c2) {
        return {
            re: c1.re * c2.re - c1.im * c2.im,
            im: c1.re * c2.im + c1.im * c2.re
        };
    }

    function complexAdd(c1, c2) {
        return {
            re: c1.re + c2.re,
            im: c1.im + c2.im
        };
    }

    resizeCanvas();
})();