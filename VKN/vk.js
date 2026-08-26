import './vk.css';

const PLANETS = [
  {
    name: 'Mercury',
    className: 'vk-planet--mercury',
    orbitClassName: 'vk-orbit--mercury',
    size: 'vk-planet__size--mercury',
    orbitDelay: '0s',
    rotationDuration: '8s',
    revolutionDuration: '18s',
    tilt: '-7deg',
    distance: 'var(--vk-orbit-mercury)',
  },
  {
    name: 'Venus',
    className: 'vk-planet--venus',
    orbitClassName: 'vk-orbit--venus',
    size: 'vk-planet__size--venus',
    orbitDelay: '-4s',
    rotationDuration: '14s',
    revolutionDuration: '28s',
    tilt: '3deg',
    distance: 'var(--vk-orbit-venus)',
  },
  {
    name: 'Earth',
    className: 'vk-planet--earth',
    orbitClassName: 'vk-orbit--earth',
    size: 'vk-planet__size--earth',
    orbitDelay: '-10s',
    rotationDuration: '12s',
    revolutionDuration: '36s',
    tilt: '0deg',
    distance: 'var(--vk-orbit-earth)',
  },
  {
    name: 'Mars',
    className: 'vk-planet--mars',
    orbitClassName: 'vk-orbit--mars',
    size: 'vk-planet__size--mars',
    orbitDelay: '-7s',
    rotationDuration: '15s',
    revolutionDuration: '48s',
    tilt: '2deg',
    distance: 'var(--vk-orbit-mars)',
  },
  {
    name: 'Jupiter',
    className: 'vk-planet--jupiter',
    orbitClassName: 'vk-orbit--jupiter',
    size: 'vk-planet__size--jupiter',
    orbitDelay: '-22s',
    rotationDuration: '8s',
    revolutionDuration: '72s',
    tilt: '-9deg',
    distance: 'var(--vk-orbit-jupiter)',
  },
  {
    name: 'Saturn',
    className: 'vk-planet--saturn',
    orbitClassName: 'vk-orbit--saturn',
    size: 'vk-planet__size--saturn',
    ringClassName: 'vk-planet__ring',
    orbitDelay: '-18s',
    rotationDuration: '10s',
    revolutionDuration: '90s',
    tilt: '11deg',
    distance: 'var(--vk-orbit-saturn)',
  },
  {
    name: 'Uranus',
    className: 'vk-planet--uranus',
    orbitClassName: 'vk-orbit--uranus',
    size: 'vk-planet__size--uranus',
    orbitDelay: '-30s',
    rotationDuration: '11s',
    revolutionDuration: '108s',
    tilt: '97deg',
    distance: 'var(--vk-orbit-uranus)',
  },
  {
    name: 'Neptune',
    className: 'vk-planet--neptune',
    orbitClassName: 'vk-orbit--neptune',
    size: 'vk-planet__size--neptune',
    orbitDelay: '-36s',
    rotationDuration: '13s',
    revolutionDuration: '128s',
    tilt: '28deg',
    distance: 'var(--vk-orbit-neptune)',
  },
];

const MOONS = [
  { name: 'Moon', className: 'vk-moon--earth', orbitClassName: 'vk-moon-orbit--earth', delay: '-2s', duration: '6s', distance: 'var(--vk-moon-earth)' },
  { name: 'Phobos', className: 'vk-moon--phobos', orbitClassName: 'vk-moon-orbit--phobos', delay: '-1s', duration: '5s', distance: 'var(--vk-moon-phobos)' },
  { name: 'Deimos', className: 'vk-moon--deimos', orbitClassName: 'vk-moon-orbit--deimos', delay: '-3s', duration: '9s', distance: 'var(--vk-moon-deimos)' },
];

export default function VK() {
  return (
    <main className="vk-page">
      <section className="vk-scene" aria-label="Three-dimensional solar system visualization">
        <div className="vk-scene__backdrop" aria-hidden="true" />
        <div className="vk-scene__stars vk-scene__stars--far" aria-hidden="true" />
        <div className="vk-scene__stars vk-scene__stars--near" aria-hidden="true" />

        <div className="vk-system">
          <div className="vk-system__tilt">
            <div className="vk-system__spin">
              <div className="vk-sun" aria-label="Sun">
                <div className="vk-sun__glow" />
                <div className="vk-sun__core" />
              </div>

              {PLANETS.map((planet) => (
                <div
                  key={planet.name}
                  className={`vk-orbit ${planet.orbitClassName}`}
                  style={{
                    ['--vk-orbit-distance']: planet.distance,
                    ['--vk-revolution-duration']: planet.revolutionDuration,
                    ['--vk-orbit-delay']: planet.orbitDelay,
                    ['--vk-tilt']: planet.tilt,
                  }}
                >
                  <div className="vk-orbit__track" aria-hidden="true" />
                  <div className="vk-orbit__plane">
                    <div
                      className={`vk-planet ${planet.className}`}
                      style={{
                        ['--vk-rotation-duration']: planet.rotationDuration,
                        ['--vk-orbit-delay']: planet.orbitDelay,
                      }}
                      aria-label={planet.name}
                    >
                      <div className={`vk-planet__body ${planet.size}`}>
                        {planet.ringClassName ? <div className={planet.ringClassName} aria-hidden="true" /> : null}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              <div className="vk-belt vk-belt--asteroid" aria-hidden="true">
                <div className="vk-belt__orbit" />
                <div className="vk-belt__particles" />
              </div>

              <div className="vk-reference vk-reference--inner" aria-hidden="true" />
              <div className="vk-reference vk-reference--outer" aria-hidden="true" />
            </div>
          </div>

          <div className="vk-moon-system" aria-hidden="true">
            {MOONS.map((moon) => (
              <div
                key={moon.name}
                className={`vk-moon-orbit ${moon.orbitClassName}`}
                style={{
                  ['--vk-moon-distance']: moon.distance,
                  ['--vk-moon-duration']: moon.duration,
                  ['--vk-moon-delay']: moon.delay,
                }}
              >
                <div className="vk-moon-orbit__plane">
                  <div className={`vk-moon ${moon.className}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <aside className="vk-hud" aria-label="Solar system details">
          <p className="vk-hud__eyebrow">VK Solar System</p>
          <h1 className="vk-hud__title">Accurate orbital scene</h1>
          <p className="vk-hud__copy">
            A layered 3D-style reconstruction with orbital planes, rotating bodies, and depth cues for a 360-degree visual presentation.
          </p>
        </aside>
      </section>
    </main>
  );
}
