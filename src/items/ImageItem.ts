import { ImageOptions } from "../types";
import { Interval } from "../utils";
import { Item } from "./item";

let imagePlayerInterval: Interval | null = null;

export class ImageItem extends Item {
  mediaEl: HTMLImageElement;
  progressEl: HTMLProgressElement;

  #duration: ImageOptions["duration"];
  #id: ImageOptions["id"];
  #state: "playing" | "paused" | "play-queued" | "closed" = "closed";
  #type: "image" = "image" as const;

  constructor(options: ImageOptions) {
    super();
    this.#id = options.id;
    this.#duration = options.duration ?? 5;

    this.progressEl = this.#createProgressEl();
    this.mediaEl = this.#createImageEl(options.imageUrl);
  }

  get loading() {
    return this.mediaEl.dataset.loading === "true";
  }

  get id() {
    return this.#id;
  }

  get type() {
    return this.#type;
  }

  get state() {
    return this.#state;
  }

  #createProgressEl() {
    const progress = document.createElement("progress");

    progress.id = "anuncio-progress-for-" + this.#id;
    progress.classList.add("anuncio-progress-element");
    progress.max = 100;
    progress.value = 0;

    return progress;
  }

  #createImageEl(imageUrl: ImageOptions["imageUrl"]) {
    const image = document.createElement("img");
    image.src = imageUrl;
    image.dataset.loading = "true";
    image.id = "anuncio-image-for-" + this.#id;

    image.addEventListener("load", () => {
      image.dataset.loading = "false";

      if (this.#state === "play-queued") this.start();
    });
    return image;
  }

  close() {
    this.#state = "closed";

    this.progressEl.value = 0;

    // garbage collect interval
    imagePlayerInterval?.destroy();
    imagePlayerInterval = null;
  }

  pause() {
    if (this.#state === "playing") {
      imagePlayerInterval?.pause();
      this.#state = "paused";
    }
  }

  resume() {
    if (this.#state === "paused") {
      imagePlayerInterval?.resume();
      this.#state = "playing";
    }
  }

  start() {
    if (this.#state === "closed" && this.loading) {
      this.#state = "play-queued";
    } else if (this.#state === "closed" || this.#state === "play-queued") {
      this.#state = "playing";

      imagePlayerInterval = new Interval(
        this.#duration * 1000,
        (completion) => {
          if (completion >= this.#duration * 1000) {
            this.dispatchEvent("play-complete");
          } else {
            // updating the progress value with completion percentage
            this.progressEl.value = completion / (this.#duration * 10);
          }
        },
        this.#duration * 5
      );
    }
  }
}
