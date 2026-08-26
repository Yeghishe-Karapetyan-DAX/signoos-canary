import React, { useEffect, useMemo, useRef, useState } from 'react';
import './yk.css';

const PLANETS = [
  {
    name: 'Mercury',
    className: 'yk-planet--mercury',
    orbitClassName: 'yk-orbit--mercury',
    sizeClassName: 'yk-size--mercury',
    periodDays: 87.97,
    distanceAu: 0.39,
    radiusKm: 2440,
    tiltDeg: 0.03,
  },
  {
    name: 'Venus',
    className: 'yk-planet--venus',
    orbitClassName: 'yk-orbit--venus',
    sizeClassName: 'yk-size--venus',
    periodDays: 224.7,
    distanceAu: 0.72,
    radiusKm: 6052,
    tiltDeg: 177.4,
  },
  {
    name: 'Earth',
    className: 'yk-planet--earth',
    orbitClassName: 'yk-orbit--earth',
    sizeClassName: 'yk-size--earth',
    periodDays: 365.25,
    distanceAu: 1,
    radiusKm: 6371,
    tiltDeg: 23.44,
  },
  {
    name: 'Mars',
    className: 'yk-planet--mars',
    orbitClassName: 'yk-orbit--mars',
    sizeClassName: 'yk-size--mars',
    periodDays: 686.98,
    distanceAu: 1.52,
    radiusKm: 3390,
    tiltDeg: 25.19,
  },
  {
    name: 'Jupiter',
    className: 'yk-planet--jupiter',
    orbitClassName: 'yk-orbit--jupiter',
    sizeClassName: 'yk-size--jupiter',
    periodDays: 4332.59,
    distanceAu: 5.2,
    radiusKm: 69911,
    tiltDeg: 3.13,
  },
  {
    name: 'Saturn',
    className: 'yk-planet--saturn',
    orbitClassName: 'yk-orbit--saturn',
    sizeClassName: 'yk-size--saturn',
    periodDays: 10759,
    distanceAu: 9.58,
    radiusKm: 58232,
    tiltDeg: 26.73,
  },
  {
    name: 'Uranus',
    className: 'yk-planet--uranus',
    orbitClassName: 'yk-orbit--uranus',
    sizeClassName: 'yk-size--uranus',
    periodDays: 30688.5,
    distanceAu: 19.2,
    radiusKm: 25362,
    tiltDeg: 97.77,
  },
  {
    name: 'Neptune',
    className: 'yk-planet--neptune',
    orbitClassName: 'yk-orbit--neptune',
    sizeClassName: 'yk-size--neptune',
    periodDays: 60182,
    distanceAu: 30.1,
    radiusKm: 24622,
    tiltDeg: 28.32,
  },
];

const ORBIT_SCALES = [0.16, 0.23, 0.3, 0.38, 0.53, 0.68, 0.83, 0.98];
const DEFAULT_ROTATION = { x: -18, y: -28 };
const DEFAULT_ZOOM = 1;
const BASE_PERIOD = 87.97;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatDuration(periodDays) {
  return `${Math.max(periodDays / 18, 5)}s`;
}

export default function YK() {
  const [rotation, setRotation] = useState(DEFAULT_ROTATION);
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef(null);
  const lastPinchDistance = useRef(null);

  const sceneStyle = useMemo(
    () => ({
      '--yk-rotate-x': `${rotation.x}deg`,
      '--yk-rotate-y': `${rotation.y}deg`,
      '--yk-zoom': zoom,
    }),
    [rotation, zoom],
  );

  useEffect(() => {
    const onPointerMove = (event) => {
      if (!dragRef.current) return;
      const dx = event.clientX - dragRef.current.x;
      const dy = event.clientY - dragRef.current.y;
      setRotation((current) => ({
        x: clamp(current.x - dy * 0.18, -75, 75),
        y: current.y + dx * 0.18,
      }));
      dragRef.current = { x: event.clientX, y: event.clientY };
    };

    const onPointerUp = () => {
      dragRef.current = null;
      setIsDragging(false);
    };

    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, []);

  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragRef.current = { x: event.clientX, y: event.clientY };
    setIsDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handleWheel = (event) => {
    event.preventDefault();
    setZoom((current) => clamp(current - event.deltaY * 0.0012, 0.55, 1.8));
  };

  const handleTouchStart = (event) => {
    if (event.touches.length === 2) {
      const [a, b] = event.touches;
      lastPinchDistance.current = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    }
  };

  const handleTouchMove = (event) => {
    if (event.touches.length !== 2 || !lastPinchDistance.current) return;
    const [a, b] = event.touches;
    const distance = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
    const delta = distance - lastPinchDistance.current;
    lastPinchDistance.current = distance;
    setZoom((current) => clamp(current + delta * 0.004, 0.55, 1.8));
  };

  const handleTouchEnd = () => {
    lastPinchDistance.current = null;
  };

  return (
    <main className="yk-page" aria-label="YK solar system page">
      <section
        className={`yk-scene ${isDragging ? 'yk-scene--dragging' : ''}`}
        aria-label="Interactive three-dimensional solar system"
        onPointerDown={handlePointerDown}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={sceneStyle}
      >
        <div className="yk-sky" aria-hidden="true" />
        <div className="yk-vignette" aria-hidden="true" />

        <div className="yk-camera">
          <div className="yk-system">
            <div className="yk-orbital-light yk-orbital-light--primary" aria-hidden="true" />
            <div className="yk-orbital-light yk-orbital-light--secondary" aria-hidden="true" />

            <div className="yk-sun-shell" aria-hidden="true">
              <div className="yk-sun">
                <span className="yk-sun-core" />
                <span className="yk-sun-glow" />
              </div>
            </div>

            <div className="yk-orbit-stack" aria-hidden="true">
              {PLANETS.map((planet, index) => {
                const orbitScale = ORBIT_SCALES[index];
                const revolution = formatDuration(planet.periodDays / BASE_PERIOD * 10);
                return (
                  <div
                    key={planet.name}
                    className={`yk-orbit ${planet.orbitClassName}`}
                    style={{ '--yk-orbit-scale': orbitScale, animationDuration: revolution }}
                  >
                    <div
                      className={`yk-planet-shell ${planet.className}`}
                      style={{ animationDuration: revolution }}
                    >
                      <div
                        className={`yk-planet ${planet.sizeClassName} ${planet.name === 'Saturn' ? 'yk-ringed' : ''}`}
                        style={{ '--yk-tilt': `${planet.tiltDeg}deg` }}
                      >
                        {planet.name === 'Earth' ? <span className="yk-planet-moon" aria-hidden="true" /> : null}
                        {planet.name === 'Saturn' ? <span className="yk-planet-rings" aria-hidden="true" /> : null}
                        <span className="yk-planet-label">{planet.name}</span>
                        <span className="yk-planet-meta">{planet.distanceAu} AU · {planet.radiusKm.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="yk-hud" aria-label="Solar system information">
            <p className="yk-kicker">YK page</p>
            <h1 className="yk-title">Interactive Solar System</h1>
            <p className="yk-copy">
              Drag to rotate the scene, scroll or pinch to zoom, and inspect a layered orbital model with relative scale,
              synchronized revolution, and a 3D camera presentation.
            </p>

            <dl className="yk-stat-grid">
              <div className="yk-stat">
                <dt className="yk-stat-label">View</dt>
                <dd className="yk-stat-value">360°</dd>
              </div>
              <div className="yk-stat">
                <dt className="yk-stat-label">Zoom</dt>
                <dd className="yk-stat-value">{zoom.toFixed(2)}x</dd>
              </div>
              <div className="yk-stat">
                <dt className="yk-stat-label">Rotation</dt>
                <dd className="yk-stat-value">{Math.round(rotation.y)}°</dd>
              </div>
            </dl>
          </aside>

          <div className="yk-controls" aria-hidden="true">
            <span>Drag to rotate</span>
            <span>Wheel or pinch to zoom</span>
            <span>3D orbital depth</span>
          </div>
        </div>
      </section>
    </main>
  );
}
