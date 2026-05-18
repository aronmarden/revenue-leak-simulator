import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';

import {
  nerdlet,
  PlatformStateContext,
  Spinner,
  useAccountsQuery,
} from 'nr1';

import HolographicFunnel from '../../src/components/holographic-funnel';
import { useFlowLoader, useFlowWriter, useFetchUser } from '../../src/hooks';
import { useSignalsManager } from '../../src/hooks/use-signals-manager';
import {
  AppContext,
  FlowContext,
  FlowDispatchContext,
  SignalsContext,
  StagesContext,
} from '../../src/contexts';
import { flowReducer, FLOW_DISPATCH_COMPONENTS, FLOW_DISPATCH_TYPES } from '../../src/reducers';
import { MAX_ENTITIES_IN_STEP } from '../../src/constants';

import './styles.scss';

const FunnelHomeNerdlet = () => {
  const { accountId } = useContext(PlatformStateContext);
  const { user } = useFetchUser();
  const { data: accounts = [] } = useAccountsQuery();
  const [currentFlowId, setCurrentFlowId] = useState(null);

  const { flows, loading: flowsLoading } = useFlowLoader({ accountId });
  const { write: saveFlowToStorage } = useFlowWriter({ accountId, user });

  const firstFlow = useMemo(() => {
    if (!flows || flows.length === 0) return null;
    if (currentFlowId) return flows.find(f => f.id === currentFlowId) || flows[0];
    return flows[0];
  }, [flows, currentFlowId]);

  const [flow, dispatch] = useReducer(flowReducer, firstFlow || { stages: [] });

  useEffect(() => {
    if (firstFlow) {
      dispatch({
        type: FLOW_DISPATCH_TYPES.CHANGED,
        component: FLOW_DISPATCH_COMPONENTS.FLOW,
        updates: firstFlow,
      });
    }
  }, [firstFlow]);

  const saveFlow = useCallback(
    (updatedFlow) => saveFlowToStorage(updatedFlow),
    [saveFlowToStorage]
  );

  const app = useMemo(() => ({
    account: accountId,
    accounts,
    debugMode: false,
    maxEntitiesInStep: MAX_ENTITIES_IN_STEP,
    user,
  }), [accountId, accounts, user]);

  useEffect(() => {
    nerdlet.setConfig({
      headerTitle: 'Revenue Command Centre',
      headerType: nerdlet.HEADER_TYPE.CUSTOM,
    });
  }, []);

  if (flowsLoading) {
    return (
      <div className="funnel-loading">
        <Spinner />
        <p>Loading flows...</p>
      </div>
    );
  }

  if (!firstFlow) {
    return (
      <div className="funnel-empty">
        <h2>No Pathpoint flows found</h2>
        <p>Create a flow in Pathpoint first, then view it here as a holographic funnel.</p>
      </div>
    );
  }

  return (
    <AppContext.Provider value={app}>
      <FlowContext.Provider value={flow}>
        <FlowDispatchContext.Provider value={dispatch}>
          <StagesWithSignals
            flow={flow}
            accounts={accounts}
            saveFlow={saveFlow}
          />
        </FlowDispatchContext.Provider>
      </FlowContext.Provider>
    </AppContext.Provider>
  );
};

function StagesWithSignals({ flow, accounts, saveFlow }) {
  const { stages = [], refreshInterval } = flow;
  const [stagesData, setStagesData] = useState({ stages });
  const [signalsDetails, setSignalsDetails] = useState({});

  const { statuses } = useSignalsManager({
    stages,
    accounts,
    refreshInterval: refreshInterval || 60000,
    setIsLoading: () => {},
  });

  useEffect(() => {
    if (!statuses) return;
    const updatedStages = stages.map(stage => {
      let stageStatus = 'success';
      (stage.levels || []).forEach(level => {
        (level.steps || []).forEach(step => {
          (step.signals || []).forEach(sig => {
            const detail = statuses[sig.guid];
            if (detail) {
              if (detail.status === 'critical') stageStatus = 'critical';
              else if (detail.status === 'warning' && stageStatus !== 'critical') stageStatus = 'warning';
            }
          });
        });
      });
      return { ...stage, status: stageStatus };
    });
    setStagesData({ stages: updatedStages });
    setSignalsDetails(statuses);
  }, [statuses, stages]);

  return (
    <StagesContext.Provider value={stagesData}>
      <SignalsContext.Provider value={signalsDetails}>
        <HolographicFunnel />
      </SignalsContext.Provider>
    </StagesContext.Provider>
  );
}

export default FunnelHomeNerdlet;
