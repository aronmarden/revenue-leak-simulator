import { useCallback, useEffect, useRef, useState } from 'react';
import { AccountStorageQuery } from 'nr1';

import { NERD_STORAGE } from '../../constants';

const useFlowLoader = ({ accountId, flowId }) => {
  const [flows, setFlows] = useState([]);
  const [error, setError] = useState();
  const [loading, setLoading] = useState(true);
  const acctId = useRef();
  const docId = useRef();

  const fetchFn = useCallback(async () => {
    setLoading(true);
    const { data, error: err } = await AccountStorageQuery.query({
      accountId: acctId.current,
      collection: NERD_STORAGE.FLOWS_COLLECTION,
      documentId: docId.current,
    });
    setLoading(false);
    setFlows(() =>
      // eslint-disable-next-line no-unused-vars
      Array.isArray(data) ? data?.map(({ __typename, ...flow }) => flow) : data
    );
    setError(err);
  }, []);

  useEffect(() => {
    if (!accountId || !Number.isInteger(accountId) || !fetchFn) return;
    acctId.current = accountId;
    docId.current = flowId;
    fetchFn();
  }, [accountId, flowId, fetchFn]);

  return { flows, error, loading, refetch: fetchFn };
};

export default useFlowLoader;
