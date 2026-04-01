"use client";

import { usePersistentStorage } from "@/hooks/use-persistent-storage";

export function PersistentStorage() {
  usePersistentStorage();
  return null;
}
