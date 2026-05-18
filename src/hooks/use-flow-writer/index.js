import { useCallback } from 'react';
import { AccountStorageMutation, AccountStorageQuery } from 'nr1';

import { NERD_STORAGE } from '../../constants';

const log = async ({ accountId, documentId, user }) => {
  const { data, error } = await AccountStorageQuery.query({
    accountId,
    collection: NERD_STORAGE.EDITS_LOG_COLLECTION,
    documentId,
  });
  if (error) {
    console.error('Error reading flow log', error);
    return;
  }

  const document = {
    logs: [
      ...(data?.logs || []),
      {
        timestamp: Date.now(),
        user,
      },
    ],
  };
  const { error: logErr } = await AccountStorageMutation.mutate({
    accountId,
    actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
    collection: NERD_STORAGE.EDITS_LOG_COLLECTION,
    documentId,
    document,
  });

  if (logErr) console.error('Error writing log', logErr);
};

const useFlowWriter = ({ accountId, user }) => {
  const write = useCallback(async ({ documentId, document }) => {
    const { data: { nerdStorageWriteDocument } = {}, error } =
      await AccountStorageMutation.mutate({
        actionType: AccountStorageMutation.ACTION_TYPE.WRITE_DOCUMENT,
        collection: NERD_STORAGE.FLOWS_COLLECTION,
        accountId,
        documentId,
        document: document,
      });

    if (error) {
      console.error('Error writing to flow', error);
      return;
    }

    if (nerdStorageWriteDocument) log({ accountId, documentId, user });
  }, []);

  const deleteFlow = useCallback(async (id) => {
    const documentId = id;
    const { data: { nerdStorageDeleteDocument } = {}, error } =
      await AccountStorageMutation.mutate({
        actionType: AccountStorageMutation.ACTION_TYPE.DELETE_DOCUMENT,
        collection: NERD_STORAGE.FLOWS_COLLECTION,
        accountId,
        documentId,
      });

    if (error) {
      console.error('Error deleting flow', error);
      return;
    }

    if (nerdStorageDeleteDocument?.deleted)
      log({ accountId, documentId, user });
  }, []);

  return { write, deleteFlow };
};

export default useFlowWriter;
