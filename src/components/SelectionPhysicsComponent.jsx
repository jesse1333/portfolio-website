import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { computePyramidStackLevel } from '../matter/pyramidDetection';

const BASE_H_DESKTOP = 470;
const BASE_H_MOBILE = 360;
const WALL = 50;
const obstaclePalette = ['#f19648', '#f5d259', '#f55a3c', '#063e7b', '#ececd1'];
/** Base → middle → cap (triangle). */
const PYRAMID_COLORS = [obstaclePalette[0], obstaclePalette[1], obstaclePalette[2]];

/** Wide trapezoid (pyramid base). */
const BASE_TRAP = { width: 168, height: 48, slope: 0.34 };
/** Narrower trapezoid (middle tier). */
const MID_TRAP = { width: 112, height: 42, slope: 0.36 };
/** Equilateral triangle (apex); `radius` is Matter’s polygon circumradius. */
const CAP_TRI = { sides: 3, radius: 46 };

/** Radians per second while A or D is held (A = CCW, D = CW). */
const KEY_ROTATE_RAD_PER_SEC = 2.75;

function isTypingTarget(target) {
  if (!target || typeof target.nodeName !== 'string') return false;
  const tag = target.nodeName.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select') return true;
  return Boolean(target.isContentEditable);
}

const PHYSICS_HINT_ASIDE = (
  <>
    <span style={{ whiteSpace: 'nowrap' }}>
      Try to build a <span style={{ color: '#f5d259' }}>pyramid!</span>
    </span>
    <br />
    {`Press 'a' and 'd' to rotate.`}
  </>
);

const PHYSICS_HINT_ABOUT = (
  <>
    Click on that button in the corner.

    <br />
    I know you want to :)
  </>
);

/**
 * Three pyramid pieces spawn scattered; stack level: 0 none, 1 mid on base, 2 full pyramid.
 * @param {'about' | 'aside'} [props.variant] — `about`: “A little bit about me” copy; `aside`: build / rotate hint.
 * @param {(level: 0|1|2) => void} [props.onStackLevelChange] — pyramid tier for driving UI (e.g. About personal sections).
 */
export default function SelectionPhysicsComponent({ variant = 'aside', onStackLevelChange }) {
  const mountRef = useRef(null);
  const onStackLevelChangeRef = useRef(onStackLevelChange);

  useEffect(() => {
    onStackLevelChangeRef.current = onStackLevelChange;
  }, [onStackLevelChange]);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const isMobileViewport = window.matchMedia('(max-width: 640px)').matches;
    const sceneHeight = isMobileViewport ? BASE_H_MOBILE : BASE_H_DESKTOP;

    const Engine = Matter.Engine;
    const Render = Matter.Render;
    const Runner = Matter.Runner;
    const Bodies = Matter.Bodies;
    const Body = Matter.Body;
    const Composite = Matter.Composite;
    const Events = Matter.Events;
    const Mouse = Matter.Mouse;
    const MouseConstraint = Matter.MouseConstraint;
    const Common = Matter.Common;

    const engine = Engine.create();

    const BASE_W = isMobileViewport ? 340 : 460;
    const dims = { w: BASE_W };

    const render = Render.create({
      element: mount,
      engine,
      options: {
        width: BASE_W,
        height: sceneHeight,
        wireframes: false,
        showAngleIndicator: true,
        background: 'transparent',
      },
    });

    let pieces = [];
    let walls = [];
    let lastLevel = 0;

    const buildScene = (w) => {
      for (const b of pieces) {
        Composite.remove(engine.world, b);
      }
      pieces = [];
      for (const b of walls) {
        Composite.remove(engine.world, b);
      }
      walls = [];

      const floorY = sceneHeight - WALL / 2;
      const innerW = w - 2 * WALL;
      const padX = Math.min(100, Math.max(24, innerW * 0.18));
      let xMin = WALL + padX;
      let xMax = w - WALL - padX;
      if (xMax <= xMin + 8) {
        const cx = w * 0.5;
        xMin = cx - 36;
        xMax = cx + 36;
      }
      const yMin = WALL + 55;
      const yMax = floorY - 70;

      const scatterBody = (body) => {
        Body.setPosition(body, {
          x: Common.random(xMin, xMax),
          y: Common.random(yMin, yMax),
        });
        Body.setAngle(body, Common.random(-Math.PI * 0.85, Math.PI * 0.85));
        Body.setVelocity(body, {
          x: Common.random(-1.8, 1.8),
          y: Common.random(-0.8, 2.2),
        });
        Body.setAngularVelocity(body, Common.random(-0.12, 0.12));
      };

      const base = Bodies.trapezoid(0, 0, BASE_TRAP.width, BASE_TRAP.height, BASE_TRAP.slope, {
        render: { fillStyle: PYRAMID_COLORS[0] },
      });
      scatterBody(base);

      const mid = Bodies.trapezoid(0, 0, MID_TRAP.width, MID_TRAP.height, MID_TRAP.slope, {
        render: { fillStyle: PYRAMID_COLORS[1] },
      });
      scatterBody(mid);

      const cap = Bodies.polygon(0, 0, CAP_TRI.sides, CAP_TRI.radius, {
        render: { fillStyle: PYRAMID_COLORS[2] },
      });
      scatterBody(cap);

      pieces = [base, mid, cap];

      const top = Bodies.rectangle(w / 2, 0, w, WALL, { isStatic: true });
      const bottom = Bodies.rectangle(w / 2, sceneHeight, w, WALL, { isStatic: true });
      const left = Bodies.rectangle(0, sceneHeight / 2, WALL, sceneHeight, { isStatic: true });
      const right = Bodies.rectangle(w, sceneHeight / 2, WALL, sceneHeight, { isStatic: true });
      walls = [top, bottom, left, right];

      Composite.add(engine.world, [...pieces, ...walls]);

      lastLevel = 0;
      onStackLevelChangeRef.current?.(0);
    };

    buildScene(BASE_W);

    engine.render = render;

    const mouse = Mouse.create(render.canvas);
    const mouseConstraint = MouseConstraint.create(engine, {
      mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false,
        },
      },
    });
    Composite.add(engine.world, mouseConstraint);
    render.mouse = mouse;

    const keysHeld = { a: false, d: false };

    const onKeyDown = (e) => {
      if (isTypingTarget(e.target)) return;
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k !== 'a' && k !== 'd') return;
      if (k === 'a') keysHeld.a = true;
      if (k === 'd') keysHeld.d = true;
      e.preventDefault();
    };

    const onKeyUp = (e) => {
      const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      if (k === 'a') keysHeld.a = false;
      if (k === 'd') keysHeld.d = false;
    };

    const onWindowBlur = () => {
      keysHeld.a = false;
      keysHeld.d = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onWindowBlur);

    const onAfterUpdate = (event) => {
      const body = mouseConstraint.body;
      if (body && !body.isStatic && pieces.includes(body) && (keysHeld.a || keysHeld.d)) {
        Body.setAngularVelocity(body, 0);
        const sign = (keysHeld.d ? 1 : 0) - (keysHeld.a ? 1 : 0);
        if (sign !== 0) {
          const deltaMs = typeof event.delta === 'number' ? event.delta : 1000 / 60;
          const dt = deltaMs / 1000;
          Body.rotate(body, sign * KEY_ROTATE_RAD_PER_SEC * dt);
        }
      }

      if (pieces.length !== 3) return;
      const [base, mid, cap] = pieces;
      const next = computePyramidStackLevel(base, mid, cap);
      if (next !== lastLevel) {
        lastLevel = next;
        onStackLevelChangeRef.current?.(next);
      }
    };
    Events.on(engine, 'afterUpdate', onAfterUpdate);

    Matter.Render.lookAt(render, {
      min: { x: 0, y: 0 },
      max: { x: BASE_W, y: sceneHeight },
    });

    const runner = Runner.create();
    Runner.run(runner, engine);
    Render.run(render);

    const applyLayout = (cssWidth) => {
      if (!cssWidth || cssWidth < 120) return;
      const nw = Math.max(220, Math.floor(cssWidth));
      if (nw === dims.w) return;

      dims.w = nw;
      Render.setSize(render, nw, sceneHeight);
      buildScene(nw);
      Matter.Render.lookAt(render, {
        min: { x: 0, y: 0 },
        max: { x: nw, y: sceneHeight },
      });
    };

    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect?.width;
      if (typeof w === 'number' && w > 0) applyLayout(w);
    });
    ro.observe(mount);
    requestAnimationFrame(() => {
      if (mount.clientWidth > 0) applyLayout(mount.clientWidth);
    });

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
      Events.off(engine, 'afterUpdate', onAfterUpdate);
      ro.disconnect();
      Render.stop(render);
      Runner.stop(runner);
      Composite.clear(engine.world, false);
      Engine.clear(engine);
      if (render.canvas) {
        render.canvas.remove();
      }
      render.textures = {};
    };
  }, []);

  return (
    <div className="selection-physics-component">
      <div className="selection-physics-component__frame">
        <p className="selection-physics-component__hint">
          <span className="selection-physics-component__hint-inner">
            {variant === 'about' ? PHYSICS_HINT_ABOUT : PHYSICS_HINT_ASIDE}
          </span>
        </p>
        <div ref={mountRef} className="selection-physics-component__mount" />
      </div>
    </div>
  );
}
