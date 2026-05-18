import { uuid } from './crypto';
import { DEFAULT_DATETIME_FORMATTER } from '../constants';

export const sanitizeKpis = (kpis = []) =>
  kpis.map(({ accountIds = [], name, nrqlQuery, type }) => ({
    id: uuid(),
    accountIds,
    name,
    nrqlQuery,
    type,
  }));

export const formatKpiHoverDatime = (dateClause) => {
  if (!dateClause) {
    return '';
  } else if (!dateClause.includes('AGO')) {
    let date;
    try {
      date = new Date(Number(dateClause));
      return DEFAULT_DATETIME_FORMATTER.format(date).replace(
        /[APM]{2}/,
        (match) => match.toLowerCase()
      );
    } catch (err) {
      return dateClause;
    }
  } else {
    return dateClause.toLowerCase();
  }
};
