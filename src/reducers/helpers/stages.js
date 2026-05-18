import { uuid } from '../../utils';
import { reorderComponent } from './reorder';

export const addStage = ({ flow, saveFlow }) => {
  const { stages = [] } = flow;
  const related = stages.length ? { source: true } : {};
  const link = '';
  const updatedFlow = {
    ...flow,
    stages: [
      ...stages.map((stage, idx, arr) =>
        idx === arr.length - 1
          ? {
              ...stage,
              related: {
                ...stage.related,
                target: true,
              },
              link: stage.link || '',
            }
          : stage
      ),
      {
        id: uuid(),
        name: 'New Stage',
        levels: [],
        related,
        link,
      },
    ],
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};

export const updateStage = ({ flow, saveFlow, componentIds, updates }) => {
  const { stageId } = componentIds;
  if (!updates || !stageId) return flow;
  const updatedFlow = {
    ...flow,
    stages: flow.stages.map((stage) =>
      stage.id === stageId
        ? {
            ...stage,
            ...updates,
          }
        : stage
    ),
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};

export const deleteStage = ({ flow, saveFlow, componentIds }) => {
  const { stageId } = componentIds;
  if (!stageId) return flow;
  const updatedFlow = {
    ...flow,
    stages: flow.stages.filter(({ id }) => id !== stageId),
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};

export const reorderStages = ({ flow, saveFlow, updates }) => {
  const { sourceIndex, targetIndex } = updates;
  const updatedFlow = {
    ...flow,
    stages: reorderComponent(flow.stages, sourceIndex, targetIndex),
  };
  if (saveFlow) saveFlow(updatedFlow);
  return updatedFlow;
};
