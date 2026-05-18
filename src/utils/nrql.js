import { NRQL_DAYS } from '../constants';

const parseNrqlForDate = (nrql, token) => {
  let re = new RegExp(`${token} *'`, 'i');
  const result = nrql.match(re);

  if (result) {
    re = /'/gi;
    const idx = re.exec(
      nrql.substring(result.index + result[0].length + 1)
    ).index;

    return `${nrql.substring(0, result.index - 1)} ${nrql.substring(
      result.index + idx + result[0].length + 3
    )}`;
  } else {
    return nrql;
  }
};

export const removeDateClauseFromNrql = (nrql, token) => {
  const tokens = nrql.toLowerCase().split(' ');

  if (tokens.includes(token)) {
    const index = tokens.indexOf(token);
    if (
      (token === 'until' && tokens[index + 1] === 'now') ||
      NRQL_DAYS.includes(tokens[index + 1])
    ) {
      const arr = nrql.split(' ');
      arr.splice(index, 2);
      return arr.join(' ');
    } else if (tokens[index + 1].startsWith("'")) {
      return parseNrqlForDate(nrql, token); // handle literal dates - i.e. '2023-12-29T22:57:19-0800'
    } else if (['this', 'last'].includes(tokens[index + 1])) {
      const arr = nrql.split(' ');
      arr.splice(index, 3);
      return arr.join(' ');
    } else {
      const arr = nrql.split(' ');
      arr.splice(index, 4);
      return arr.join(' ');
    }
  } else {
    return nrql;
  }
};

export const sanitizeQuery = (nrql) => {
  return nrql.replace(/\s+/g, ' ');
};
