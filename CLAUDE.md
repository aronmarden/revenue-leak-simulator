# Revenue Leak Simulator

## Overview

A holographic 3D conversion funnel visualisation built as both a standalone demo (GitHub Pages) and a New Relic nerdpack that renders Pathpoint v2 flow data as an interactive funnel.

## Two modes of operation

### Standalone demo (`index.html`)
- Opens directly in browser, no dependencies
- Hardcoded 6-stage e-commerce funnel with simulate/remediate buttons
- Deployed via GitHub Pages: push to main = live
- For CTO Days, exec demos, offline presentations

### Nerdpack mode (`nerdlets/funnel-home/`)
- Deployed as a New Relic nerdpack via `nr1 nerdpack:serve`
- Reads Pathpoint v2 flows from NerdStorage
- Dynamically builds funnel levels from stages in the flow
- Real-time signal status drives funnel colours (green/amber/red)
- HUD cards show live signal health per stage

## Architecture

```
index.html                          ← Standalone demo (GitHub Pages)
nerdlets/funnel-home/index.js       ← Nerdlet entry: loads flow, sets up contexts
src/components/holographic-funnel/
  ├── index.js                      ← React wrapper: reads StagesContext, mounts Three.js
  ├── scene.js                      ← Three.js scene (funnel geometry, particles, animation)
  ├── hud-overlay.js                ← React HUD cards positioned via 3D→screen projection
  └── styles.scss
src/hooks/                          ← Copied from Pathpoint v2 (data engine)
src/contexts/                       ← Copied from Pathpoint v2 (state management)
src/reducers/                       ← Copied from Pathpoint v2 (flow reducer)
src/queries/                        ← Copied from Pathpoint v2 (NerdGraph queries)
src/utils/                          ← Copied from Pathpoint v2 (status calculation)
src/constants/                      ← Copied from Pathpoint v2
```

## Data flow (nerdpack mode)

```
NerdStorage (Pathpoint flow document)
  → useFlowLoader → FlowContext
  → useSignalsManager (polls entity/alert status via NerdGraph)
  → StagesContext (stages with computed status)
  → HolographicFunnel component
    → stagesToFunnelLevels() maps stages → 3D positions
    → Three.js scene renders hexagonal rings
    → HUD overlay renders React cards at projected screen positions
```

## Development

### Standalone demo
```bash
python3 -m http.server 8080
open http://localhost:8080
```

### Nerdpack
```bash
npm install
nr1 nerdpack:uuid -g   # first time only
nr1 nerdpack:serve
# Open https://one.newrelic.com/?nerdpacks=local
```

## Key conventions

- React 17.0.2 (pinned by NR platform)
- Three.js bundled via webpack (nr1 handles this)
- `nr1` SDK imported at runtime, never from npm
- Pathpoint data layer copied verbatim — don't modify upstream patterns
- Standalone index.html must work without any NR dependencies
