import React, { useCallback, useContext, useEffect, useMemo, useRef } from 'react';

import { StagesContext, SignalsContext } from '../../contexts';
import { createScene, stagesToFunnelLevels } from './scene';
import { HudOverlay } from './hud-overlay';

import './styles.scss';

function getSignalsByStage(stages, signalsDetails) {
  const result = {};
  (stages || []).forEach(stage => {
    const signals = [];
    (stage.levels || []).forEach(level => {
      (level.steps || []).forEach(step => {
        (step.signals || []).forEach(sig => {
          const detail = signalsDetails[sig.guid] || {};
          signals.push({
            guid: sig.guid,
            name: detail.name || sig.name || sig.guid?.slice(0, 16),
            status: detail.status || sig.status || 'unknown',
            type: sig.type,
          });
        });
      });
    });
    result[stage.id] = signals;
  });
  return result;
}

export default function HolographicFunnel() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const { stages = [] } = useContext(StagesContext) || {};
  const signalsDetails = useContext(SignalsContext) || {};

  const funnelLevels = useMemo(() => stagesToFunnelLevels(stages), [stages]);

  const signalsByStage = useMemo(
    () => getSignalsByStage(stages, signalsDetails),
    [stages, signalsDetails]
  );

  useEffect(() => {
    if (!canvasRef.current) return;
    const sceneApi = createScene(canvasRef.current, funnelLevels);
    sceneRef.current = sceneApi;
    sceneApi.start();
    return () => sceneApi.stop();
  }, []);

  useEffect(() => {
    if (!sceneRef.current) return;
    sceneRef.current.buildFunnelLevels(funnelLevels);
    sceneRef.current.updateStageStatuses(funnelLevels);
  }, [funnelLevels]);

  useEffect(() => {
    const onResize = () => {
      if (!canvasRef.current || !sceneRef.current) return;
      sceneRef.current.resize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
    <div className="holographic-funnel-container">
      <canvas ref={canvasRef} className="holographic-funnel-canvas" />
      <HudOverlay
        levels={funnelLevels}
        sceneRef={sceneRef}
        signalsByStage={signalsByStage}
      />
    </div>
  );
}
