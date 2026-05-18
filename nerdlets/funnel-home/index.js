import React, {
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import {
  nerdlet,
  PlatformStateContext,
  Spinner,
} from 'nr1';

import HolographicFunnel from '../../src/components/holographic-funnel';
import { useFlowLoader } from '../../src/hooks';
import {
  SignalsContext,
  StagesContext,
} from '../../src/contexts';

function applyDarkTheme() {
  // Swap the limited 3rd-app CSS for the full platform stylesheet
  const link = document.querySelector('link[href*="/platform/3rd-app"]');
  if (link) link.href = 'https://us-one.nr-assets.net/platform/one-app-dfc4401d.css';

  // Detect if parent is in dark mode
  let isDark = true; // default to dark for our use case
  try {
    isDark = window.parent.document.documentElement.classList.contains('wnd-Theme-dark');
  } catch (e) {
    // Cross-origin — fall back to prefers-color-scheme
    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // Apply theme class
  document.documentElement.classList.toggle('wnd-Theme-dark', isDark);
  document.documentElement.classList.toggle('wnd-Theme-light', !isDark);
}

const DEMO_STAGES = [
  { id: 'visitors', name: 'Website Visitors', status: 'success', levels: [] },
  { id: 'browse', name: 'Product Browsing', status: 'success', levels: [] },
  { id: 'cart', name: 'Add to Cart', status: 'success', levels: [] },
  { id: 'checkout', name: 'Checkout', status: 'success', levels: [] },
  { id: 'payment', name: 'Payment Processing', status: 'success', levels: [] },
  { id: 'delivery', name: 'Order & Delivery', status: 'success', levels: [] },
];

const FunnelHomeNerdlet = () => {
  const { accountId } = useContext(PlatformStateContext);
  const parsedAccountId = accountId ? parseInt(accountId, 10) : null;
  const [useDemo, setUseDemo] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  const { flows, loading: flowsLoading } = useFlowLoader({
    accountId: parsedAccountId,
  });

  useEffect(() => {
    nerdlet.setConfig({ headerTitle: 'Revenue Command Centre' });
    const t = setTimeout(() => setTimedOut(true), 3000);

    // Dark mode fix — nerdpack iframe doesn't inherit platform theme
    applyDarkTheme();

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!flowsLoading && (!flows || flows.length === 0)) {
      setUseDemo(true);
    } else if (flows && flows.length > 0) {
      setUseDemo(false);
    }
  }, [flows, flowsLoading]);

  useEffect(() => {
    if (timedOut && flowsLoading) setUseDemo(true);
  }, [timedOut, flowsLoading]);

  if (flowsLoading && !useDemo && !timedOut) {
    return (
      <div className="funnel-loading">
        <Spinner />
        <p>Loading flows...</p>
      </div>
    );
  }

  const stages = useDemo
    ? DEMO_STAGES
    : (flows?.[0]?.stages || DEMO_STAGES).map(s => ({
        ...s,
        status: s.status || 'success',
      }));

  return (
    <StagesContext.Provider value={{ stages }}>
      <SignalsContext.Provider value={{}}>
        <HolographicFunnel />
      </SignalsContext.Provider>
    </StagesContext.Provider>
  );
};

export default FunnelHomeNerdlet;
