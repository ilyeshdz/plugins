import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createQueue } from "./queue.js";

// Drains a pending run() by advancing fake timers until it settles. The
// queue's retry backoff and inter-item delay are real setTimeouts, so under
// fake timers we have to poke the clock for the loop to make progress.
async function drain(runPromise: Promise<void>) {
  let settled = false;
  const tracked = runPromise.finally(() => {
    settled = true;
  });
  for (let i = 0; i < 200 && !settled; i++) {
    await vi.advanceTimersByTimeAsync(100);
  }
  await tracked;
}

describe("createQueue", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  function makeQueue(
    onProcess: (item: { id: string }) => Promise<void>,
    extra: Partial<Parameters<typeof createQueue>[0]> = {},
  ) {
    return createQueue({
      delayMs: 0,
      onProcess,
      ...extra,
    });
  }

  it("starts idle and empty", () => {
    const queue = makeQueue(async () => {});
    expect(queue.state()).toBe("idle");
    expect(queue.items()).toEqual([]);
  });

  it("processes every item and ends completed", async () => {
    const processed: string[] = [];
    const queue = makeQueue(async (item) => {
      processed.push(item.id);
    });

    queue.addMany([
      { id: "a", data: null },
      { id: "b", data: null },
    ]);
    await drain(queue.run());

    expect(processed).toEqual(["a", "b"]);
    expect(queue.state()).toBe("completed");
    expect(queue.items().every((i) => i.status === "success")).toBe(true);
  });

  it("deduplicates by id on add", () => {
    const queue = makeQueue(async () => {});
    queue.add({ id: "a", data: null });
    queue.add({ id: "a", data: null });
    expect(queue.items()).toHaveLength(1);
  });

  it("deduplicates by id within addMany", () => {
    const queue = makeQueue(async () => {});
    queue.addMany([
      { id: "a", data: null },
      { id: "a", data: null },
      { id: "b", data: null },
    ]);
    expect(queue.items().map((i) => i.id)).toEqual(["a", "b"]);
  });

  it("retries a failing item maxRetries times before marking it failed", async () => {
    let calls = 0;
    const errors: string[] = [];
    const queue = makeQueue(
      async () => {
        calls++;
        throw new Error("nope");
      },
      { maxRetries: 3, onError: (_item, err) => void errors.push(err.message) },
    );

    queue.add({ id: "a", data: null });
    await drain(queue.run());

    // initial attempt + 3 retries
    expect(calls).toBe(4);
    expect(errors).toEqual(["nope"]);
    expect(queue.state()).toBe("completed-with-errors");
    expect(queue.items()[0].status).toBe("failed");
    expect(queue.items()[0].error).toBe("nope");
  });

  it("succeeds after transient failures", async () => {
    let calls = 0;
    const queue = makeQueue(async () => {
      calls++;
      if (calls < 3) throw new Error("flaky");
    });

    queue.add({ id: "a", data: null });
    await drain(queue.run());

    expect(calls).toBe(3);
    expect(queue.state()).toBe("completed");
    expect(queue.items()[0].status).toBe("success");
  });

  it("reports completed-with-errors when a mix succeed and fail", async () => {
    const queue = makeQueue(async (item) => {
      if (item.id === "bad") throw new Error("boom");
    });

    queue.addMany([
      { id: "good", data: null },
      { id: "bad", data: null },
    ]);
    await drain(queue.run());

    expect(queue.state()).toBe("completed-with-errors");
    expect(queue.items().find((i) => i.id === "good")?.status).toBe("success");
    expect(queue.items().find((i) => i.id === "bad")?.status).toBe("failed");
  });

  it("invokes onComplete once at the end", async () => {
    const onComplete = vi.fn();
    const queue = makeQueue(async () => {}, { onComplete });

    queue.add({ id: "a", data: null });
    await drain(queue.run());

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("stop() aborts the run and returns to idle", async () => {
    // Hold the first item open on a promise we control, so stop() lands
    // while the queue is mid-flight rather than after it finished.
    let releaseFirst!: () => void;
    const firstStarted = new Promise<void>((resolveStarted) => {
      const gate = new Promise<void>((resolve) => {
        releaseFirst = resolve;
      });
      resolveStarted(
        gate.then(() => {
          // resolve on the next microtask so the abort is observed first
        }),
      );
    });

    const queue = createQueue<string>({
      delayMs: 0,
      onProcess: (item) => {
        if (item.id === "a") return firstStarted;
        return Promise.resolve();
      },
    });

    queue.addMany([
      { id: "a", data: "a" },
      { id: "b", data: "b" },
    ]);

    const runPromise = queue.run();
    await vi.advanceTimersByTimeAsync(0);

    // item "a" is in-flight; abort the whole run
    queue.stop();
    releaseFirst();
    await vi.advanceTimersByTimeAsync(0);
    await runPromise;

    expect(queue.state()).toBe("idle");
    // the second item must never have been processed
    expect(queue.items().find((i) => i.id === "b")?.status).toBe("pending");
  });

  it("uses getRetryDelayMs to size the wait before a retry", async () => {
    const observed: number[] = [];
    let calls = 0;
    const queue = makeQueue(
      async () => {
        calls++;
        if (calls === 1) throw new Error("rl");
      },
      {
        maxRetries: 2,
        getRetryDelayMs: (_err, attempt) => {
          observed.push(attempt);
          return 5000;
        },
      },
    );

    queue.add({ id: "a", data: null });
    const runPromise = queue.run();

    // The retry should wait 5000ms (per the hook), not 1000ms (default).
    await vi.advanceTimersByTimeAsync(1000);
    expect(calls).toBe(1); // still waiting on the hook's longer delay
    await vi.advanceTimersByTimeAsync(4000);

    await drain(runPromise);
    expect(observed).toEqual([1]);
    expect(queue.state()).toBe("completed");
    expect(queue.items()[0].status).toBe("success");
  });

  it("falls back to linear backoff when getRetryDelayMs is absent", async () => {
    let calls = 0;
    const queue = makeQueue(async () => {
      calls++;
      if (calls < 2) throw new Error("flaky");
    });

    queue.add({ id: "a", data: null });
    const runPromise = queue.run();

    // default first retry delay is 1000ms
    await vi.advanceTimersByTimeAsync(999);
    expect(calls).toBe(1);
    await vi.advanceTimersByTimeAsync(1);

    await drain(runPromise);
    expect(queue.state()).toBe("completed");
  });

  it("invokes onError with a normalized Error even for thrown non-errors", async () => {
    const errors: unknown[] = [];
    const queue = makeQueue(
      async () => {
        // eslint-disable-next-line no-throw-literal
        throw "a bare string";
      },
      { maxRetries: 0, onError: (_item, err) => void errors.push(err) },
    );

    queue.add({ id: "a", data: null });
    await drain(queue.run());

    expect(errors).toHaveLength(1);
    expect(errors[0]).toBeInstanceOf(Error);
    expect((errors[0] as Error).message).toBe("a bare string");
  });

  it("clear() empties items and resets to idle", async () => {
    const queue = makeQueue(async () => {});
    queue.add({ id: "a", data: null });
    queue.clear();

    expect(queue.items()).toEqual([]);
    expect(queue.state()).toBe("idle");
  });
});
