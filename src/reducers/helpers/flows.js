export const updateFlow = ({ flow, saveFlow, updates }) => {
  const updatedFlow = {
    ...flow,
    ...updates,
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};

export const persistFlow = ({ flow, saveFlow }) => {
  if (saveFlow) saveFlow(flow);
  return flow;
};
