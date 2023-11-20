import { AnuncioEvent, ImageOptions } from "./types";
import { Interval } from "./utils";

let imagePlayerInterval: Interval | null = null;

export class ImageItem {
  autoPlay: boolean;
  mediaEl: HTMLImageElement;
  progressEl: HTMLProgressElement;

  #duration: ImageOptions["duration"];
  #id: ImageOptions["id"];
  #state: "playing" | "paused" | "play-queued" | "closed" = "closed";
  #type: "image" = "image" as const;

  constructor(options: ImageOptions) {
    this.#id = options.id;
    this.#duration = options.duration ?? 5;

    this.autoPlay = options.autoPlay ?? true;
    this.progressEl = this.#createProgressEl();
    this.mediaEl = this.#createImageEl(options.imageUrl);
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

      if (this.#state === "play-queued") this.tryPlayImage();
      else if (this.autoPlay) this.tryPlayImage();
    });
    return image;
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

  tryPlayImage() {
    if (this.loading) return;

    this.#state = "playing";

    imagePlayerInterval = new Interval(
      this.#duration * 1000,
      (completion) => {
        if (completion >= this.#duration * 1000) {
          this.#dispatchEvent("play-complete");
        } else {
          // updating the progress value with completion percentage
          this.progressEl.value = completion / (this.#duration * 10);
        }
      },
      this.#duration * 5
    );
  }

  close() {
    this.#state = "closed";

    this.mediaEl.style.display = "none";
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
    if (this.#state === "closed") {
      if (this.loading) this.#state = "play-queued";
      else this.tryPlayImage();
    }
  }

  addEventListener(name: AnuncioEvent, handler: () => void) {
    this.mediaEl.addEventListener(name, handler);
  }

  removeEventListener(name: AnuncioEvent, handler: () => void) {
    this.mediaEl.removeEventListener(name, handler);
  }

  #dispatchEvent(name: AnuncioEvent) {
    const event = new Event(name);
    this.mediaEl.dispatchEvent(event);
  }
}
