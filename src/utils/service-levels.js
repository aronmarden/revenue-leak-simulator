import { StatusIcon } from '@newrelic/nr-labs-components';

const {
  STATUSES: { UNKNOWN, CRITICAL, WARNING, SUCCESS },
} = StatusIcon;

const maxDecimalDigits = (target) => {
  const decimal = target.toString().split('.')[1];

  if (!decimal) return 2;
  if (decimal.length >= 6) return 6;
  return decimal.length + 1;
};

export const serviceLevelStatus = ({ attainment, target }) => {
  if (
    attainment == null ||
    typeof attainment !== 'number' ||
    target == null ||
    typeof target !== 'number'
  )
    return UNKNOWN;

  const attainmentRounded = attainment.toFixed(maxDecimalDigits(target));

  if (attainmentRounded < target) return CRITICAL;

  const remainingErrorBudget =
    target === 100
      ? 0
      : (Math.max(attainment - target, 0) / (100 - target)) * 100;
  if (remainingErrorBudget < 25) return WARNING;

  return SUCCESS;
};
