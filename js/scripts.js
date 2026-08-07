jQuery(function ($) {

    'use strict';

    // --------------------------------------------------------------------
    // PreLoader
    // --------------------------------------------------------------------

    (function () {
        $('#preloader').delay(200).fadeOut('slow');
    }());



    // --------------------------------------------------------------------
    // Sticky Sidebar
    // --------------------------------------------------------------------

    $('.left-col-block, .right-col-block').theiaStickySidebar();

}); // JQuery end

(function () {
    'use strict';

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reduced-motion');
        return;
    }

    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');
    var particles = [];
    var pointer = { x: null, y: null };
    var animationFrame = null;
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    var colors = [
        'rgba(47, 89, 84, 0.48)',
        'rgba(36, 93, 143, 0.38)',
        'rgba(188, 135, 52, 0.42)'
    ];

    canvas.className = 'particle-field';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    function particleCount() {
        var area = window.innerWidth * window.innerHeight;
        return Math.max(34, Math.min(88, Math.round(area / 18000)));
    }

    function makeParticle(index) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 0.12 + Math.random() * 0.24;

        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 1.1 + Math.random() * 1.9,
            color: colors[index % colors.length]
        };
    }

    function resize() {
        pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * pixelRatio);
        canvas.height = Math.floor(window.innerHeight * pixelRatio);
        canvas.style.width = window.innerWidth + 'px';
        canvas.style.height = window.innerHeight + 'px';
        context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

        var count = particleCount();
        while (particles.length < count) {
            particles.push(makeParticle(particles.length));
        }
        particles.length = count;
    }

    function moveParticle(particle) {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < -12) particle.x = window.innerWidth + 12;
        if (particle.x > window.innerWidth + 12) particle.x = -12;
        if (particle.y < -12) particle.y = window.innerHeight + 12;
        if (particle.y > window.innerHeight + 12) particle.y = -12;

        if (pointer.x !== null) {
            var dx = particle.x - pointer.x;
            var dy = particle.y - pointer.y;
            var distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 130 && distance > 0) {
                particle.x += dx / distance * 0.18;
                particle.y += dy / distance * 0.18;
            }
        }
    }

    function drawConnections() {
        for (var i = 0; i < particles.length; i += 1) {
            for (var j = i + 1; j < particles.length; j += 1) {
                var a = particles[i];
                var b = particles[j];
                var dx = a.x - b.x;
                var dy = a.y - b.y;
                var distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 118) {
                    context.beginPath();
                    context.strokeStyle = 'rgba(47, 89, 84, ' + (0.13 * (1 - distance / 118)).toFixed(3) + ')';
                    context.lineWidth = 1;
                    context.moveTo(a.x, a.y);
                    context.lineTo(b.x, b.y);
                    context.stroke();
                }
            }
        }
    }

    function draw() {
        context.clearRect(0, 0, window.innerWidth, window.innerHeight);

        particles.forEach(function (particle) {
            moveParticle(particle);
            context.beginPath();
            context.fillStyle = particle.color;
            context.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            context.fill();
        });

        drawConnections();
        animationFrame = window.requestAnimationFrame(draw);
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', function (event) {
        pointer.x = event.clientX;
        pointer.y = event.clientY;
    });
    window.addEventListener('mouseleave', function () {
        pointer.x = null;
        pointer.y = null;
    });
    document.addEventListener('visibilitychange', function () {
        if (document.hidden && animationFrame) {
            window.cancelAnimationFrame(animationFrame);
            animationFrame = null;
        } else if (!document.hidden && !animationFrame) {
            draw();
        }
    });

    resize();
    draw();
}());
