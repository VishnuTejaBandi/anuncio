export class Interval {
  #startingTime = -1;
  #intervalId = -1;
  #state: "running" | "paused" | "stopped" | "destroyed" = "stopped";
  #pausedAt = -1;
  #offset = 0;

  /**
   *Starts a interval that can be paused.\
   *Destroys the timer on completion.
   */
  constructor(
    public duration: number,
    public onInterval: (completion: number) => void,
    public precision: number = 30
  ) {
    this.#start();
  }

  #start() {
    this.#startingTime = +new Date();
    this.#state = "running";

    this.#intervalId = window.setInterval(() => {
      if (this.#state === "paused") return;

      const currentTime = +new Date();
      const completion = currentTime - this.#startingTime - this.#offset;
      this.onInterval(completion);

      if (completion >= this.duration) {
        this.destroy();
      }
    }, this.precision);
  }

  pause() {
    if (this.#state === "paused") throw new Error("Timer is already paused");
    if (this.#state === "destroyed") throw new Error("cannot call pause method on a destroyed timer");
    this.#state = "paused";
    this.#pausedAt = +new Date();
  }

  resume() {
    if (this.#state === "destroyed") throw new Error("cannot call resume method on a destroyed timer");
    if (this.#state !== "paused") throw new Error("cannot resume timer that has not started and running");

    this.#state = "running";
    this.#offset += +new Date() - this.#pausedAt;
  }

  destroy() {
    if (this.#state === "destroyed") return;

    window.clearInterval(this.#intervalId);
    this.#state = "destroyed";
  }
}
