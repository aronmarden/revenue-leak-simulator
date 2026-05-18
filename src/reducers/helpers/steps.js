import { uuid } from '../../utils';
import { reorderComponent } from './reorder';

export const addStep = ({ flow, saveFlow, componentIds, updates }) => {
  const { stageId, levelId } = componentIds;
  if (!updates || !stageId) return flow;
  const newStep = { id: uuid(), signals: [], title: updates.title };

  const updatedFlow = {
    ...flow,
    stages: flow.stages.map((stage) =>
      stage.id === stageId
        ? {
            ...stage,
            levels: levelId
              ? stage.levels.map((level) =>
                  level.id === levelId
                    ? {
                        ...level,
                        steps: [...level.steps, newStep],
                      }
                    : level
                )
              : [...stage.levels, { id: uuid(), steps: [newStep] }],
          }
        : stage
    ),
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};

export const updateStep = ({ flow, saveFlow, componentIds, updates }) => {
  const { stageId, levelId, stepId } = componentIds;
  if (!updates || !stageId || !levelId || !stepId) return flow;

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
                            ...updates,
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

export const deleteStep = ({ flow, saveFlow, componentIds }) => {
  const { stageId, levelId, stepId } = componentIds;
  if (!stageId || !levelId || !stepId) return flow;

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
                    steps: level.steps.filter(({ id }) => id !== stepId),
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

export const reorderSteps = ({ flow, saveFlow, componentIds, updates }) => {
  const { stageId, levelId } = componentIds;
  if (!stageId || !levelId) return flow;
  const { sourceIndex, targetIndex } = updates;
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
                    steps: reorderComponent(
                      level.steps,
                      sourceIndex,
                      targetIndex
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
