"use client";

import { useState, useEffect, useCallback } from "react";

export function usePersistentStorage() {
  const [isPersisted, setIsPersisted] = useState(false);
  const [storageEstimate, setStorageEstimate] = useState(null);

  useEffect(() => {
    requestPersistence();
    estimateStorage();
  }, []);

  const requestPersistence = useCallback(async () => {
    if (navigator.storage && navigator.storage.persist) {
      const granted = await navigator.storage.persist();
      setIsPersisted(granted);
      return granted;
    }
    return false;
  }, []);

  const estimateStorage = useCallback(async () => {
    if (navigator.storage && navigator.storage.estimate) {
      const estimate = await navigator.storage.estimate();
      setStorageEstimate({
        usage: estimate.usage,
        quota: estimate.quota,
        usagePercent: ((estimate.usage / estimate.quota) * 100).toFixed(2),
      });
    }
  }, []);

  return { isPersisted, storageEstimate, requestPersistence, estimateStorage };
}
