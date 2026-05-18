import React, { useCallback, useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

const STATUS_CSS = {
  success: '',
  warning: 'warning',
  critical: 'degraded',
  unknown: '',
};

function HudCard({ level, index, totalLevels, screenPos, signals = [] }) {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [manualPos, setManualPos] = useState(null);
  const dragRef = useRef(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (manualPos) return;
    if (!screenPos) return;
    const w = window.innerWidth;
    const offsetX = Math.min(320, w * 0.28);
    const cx = w / 2;
    const side = index % 2 === 0 ? 'left' : 'right';
    let x = side === 'right' ? cx + offsetX - 120 : cx - offsetX - 120;
    x = Math.max(10, Math.min(x, w - 250));
    const y = Math.max(60, Math.min(screenPos.y - 50, window.innerHeight - 160));
    setPos({ x, y });
  }, [screenPos, index, manualPos]);

  const onMouseDown = useCallback((e) => {
    if (e.target.closest('.resize-handle')) return;
    const rect = e.currentTarget.getBoundingClientRect();
    offsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    dragRef.current = true;
    e.preventDefault();
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!dragRef.current) return;
      setManualPos({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    };
    const onUp = () => { dragRef.current = false; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  const displayPos = manualPos || pos;
  const statusClass = STATUS_CSS[level.status] || '';
  const alertingSignals = signals.filter(s => s.status === 'critical' || s.status === 'warning');

  const stepsHealthy = signals.filter(s => s.status === 'success').length;
  const stepsTotal = signals.length;
  const subtitle = stepsTotal > 0
    ? `${stepsHealthy}/${stepsTotal} signals healthy`
    : level.status || 'monitoring';

  return (
    <div
      className={`hud-card ${statusClass}`}
      style={{ left: displayPos.x, top: displayPos.y, animationDelay: `${index * 0.1}s` }}
      onMouseDown={onMouseDown}
    >
      <div className="hud-name">
        <div className="hud-dot" />
        {level.label}
      </div>
      <div className="hud-val">
        {level.status === 'critical' ? 'CRITICAL' : level.status === 'warning' ? 'WARNING' : 'NOMINAL'}
      </div>
      <div className="hud-sub">{subtitle}</div>
      {alertingSignals.length > 0 && (
        <div className="hud-log">
          {alertingSignals.slice(0, 3).map((sig, i) => (
            <div key={i} className={`hud-log-entry ${sig.status === 'critical' ? 'error' : 'warn'}`}>
              {sig.name || sig.guid?.slice(0, 12)}
            </div>
          ))}
        </div>
      )}
      <div className="resize-handle" />
    </div>
  );
}

HudCard.propTypes = {
  level: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  totalLevels: PropTypes.number.isRequired,
  screenPos: PropTypes.object,
  signals: PropTypes.array,
};

export function HudOverlay({ levels, sceneRef, signalsByStage = {} }) {
  const [screenPositions, setScreenPositions] = useState({});
  const frameRef = useRef(0);

  useEffect(() => {
    let animId;
    function update() {
      animId = requestAnimationFrame(update);
      frameRef.current++;
      if (frameRef.current % 4 !== 0) return;
      if (!sceneRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      const positions = {};
      levels.forEach(lev => {
        positions[lev.id] = sceneRef.current.projectToScreen(lev.y + lev.height / 2, w, h);
      });
      setScreenPositions(positions);
    }
    update();
    return () => cancelAnimationFrame(animId);
  }, [levels, sceneRef]);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 15 }}>
      {levels.map((lev, i) => (
        <HudCard
          key={lev.id}
          level={lev}
          index={i}
          totalLevels={levels.length}
          screenPos={screenPositions[lev.id]}
          signals={signalsByStage[lev.id] || []}
        />
      ))}
    </div>
  );
}

HudOverlay.propTypes = {
  levels: PropTypes.array.isRequired,
  sceneRef: PropTypes.object.isRequired,
  signalsByStage: PropTypes.object,
};
