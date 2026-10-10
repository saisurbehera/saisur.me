import { useEffect, useRef, useState } from 'react';

export function timeLabel(seconds) {
  const whole = Math.round(seconds);
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
}

export function DepthChart({ models }) {
  const width = 760;
  const height = 240;
  const left = 34;
  const right = 718;
  const top = 22;
  const bottom = 198;
  const x = seconds => left + (seconds / 310) * (right - left);
  const y = depth => bottom - ((depth - 1) / 6) * (bottom - top);
  return (
    <figure className="oriole-chart">
      <div className="oriole-figure-heading"><span>Deepest floor reached</span><span>Recorded wall-clock time</span></div>
      <svg viewBox={`0 0 ${width} ${height}`} role="img"
        aria-label="Recorded progress over five minutes: GPT-6.1 Sol reaches floor 7, Astra floor 6, Sol and Luna floor 2.">
        {[1, 2, 3, 4, 5, 6, 7].map(depth => <g key={depth}>
          <line x1={left} x2={right} y1={y(depth)} y2={y(depth)} className="oriole-gridline" />
          <text x="16" y={y(depth) + 4} textAnchor="middle">{depth}</text>
        </g>)}
        {[0, 60, 120, 180, 240, 300].map(seconds => <text key={seconds}
          x={x(seconds)} y="223" textAnchor="middle">{timeLabel(seconds)}</text>)}
        {models.map(model => {
          const points = model.progress;
          const path = points.reduce((value, point, index) => index === 0
            ? `M ${x(point.seconds)} ${y(point.depth)}`
            : `${value} H ${x(point.seconds)} V ${y(point.depth)}`, '');
          const last = points[points.length - 1];
          return <g key={model.id}>
            <path d={path} fill="none" stroke={model.color} strokeWidth="2.5"
              strokeDasharray={model.id === 'gpt-6-luna' ? '4 5' : undefined} />
            <circle cx={x(last.seconds)} cy={y(last.depth)} r="4" fill={model.color} />
          </g>;
        })}
      </svg>
      <figcaption className="oriole-chart-legend">{models.map(model => <span key={model.id}>
        <i style={{ background: model.color }} aria-hidden="true" />{model.label}</span>)}</figcaption>
    </figure>
  );
}

export default function OrioleReplay({ models }) {
  const initial = models.find(model => model.id === 'gpt-6.1-sol');
  const [selected, setSelected] = useState(initial.id);
  const [index, setIndex] = useState(initial.keys);
  const [frames, setFrames] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(null);
  const cache = useRef(new Map());
  const model = models.find(candidate => candidate.id === selected);
  const current = frames?.[index] ?? model.finalFrame;

  useEffect(() => {
    const controller = new AbortController();
    setError(null);
    if (cache.current.has(selected)) {
      setFrames(cache.current.get(selected));
      return () => controller.abort();
    }
    fetch(`/static/oriole/${selected}.json`, { signal: controller.signal })
      .then(response => {
        if (!response.ok) throw new Error('The recorded replay could not be loaded.');
        return response.json();
      })
      .then(data => {
        if (!controller.signal.aborted) {
          cache.current.set(selected, data.frames);
          setFrames(data.frames);
        }
      })
      .catch(problem => {
        if (problem.name !== 'AbortError') setError(problem.message);
      });
    return () => controller.abort();
  }, [selected]);

  useEffect(() => {
    if (!playing || !frames) return undefined;
    if (index >= frames.length - 1) {
      setPlaying(false);
      return undefined;
    }
    const timer = setTimeout(() => setIndex(previous => previous + 1), 150);
    return () => clearTimeout(timer);
  }, [playing, frames, index]);

  function selectModel(next) {
    setPlaying(false);
    setSelected(next.id);
    setIndex(next.keys);
    setFrames(cache.current.get(next.id) ?? null);
    setError(null);
  }

  function jump(next) {
    setPlaying(false);
    setIndex(next);
  }

  return (
    <figure className="oriole-replay" aria-labelledby="oriole-replay-title">
      <div className="oriole-model-tabs" aria-label="Choose a recorded model run">
        {models.map(candidate => <button key={candidate.id} type="button"
          onClick={() => selectModel(candidate)} aria-pressed={selected === candidate.id}
          style={{ '--model-color': candidate.color }}>
          <span className="oriole-model-dot" aria-hidden="true" />{candidate.label}
        </button>)}
      </div>
      <div className="oriole-terminal">
        <div className="oriole-terminal-heading">
          <span id="oriole-replay-title">{model.label} / recorded episode</span>
          <span>Floor {current.depth} · turn {current.turn}</span>
        </div>
        <div className="oriole-terminal-scroll" tabIndex="0" aria-label="Scrollable recorded dungeon screen">
          <pre aria-label={`${model.label} dungeon screen on floor ${current.depth}`}>{current.screen}</pre>
        </div>
        <div className="oriole-terminal-stats">
          <span>HP <strong>{current.hp}/{current.maxHp}</strong></span>
          <span>Score <strong>{current.score}</strong></span>
          <span>Key <strong>{current.key}/{model.keys}</strong></span>
          <span>Last input <strong>{current.action === ' ' ? 'space' : current.action}</strong></span>
        </div>
      </div>
      <div className="oriole-playback">
        <button type="button" className="oriole-play-button" disabled={!frames}
          onClick={() => { if (index === model.keys) setIndex(0); setPlaying(previous => !previous); }}>
          {playing ? 'Pause' : 'Play replay'}
        </button>
        <label className="oriole-scrubber" htmlFor="oriole-replay-key">
          <span className="oriole-visually-hidden">Replay key number</span>
          <input id="oriole-replay-key" type="range" min="0" max={model.keys} step="1" value={index}
            disabled={!frames} onChange={event => jump(Number(event.target.value))}
            aria-valuetext={`Key ${current.key}, floor ${current.depth}, turn ${current.turn}`} />
        </label>
        <output htmlFor="oriole-replay-key">{timeLabel(current.seconds)} recorded</output>
      </div>
      <div className="oriole-floor-jumps" aria-label="Jump to a reached floor">
        <span>Jump to</span>
        {model.milestones.filter(event => event.name.startsWith('reached_floor_')).map(event =>
          <button key={event.name} type="button" disabled={!frames} onClick={() => jump(event.key)}
            aria-label={`Jump to ${model.label} reaching floor ${event.depth} at key ${event.key}`}>
            Floor {event.depth}
          </button>)}
        <button type="button" disabled={!frames} onClick={() => jump(model.keys)}>Final frame</button>
      </div>
      {error && <p role="alert" className="oriole-replay-error">{error} The final snapshot is still shown.</p>}
      <figcaption>
        These are the actual saved screens, one frame per key. Playback is accelerated;
        the time label shows when the frame was recorded. No model runs in this browser.
        All four characters were alive at the time limit. Stats beneath the screen come from
        the structured game observations; the original text screen is preserved as recorded.
      </figcaption>
      <div className="oriole-symbols"><span><b>@</b> player</span><span><b>#</b> corridor</span>
        <span><b>+</b> closed door</span><span><b>&gt;</b> stairs down</span><span><b>&lt;</b> stairs up</span></div>
    </figure>
  );
}
