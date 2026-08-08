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
    var bursts = [];
    var pointer = { x: null, y: null };
    var animationFrame = null;
    var pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    var colors = [
        'rgba(126, 190, 226, 0.24)',
        'rgba(154, 211, 238, 0.22)',
        'rgba(188, 226, 244, 0.28)'
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
        var speed = 0.035 + Math.random() * 0.075;

        return {
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            radius: 3.2 + Math.random() * 4.8,
            phase: Math.random() * Math.PI * 2,
            impact: 0,
            popped: false,
            popAge: 0,
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
                particle.x += dx / distance * 0.08;
                particle.y += dy / distance * 0.08;
            }
        }
    }

    function popParticle(particle) {
        if (particle.popped) {
            return;
        }

        particle.popped = true;
        particle.popAge = 0;

        for (var i = 0; i < 7; i += 1) {
            var angle = Math.PI * 2 * i / 7 + Math.random() * 0.35;
            bursts.push({
                x: particle.x,
                y: particle.y,
                vx: Math.cos(angle) * (0.7 + Math.random() * 0.6),
                vy: Math.sin(angle) * (0.7 + Math.random() * 0.6),
                radius: Math.max(1.4, particle.radius * (0.18 + Math.random() * 0.16)),
                age: 0,
                life: 28 + Math.random() * 10,
                color: particle.color
            });
        }
    }

    function resetParticle(particle) {
        var fresh = makeParticle(particles.indexOf(particle));
        particle.x = fresh.x;
        particle.y = fresh.y;
        particle.vx = fresh.vx;
        particle.vy = fresh.vy;
        particle.radius = fresh.radius;
        particle.phase = fresh.phase;
        particle.impact = 0;
        particle.popped = false;
        particle.popAge = 0;
        particle.color = fresh.color;
    }

    function drawCuteParticle(particle) {
        if (particle.popped) {
            particle.popAge += 1;
            if (particle.popAge > 46) {
                resetParticle(particle);
            }
            return;
        }

        var pulse = 1 + Math.sin(particle.phase) * 0.06;
        var radius = particle.radius * pulse;
        var squash = Math.min(1, particle.impact);
        var radiusX = radius * (1 + squash * 0.18);
        var radiusY = radius * (1 - squash * 0.18);
        var glowRadius = radius * 2.7;
        var glow = context.createRadialGradient(
            particle.x,
            particle.y,
            0,
            particle.x,
            particle.y,
            glowRadius
        );

        glow.addColorStop(0, particle.color.replace(/[\d.]+\)$/, '0.14)'));
        glow.addColorStop(0.55, particle.color.replace(/[\d.]+\)$/, '0.045)'));
        glow.addColorStop(1, 'rgba(188, 226, 244, 0)');

        context.beginPath();
        context.fillStyle = glow;
        context.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.fillStyle = particle.color;
        context.ellipse(particle.x, particle.y, radiusX, radiusY, 0, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.fillStyle = 'rgba(255, 255, 255, 0.62)';
        context.arc(particle.x - radius * 0.28, particle.y - radius * 0.3, Math.max(1, radius * 0.28), 0, Math.PI * 2);
        context.fill();
        particle.impact *= 0.88;
    }

    function resolveCollisions() {
        for (var i = 0; i < particles.length; i += 1) {
            var a = particles[i];
            if (a.popped) continue;

            for (var j = i + 1; j < particles.length; j += 1) {
                var b = particles[j];
                if (b.popped) continue;

                var dx = b.x - a.x;
                var dy = b.y - a.y;
                var distance = Math.sqrt(dx * dx + dy * dy);
                var minimumDistance = a.radius + b.radius;

                if (distance === 0) {
                    dx = 0.01;
                    dy = 0;
                    distance = 0.01;
                }

                if (distance < minimumDistance) {
                    var nx = dx / distance;
                    var ny = dy / distance;
                    var overlap = minimumDistance - distance;
                    var correction = overlap * 0.52;

                    a.x -= nx * correction;
                    a.y -= ny * correction;
                    b.x += nx * correction;
                    b.y += ny * correction;

                    var relativeVelocity = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
                    if (relativeVelocity < 0) {
                        var impulse = -relativeVelocity * 0.92;
                        a.vx -= impulse * nx;
                        a.vy -= impulse * ny;
                        b.vx += impulse * nx;
                        b.vy += impulse * ny;
                        a.impact = Math.max(a.impact, 0.8);
                        b.impact = Math.max(b.impact, 0.8);
                    }
                }
            }
        }
    }

    function drawBursts() {
        bursts = bursts.filter(function (burst) {
            burst.age += 1;
            burst.x += burst.vx;
            burst.y += burst.vy;
            burst.vx *= 0.96;
            burst.vy *= 0.96;

            var fade = Math.max(0, 1 - burst.age / burst.life);

            context.beginPath();
            context.fillStyle = burst.color.replace(/[\d.]+\)$/, (0.34 * fade).toFixed(3) + ')');
            context.arc(burst.x, burst.y, burst.radius * (1 + burst.age / burst.life), 0, Math.PI * 2);
            context.fill();

            return burst.age < burst.life;
        });
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
            if (!particle.popped) {
                moveParticle(particle);
                particle.phase += 0.014;
            }
        });

        resolveCollisions();

        particles.forEach(function (particle) {
            drawCuteParticle(particle);
        });

        drawBursts();
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
    window.addEventListener('click', function (event) {
        var nearest = null;
        var nearestDistance = Infinity;

        particles.forEach(function (particle) {
            if (particle.popped) {
                return;
            }

            var dx = particle.x - event.clientX;
            var dy = particle.y - event.clientY;
            var distance = Math.sqrt(dx * dx + dy * dy);
            var hitRadius = Math.max(24, particle.radius * 3.2);

            if (distance < hitRadius && distance < nearestDistance) {
                nearest = particle;
                nearestDistance = distance;
            }
        });

        if (nearest) {
            popParticle(nearest);
        }
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
