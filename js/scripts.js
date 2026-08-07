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
        'rgba(47, 102, 149, 0.42)',
        'rgba(79, 134, 184, 0.34)',
        'rgba(117, 169, 207, 0.38)'
    ];

    canvas.className = 'particle-field';
    canvas.setAttribute('aria-hidden', 'true');
    document.body.insertBefore(canvas, document.body.firstChild);

    function particleCount() {
        var area = window.innerWidth * window.innerHeight;
        return Math.max(24, Math.min(58, Math.round(area / 26000)));
    }

    function makeParticle(index) {
        var angle = Math.random() * Math.PI * 2;
        var speed = 0.12 + Math.random() * 0.24;

        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 8 + Math.random() * 6,
            rotation: Math.random() * Math.PI * 2,
            spin: (Math.random() - 0.5) * 0.004,
            phase: Math.random() * Math.PI * 2,
            squash: 0.84 + Math.random() * 0.22,
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

    function drawMobius(particle) {
        var scale = particle.radius;
        var twist = particle.rotation;
        var squeeze = particle.squash + Math.sin(particle.phase) * 0.08;
        var steps = 54;

        context.save();
        context.translate(particle.x, particle.y);
        context.rotate(twist);
        context.scale(1 + (1 - squeeze) * 0.22, squeeze);
        context.lineCap = 'round';
        context.lineJoin = 'round';
        context.shadowColor = 'rgba(36, 106, 165, 0.12)';
        context.shadowBlur = 7;
        context.lineWidth = Math.max(2.2, scale * 0.22);
        context.strokeStyle = particle.color;
        context.fillStyle = particle.color.replace(/[\d.]+\)$/, '0.11)');

        context.beginPath();
        for (var i = 0; i <= steps; i += 1) {
            var t = i / steps * Math.PI * 2;
            var x = Math.cos(t) * scale * 1.18;
            var y = Math.sin(t * 2) * scale * 0.36 + Math.sin(t) * scale * 0.15;

            if (i === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }
        }
        context.closePath();
        context.fill();
        context.stroke();

        context.shadowBlur = 0;
        context.lineWidth = Math.max(1.1, scale * 0.11);
        context.beginPath();
        for (var j = 0; j <= steps; j += 1) {
            var u = j / steps * Math.PI * 2;
            var ix = Math.cos(u) * scale * 0.58;
            var iy = Math.sin(u * 2 + Math.PI) * scale * 0.18 + Math.sin(u) * scale * 0.08;

            if (j === 0) {
                context.moveTo(ix, iy);
            } else {
                context.lineTo(ix, iy);
            }
        }
        context.strokeStyle = particle.color.replace(/[\d.]+\)$/, '0.22)');
        context.stroke();

        context.beginPath();
        context.fillStyle = 'rgba(255, 255, 255, 0.34)';
        context.ellipse(-scale * 0.34, -scale * 0.17, scale * 0.18, scale * 0.07, -0.25, 0, Math.PI * 2);
        context.fill();
        context.restore();
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
                    context.strokeStyle = 'rgba(47, 102, 149, ' + (0.12 * (1 - distance / 118)).toFixed(3) + ')';
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
            particle.rotation += particle.spin;
            particle.phase += 0.018;
            drawMobius(particle);
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
