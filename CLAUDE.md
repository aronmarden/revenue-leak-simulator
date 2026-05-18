# Revenue Leak Simulator

## Overview

An interactive 3D holographic visualisation demonstrating business observability concepts. Shows a conversion funnel where users can simulate a traffic spike failure, watch revenue drop in real-time, then trigger auto-remediation to see recovery.

## How it works

Single `index.html` file deployed via GitHub Pages. No build step, no dependencies to install.

- **Healthy state**: Green holographic funnel with live metrics in HUD cards
- **Failure state**: Red pulsing cascade from bottom-up, HUD cards show degraded metrics
- **Recovery state**: Cyan/teal restoration from top-down, shows total revenue protected

## Tech stack

- Three.js (ES modules via CDN importmap)
- UnrealBloomPass for holographic glow
- Pure CSS for HUD overlay cards
- No build tools, no npm, no framework

## Development

Serve locally:
```bash
python3 -m http.server 8080
# Open http://localhost:8080
```

## Performance notes

- Pixel ratio capped at 1.5x (bloom at full Retina is unnecessary)
- Bloom rendered at half resolution
- Dust particles use rotation instead of per-frame buffer uploads
- Leader lines update every 4th frame
- 15 data particles, 150 dust particles (reduced from higher counts)

## Deployment

Hosted on GitHub Pages from the `main` branch root. Push to main = deployed.
