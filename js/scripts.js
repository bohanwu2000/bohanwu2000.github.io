jQuery(function ($) {

    'use strict';

    $('#preloader').delay(200).fadeOut('slow');
    $('.left-col-block, .right-col-block').theiaStickySidebar();

});

(function () {
    'use strict';

    var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    if (!context) return;

    canvas.className = 'bubble-background';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.prepend(canvas);

    var bubbles = [];
    var width = 0;
    var height = 0;
    var frame = null;
    var lastTime = null;
    var content = document.querySelector('.content-column');

    function resize() {
        var oldWidth = width;
        var oldHeight = height;
        width = window.innerWidth;
        height = window.innerHeight;
        var ratio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        context.setTransform(ratio, 0, 0, ratio, 0, 0);

        bubbles.forEach(function (bubble) {
            bubble.x *= width / oldWidth;
            bubble.y *= height / oldHeight;
        });

        var count = width < 600 ? 6 : Math.min(20, Math.max(10, Math.round(width * height / 65000)));
        while (bubbles.length < count) {
            var angle = Math.random() * Math.PI * 2;
            var speed = 1 + Math.random();
            bubbles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: 6 + Math.random() * 8,
                aspect: 0.88 + Math.random() * 0.1,
                tilt: Math.random() * Math.PI,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed
            });
        }
        bubbles.length = count;
    }

    function draw(time) {
        frame = window.requestAnimationFrame(draw);
        if (lastTime === null) lastTime = time;
        var elapsed = time - lastTime;
        if (elapsed < 1000 / 30) return;
        var seconds = Math.min(elapsed / 1000, 0.1);
        lastTime = time;
        context.clearRect(0, 0, width, height);
        var bounds = content ? content.getBoundingClientRect() : null;

        bubbles.forEach(function (bubble) {
            bubble.x += bubble.vx * seconds;
            bubble.y += bubble.vy * seconds;
            var margin = bubble.radius + 2;
            if (bubble.x < -margin) bubble.x = width + margin;
            if (bubble.x > width + margin) bubble.x = -margin;
            if (bubble.y < -margin) bubble.y = height + margin;
            if (bubble.y > height + margin) bubble.y = -margin;

            // Fade smoothly near the reading column, keeping the text visually dominant.
            var distance = bounds ? Math.max(bounds.left - bubble.x, bubble.x - bounds.right,
                bounds.top - bubble.y, bubble.y - bounds.bottom, 0) : 80;
            context.globalAlpha = 0.3 + 0.7 * Math.min(distance / 80, 1);
            context.beginPath();
            context.ellipse(bubble.x, bubble.y, bubble.radius, bubble.radius * bubble.aspect,
                bubble.tilt, 0, Math.PI * 2);
            context.fillStyle = 'rgba(156, 205, 231, 0.035)';
            context.fill();
            context.strokeStyle = 'rgba(105, 166, 201, 0.22)';
            context.lineWidth = 0.8;
            context.stroke();

            context.beginPath();
            context.ellipse(bubble.x, bubble.y, bubble.radius * 0.8, bubble.radius * bubble.aspect * 0.8,
                bubble.tilt, Math.PI * 1.05, Math.PI * 1.45);
            context.strokeStyle = 'rgba(255, 255, 255, 0.65)';
            context.stroke();
        });
        context.globalAlpha = 1;
    }

    function syncMotion() {
        if (frame !== null) window.cancelAnimationFrame(frame);
        frame = null;
        lastTime = null;
        canvas.hidden = motionPreference.matches;
        if (!motionPreference.matches && !document.hidden) {
            frame = window.requestAnimationFrame(draw);
        }
    }

    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', syncMotion);
    motionPreference.addEventListener('change', syncMotion);
    resize();
    syncMotion();
}());
