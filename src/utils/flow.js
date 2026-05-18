import { REFRESH_INTERVALS } from '../constants';

export const flowDocument = (flows = [], flowId) =>
  flows.find(({ id }) => id === flowId)?.document;

export const validRefreshInterval = (interval) =>
  interval && REFRESH_INTERVALS.some(({ value }) => interval === value)
    ? interval
    : REFRESH_INTERVALS[0].value;
