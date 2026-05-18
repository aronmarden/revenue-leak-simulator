export const deleteSignal = ({ flow, saveFlow, componentIds }) => {
  const { stageId, levelId, stepId, signalId } = componentIds;
  if (!stageId || !levelId || !stepId || !signalId) return flow;

  const updatedFlow = {
    ...flow,
    stages: flow.stages.map((stage) =>
      stage.id === stageId
        ? {
            ...stage,
            levels: stage.levels.map((level) =>
              level.id === levelId
                ? {
                    ...level,
                    steps: level.steps.map((step) =>
                      step.id === stepId
                        ? {
                            ...step,
                            signals: step.signals.filter(
                              ({ guid }) => guid !== signalId
                            ),
                          }
                        : step
                    ),
                  }
                : level
            ),
          }
        : stage
    ),
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};
