/**
 * @fileoverview Queue system for processing items sequentially with retry support.
 */

import { createSignal } from "solid-js";

export type QueueItemStatus = "pending" | "processing" | "success" | "failed";

export type QueueItem<T> = {
  id: string;
  data: T;
  status?: QueueItemStatus;
  error?: string;
};

export interface QueueOptions<T> {
  delayMs: number;
  onProcess: (item: QueueItem<T>) => Promise<void>;
  onError?: (item: QueueItem<T>, error: Error) => void | Promise<void>;
  onComplete?: () => void | Promise<void>;
  maxRetries?: number;
}

export function createQueue<T>(options: QueueOptions<T>) {
  const { delayMs, onProcess, onError, onComplete, maxRetries = 3 } = options;

  const [items, setItems] = createSignal<QueueItem<T>[]>([]);
  const [state, setState] = createSignal<
    "idle" | "running" | "paused" | "completed" | "completed-with-errors"
  >("idle");

  let abortController: AbortController | null = null;
  let isPaused = false;

  const sleep = (ms: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, ms));

  const updateItemStatus = (
    id: string,
    status: QueueItemStatus,
    error?: string,
  ) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status, error } : item)),
    );
  };

  const add = (item: QueueItem<T>) => {
    setItems((prev) => [...prev, { ...item, status: "pending" }]);
  };

  const addMany = (newItems: QueueItem<T>[]) => {
    setItems((prev) => [
      ...prev,
      ...newItems.map((item): QueueItem<T> => ({ ...item, status: "pending" })),
    ]);
  };

  const clear = () => {
    setItems([]);
    setState("idle");
  };

  const processItem = async (item: QueueItem<T>) => {
    updateItemStatus(item.id, "processing");
    let attempt = 0;
    let lastError: unknown;

    while (attempt <= maxRetries) {
      try {
        await onProcess(item);
        updateItemStatus(item.id, "success");
        return true;
      } catch (err) {
        lastError = err;
        attempt++;
        if (attempt > maxRetries) break;
        await sleep(1000 * attempt);
      }
    }

    const error =
      lastError instanceof Error ? lastError : new Error(String(lastError));
    updateItemStatus(item.id, "failed", error.message);
    if (onError) await onError(item, error);
    return false;
  };

  const run = async () => {
    if (state() === "running") return;

    abortController = new AbortController();
    setState("running");
    isPaused = false;

    while (!abortController?.signal.aborted && !isPaused) {
      const currentItems = items();
      const next = currentItems.find((i) => i.status === "pending");
      if (!next) break;

      await processItem(next);

      const remaining = items().filter((i) => i.status === "pending").length;
      if (remaining > 0 && !abortController?.signal.aborted && !isPaused) {
        await sleep(delayMs);
      }
    }

    if (!abortController?.signal.aborted) {
      const failed = items().filter((i) => i.status === "failed").length;
      setState(failed > 0 ? "completed-with-errors" : "completed");
      if (onComplete) await onComplete();
    }
  };

  const pause = () => {
    isPaused = true;
    setState("paused");
  };

  const resume = () => {
    if (state() === "paused") {
      isPaused = false;
      setState("running");
      run();
    }
  };

  const stop = () => {
    abortController?.abort();
    setState("idle");
  };

  return {
    items,
    state,
    add,
    addMany,
    clear,
    run,
    pause,
    resume,
    stop,
  };
}

export type Queue<T> = ReturnType<typeof createQueue<T>>;
