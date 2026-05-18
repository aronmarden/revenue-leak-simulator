import { useEffect, useRef, useState } from 'react';
import { useEntitiesByGuidsQuery, useNerdGraphQuery } from 'nr1';

import {
  queriesGQL,
  serviceLevelEntityFragment as entityFragmentExtension,
} from '../../queries';

const MAX_ITEMS_IN_BATCH = 25;

const useFetchServiceLevels = ({ guids = [] }) => {
  const [data, setData] = useState({});
  const [entityGuids, setEntityGuids] = useState([]);
  const [query, setQuery] = useState(queriesGQL());
  const guidsSet = useRef(new Set([]));
  const guidsIndexMarker = useRef(0);
  const serviceLevels = useRef({});
  const serviceLevelsSet = useRef(new Set([]));
  const serviceLevelsIndexMarker = useRef(0);
  const {
    data: { entities } = {},
    error: slError,
    loading: slLoading,
  } = useEntitiesByGuidsQuery({
    entityGuids,
    entityFragmentExtension,
  });
  const {
    data: { actor: aqData },
    error: aqError,
    loading: aqLoading,
  } = useNerdGraphQuery({ query });

  useEffect(() => {
    guidsSet.current = new Set([...guidsSet.current, ...guids]);
    batchGuids();
  }, [guids]);

  useEffect(() => {
    if (!slLoading && entities?.length) {
      serviceLevels.current = serviceLevelsFromEntities(
        entities,
        serviceLevels.current
      );
      serviceLevelsSet.current = new Set([
        ...serviceLevelsSet.current,
        ...Object.keys(serviceLevels.current),
      ]);
      batchQueries();
      batchGuids();
    }
  }, [entities, slLoading]);

  useEffect(() => {
    if (!aqLoading && aqData) {
      const slAttainments = attainmentsFromData(aqData, serviceLevels.current);

      setData((data) => ({
        ...data,
        ...slAttainments,
      }));
    }
  }, [aqData, aqLoading]);

  const batchGuids = () => {
    const index = guidsIndexMarker.current;
    if (index < guidsSet.current.size) {
      const slicedGuids = [...guidsSet.current].slice(
        index,
        index + MAX_ITEMS_IN_BATCH
      );
      guidsIndexMarker.current = index + slicedGuids.length;
      setEntityGuids(() => [...slicedGuids]);
    }
  };

  const batchQueries = () => {
    const index = serviceLevelsIndexMarker.current;
    if (index < serviceLevelsSet.current.size) {
      const slicedQueries = (
        [...serviceLevelsSet.current].slice(
          index,
          index + MAX_ITEMS_IN_BATCH
        ) || []
      ).map((guid) => {
        const { accountId, nrql } = serviceLevels.current[guid];
        return { accounts: accountId, alias: guid, query: nrql };
      });
      serviceLevelsIndexMarker.current = index + slicedQueries.length;
      setQuery(queriesGQL(slicedQueries));
    }
  };

  return { data, error: slError || aqError, loading: slLoading || aqLoading };
};

const serviceLevelsFromEntities = (entities = [], existing = {}) =>
  entities.reduce(
    (
      acc,
      {
        accountId,
        guid,
        name,
        serviceLevel: {
          indicators: [
            {
              objectives: [
                {
                  resultQueries: { attainment: { nrql } = {} } = {},
                  target = 0,
                  timeWindow: { rolling: { count = 0, unit = '' } = {} } = {},
                } = {},
              ] = [],
            } = {},
          ] = [],
        } = {},
      }
    ) => ({
      ...acc,
      [guid]: {
        accountId,
        name,
        nrql,
        target,
        timeWindow: {
          count,
          unit,
        },
      },
    }),
    existing
  );

const attainmentsFromData = (data = {}, lookup = {}) =>
  Object.keys(data).reduce((acc, guid) => {
    if (!(guid in lookup)) return acc;
    const { results: [res] = {} } = data[guid] || {};
    return {
      ...acc,
      [guid]: {
        ...lookup[guid],
        attainment: attainmentValue(Object.values(res)),
      },
    };
  }, {});

const attainmentValue = (values = []) => (values.length === 1 ? values[0] : 0);

export default useFetchServiceLevels;
