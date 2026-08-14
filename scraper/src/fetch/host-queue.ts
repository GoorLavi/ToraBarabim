// Serializes every request to the same host behind one chained promise, and
// holds the queue open for `delayMs` after each request completes before
// releasing the next one. This is the one request at a time, spaced apart,
// per host that the polite fetcher promises.
export class HostQueue {
  private readonly tails = new Map<string, Promise<unknown>>();

  constructor(private readonly delayMs: number) {}

  async run<T>(host: string, task: () => Promise<T>): Promise<T> {
    const previous = this.tails.get(host) ?? Promise.resolve();
    const gated = previous.then(task, task);
    const wait = new Promise((resolve) => setTimeout(resolve, this.delayMs));
    this.tails.set(
      host,
      gated.then(
        () => wait,
        () => wait,
      ),
    );
    return gated;
  }
}
