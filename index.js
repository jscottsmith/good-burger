//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Good Burger: Sliders
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/
/**

Welcome to Good Burger, Sliders

Click, drag, release to slide a new burger.

*/

// preload
const BURGER_IMG = document.createElement('img');
BURGER_IMG.src =
    'https://s3-us-west-2.amazonaws.com/s.cdpn.io/105988/hamburger.png';
let IMAGE_LOADED = false;
BURGER_IMG.addEventListener('load', () => {
    IMAGE_LOADED = true;
});

function getRandomInt(min, max) {
    return Math.random() * (max - min) + min;
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Point
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    get position() {
        return {
            x: this.x,
            y: this.y,
        };
    }

    set position([x, y]) {
        this.x = x;
        this.y = y;
    }

    delta(point) {
        return [this.x - point.x, this.y - point.y];
    }

    distance(point) {
        const dx = point.x - this.x;
        const dy = point.y - this.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    applyVelocity(velocity) {
        this.x += velocity.vx;
        this.y += velocity.vy;
        return this;
    }

    angleRadians(point) {
        // radians = atan2(deltaY, deltaX)
        const y = point.y - this.y;
        const x = point.x - this.x;
        return Math.atan2(y, x);
    }

    angleDeg(point) {
        // degrees = atan2(deltaY, deltaX) * (180 / PI)
        const y = point.y - this.y;
        const x = point.x - this.x;
        return Math.atan2(y, x) * (180 / Math.PI);
    }
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Velocity
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Velocity {
    constructor(vx, vy) {
        this.vx = vx;
        this.vy = vy;
    }

    flip() {
        this.vx *= -1;
        this.vy *= -1;
        return this;
    }

    flipX() {
        this.vx *= -1;
        return this;
    }

    flipY() {
        this.vy *= -1;
        return this;
    }

    multiply(scalar) {
        this.vx *= scalar;
        this.vy *= scalar;
        return this;
    }

    divide(scalar) {
        this.vx /= scalar;
        this.vy /= scalar;
        return this;
    }
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Emoji
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Emoji {
    constructor(position, size, img) {
        this.position = position;
        this.size = size;
        this.img = img;
        this.ctx = document.createElement('canvas').getContext('2d');
        this.ctx.canvas.width = this.size;
        this.ctx.canvas.height = this.size;

        this.drawCanvas();
    }

    drawCanvas() {
        this.ctx.clearRect(0, 0, this.size, this.size);
        this.ctx.drawImage(this.img, 0, 0, this.size, this.size);
    }

    draw = ({ ctx, x, y }) => {
        ctx.drawImage(
            this.ctx.canvas,
            x,
            y,
            this.ctx.canvas.width,
            this.ctx.canvas.height
        );
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Element
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Element {
    dpr = window.devicePixelRatio || 1;
    toValue = value => value * this.dpr;
    draw = () => {};
    update = () => {};
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Explosion
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Explosion extends Element {
    constructor(power, multiplier, center) {
        super();
        this.center = center;
        this.power = power; // should be from 1 - 0
        this.color = '#4963cc';
        this.r = this.toValue(1);
        this.pi = Math.PI;
        this.pi2 = this.pi * 2;
        this.opacity = 0.5;
        this.multiplier = multiplier;
        this.dead = false;
    }

    update = () => {
        this.r += this.power;
        this.power *= 0.95;

        if (this.power < 0.01) {
            this.dead = true;
        }
    };

    drawShockWave(ctx, r) {
        ctx.strokeStyle = this.color;
        ctx.globalAlpha = this.opacity * this.power;
        ctx.globalCompositeOperation = 'lighter';
        ctx.lineWidth = this.toValue((1 - this.power) * this.multiplier - r);

        ctx.beginPath();
        ctx.arc(
            this.center.x,
            this.center.y,
            r * this.multiplier,
            0,
            this.pi2,
            true
        );
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
    }

    draw = ({ ctx }) => {
        this.drawShockWave(ctx, this.r);
        // this.drawShockWave(ctx, this.r + 3);
        // this.drawShockWave(ctx, this.r + 6);
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Burger
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Burger extends Element {
    constructor({ center, radius, velocity, id, emoji }) {
        super();
        this.emoji = emoji;
        this.center = center;
        this.radius = radius;
        this.velocity = velocity;
        this.mass = this.radius * 2;
        this.friction = 0.995;
        this.id = id;
    }

    circleToCircleCollision(circle) {
        const dx = this.center.x - circle.center.x;
        const dy = this.center.y - circle.center.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < circle.radius + this.radius) {
            return true;
        }
        return false;
    }

    collisionSound() {
        const freq = 120 + Math.random() * 50;
        // sound.play(freq, 0.1, 0.1);
        // sound.play(freq, 0.1, 0.2);
    }

    updateVelocity = (bounds, elements) => {
        // bounds collision
        // horiz
        if (this.center.x + this.radius >= bounds.x + bounds.width) {
            this.center.x = bounds.x + bounds.width - this.radius;
            this.velocity.flipX();
            this.collisionSound();
        } else if (this.center.x - this.radius <= bounds.x) {
            this.center.x = bounds.x + this.radius;
            this.velocity.flipX();
            this.collisionSound();
        }
        // vert
        if (this.center.y + this.radius >= bounds.y + bounds.height) {
            this.center.y = bounds.y + bounds.height - this.radius;
            this.velocity.flipY();
            this.collisionSound();
        } else if (this.center.y - this.radius <= bounds.y) {
            this.center.y = bounds.y + this.radius;
            this.velocity.flipY();
            this.collisionSound();
        }

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];

            if (element instanceof Burger && element.id !== this.id) {
                // Circle To Circle Collision
                const dx = this.center.x - element.center.x;
                const dy = this.center.y - element.center.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = element.radius + this.radius;

                if (distance < minDistance) {
                    // http://www.petercollingridge.co.uk/pygame-physics-simulation/collisions
                    // revisit this math... it needs to be fixed.
                    const tangent = Math.atan2(dy, dx);

                    const spread = minDistance - distance;
                    const ax = spread * Math.cos(tangent);
                    const ay = spread * Math.sin(tangent);

                    // solve collision (separation)
                    this.center.x += ax;
                    this.center.y += ay;
                    element.x -= ax;
                    element.y -= ay;

                    // give a punch to the speed
                    const punch = this.toValue(2);

                    this.velocity.vx += punch * Math.cos(tangent);
                    this.velocity.vy += punch * Math.sin(tangent);
                    element.velocity.vx -= punch * Math.cos(tangent);
                    element.velocity.vy -= punch * Math.sin(tangent);

                    this.collisionSound();

                    break;
                }
            }
        }

        this.velocity.multiply(this.friction);
    };

    draw = ({ ctx }) => {
        // ctx.beginPath();
        // ctx.arc(
        //     this.center.x,
        //     this.center.y,
        //     this.radius,
        //     0,
        //     2 * Math.PI,
        //     false
        // );
        // ctx.fillStyle = 'transparent';
        // ctx.fill();
        // ctx.lineWidth = this.toValue(2);
        // ctx.strokeStyle = '#ff00ff';
        // ctx.stroke();

        this.emoji.draw({
            ctx,
            x: this.center.x - this.radius,
            y: this.center.y - this.radius,
        });
    };

    update = ({ elements, bounds }) => {
        this.center.applyVelocity(this.velocity);
        this.updateVelocity(bounds, elements);
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Sling
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Sling extends Element {
    constructor() {
        super();
        this.mouseDown = false;
        this.start = null;
        this.elementId = 0;
        this.interaction = false;

        ['mousedown', 'touchstart'].forEach((event, touch) => {
            window.addEventListener(
                event,
                e => {
                    this.interaction = true;
                    this.mousedown = true;
                    const x = touch
                        ? e.targetTouches[0].clientX * this.dpr
                        : e.clientX * this.dpr;
                    const y = touch
                        ? e.targetTouches[0].clientY * this.dpr
                        : e.clientY * this.dpr;
                    this.start = new Point(x, y);
                },
                false
            );
        });
        ['mouseup', 'touchend'].forEach((event, touch) => {
            window.addEventListener(
                event,
                e => {
                    this.element = true;
                    this.mousedown = false;
                },
                false
            );
        });
    }

    addBurger({ addElement, mouse }) {
        const hw = this.toValue(window.innerWidth / 2);
        const hh = this.toValue(window.innerHeight / 2);
        const offX = hw / 20;
        const offY = hh / 20;
        const maxSize = hw / 10;
        const minSize = hw / 20;
        const rx = getRandomInt(hw - offX, hw + offX);
        const ry = getRandomInt(hh - offY, hh + offY);
        const rr = getRandomInt(maxSize, minSize);

        const start = this.start ? this.start : new Point(rx, ry);
        const radius = this.elementRadius ? this.elementRadius : rr;
        const _mouse = this.start ? mouse : new Point(hw, hh);
        const delta = start.delta(_mouse);

        const element = new Burger({
            id: this.elementId,
            center: start,
            radius: radius,
            velocity: new Velocity(...delta).multiply(0.25),
            emoji: new Emoji(
                new Point(start.x - radius, start.y - radius),
                radius * 2,
                BURGER_IMG
            ),
        });

        addElement(element);
        addElement(new Explosion(0.2, radius, new Point(start.x, start.y)));

        this.element = null;
        this.elementId += 1;

        // const freq = 200 + Math.random() * 50;
        // sound.play(freq, 0.5);
    }

    drawVector({ ctx, mouse }) {
        ctx.strokeStyle = '#fff';
        ctx.strokeWidth = this.toValue(2);
        ctx.beginPath();
        ctx.moveTo(this.start.x, this.start.y);
        ctx.lineTo(mouse.x, mouse.y);
        ctx.stroke();
    }

    drawPower({ ctx, mouse }) {
        this.elementRadius = this.start.distance(mouse) / 4;
        ctx.beginPath();
        ctx.arc(
            this.start.x,
            this.start.y,
            this.elementRadius,
            0,
            2 * Math.PI,
            false
        );
        ctx.lineWidth = this.toValue(2);
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    drawPoint({ ctx, mouse }) {
        const radius = this.toValue(10);
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, radius, 0, 2 * Math.PI, false);
        ctx.lineWidth = this.toValue(2);
        ctx.strokeStyle = '#fff';
        ctx.stroke();
    }

    draw = ({ ctx, mouse, addElement }) => {
        if (this.mousedown) {
            this.drawPoint({ ctx, mouse });
            this.drawVector({ ctx, mouse });
            this.drawPower({ ctx, mouse });
        }
        this.element && this.addBurger({ addElement, mouse });
    };

    update = ({ ctx, mouse, addElement, tick }) => {
        if (
            tick < 300 &&
            tick % 30 === 0 &&
            !this.interaction &&
            IMAGE_LOADED
        ) {
            this.addBurger({ mouse, addElement });
        }
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Background
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Background extends Element {
    drawText(ctx, canvas) {
        ctx.save();
        const ms = Math.max(canvas.width, canvas.height);
        const size = ms / 10;
        ctx.font = `900 italic ${size}px futura-pt, futura, sans-serif`;
        ctx.textAlign = 'center';

        const copy = 'Sliders';
        const x = canvas.width / 2;
        const y = canvas.height / 2 + size / 3;
        const depth = this.toValue(50);
        for (let i = 0; i <= depth; i++) {
            const v = i / depth;
            ctx.fillStyle = '#59dbd9';
            ctx.shadowColor = `hsl(${169 + 20 * v}, 64%, 60%)`;

            ctx.shadowOffsetX = depth - i;
            ctx.shadowOffsetY = depth - i;
            ctx.fillText(copy, x, y);
        }

        ctx.fillStyle = '#fff';
        ctx.fillText(copy, x, y);

        ctx.restore();
    }

    drawGradient(ctx, canvas) {
        const gradient = ctx.createLinearGradient(
            0,
            0,
            canvas.width,
            canvas.height
        );
        gradient.addColorStop(0, '#d4eef7');
        gradient.addColorStop(1, '#95e3e5');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    draw = ({ ctx, canvas }) => {
        this.drawGradient(ctx, canvas);
        this.drawText(ctx, canvas);
    };
}

//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡/
// Canvas
//*‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡‡*/

class Canvas {
    constructor(elements = []) {
        // setup a canvas
        this.canvas = document.getElementById('canvas');
        this.dpr = window.devicePixelRatio || 1;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.scale(this.dpr, this.dpr);
        this.tick = 0;

        // stuff
        this.elements = elements;
        this.mouse = new Point(
            window.innerWidth * this.dpr,
            window.innerHeight * this.dpr
        );
        this.sling = new Sling();
        // run
        this.setCanvasSize();
        this.setupListeners();
        this.render();
    }

    setupListeners() {
        window.addEventListener('resize', this.setCanvasSize);
        ['mousemove', 'touchmove'].forEach((event, touch) => {
            window.addEventListener(
                event,
                e => {
                    if (touch) {
                        e.preventDefault();
                        const x = e.targetTouches[0].clientX * this.dpr;
                        const y = e.targetTouches[0].clientY * this.dpr;
                        this.mouse.position = [x, y];
                    } else {
                        const x = e.clientX * this.dpr;
                        const y = e.clientY * this.dpr;
                        this.mouse.position = [x, y];
                    }
                },
                false
            );
        });
    }

    setCanvasSize = () => {
        this.canvas.width = window.innerWidth * this.dpr;
        this.canvas.height = window.innerHeight * this.dpr;
        this.canvas.style.width = window.innerWidth + 'px';
        this.canvas.style.height = window.innerHeight + 'px';
        this.bounds = {
            x: 0,
            y: 0,
            width: window.innerWidth * this.dpr,
            height: window.innerHeight * this.dpr,
        };
    };

    addElement = newElement => {
        this.elements = [...this.elements, newElement];
        return this.elements.length - 1;
    };

    removeElement(deleteIndex) {
        this.elements = this.elements.filter((el, i) => i !== deleteIndex);
        return this.elements;
    }

    update() {
        this.elements.map(({ update }) => update(this));
        this.elements = this.elements.filter(({ dead = false }) => !dead);
        this.sling.draw(this);
    }

    draw() {
        this.elements.map(({ draw }) => draw(this));
        this.sling.update(this);
    }

    render = () => {
        this.draw();
        this.update();
        ++this.tick;
        window.requestAnimationFrame(this.render);
    };
}

const canvas = new Canvas([new Background()]);
